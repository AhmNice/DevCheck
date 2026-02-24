import crypto from "crypto";
export const generateOTP = (length: number = 6): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  return otp.toString();
};
export const generateRandomPassword = (length: number = 12): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
};
interface ResetPasswordToken {
  token: string;
  hashedToken: string;
  expiresAt: Date;
}

export const generateResetPasswordToken = (): ResetPasswordToken => {
  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  return { token, hashedToken, expiresAt };
};
