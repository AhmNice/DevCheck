import express from "express";
import {
  archiveProject,
  createProject,
  deleteProject,
  destroyProject,
  getProjectById,
  listArchivedProjects,
  listDeletedProjects,
  unarchiveProject,
  userProjects,
} from "../controllers/project.controller.js";
import { jsonProjectHandler } from "../utils/json_task_handler.js";
import {
  validateId,
  validationResultHandler,
} from "../utils/inputValidator.js";
import { verifySession } from "../middleware/verifysession.js";

const projectRouter = express.Router();

projectRouter.post("/create", verifySession, createProject);
projectRouter.get(
  "/get/:project_id",
  validateId("project_id"),
  validationResultHandler,
  verifySession,
  getProjectById,
);
projectRouter.get(
  "/user/:user_id",
  validateId("user_id"),
  validationResultHandler,
  verifySession,
  userProjects,
);
projectRouter.post("/import", verifySession, jsonProjectHandler);
projectRouter.post(
  "/archive/:project_id",
  validateId("project_id"),
  validationResultHandler,
  verifySession,
  archiveProject,
);
projectRouter.post(
  "/unarchive/:project_id",
  validateId("project_id"),
  validationResultHandler,
  verifySession,
  unarchiveProject,
);
projectRouter.put(
  "/delete/:project_id",
  validateId("project_id"),
  validationResultHandler,
  verifySession,
  deleteProject,
);
projectRouter.delete(
  "/destroy/:project_id",
  validateId("project_id"),
  validationResultHandler,
  verifySession,
  destroyProject,
);
projectRouter.get(
  "/archives/:user_id",
  validateId("user_id"),
  validationResultHandler,
  verifySession,
  listArchivedProjects,
);
projectRouter.get(
  "/deleted/:user_id",
  validateId("user_id"),
  validationResultHandler,
  verifySession,
  listDeletedProjects,
);

export default projectRouter;
