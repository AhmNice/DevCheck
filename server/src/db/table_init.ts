import { createTables } from "./db_setup.js";

const table_init = async () => {
  try {
    await createTables();
    console.log("Tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};
table_init();
