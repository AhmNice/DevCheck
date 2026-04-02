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

import config from "../config/config.js";
import UserInterface from "../interface/user.interface.js";
import crypto from "crypto";
import { Session } from "../model/Session.js";
import { AuthSecurityService } from "../service/authSecurity.service.js";
import { EmailService } from "../service/Email.service.js";
import { ZodError } from "zod";
const emailService = new EmailService();
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
  await emailService.sendOTPMail(
    { name: savedUser.name, email: savedUser.email },
    otp,
  );
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
    await emailService.sendWelcomeMail({ name: user.name, email: user.email });
  } else if (purpose === "password_reset") {
    await emailService.sendPasswordResetRequestMail(
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
  const {
    password: _p,
    resetPassword_token_expiry: _rte,
    resetPassword_token: _rt,
    ...userWithoutPassword
  } = user;
  res.json({
    success: true,
    message: "Login successful",
    user: userWithoutPassword,
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
        return res.redirect(
          `${config.CLIENT_URL}/oauth-popup-callback.html?token=error&user_id=${null}&error=google_oauth_error`,
        );
      }
      console.log("Google OAuth callback user:", user);
      if (!user) {
        return res.redirect(
          `${config.CLIENT_URL}/oauth-popup-callback.html?token=error&user_id=${null}&error=google_oauth_error&error_description=user_not_found`,
        );
      }

      try {
        const nSession = new Session({
          user_id: user._id,
          userName: user.name,
          email: user.email,
          role: user.account_role,
        });
        await nSession.createSession(res);

        return res.redirect(
          `${config.CLIENT_URL}/oauth-popup-callback.html?token=success&user_id=${user._id}`,
        );
      } catch {
        console.error("Error during Google OAuth callback:", err);
        return res.redirect(
          `${config.CLIENT_URL}/oauth-popup-callback.html?token=error&user_id=${null}&error=google_oauth_error&error_description=server_error`,
        );
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
      const state = JSON.parse(req.query.state as string);
      if (state.type === "login") {
        if (err) {
          return res.redirect(
            `${config.CLIENT_URL}/oauth-popup-callback.html?token=error&user_id=${null}&error=github_oauth_error&error_description=server_error`,
          );
        }

        if (!user) {
          return res.redirect(
            `${config.CLIENT_URL}/oauth-popup-callback.html?token=error&user_id=${null}&error=github_oauth_error&error_description=user_not_found`,
          );
        }

        try {
          const nSession = new Session({
            user_id: user._id,
            userName: user.name,
            email: user.email,
            role: user.account_role,
          });

          await nSession.createSession(res);

          return res.redirect(
            `${config.CLIENT_URL}/oauth-popup-callback.html?token=success&user_id=${user._id}`,
          );
        } catch {
          return res.redirect(
            `${config.CLIENT_URL}/oauth-popup-callback.html?token=error&user_id=${null}&error=github_oauth_error&error_description=server_error`,
          );
        }
      }

      if (state.type === "connect") {
        if (err) {
          return res.redirect(
            `${config.CLIENT_URL}/github-connect-callback.html?token=error&user_id=${null}&error=github_oauth_error&error_description=authentication_failed`,
          );
        }

        if (!user) {
          return res.redirect(
            `${config.CLIENT_URL}/github-connect-callback.html?token=error&user_id=${null}&error=github_oauth_error&error_description=user_not_found`,
          );
        }

        return res.redirect(
          `${config.CLIENT_URL}/github-connect-callback.html?token=success&user_id=${user._id}`,
        );
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
    await emailService.sendPasswordResetRequestMail(
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
    await emailService.sendPasswordResetSuccessMail(
      { name: user.name, email: user.email },
      `${config.CLIENT_URL}/support`,
    );
    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  },
);
export const checkAuth = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const findUser = await User.findById(`${user?.user_id}`);
  if (!findUser) {
    throw new BadRequestError("User not found");
  }
  const { password: _password, ...safeData } = findUser;
  return res.status(200).json({
    success: true,
    message: "User Authenticated",
    user: safeData,
  });
});
export const userUpdate = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const user_id = user?.user_id || "";
  if (req.body === undefined || Object.keys(req.body).length === 0) {
    throw new BadRequestError("No data provided for update");
  }
  let updatedUser;

  try {
    const validatedData = req.body;
    await User.updateUserById(user_id, validatedData);
    updatedUser = await User.findById(user_id);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      throw new BadRequestError(
        error.issues[0]?.message || "Invalid input data",
      );
    }

    throw error;
  }

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    user: updatedUser,
  });
});
export const logOut = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  await new Session({
    user_id: user?.user_id || "",
    userName: user?.userName || "",
    email: user?.email || "",
    role: user?.role || "",
  }).destroySession(req, res);
  return res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});
