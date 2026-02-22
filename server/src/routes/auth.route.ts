import express from "express";

const authRouter = express.Router();
import { register } from "../controllers/auth.controller.js";
import {
  validateRegisterInput,
  validationResultHandler,
} from "../utils/inputValidator.js";

authRouter.post(
  "/user/register",
  validateRegisterInput,
  validationResultHandler,
  register,
);

export default authRouter;
