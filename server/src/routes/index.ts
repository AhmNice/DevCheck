import { Router } from "express";
import dashboardRouter from "./dashboard.route.js";
import healthRouter from "./health.route.js";
import authRouter from "./auth.route.js";
import taskRouter from "./task.route.js";
import testRouter from "./test.route.js";
import projectRouter from "./project.route.js";
import githubRoute from "./github.route.js";
import webhookRoute from "./webhook.route.js";

const router = Router();
router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/tasks", taskRouter);
router.use("/test", testRouter);
router.use("/projects", projectRouter);
router.use("/integrations/github", githubRoute);
router.use("/webhooks", webhookRoute);
router.use("/dashboard", dashboardRouter);

export default router;
