import express from "express";

const authRouter = express.Router();
import {
  checkAuth,
  githubAuthCallback,
  // githubAuthCallback,
  googleAuthCallback,
  login,
  logOut,
  register,
  userUpdate,
  verifyOTP,
} from "../controllers/auth.controller.js";
import {
  validateLoginInput,
  validateOTPInput,
  validateRegisterInput,
  validationResultHandler,
} from "../utils/inputValidator.js";
import passport from "passport";
import { rateLimiter } from "../utils/rateLimiter.js";
import { verifySession } from "../middleware/verifysession.js";
import { validateRequest } from "../middleware/validate.js";
import { userUpdateSchema } from "../validation/user.js";
import { connectGitHub, githubLogin } from "../github/github_auth.js";

authRouter.post(
  "/user/register",
  validateRegisterInput,
  validationResultHandler,
  rateLimiter({ maxTokens: 10, refillInterval: 60 }),
  register,
);
authRouter.post(
  "/user/account-verify",
  validateOTPInput,
  validationResultHandler,
  rateLimiter({ maxTokens: 20, refillInterval: 60 }),
  verifyOTP,
);
authRouter.post(
  "/user/login",
  validateLoginInput,
  validationResultHandler,
  rateLimiter({ maxTokens: 5, refillInterval: 5 }),
  login,
);
authRouter.get(
  "/google-auth",
  rateLimiter({ maxTokens: 20, refillInterval: 60 }),
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
authRouter.get(
  "/github-auth",
  rateLimiter({ maxTokens: 20, refillInterval: 60 }),
  githubLogin,
);
authRouter.get(
  "/connect/github",
  verifySession,
  rateLimiter({ maxTokens: 20, refillInterval: 60 }),
  connectGitHub,
);
authRouter.post(
  "/user/update",
  verifySession,
  validateRequest(userUpdateSchema),
  rateLimiter({ maxTokens: 10, refillInterval: 60 }),
  userUpdate,
);
authRouter.get("/google/callback", googleAuthCallback);
authRouter.get("/github/callback", githubAuthCallback);

authRouter.get("/user/logout", verifySession, logOut);
authRouter.get("/user/authenticate", verifySession, checkAuth);
export default authRouter;
