import { createDatabase, createTable } from "./db_setup.js";

export const initializeDatabase = async () => {
  try {
    await createDatabase();
    await createTable();
    console.log("Database initialization completed.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};
initializeDatabase();
