import { createDatabase, createTables } from "./db_setup.js";

export const initializeDatabase = async () => {
  try {
    const dbCreated = await createDatabase();
    if (!dbCreated) {
      console.log("Database already exists. Skipping creation.");
      return;
    }
    await createTables();
    console.log("Database initialization completed.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};
(async () => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error("Unhandled error during DB initialization:", error);
    process.exit(1);
  }
})();
