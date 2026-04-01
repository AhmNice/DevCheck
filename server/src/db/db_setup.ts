import { defaultPool, pool } from "../config/db.config.js";
import config from "../config/config.js";
import format from "pg-format";
import {
  isPgDuplicateDatabaseError,
  validateDatabaseName,
} from "../utils/db_helper.js";

export async function createDatabase(): Promise<boolean> {
  try {
    validateDatabaseName(config.DB_NAME);
    const saveDbName = format.ident(config.DB_NAME);
    await defaultPool.query(`CREATE DATABASE ${saveDbName}`);
    console.log(`Database ${config.DB_NAME} created successfully.`);
    return true;
  } catch (error: unknown) {
    if (isPgDuplicateDatabaseError(error)) {
      console.log(
        `Database ${config.DB_NAME} already exists. Skipping creation.`,
      );
      return false;
    } else {
      console.error("Error creating database:", error);
      throw error;
    }
  }
}

export const createTables = async () => {
  try {
    await pool.query(`BEGIN`);

    // extensions
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // schema
    await pool.query(`CREATE SCHEMA IF NOT EXISTS core;`);
    await pool.query(`CREATE SCHEMA IF NOT EXISTS session;`);
    await pool.query(`CREATE SCHEMA IF NOT EXISTS integrations;`);
    // --- USERS TABLE ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS core.users (
        _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        google_id VARCHAR(255) UNIQUE,
        github_id VARCHAR(255) UNIQUE,
        github_avatar_url TEXT,
        github_username VARCHAR(255),
        github_profile_url TEXT,
        github_access_token TEXT DEFAULT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        bio TEXT,
        profile_picture TEXT,
        account_role VARCHAR(50) NOT NULL CHECK (account_role IN ('user','admin')),
        otp VARCHAR(10),
        otp_expiry TIMESTAMP,
        jobTitle VARCHAR(255),
        account_type VARCHAR(50) CHECK (account_type IN ('pro','free_tier')) DEFAULT 'free_tier',
        is_verified BOOLEAN DEFAULT FALSE,
        resetPassword_token VARCHAR(255),
        resetPassword_token_expiry TIMESTAMP,
        role VARCHAR(255),
        failed_attempts INTEGER DEFAULT 0,
        lock_until TIMESTAMP NULL,
        is_suspended BOOLEAN DEFAULT FALSE,
        github_connected BOOLEAN DEFAULT FALSE,
        github_connected_at TIMESTAMP,
        sync_personal_repos BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE TABLE IF NOT EXISTS session.tokens(
      user_id UUID NOT NULL REFERENCES core.users(_id) ON DELETE CASCADE,
      refresh_token VARCHAR(255) PRIMARY KEY NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
      )
      ;`);
    // --- ENUMS ---
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'task_status'
        ) THEN
          CREATE TYPE task_status AS ENUM ('pending','in_progress','completed', 'overdue');
        END IF;
      END
      $$;
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'task_priority'
        ) THEN
          CREATE TYPE task_priority AS ENUM ('normal','medium','high');
        END IF;
      END
      $$;
    `);
    // --- PROJECTS TABLE ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS core.projects (
        _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES core.users(_id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        deadline TIMESTAMP,
        archived BOOLEAN DEFAULT FALSE,
        total_tasks INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP NULL
      );
    `);

    // --- TASKS TABLE ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS core.tasks (
        _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES core.users(_id) ON DELETE CASCADE,
        project_id UUID REFERENCES core.projects(_id) ON DELETE CASCADE,
        title VARCHAR(225) NOT NULL,
        description TEXT,
        due_date TIMESTAMP NOT NULL,
        status task_status NOT NULL CHECK (status IN ('pending','in_progress','completed')) DEFAULT 'pending' ,
        source VARCHAR(50),
        source_id VARCHAR(255),
        total_subtasks INT DEFAULT 0,
        priority task_priority DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // --- SUBTASKS TABLE ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS core.subtasks (
        _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES core.tasks(_id) ON DELETE CASCADE,
        title VARCHAR(225) NOT NULL,
        description VARCHAR(500),
        due_date TIMESTAMP NOT NULL,
        status task_status DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS integrations.github_repositories (
          _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID  NOT NULL REFERENCES core.users(_id) ON DELETE CASCADE,
          github_repo_id BIGINT UNIQUE NOT NULL,
          owner VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          default_branch VARCHAR(100),
          connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          visibility VARCHAR(20),
          repo_url TEXT,
          last_synced_at TIMESTAMP,
          active BOOLEAN DEFAULT TRUE );
      `);
    // --- TRIGGER FUNCTIONS ---

    // increment project total_tasks
    await pool.query(`
      CREATE OR REPLACE FUNCTION core.increment_project_tasks()
      RETURNS TRIGGER AS $func$
      BEGIN
        UPDATE core.projects
        SET total_tasks = total_tasks + 1
        WHERE _id = NEW.project_id;
        RETURN NEW;
      END;
      $func$ LANGUAGE plpgsql;
    `);

    // decrement project total_tasks
    await pool.query(`
      CREATE OR REPLACE FUNCTION core.decrement_project_tasks()
      RETURNS TRIGGER AS $func$
      BEGIN
        UPDATE core.projects
        SET total_tasks = GREATEST(total_tasks - 1, 0)
        WHERE _id = OLD.project_id;
        RETURN OLD;
      END;
      $func$ LANGUAGE plpgsql;
    `);

    // increment task total_subtasks
    await pool.query(`
      CREATE OR REPLACE FUNCTION core.increment_task_subtasks()
      RETURNS TRIGGER AS $func$
      BEGIN
        UPDATE core.tasks
        SET total_subtasks = total_subtasks + 1
        WHERE _id = NEW.task_id;
        RETURN NEW;
      END;
      $func$ LANGUAGE plpgsql;
    `);

    // decrement task total_subtasks
    await pool.query(`
      CREATE OR REPLACE FUNCTION core.decrement_task_subtasks()
      RETURNS TRIGGER AS $func$
      BEGIN
        UPDATE core.tasks
        SET total_subtasks = GREATEST(total_subtasks - 1, 0)
        WHERE _id = OLD.task_id;
        RETURN OLD;
      END;
      $func$ LANGUAGE plpgsql;
    `);

    // --- TRIGGERS ---

    // tasks triggers
    await pool.query(`
      CREATE TRIGGER task_insert_trigger
      AFTER INSERT ON core.tasks
      FOR EACH ROW
      EXECUTE FUNCTION core.increment_project_tasks();
    `);

    await pool.query(`
      CREATE TRIGGER task_delete_trigger
      AFTER DELETE ON core.tasks
      FOR EACH ROW
      EXECUTE FUNCTION core.decrement_project_tasks();
    `);

    // subtasks triggers
    await pool.query(`
      CREATE TRIGGER subtask_insert_trigger
      AFTER INSERT ON core.subtasks
      FOR EACH ROW
      EXECUTE FUNCTION core.increment_task_subtasks();
    `);

    await pool.query(`
      CREATE TRIGGER subtask_delete_trigger
      AFTER DELETE ON core.subtasks
      FOR EACH ROW
      EXECUTE FUNCTION core.decrement_task_subtasks();
    `);

    // --- INDEXES ---
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON core.tasks(user_id);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON core.tasks(project_id);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON core.subtasks(task_id);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_projects_user_id ON core.projects(user_id);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_projects_id ON core.projects(_id);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_projects_deleted ON core.projects(deleted);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_users_google_id ON core.users(google_id);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_users_github_id ON core.users(github_id);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_users_id ON core.users(_id);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_users_email ON core.users(email);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_session_user_id ON session.tokens(user_id);`,
    );
    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_github_repos_user ON integrations.github_repositories(user_id);
    `);
    await pool.query(`COMMIT`);
    console.log("Tables created successfully with triggers and indexes.");
  } catch (error) {
    try {
      await pool.query(`ROLLBACK`);
    } catch (rollbackError) {
      console.error("Error during ROLLBACK:", rollbackError);
    }
    throw error;
  } finally {
    pool.end();
  }
};
