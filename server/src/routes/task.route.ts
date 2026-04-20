import express from "express";
import {
  createTask,
  deleteSubtask,
  deleteTask,
  getTasksByUserId,
  getTaskWithSubtasks,
  saveSubtask,
  updateTask,
} from "../controllers/task.controller.js";
import { jsonTaskHandler } from "../utils/json_task_handler.js";
import { singleUpload } from "../middleware/file_uploader.js";
import {
  validateId,
  validateSubtaskInput,
  validationResultHandler,
} from "../utils/inputValidator.js";
import { verifySession } from "../middleware/verifysession.js";
import { validate } from "../middleware/validate.middleware.js";
import { TaskSchema } from "../validation/task_schema.js";
import { protectedRoute } from "../utils/protection.js";

const taskRouter = express.Router();

taskRouter.use(verifySession, protectedRoute(["USER"]));
taskRouter.post("/create", validate(TaskSchema), createTask);
taskRouter.post(
  "/:task_id/subtasks",
  validateSubtaskInput,
  validationResultHandler,
  saveSubtask,
);
taskRouter.post("/import", singleUpload, jsonTaskHandler);
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
taskRouter.delete("/delete/subtask/:subtask_id", deleteSubtask);
taskRouter.put(
  "/update/:task_id",
  validateId("task_id"),
  validationResultHandler,
  updateTask,
);

export default taskRouter;
