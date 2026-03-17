import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import config from "../config/config.js";
export const verifySignature = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const signature = req.headers["x-hub-signature-256"];
  const payload = JSON.stringify(req.body);

  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", config.GITHUB_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");
  if (!signature || signature !== expected) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid signature" });
  }
  next();
};
