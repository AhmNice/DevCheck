import { Pool, PoolClient } from "pg";
import { RepoInterface } from "../interface/repo.interface.js";
import { BadRequestError } from "../utils/errorHandler.js";
import prisma from "../config/database.js";
import type { GithubRepository } from "../generated/prisma/client.js";

type RepoType = Pick<
  RepoInterface,
  | "user_id"
  | "github_repo_id"
  | "owner"
  | "name"
  | "full_name"
  | "default_branch"
  | "visibility"
  | "repo_url"
  | "last_synced_at"
  | "active"
>;

export class GitHubRepo {
  user_id!: string;
  github_repo_id!: string;
  owner!: string;
  name!: string;
  full_name!: string;
  default_branch?: string;
  visibility?: string;
  repo_url?: string;
  last_synced_at?: Date;
  active?: boolean;

  constructor(parameters: RepoType) {
    Object.assign(this, parameters);
  }

  private static toLegacyRepo(repo: GithubRepository): RepoInterface {
    return {
      user_id: repo.userId,
      github_repo_id: repo.githubRepoId.toString(),
      owner: repo.owner,
      name: repo.name,
      full_name: repo.fullName,
      default_branch: repo.defaultBranch || undefined,
      connected_at: repo.connectedAt,
      visibility: repo.visibility || undefined,
      repo_url: repo.repoUrl || undefined,
      last_synced_at: repo.lastSyncedAt || undefined,
      active: repo.active,
    };
  }

  async connect(client?: Pool | PoolClient) {
    try {
      void client;
      const repo = await prisma.githubRepository.create({
        data: {
          userId: this.user_id,
          githubRepoId: BigInt(this.github_repo_id),
          owner: this.owner,
          name: this.name,
          fullName: this.full_name,
          defaultBranch: this.default_branch,
          visibility: this.visibility,
          repoUrl: this.repo_url,
          lastSyncedAt: this.last_synced_at,
          active: this.active ?? true,
        },
      });

      return GitHubRepo.toLegacyRepo(repo);
    } catch (error) {
      console.error("Error connecting GitHub repo:", error);
      throw error;
    }
  }
  static async disconnect(
    client: Pool | PoolClient | undefined,
    { user_id, github_repo_id }: { user_id: string; github_repo_id: string },
  ) {
    try {
      void client;
      const existingRepo = await prisma.githubRepository.findFirst({
        where: {
          githubRepoId: BigInt(github_repo_id),
          userId: user_id,
        },
      });

      if (!existingRepo) {
        throw new BadRequestError({ message: "Repository not found" });
      }

      const deletedRepo = await prisma.githubRepository.delete({
        where: {
          githubRepoId: BigInt(github_repo_id),
        },
      });

      return GitHubRepo.toLegacyRepo(deletedRepo);
    } catch (error) {
      console.error("Error disconnecting GitHub repo:", error);
      throw error;
    }
  }
  static async findByRepo(
    client: Pool | PoolClient | undefined,
    { owner, user_id, repo }: { owner: string; user_id: string; repo?: string },
  ) {
    try {
      void client;
      const foundRepo = await prisma.githubRepository.findFirst({
        where: {
          owner,
          userId: user_id,
          ...(repo ? { name: repo } : {}),
        },
      });

      return foundRepo ? GitHubRepo.toLegacyRepo(foundRepo) : null;
    } catch (error) {
      console.error("Error finding GitHub repo:", error);
      throw error;
    }
  }
  static async findByFullName({ full_name }: { full_name: string }) {
    try {
      const foundRepo = await prisma.githubRepository.findFirst({
        where: {
          fullName: full_name,
        },
      });

      return foundRepo ? GitHubRepo.toLegacyRepo(foundRepo) : null;
    } catch (error) {
      console.error("Error finding GitHub repo by full name:", error);
      throw error;
    }
  }
}
