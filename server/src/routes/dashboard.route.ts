import express from "express";
import { dashboardSummary } from "../controllers/dashboard.controller.js";
import { verifySession } from "../middleware/verifysession.js";
const dashboardRouter = express.Router();

dashboardRouter.get("/stats", verifySession, dashboardSummary);
export default dashboardRouter;
