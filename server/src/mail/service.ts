import { transporter, sender } from "../config/mail.config.js";
import UserInterface from "../interface/user.interface.js";
import {
  generateOtpEmailTemplate,
  generateResetPasswordSuccessEmailTemplate,
  generateWelcomeEmailTemplate,
} from "./email.template.js";

type UserType = Pick<UserInterface, "email" | "name">;

interface MailArgs {
  email: string;
  subject: string;
  html: string;
}

const mailOption = ({ email, subject, html }: MailArgs) => ({
  from: sender,
  to: email,
  subject: subject,
  html: html,
});

export const sendOTPEmail = async (user: UserType, otp: string) => {
  const html = generateOtpEmailTemplate({ otp, userName: user.name });

  try {
    await transporter.sendMail(
      mailOption({
        email: user.email,
        subject: "DevCheck - Verification Code",
        html,
      }),
    );
  } catch (error) {
    throw new Error("Failed to send OTP email: " + (error as Error).message);
  }
};

export const sendWelcomeEmail = async (user: UserType) => {
  const html = generateWelcomeEmailTemplate({ userName: user.name });
  try {
    await transporter.sendMail(
      mailOption({
        email: user.email,
        subject: "Welcome to DevCheck!",
        html,
      }),
    );
  } catch (error) {
    throw new Error(
      "Failed to send welcome email: " + (error as Error).message,
    );
  }
};

export const sendPasswordResetEmail = async (
  user: UserType,
  supportLink: string,
  loginLink: string,
) => {
  const html = generateResetPasswordSuccessEmailTemplate({
    userName: user.name,
    supportUrl: supportLink,
    loginUrl: loginLink,
  });
  try {
    await transporter.sendMail(
      mailOption({
        email: user.email,
        subject: "DevCheck - Reset Password",
        html,
      }),
    );
  } catch (error) {
    throw new Error(
      "Failed to send password reset email: " + (error as Error).message,
    );
  }
};
