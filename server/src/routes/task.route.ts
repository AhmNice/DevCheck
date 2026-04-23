import express from "express";
import {
  changeStatus,
  createTask,
  deleteTask,
  getTasksByUserId,
  getTaskWithSubtasks,
  updateTask,
  uploadJsonTaskFile,
} from "../controllers/task.controller.js";
import { singleUpload } from "../middleware/file_uploader.js";
import {
  validateId,
  validationResultHandler,
} from "../utils/inputValidator.js";
import { verifySession } from "../middleware/verifysession.js";
import {
  sanitizeBodyMiddleware,
  validate,
} from "../middleware/validate.middleware.js";
import { TaskSchema, updateStatusSchema } from "../validation/task_schema.js";
import { protectedRoute } from "../utils/protection.js";

const taskRouter = express.Router();

taskRouter.use(verifySession, protectedRoute(["USER"]), sanitizeBodyMiddleware);

taskRouter.post("/create", validate(TaskSchema), createTask);
taskRouter.post("/import", singleUpload, uploadJsonTaskFile);
taskRouter.get(
  "/get/:task_id",
  validateId("task_id"),
  validationResultHandler,
  getTaskWithSubtasks,
);
taskRouter.get(
  "/user/:user_id",
  validateId("user_id"),
  validationResultHandler,
  getTasksByUserId,
);
taskRouter.delete(
  "/delete/:task_id",
  validateId("task_id"),
  validationResultHandler,
  deleteTask,
);
taskRouter.put(
  "/transition/:task_id",
  validate(updateStatusSchema),
  changeStatus,
);
taskRouter.put(
  "/update/:task_id",
  validateId("task_id"),
  validationResultHandler,
  updateTask,
);

export default taskRouter;
