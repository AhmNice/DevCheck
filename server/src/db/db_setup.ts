import { defaultPool, pool } from "../config/db.config.js";
import config from "../config/config.js";
export async function createDatabase() {
  try {
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const checkDbResult = await defaultPool.query(checkDbQuery, [
      config.DB_NAME,
    ]);
    if (checkDbResult.rowCount === 0) {
      const createDbQuery = `CREATE DATABASE ${config.DB_NAME}`;
      await defaultPool.query(createDbQuery);
      console.log(`Database ${config.DB_NAME} created successfully.`);
    } else {
      console.log(`Database ${config.DB_NAME} already exists.`);
    }
  } catch (error) {
    console.error("Error creating database:", error);
  } finally {
    await defaultPool.end();
  }
}
export const createTable = async () => {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
    await pool.query(`BEGIN`);

    // create schemas
    await pool.query(`CREATE SCHEMA IF NOT EXISTS core`);
    // create tables
    await pool.query(`CREATE TABLE IF NOT EXISTS core.users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      bio TEXT,
      profile_picture TEXT,
      account_role VARCHAR(50) NOT NULL CHECK (account_role IN ('user', 'admin')),
      role VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`);
    await pool.query(`COMMIT`);
  } catch (error) {
    await pool.query(`ROLLBACK`);
    console.error("Error creating tables:", error);
  }
};
