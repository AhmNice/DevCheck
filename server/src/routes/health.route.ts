import express from "express";
import { healthCheck } from "../controllers/health.js";

const healthRouter = express.Router();
healthRouter.get("/health-check", healthCheck);
export default healthRouter;
