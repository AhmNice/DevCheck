import express from "express";
import { verifySignature } from "../middleware/verifySignature.js";
import { githubWebhook } from "../controllers/github.controller.js";

const webhookRoute = express.Router();

webhookRoute.post("/github", verifySignature, githubWebhook);
export default webhookRoute;
