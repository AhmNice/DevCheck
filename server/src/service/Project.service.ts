import { Pool, PoolClient } from "pg";
import { ProjectInterface } from "../interface/project.interface.js";
import prisma from "../config/database.js";
import type {
  Project as PrismaProject,
  Task as PrismaTask,
} from "../generated/prisma/client.js";

type ProjectType = Pick<
  ProjectInterface,
  "user_id" | "name" | "description" | "deadline"
>;
export class Project implements ProjectType {
  user_id!: string;
  name!: string;
  description!: string;
  deadline?: Date | undefined;

  constructor(parameters: ProjectType) {
    Object.assign(this, parameters);
  }

  private static toLegacyProject(project: PrismaProject): ProjectInterface {
    return {
      _id: project.id,
      user_id: project.userId,
      name: project.name,
      description: project.description || "",
      deadline: project.deadline || undefined,
      archived: project.archived,
      deleted: project.deleted,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
      deleted_at: project.deletedAt,
    };
  }

  private static toLegacyTaskProjection(task: PrismaTask) {
    return {
      task_title: task.title,
      task_description: task.description,
      task_due_date: task.dueDate,
      task_status: task.status,
      task_priority: task.priority,
      task_user_id: task.userId,
    };
  }

  async create(client?: Pool | PoolClient) {
    try {
      void client;
      const createdProject = await prisma.project.create({
        data: {
          userId: this.user_id,
          name: this.name,
          description: this.description,
          deadline: this.deadline,
        },
      });
      return Project.toLegacyProject(createdProject);
    } catch (error) {
      throw new Error("Error creating project: " + (error as Error).message);
    }
  }
  static async findById(project_id: string) {
    try {
      const foundProject = await prisma.project.findFirst({
        where: {
          id: project_id,
          deleted: false,
        },
        include: {
          tasks: true,
        },
      });

      if (!foundProject) {
        return null;
      }

      const legacyProject = Project.toLegacyProject(foundProject);
      return {
        ...legacyProject,
        tasks: foundProject.tasks.map(Project.toLegacyTaskProjection),
      };
    } catch (error) {
      throw new Error(
        "Error finding project by ID: " + (error as Error).message,
      );
    }
  }
  static async findAllByUserId(
    client: Pool | PoolClient | undefined,
    { user_id }: { user_id: string },
  ) {
    try {
      void client;
      const projects = await prisma.project.findMany({
        where: {
          userId: user_id,
          deleted: false,
          archived: false,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return projects.map(Project.toLegacyProject);
    } catch (error) {
      throw new Error(
        "Error finding projects by user ID: " + (error as Error).message,
      );
    }
  }
  static async delete(
    client: Pool | PoolClient | undefined,
    project_id: string,
  ) {
    try {
      void client;
      await prisma.project.update({
        where: { id: project_id },
        data: {
          deleted: true,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      throw new Error("Error deleting project: " + (error as Error).message);
    }
  }
  static async archive(
    client: Pool | PoolClient | undefined,
    project_id: string,
  ) {
    try {
      void client;
      const updatedProject = await prisma.project.update({
        where: { id: project_id },
        data: { archived: true },
      });
      return Project.toLegacyProject(updatedProject);
    } catch (error) {
      throw new Error("Error archiving project: " + (error as Error).message);
    }
  }
  static async unarchive(
    client: Pool | PoolClient | undefined,
    project_id: string,
  ) {
    try {
      void client;
      const updatedProject = await prisma.project.update({
        where: { id: project_id },
        data: { archived: false },
      });
      return Project.toLegacyProject(updatedProject);
    } catch (error) {
      throw new Error("Error unarchiving project: " + (error as Error).message);
    }
  }
  static async listArchivedByUserId(
    client: Pool | PoolClient | undefined,
    { user_id }: { user_id: string },
  ) {
    try {
      void client;
      const projects = await prisma.project.findMany({
        where: {
          userId: user_id,
          archived: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return projects.map(Project.toLegacyProject);
    } catch (error) {
      throw new Error(
        "Error listing archived projects by user ID: " +
          (error as Error).message,
      );
    }
  }
  static async listDeletedByUserId(
    client: Pool | PoolClient | undefined,
    { user_id }: { user_id: string },
  ) {
    try {
      void client;
      const projects = await prisma.project.findMany({
        where: {
          userId: user_id,
          deleted: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return projects.map(Project.toLegacyProject);
    } catch (error) {
      throw new Error(
        "Error listing deleted projects by user ID: " +
          (error as Error).message,
      );
    }
  }
  static async destroy(
    client: Pool | PoolClient | undefined,
    project_id: string,
  ) {
    try {
      void client;
      await prisma.project.delete({
        where: { id: project_id },
      });
    } catch (error) {
      throw new Error("Error destroying project: " + (error as Error).message);
    }
  }
  static async restore(
    client: Pool | PoolClient | undefined,
    project_id: string,
  ) {
    try {
      void client;
      const updatedProject = await prisma.project.update({
        where: { id: project_id },
        data: {
          deleted: false,
          deletedAt: null,
        },
      });
      return Project.toLegacyProject(updatedProject);
    } catch (error) {
      throw new Error("Error restoring project: " + (error as Error).message);
    }
  }
}
