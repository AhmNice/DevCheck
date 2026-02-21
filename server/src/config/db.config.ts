import pg from "pg";
import config from "./config.js";

const configWitOutDB = {
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  host: config.DB_HOST,
  port: config.DB_PORT,
};
export const defaultPool = new pg.Pool(configWitOutDB);

export const pool = new pg.Pool({
  ...configWitOutDB,
  database: config.DB_NAME,
});
