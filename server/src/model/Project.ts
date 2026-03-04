import { Pool, PoolClient } from "pg";
import { ProjectInterface } from "../interface/project.interface.js";
import { pool } from "../config/db.config.js";

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
  async create(client: Pool | PoolClient = pool) {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      const placeholders: string[] = [];

      const allowedFields: (keyof ProjectType)[] = [
        "user_id",
        "name",
        "description",
        "deadline",
      ];
      let index = 1;
      for (const key of allowedFields) {
        const value = this[key];
        if (value !== undefined) {
          fields.push(key);
          values.push(value);
          placeholders.push(`$${index++}`);
        }
      }
      const query = `
      INSERT INTO core.projects (${fields.join(", ")})
       VALUES (${placeholders.join(", ")})
       RETURNING *;`;
      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Error creating project: " + (error as Error).message);
    }
  }
  static async findById(project_id: string) {
    try {
      const query = `SELECT
      p.*,
      COALESCE(
        json_agg(
          json_build_object(
            'task_title', t.title,
            'task_description', t.description,
            'task_due_date', t.due_date,
            'task_status', t.status,
            'task_priority', t.priority,
            'task_user_id', t.user_id
          )
        )FILTER (WHERE t._id IS NOT NULL), '[]'
      )AS tasks
      FROM core.projects p
      LEFT JOIN core.tasks t ON p._id = t.project_id
      WHERE p._id = $1
      AND p.deleted = false
      GROUP BY p._id`;
      const result = await pool.query(query, [project_id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(
        "Error finding project by ID: " + (error as Error).message,
      );
    }
  }
  static async findAllByUserId(
    client: Pool | PoolClient = pool,
    { user_id }: { user_id: string },
  ) {
    try {
      const query = `SELECT
        * FROM core.projects WHERE user_id = $1 AND deleted = false AND archived = false ORDER BY created_at DESC`;
      const result = await client.query(query, [user_id]);
      return result.rows || [];
    } catch (error) {
      throw new Error(
        "Error finding projects by user ID: " + (error as Error).message,
      );
    }
  }
  static async delete(client: Pool | PoolClient = pool, project_id: string) {
    try {
      const query = `UPDATE core.projects SET deleted = true, deleted_at = NOW() WHERE _id = $1`;
      await client.query(query, [project_id]);
    } catch (error) {
      throw new Error("Error deleting project: " + (error as Error).message);
    }
  }
  static async archive(client: Pool | PoolClient = pool, project_id: string) {
    try {
      const query = `UPDATE core.projects SET archived = true WHERE _id = $1`;
      await client.query(query, [project_id]);
    } catch (error) {
      throw new Error("Error archiving project: " + (error as Error).message);
    }
  }
  static async unarchive(client: Pool | PoolClient = pool, project_id: string) {
    try {
      const query = `UPDATE core.projects SET archived = false WHERE _id = $1`;
      await client.query(query, [project_id]);
    } catch (error) {
      throw new Error("Error unarchiving project: " + (error as Error).message);
    }
  }
  static async listArchivedByUserId(
    client: Pool | PoolClient = pool,
    { user_id }: { user_id: string },
  ) {
    try {
      const query = `SELECT
        * FROM core.projects WHERE user_id = $1 AND archived = true ORDER BY created_at DESC`;
      const result = await client.query(query, [user_id]);
      return result.rows || [];
    } catch (error) {
      throw new Error(
        "Error listing archived projects by user ID: " +
          (error as Error).message,
      );
    }
  }
  static async listDeletedByUserId(
    client: Pool | PoolClient = pool,
    { user_id }: { user_id: string },
  ) {
    try {
      const query = `SELECT
        * FROM core.projects WHERE user_id = $1 AND deleted = true ORDER BY created_at DESC`;
      const result = await client.query(query, [user_id]);
      return result.rows || [];
    } catch (error) {
      throw new Error(
        "Error listing deleted projects by user ID: " +
          (error as Error).message,
      );
    }
  }
  static async destroy(client: Pool | PoolClient = pool, project_id: string) {
    try {
      const query = `DELETE FROM core.projects WHERE _id = $1`;
      await client.query(query, [project_id]);
    } catch (error) {
      throw new Error("Error destroying project: " + (error as Error).message);
    }
  }
  static async restore(client: Pool | PoolClient = pool, project_id: string) {
    try {
      const query = `UPDATE core.projects SET deleted = false, deleted_at = NULL WHERE _id = $1`;
      await client.query(query, [project_id]);
    } catch (error) {
      throw new Error("Error restoring project: " + (error as Error).message);
    }
  }
}
