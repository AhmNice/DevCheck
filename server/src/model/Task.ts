import { pool } from "../config/db.config.js";
import { TaskInterface } from "../interface/task.interface.js";
import { BadRequestError } from "../utils/errorHandler.js";
import { Pool, PoolClient } from "pg";

type taskInterface = Pick<
  TaskInterface,
  | "title"
  | "description"
  | "due_date"
  | "status"
  | "priority"
  | "user_id"
  | "project_id"
>;

export class Task {
  constructor(parameters: taskInterface) {
    Object.assign(this, parameters);
  }

  title!: string;
  description?: string;
  due_date!: Date;
  status!: "pending" | "in_progress" | "completed";
  priority!: "normal" | "medium" | "high";
  user_id!: string;
  project_id?: string;
  async save(client: Pool | PoolClient = pool) {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      const placeholders: string[] = [];

      const allowedFields: (keyof taskInterface)[] = [
        "title",
        "description",
        "due_date",
        "status",
        "priority",
        "user_id",
        "project_id",
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
        INSERT INTO core.tasks (${fields.join(", ")})
        VALUES (${placeholders.join(", ")})
        RETURNING *;
      `;

      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Error saving task: " + (error as Error).message);
    }
  }

  static async findById(client: Pool | PoolClient = pool, id: string) {
    try {
      const query = `SELECT * FROM core.tasks WHERE _id = $1`;
      const result = await client.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new BadRequestError(
        "Error finding task: " + (error as Error).message,
      );
    }
  }
  static async getTaskByUserId(user_id: string) {
    try {
      const query = `SELECT * FROM core.tasks WHERE user_id = $1`;
      const result = await pool.query(query, [user_id]);
      return result.rows;
    } catch (error) {
      throw new BadRequestError(
        "Error finding tasks: " + (error as Error).message,
      );
    }
  }
  static async deleteById(task_id: string, client: Pool | PoolClient = pool) {
    try {
      const query = `DELETE FROM core.tasks WHERE _id = $1`;
      await client.query(query, [task_id]);
    } catch (error) {
      throw new BadRequestError(
        "Error deleting task: " + (error as Error).message,
      );
    }
  }
  static async getTaskByIdWithSubtasks(task_id: string) {
    const query = `
        SELECT
      t.*,
      COALESCE(
        json_agg(
          json_build_object(
            '_id', s._id,
            'title', s.title,
            'description', s.description,
            'due_date', s.due_date,
            'status', s.status
          )
        ) FILTER (WHERE s._id IS NOT NULL),
        '[]'
      ) AS subtasks
    FROM core.tasks t
    LEFT JOIN core.subtasks s
      ON t._id = s.task_id
    WHERE t._id = $1
    GROUP BY t._id;
      `;
    try {
      const result = await pool.query(query, [task_id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new BadRequestError(
        "Error retrieving task with subtasks: " + (error as Error).message,
      );
    }
  }
  static async updateById(
    task_id: string,
    updates: Partial<taskInterface>,
    client: Pool | PoolClient = pool,
  ) {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      let index = 1;
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          fields.push(key);
          values.push(value);
          index++;
        }
      }
      if (fields.length === 0) {
        throw new BadRequestError("No updates provided");
      }
      const query = `
        UPDATE core.tasks
        SET ${fields.join(", ")} WHERE _id = $${index}
        WHERE _id = $${index}
        RETURNING *;
      `;
      values.push(task_id);
      const result = await client.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw new BadRequestError(
        "Error updating task: " + (error as Error).message,
      );
    }
  }
}
