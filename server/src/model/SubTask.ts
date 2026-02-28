import { Pool, PoolClient } from "pg";
import { pool } from "../config/db.config.js";
import { SubtaskInterface } from "../interface/task.interface.js";

type subInterface = Pick<
  SubtaskInterface,
  "task_id" | "title" | "description" | "due_date" | "status"
>;

export class SubTask {
  constructor(parameters: subInterface) {
    Object.assign(this, parameters);
  }

  _id!: string;
  task_id!: string;
  title!: string;
  description?: string;
  due_date!: Date;
  status!: "pending" | "in_progress" | "completed";

  async save(client: Pool | PoolClient = pool) {
    try {
      const fields: (keyof subInterface)[] = [
        "task_id",
        "title",
        "description",
        "due_date",
        "status",
      ];

      const columns: string[] = [];
      const values: unknown[] = [];
      const placeholders: string[] = [];

      let index = 1;
      for (const key of fields) {
        const value = this[key];
        if (value !== undefined) {
          columns.push(key);
          values.push(value);
          placeholders.push(`$${index++}`);
        }
      }

      const query = `
        INSERT INTO core.subtasks (${columns.join(", ")})
        VALUES (${placeholders.join(", ")})
        RETURNING *;
      `;

      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Error saving subtask: " + (error as Error).message);
    }
  }
  static async getByTaskId(client: Pool | PoolClient = pool, task_id: string) {
    try {
      const query = `
        SELECT * FROM core.subtasks
        WHERE task_id = $1
      `;
      const result = await client.query(query, [task_id]);
      return result.rows;
    } catch (error) {
      throw new Error("Error fetching subtasks: " + (error as Error).message);
    }
  }
  static async deleteById(
    subtask_id: string,
    client: Pool | PoolClient = pool,
  ) {
    try {
      const query = `
        DELETE FROM core.subtasks
        WHERE _id = $1
      `;
      await client.query(query, [subtask_id]);
    } catch (error) {
      throw new Error("Error deleting subtask: " + (error as Error).message);
    }
  }
}
