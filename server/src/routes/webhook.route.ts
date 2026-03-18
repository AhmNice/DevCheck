import express from "express";
import { githubWebhook } from "../controllers/github.controller.js";

const webhookRoute = express.Router();

webhookRoute.post("/github", githubWebhook);
export default webhookRoute;
