import dotenv from "dotenv";
dotenv.config({
  quiet: true,
});

interface Config {
  PORT: number;
  NODE_ENV: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  DB_URL: string;
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
}

const config: Config = {
  PORT: Number(process.env.PORT)!,
  NODE_ENV: process.env.NODE_ENV!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN!,
  DB_URL: process.env.DB_URL!,
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
};
export default config;
