import express from "express";

const authRouter = express.Router();
import {
  // githubAuthCallback,
  googleAuthCallback,
  login,
  register,
  verifyOTP,
} from "../controllers/auth.controller.js";
import {
  validateLoginInput,
  validateOTPInput,
  validateRegisterInput,
  validationResultHandler,
} from "../utils/inputValidator.js";
import passport from "passport";

authRouter.post(
  "/user/register",
  validateRegisterInput,
  validationResultHandler,
  register,
);
authRouter.post(
  "/user/account-verify",
  validateOTPInput,
  validationResultHandler,
  verifyOTP,
);
authRouter.post(
  "/user/login",
  validateLoginInput,
  validationResultHandler,
  login,
);
authRouter.get(
  "/google-auth",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
authRouter.get(
  "/github-auth",
  passport.authenticate("github", { scope: ["profile", "email"] }),
);
authRouter.get("/google/callback", googleAuthCallback);
// authRouter.get("/github/callback", githubAuthCallback);

export default authRouter;
