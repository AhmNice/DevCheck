import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BadRequestError } from "../utils/errorHandler.js";
import { User } from "../model/User.js";
import { GitHubService } from "../service/github.service.js";
import { Task } from "../model/Task.js";
import { createGitHubWebhook } from "../hooks/github_webhook.js";
import { GitHubRepo } from "../model/Repo.js";
import { pool } from "../config/db.config.js";

interface GitHubIssuePayload {
  action: string;
  repository: {
    full_name: string;
  };
  issue: {
    id: number;
    title: string;
    body: string | null;
    assignees: {
      login: string;
    }[];
  };
}

export const getUserRepos = asyncHandler(
  async (req: Request, res: Response) => {
    const userPayload = req.user;
    const user_id = userPayload?.user_id;
    if (!user_id) {
      throw new BadRequestError("User ID not found in request");
    }
    const user = await User.findById(user_id);
    if (!user) {
      throw new BadRequestError("User not found");
    }
    const accessToken = user.github_access_token;
    if (!accessToken) {
      throw new BadRequestError("GitHub access token not found for user");
    }
    const repos = await GitHubService.getUserRepos(accessToken);
    return res.json({ success: true, repos });
  },
);
export const searchRepos = asyncHandler(async (req: Request, res: Response) => {
  const userPayload = req.user;
  const user_id = userPayload?.user_id;
  if (!user_id) {
    throw new BadRequestError("User ID not found in request");
  }
  const user = await User.findById(user_id);
  if (!user) {
    throw new BadRequestError("User not found");
  }
  const accessToken = user.github_access_token;
  if (!accessToken) {
    throw new BadRequestError("GitHub access token not found for user");
  }

  const query = req.query.q as string;
  if (!query) {
    throw new BadRequestError("Search query parameter 'q' is required");
  }
  const repos = await GitHubService.searchRepos(query, accessToken);
  return res.json({ success: true, repos });
});
export const connectRepo = asyncHandler(async (req: Request, res: Response) => {
  const user_id = req.user?.user_id;
  const { repoFullName } = req.body;

  if (!user_id) {
    throw new BadRequestError("User ID not found in request");
  }

  if (!repoFullName) {
    throw new BadRequestError("Repository full name is required");
  }
  const user = await User.findById(user_id);
  if (!user) {
    throw new BadRequestError("User not found");
  }
  const accessToken = user.github_access_token;
  if (!accessToken) {
    throw new BadRequestError("GitHub access token not found for user");
  }
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) {
    throw new BadRequestError("Invalid repository format. Use owner/repo");
  }
  const existingRepo = await GitHubRepo.findByRepo(pool, {
    owner,
    user_id,
    repo,
  });
  if (existingRepo) {
    throw new BadRequestError("Repository is already connected");
  }
  await createGitHubWebhook(accessToken, {
    owner,
    repo,
  });
  const connectedRepo = await GitHubService.connectRepo({
    user_id,
    accessToken,
    repoFullName,
  });

  return res.json({
    success: true,
    connectedRepo,
  });
});
export const githubWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const event = req.headers["x-github-event"];
    const payload = req.body;
    if (event !== "issues") {
      return res.status(200).json({ success: true, message: "Event ignored" });
    }
    const repoFullName = payload.repository.full_name;
    const connectedRepo = await GitHubRepo.findByFullName({
      full_name: repoFullName,
    });
    if (!connectedRepo) {
      return res.status(200).json({
        success: true,
        message: "Repository not connected",
      });
    }
    const user = await User.findById(connectedRepo.user_id);
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "User not found",
      });
    }
    const typedPayload = payload as GitHubIssuePayload;

    const assignees = typedPayload.issue.assignees.map(
      (assignee) => assignee.login,
    );
    if (!assignees.includes(user.github_username)) {
      return res.status(200).json({
        success: true,
        message: "Issue not assigned to user",
      });
    }
    const existingTask = await Task.findByGitHubIssue(pool, {
      github_issue_id: typedPayload.issue.id.toString(),
      user_id: connectedRepo.user_id,
    });
    if (typedPayload.action === "opened") {
      if (existingTask) {
        return res.status(200).json({
          success: true,
          message: "Task already exists for this issue",
        });
      }
      const task = new Task({
        user_id: user._id,
        title: typedPayload.issue.title,
        description: typedPayload.issue.body || "",
        status: "pending",
        priority: "medium",
        source: "github",
        source_id: typedPayload.issue.id.toString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      const savedTask = await task.save();
      return res.status(201).json({
        success: true,
        task: savedTask,
      });
    }
    if (typedPayload.action === "closed" && existingTask) {
      const updatedTask = await Task.updateById(existingTask._id, {
        status: "completed",
      });

      return res.status(200).json({
        success: true,
        message: "Task marked as completed",
        task: updatedTask,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Action ignored",
    });
  },
);
