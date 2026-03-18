import nodemailer, { Transporter } from "nodemailer";
import config from "../config/config.js";
import UserInterface from "../interface/user.interface.js";
import {
  generateOtpEmailTemplate,
  generateResetPasswordRequestEmailTemplate,
  generateResetPasswordSuccessEmailTemplate,
  generateWelcomeEmailTemplate,
} from "../mail/email.template.js";

type UserType = Pick<UserInterface, "email" | "name">;

interface MailArgs {
  email: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter: Transporter;
  private sender: string = `DevCheck <${config.EMAIL_USER}>`;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: config.EMAIL_SERVICE,
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      secure: config.EMAIL_PORT === 465,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
      },
    });
    this.transporter
      .verify()
      .then(() => {
        console.log("✅ Email server ready");
      })
      .catch((error) => {
        console.error("❌ Email server connection failed:", error);
      });
  }

  private mailOption({ email, subject, html }: MailArgs) {
    return {
      from: this.sender,
      to: email,
      subject,
      html,
    };
  }

  async sendOTPMail(user: UserType, otp: string) {
    const html = generateOtpEmailTemplate({
      otp,
      userName: user.name,
    });

    try {
      await this.transporter.sendMail(
        this.mailOption({
          email: user.email,
          subject: "DevCheck - Verification Code",
          html,
        }),
      );
    } catch (error) {
      throw new Error("Failed to send OTP email: " + (error as Error).message);
    }
  }
  async sendWelcomeMail(user: UserType) {
    const content = generateWelcomeEmailTemplate({
      userName: user.name,
    });

    try {
      await this.transporter.sendMail(
        this.mailOption({
          email: user.email,
          subject: "Welcome to DevCheck!",
          html: content,
        }),
      );
    } catch (error) {
      throw new Error(
        "Failed to send welcome email: " + (error as Error).message,
      );
    }
  }
  async sendPasswordResetRequestMail(
    user: UserType,
    resetLink: string,
    expiresIn: string = "1 hour",
  ) {
    const content = generateResetPasswordRequestEmailTemplate({
      userName: user.name,
      resetLink,
      expiresIn,
    });
    try {
      await this.transporter.sendMail(
        this.mailOption({
          email: user.email,
          subject: "DevCheck - Reset Password",
          html: content,
        }),
      );
    } catch (error) {
      throw new Error(
        "Failed to send password reset email: " + (error as Error).message,
      );
    }
  }
  async sendPasswordResetSuccessMail(user: UserType, supportLink: string) {
    const content = generateResetPasswordSuccessEmailTemplate({
      userName: user.name,
      supportUrl: supportLink,
    });
    try {
      await this.transporter.sendMail(
        this.mailOption({
          email: user.email,
          subject: "DevCheck - Password Reset Successful",
          html: content,
        }),
      );
    } catch (error) {
      throw new Error(
        "Failed to send password reset success email: " +
          (error as Error).message,
      );
    }
  }
}
