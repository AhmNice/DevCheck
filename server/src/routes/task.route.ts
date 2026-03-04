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
  validateTaskInput,
  validationResultHandler,
} from "../utils/inputValidator.js";
import { verifySession } from "../middleware/verifysession.js";

const taskRouter = express.Router();

taskRouter.post(
  "/create",
  validateTaskInput,
  validationResultHandler,
  createTask,
);
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
  verifySession,
  getTaskWithSubtasks,
);
taskRouter.get(
  "/user/:user_id",
  validateId("user_id"),
  validationResultHandler,
  verifySession,
  getTasksByUserId,
);
taskRouter.delete(
  "/delete/:task_id",
  validateId("task_id"),
  validationResultHandler,
  verifySession,
  deleteTask,
);
taskRouter.delete("/delete/subtask/:subtask_id", verifySession, deleteSubtask);
taskRouter.put(
  "/update/:task_id",
  validateId("task_id"),
  validationResultHandler,
  verifySession,
  updateTask,
);

export default taskRouter;
