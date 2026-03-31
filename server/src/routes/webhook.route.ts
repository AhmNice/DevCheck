import express from "express";

import { githubWebhook } from "../github/github.controller.js";
import { verifySignature } from "../middleware/verifySignature.js";

const webhookRoute = express.Router();
webhookRoute.post("/github", githubWebhook);
webhookRoute.post(
  "/github",
  express.raw({ type: "application/json" }),
  verifySignature,
  githubWebhook,
);
export default webhookRoute;
