import nodemailer, { Transporter } from "nodemailer";
import config from "../config/config.js";

export class EmailService {
  private transporter: Transporter;
  private sender: string = `DevCheck <${config.EMAIL_USER}>`;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: `${config.EMAIL_SERVICE}`,
      host: `${config.EMAIL_HOST}`,
      port: config.EMAIL_PORT,
      secure: config.EMAIL_PORT === 465,
      auth: {
        user: `${config.EMAIL_USER}`,
        pass: `${config.EMAIL_PASS}`,
      },
    });
  }
}
