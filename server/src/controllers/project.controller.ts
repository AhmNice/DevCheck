import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BadRequestError } from "../utils/errorHandler.js";
import { Project } from "../service/Project.service.js";
import { pool } from "../config/db.config.js";

export const createProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { user_id, name, description, deadline } = req.body;
    if (!user_id || !name) {
      throw new BadRequestError({
        message: "Missing required fields: user_id and name",
      });
    }
    const parsedDeadline = deadline ? new Date(deadline) : undefined;
    if (deadline && isNaN(parsedDeadline!.getTime())) {
      throw new BadRequestError({ message: "Invalid deadline format" });
    }

    const project = new Project({
      user_id,
      description: description || "",
      name,
      deadline: parsedDeadline,
    });
    const newProject = await project.create();
    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: newProject,
    });
  },
);
export const getProjectById = asyncHandler(
  async (req: Request, res: Response) => {
    const { project_id } = req.params;
    const project = await Project.findById(`${project_id}`);
    if (!project) {
      throw new BadRequestError({ message: "Project not found" });
    }
    return res.status(200).json({
      success: true,
      project,
    });
  },
);
export const userProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const client = await pool.connect();
    try {
      const projects = await Project.findAllByUserId(client, {
        user_id: `${user_id}`,
      });
      return res.status(200).json({
        success: true,
        projects,
      });
    } finally {
      client.release();
    }
  },
);
export const archiveProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { project_id } = req.params;
    const client = await pool.connect();
    try {
      const project = await Project.findById(`${project_id}`);
      if (!project) {
        throw new BadRequestError({ message: "Project not found" });
      }
      const updatedProject = await Project.archive(client, `${project_id}`);
      return res.status(200).json({
        success: true,
        message: "Project archived successfully",
        project: updatedProject,
      });
    } finally {
      client.release();
    }
  },
);
export const unarchiveProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { project_id } = req.params;
    const client = await pool.connect();
    try {
      const project = await Project.findById(`${project_id}`);
      if (!project) {
        throw new BadRequestError({ message: "Project not found" });
      }
      const updatedProject = await Project.unarchive(client, `${project_id}`);
      return res.status(200).json({
        success: true,
        message: "Project unarchived successfully",
        project: updatedProject,
      });
    } finally {
      client.release();
    }
  },
);
export const deleteProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { project_id } = req.params;
    const client = await pool.connect();
    try {
      const project = await Project.findById(`${project_id}`);
      if (!project) {
        throw new BadRequestError({ message: "Project not found" });
      }
      await Project.delete(client, `${project_id}`);
      return res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      });
    } finally {
      client.release();
    }
  },
);
export const restoreProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { project_id } = req.params;
    const client = await pool.connect();
    try {
      const project = await Project.findById(`${project_id}`);
      if (!project) {
        throw new BadRequestError({ message: "Project not found" });
      }
      const updatedProject = await Project.restore(client, `${project_id}`);
      return res.status(200).json({
        success: true,
        message: "Project restored successfully",
        project: updatedProject,
      });
    } finally {
      client.release();
    }
  },
);
export const destroyProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { project_id } = req.params;
    const client = await pool.connect();
    try {
      const project = await Project.findById(`${project_id}`);
      if (!project) {
        throw new BadRequestError({ message: "Project not found" });
      }
      await Project.destroy(client, `${project_id}`);
      return res.status(200).json({
        success: true,
        message: "Project permanently deleted successfully",
      });
    } finally {
      client.release();
    }
  },
);
export const listArchivedProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const client = await pool.connect();
    try {
      const projects = await Project.listArchivedByUserId(client, {
        user_id: `${user_id}`,
      });
      return res.status(200).json({
        success: true,
        projects,
      });
    } finally {
      client.release();
    }
  },
);
export const listDeletedProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const client = await pool.connect();
    try {
      const projects = await Project.listDeletedByUserId(client, {
        user_id: `${user_id}`,
      });
      return res.status(200).json({
        success: true,
        projects,
      });
    } finally {
      client.release();
    }
  },
);
