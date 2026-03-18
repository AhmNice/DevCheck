import { Pool, PoolClient } from "pg";
import { RepoInterface } from "../interface/repo.interface.js";
import { pool } from "../config/db.config.js";
import { BadRequestError } from "../utils/errorHandler.js";

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

  async connect(client: Pool | PoolClient = pool) {
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
        INSERT INTO integrations.github_repositories (${fields.join(", ")})
        VALUES (${placeholders.join(", ")})
        RETURNING *;
      `;

      const { rows } = await client.query(query, values);

      return rows[0];
    } catch (error) {
      console.error("Error connecting GitHub repo:", error);
      throw error;
    }
  }
  static async disconnect(
    client: Pool | PoolClient = pool,
    { user_id, github_repo_id }: { user_id: string; github_repo_id: string },
  ) {
    try {
      const query = `SELECT * FROM integrations.github_repositories WHERE github_repo_id = $1 AND user_id = $2`;
      const { rows } = await client.query(query, [github_repo_id, user_id]);
      if (rows.length === 0) {
        throw new BadRequestError("Repository not found");
      }
      const deleteQuery = `DELETE FROM integrations.github_repositories WHERE github_repo_id = $1 AND user_id = $2 RETURNING *`;
      const { rows: deletedRows } = await client.query(deleteQuery, [
        github_repo_id,
        user_id,
      ]);
      return deletedRows[0];
    } catch (error) {
      console.error("Error disconnecting GitHub repo:", error);
      throw error;
    }
  }
  static async findByRepo(
    client: Pool | PoolClient = pool,
    { owner, user_id, repo }: { owner: string; user_id: string; repo?: string },
  ) {
    try {
      const query = `SELECT * FROM integrations.github_repositories WHERE owner = $1 AND user_id = $2 AND name = COALESCE($3, name)`;
      const { rows } = await client.query(query, [owner, user_id, repo]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding GitHub repo:", error);
      throw error;
    }
  }
  static async findByFullName({ full_name }: { full_name: string }) {
    try {
      const query = `SELECT * FROM integrations.github_repositories WHERE full_name = $1`;
      const { rows } = await pool.query(query, [full_name]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding GitHub repo by full name:", error);
      throw error;
    }
  }
}
