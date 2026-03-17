import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/User.js";
import { BadRequestError } from "../utils/errorHandler.js";
import {
  generateOTP,
  generateResetPasswordToken,
} from "../utils/codeGenerator.js";
import bcrypt from "bcrypt";
import passport from "passport";
import {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendPasswordResetRequestEmail,
  sendWelcomeEmail,
} from "../mail/service.js";
import config from "../config/config.js";
import UserInterface from "../interface/user.interface.js";
import crypto from "crypto";
import { Session } from "../model/Session.js";
import { AuthSecurityService } from "../service/authSecurity.service.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, account_role } = req.body;
  if (await User.exists(email)) {
    throw new BadRequestError("User with this email already exists");
  }
  const accountRole = account_role || "user";
  const otp = generateOTP(6);
  const user = new User({
    name,
    email,
    password,
    otp,
    otp_expiry: new Date(Date.now() + 10 * 60 * 1000),
    account_role: accountRole,
    google_id: null,
    profile_picture: "",
    github_id: null,
  });
  const savedUser = await user.save();
  await sendOTPEmail({ name: savedUser.name, email: savedUser.email }, otp);
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: savedUser,
  });
});
export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const { purpose } = req.query;
  if (purpose !== "verification" && purpose !== "password_reset") {
    throw new BadRequestError("Invalid purpose for OTP verification");
  }
  const user = await User.findByEmailWithOTP(email);
  if (!user) {
    throw new BadRequestError("User not found");
  }
  await AuthSecurityService.checkLock(user._id);
  if (user.otp !== otp) {
    await AuthSecurityService.registerFailure(user._id);
    throw new BadRequestError("Invalid OTP or OTP has expired");
  }
  if (user.otp_expiry && user.otp_expiry < new Date()) {
    throw new BadRequestError("Invalid OTP or OTP has expired");
  }
  const updates: Partial<UserInterface> = {
    otp: null,
    otp_expiry: null,
  };
  if (purpose === "verification") {
    updates.is_verified = true;
    await sendWelcomeEmail({ name: user.name, email: user.email });
  } else if (purpose === "password_reset") {
    await sendPasswordResetEmail(
      { name: user.name, email: user.email },
      `${config.CLIENT_URL}/support`,
      `${config.CLIENT_URL}/login`,
    );
  }
  await User.updateUserByEmail(user.email, updates);
  await AuthSecurityService.reset(user._id);
  return res.status(200).json({
    success: true,
    message: "OTP verified successfully",
  });
});
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findByEmailWithPassword(email);
  if (!user) {
    throw new BadRequestError("Invalid email or password");
  }
  await AuthSecurityService.checkLock(user._id);
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    await AuthSecurityService.registerFailure(user._id);
    throw new BadRequestError("Invalid email or password");
  }
  const nSession = new Session({
    user_id: user._id,
    userName: user.name,
    email: user.email,
    role: user.account_role,
  });
  await nSession.createSession(res);
  await AuthSecurityService.reset(user._id);
  return res.status(200).json({
    success: true,
    message: "Login successful",
    user,
  });
});
export const googleAuthCallback = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate(
    "google",
    { session: false },
    async (err: undefined, user: UserInterface) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Google authentication failed: User not found",
        });
      }

      try {
        const nSession = new Session({
          user_id: user._id,
          userName: user.name,
          email: user.email,
          role: user.account_role,
        });
        await nSession.createSession(res);

        return res.redirect(`${config.CLIENT_URL}/user-auth/oauth-success`);
      } catch (sessionError) {
        return next(sessionError);
      }
    },
  )(req, res, next);
};
export const githubAuthCallback = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate(
    "github",
    { session: false },
    async (err: undefined, user: UserInterface) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "github authentication failed: User not found",
        });
      }

      try {
        const nSession = new Session({
          user_id: user._id,
          userName: user.name,
          email: user.email,
          role: user.account_role,
        });
        await nSession.createSession(res);
        return res.redirect(`${config.CLIENT_URL}/user-auth/oauth-success`);
      } catch (error) {
        return next(error);
      }
    },
  )(req, res, next);
};
export const requestPasswordReset = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      throw new BadRequestError("User not found");
    }
    const token = generateResetPasswordToken();

    await User.updateUserByEmail(email, {
      resetPassword_token: token.hashedToken,
      resetPassword_token_expiry: token.expiresAt,
    });
    await sendPasswordResetRequestEmail(
      user,
      `${config.CLIENT_URL}/reset-password/${token.token}`,
      "1 hour",
    );
    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  },
);
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.query;
    const { newPassword } = req.body;
    if (!token || typeof token !== "string") {
      throw new BadRequestError("Invalid or missing token");
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findByResetPasswordToken(hashedToken);
    if (!user) {
      throw new BadRequestError("Invalid or expired token");
    }
    if (
      user.resetPassword_token_expiry &&
      user.resetPassword_token_expiry < new Date()
    ) {
      throw new BadRequestError("Invalid or expired token");
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.updateUserByEmail(user.email, {
      password: passwordHash,
      resetPassword_token: null,
      resetPassword_token_expiry: null,
    });
    await sendPasswordResetEmail(
      { name: user.name, email: user.email },
      `${config.CLIENT_URL}/support`,
      `${config.CLIENT_URL}/login`,
    );
    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  },
);
