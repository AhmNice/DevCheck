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

const taskRouter = express.Router();

taskRouter.post("/create", createTask);
taskRouter.post("/:task_id/subtasks", saveSubtask);
taskRouter.post("/import", singleUpload, jsonTaskHandler);
taskRouter.get("/get/:task_id", getTaskWithSubtasks);
taskRouter.get("/user/:user_id", getTasksByUserId);
taskRouter.delete("/delete/:task_id", deleteTask);
taskRouter.delete("/delete/subtask/:subtask_id", deleteSubtask);
taskRouter.put("/update/:task_id", updateTask);

export default taskRouter;
