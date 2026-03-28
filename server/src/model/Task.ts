import { pool } from "../config/db.config.js";
import { TaskInterface } from "../interface/task.interface.js";
import { BadRequestError } from "../utils/errorHandler.js";
import { Pool, PoolClient } from "pg";
import format from "pg-format";
type taskInterface = Pick<
  TaskInterface,
  | "title"
  | "description"
  | "due_date"
  | "status"
  | "priority"
  | "user_id"
  | "project_id"
  | "source"
  | "source_id"
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
  source?: string;
  source_id?: string;
  async save(client: Pool | PoolClient = pool) {
    try {
      const fields: string[] = [];
      const values: unknown[] = [];
      const placeholders: string[] = [];

      let index = 1;
      for (const [key, value] of Object.entries(this)) {
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
  static async insertMany(tasks: Task[], client: Pool | PoolClient = pool) {
    try {
      const values: unknown[] = tasks.map((task) => [
        task.user_id,
        task.project_id ? task.project_id : null,
        task.title,
        task.description,
        task.due_date,
        task.status,
        task.priority,
        task.source ? task.source : null,
        task.source_id ? task.source_id : null,
      ]);
      console.log(values);
      const query = format(
        `INSERT INTO core.tasks (user_id, project_id, title, description, due_date, status, priority, source, source_id) VALUES %L RETURNING *`,
        values,
      );
      const result = await client.query(query);
      console.log("Insert query result:", result);
      return result.rows;
    } catch (error) {
      throw new Error("Error saving tasks: " + (error as Error).message);
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
      const query = `SELECT t.*,
      u.name AS created_by,
      COUNT (s._id) FILTER (WHERE s.status = 'completed') AS
      completed_subtasks
      FROM core.tasks t
      LEFT JOIN core.subtasks s ON t._id = s.task_id
      LEFT JOIN core.users u ON t.user_id = u._id
      WHERE user_id = $1
      GROUP BY t._id, u.name
      ORDER BY t.created_at DESC`;
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
      u.name AS created_by,
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
    LEFT JOIN core.users u
      ON t.user_id = u._id
    WHERE t._id = $1
    GROUP BY t._id, u.name;
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
  static async findByGitHubIssue(
    client: Pool | PoolClient = pool,
    { github_issue_id, user_id }: { github_issue_id: string; user_id: string },
  ) {
    try {
      const query = `SELECT * FROM core.tasks WHERE source_id = $1 AND user_id = $2 AND status != 'completed'`;
      const result = await client.query(query, [github_issue_id, user_id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new BadRequestError(
        "Error finding task by GitHub issue: " + (error as Error).message,
      );
    }
  }
  static async summaryByUserId({
    client,
    user_id,
  }: {
    client: Pool | PoolClient;
    user_id: string;
  }) {
    const query = `
     SELECT
        CASE
          WHEN status != 'completed' AND due_date < NOW() THEN 'overdue'
          ELSE status
        END AS status_group,
        COUNT(*) AS count
      FROM core.tasks
      WHERE user_id = $1
      GROUP BY status_group;
    `;
    try {
      const result = await client.query(query, [user_id]);
      return result.rows;
    } catch (error) {
      throw new BadRequestError(
        "Error retrieving task summary: " + (error as Error).message,
      );
    }
  }
  static async summaryByProjectId({
    client,
    project_id,
  }: {
    client: Pool | PoolClient;
    project_id: string;
  }) {
    const query = `
      SELECT
        status,
        COUNT(*) AS count
      FROM core.tasks
      WHERE project_id = $1
      GROUP BY status;
    `;
    try {
      const result = await client.query(query, [project_id]);
      return result.rows;
    } catch (error) {
      throw new BadRequestError(
        "Error retrieving task summary: " + (error as Error).message,
      );
    }
  }
  static async weeklySummaryByUserId({
    client,
    user_id,
  }: {
    client: Pool | PoolClient;
    user_id: string;
  }) {
    const query = `
      SELECT
        DATE_TRUNC('week', due_date) AS week_start,
        CASE
          WHEN status != 'completed' AND due_date < NOW() THEN 'overdue'
          ELSE status
        END AS status_group,
        COUNT(*) AS count
      FROM core.tasks
      WHERE user_id = $1
        AND due_date >= NOW() - INTERVAL '4 weeks'
      GROUP BY week_start, status_group
      ORDER BY week_start DESC;
    `;
    try {
      const result = await client.query(query, [user_id]);
      return result.rows;
    } catch (error) {
      throw new BadRequestError(
        "Error retrieving weekly task summary: " + (error as Error).message,
      );
    }
  }
  static async currentWeekProgressByUserId({
    client,
    user_id,
  }: {
    client: Pool | PoolClient;
    user_id: string;
  }) {
    const query = `
    SELECT
      days.day,
      TO_CHAR(days.day, 'Dy') AS day_name,
      COALESCE(COUNT(t._id), 0) AS task_count
    FROM generate_series(
      DATE_TRUNC('week', NOW()),
      DATE_TRUNC('week', NOW()) + INTERVAL '6 days',
      INTERVAL '1 day'
    ) AS days(day)
    LEFT JOIN core.tasks t
      ON DATE_TRUNC('day', t.due_date) = days.day
      AND t.user_id = $1
    GROUP BY days.day
    ORDER BY days.day;
    `;
    try {
      const result = await client.query(query, [user_id]);
      return result.rows;
    } catch (error) {
      throw new BadRequestError(
        "Error retrieving current week progress: " + (error as Error).message,
      );
    }
  }
}
