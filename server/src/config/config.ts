import dotenv from "dotenv";
import { SignOptions } from "jsonwebtoken";
dotenv.config({
  quiet: true,
});

interface Config {
  PORT: number;
  NODE_ENV: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: SignOptions["expiresIn"];
  DATABASE_URL: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  REDIS_URL: string;
  CLIENT_URL: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  EMAIL_SERVICE: string;
  SESSION_COOKIE_NAME_ACCESS: string;
  SESSION_COOKIE_NAME_REFRESH: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  DEV_WEBHOOK_URL: string;
  GITHUB_WEBHOOK_SECRET: string;
  PROD_WEBHOOK_URL: string;
}

const config: Config = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "supersecret",
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN ||
    "7d") as SignOptions["expiresIn"],
  DATABASE_URL: process.env.DATABASE_URL!,
  DB_HOST: process.env.DB_HOST!,
  DB_PORT: Number(process.env.DB_PORT)!,
  DB_NAME: process.env.DB_NAME!,
  DB_USER: process.env.DB_USER!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  REDIS_URL: process.env.REDIS_URL!,
  CLIENT_URL: process.env.CLIENT_URL!,
  EMAIL_HOST: process.env.EMAIL_HOST!,
  EMAIL_PORT: Number(process.env.EMAIL_PORT)!,
  EMAIL_USER: process.env.EMAIL_USER!,
  EMAIL_PASS: process.env.EMAIL_PASS!,
  EMAIL_SERVICE: process.env.EMAIL_SERVICE!,
  SESSION_COOKIE_NAME_ACCESS:
    process.env.SESSION_COOKIE_NAME_ACCESS || "devcheck_access",
  SESSION_COOKIE_NAME_REFRESH:
    process.env.SESSION_COOKIE_NAME_REFRESH || "devcheck_refresh",
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  DEV_WEBHOOK_URL: process.env.DEV_WEBHOOK_URL!,
  GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET!,
  PROD_WEBHOOK_URL: process.env.PROD_WEBHOOK_URL!,
};
export default config;
