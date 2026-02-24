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
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // create schemas
    await pool.query(`CREATE SCHEMA IF NOT EXISTS core`);
    // create tables
    await pool.query(`CREATE TABLE IF NOT EXISTS core.users (
      _id UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
      google_id VARCHAR(255) UNIQUE,
      github_id VARCHAR(255) UNIQUE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      bio TEXT,
      profile_picture TEXT,
      account_role VARCHAR(50) NOT NULL CHECK (account_role IN ('user', 'admin')),
      otp VARCHAR(10),
      otp_expiry TIMESTAMP,
      is_verified BOOLEAN DEFAULT FALSE,
      restPassword_token VARCHAR(255),
      resetPassword_token_expiry TIMESTAMP,
      role VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`);
    await pool.query(`COMMIT`);
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
