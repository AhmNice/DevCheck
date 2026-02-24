import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/User.js";
import { BadRequestError } from "../utils/errorHandler.js";
import { generateOTP } from "../utils/codeGenerator.js";
import bcrypt from "bcrypt";
import { createSession } from "../utils/session.js";
import passport from "passport";
import {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../mail/service.js";
import config from "../config/config.js";
import UserInterface from "../interface/user.interface.js";

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
  const user = await User.findByEmail(email);
  if (!user) {
    throw new BadRequestError("User not found");
  }
  if (user.otp !== otp) {
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
  res.json({
    success: true,
    message: "OTP verified successfully",
  });
});
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);
  if (!user) {
    throw new BadRequestError("Invalid email or password");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new BadRequestError("Invalid email or password");
  }
  createSession(
    {
      user_id: user._id,
      userName: user.name,
      email: user.email,
      role: user.account_role,
    },
    res,
  );
  res.json({
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
    (err: undefined, user: UserInterface) => {
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
        createSession(
          {
            user_id: user._id,
            userName: user.name,
            email: user.email,
            role: user.account_role,
          },
          res,
        );
        const { password: _password, ...cleanedUser } = user;
        return res.json({
          success: true,
          message: "Google authentication successful",
          user: cleanedUser,
        });
      } catch (sessionError) {
        return next(sessionError);
      }
    },
  )(req, res, next);
};
// export const githubAuthCallback = (req: Request, res: Response) => {
//   passport.authenticate(
//     "github",
//     { session: false, failureRedirect: "/login" },
//     (err, user) => {
//       if (err || !user) {
//         throw new BadRequestError("GitHub authentication failed");
//       }
//       createSession(
//         {
//           user_id: user._id,
//           userName: user.name,
//           email: user.email,
//           role: user.account_role,
//         },
//         res,
//       );

//       return res.json({
//         success: true,
//         message: "GitHub authentication successful",
//         user,
//       });
//     },
//   )(req, res);
// };
