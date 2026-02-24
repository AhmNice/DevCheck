import nodemailer from "nodemailer";
import config from "./config.js";

export const transporter = nodemailer.createTransport({
  service: `${config.EMAIL_SERVICE}`,
  host: `${config.EMAIL_HOST}`,
  port: config.EMAIL_PORT,
  secure: config.EMAIL_PORT === 465,
  auth: {
    user: `${config.EMAIL_USER}`,
    pass: `${config.EMAIL_PASS}`,
  },
});
export const sender = `DevCheck <${config.EMAIL_USER}>`;
