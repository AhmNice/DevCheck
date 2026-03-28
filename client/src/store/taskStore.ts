import { create } from "zustand";
import type { DashboardSummary, Task } from "../interface/task";
import { createTaskHelpers } from "./helper/taskHelper";
import { handleRequest } from "../util/request";
import api from "../services/axios";

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  taskError: string | null;
  taskSuccess: boolean | undefined;
  dashboardSummary: DashboardSummary | null;
}

interface PayloadFetchTasks {
  user_id: string;
}

interface TaskActions {
  fetchTasks: (payload: PayloadFetchTasks) => Promise<void>;
  createTask: (
    payload: Omit<Task, "_id" | "created_at" | "updated_at">,
  ) => Promise<{ success: boolean; task: Task | null }>;
  updateTask: (
    taskId: string,
    payload: Partial<Omit<Task, "_id" | "created_at" | "updated_at">>,
  ) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  fetchDashboardSummary: (userId: string) => Promise<void>;
  getTaskById: (taskId: string) => Promise<Task | null>;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  taskError: null,
  taskSuccess: undefined,
  dashboardSummary: null,
};

export const useTaskStore = create<TaskState & TaskActions>((set, get) => {
  const taskHelper = createTaskHelpers(set);
  return {
    ...initialState,

    fetchTasks: async (payload) => {
      await handleRequest({
        request: () => api.get(`/tasks/user/${payload.user_id}`),
        onSuccess: (data) => {
          taskHelper.success({ dashboard: false, tasks: data.tasks });
        },
        onError: (err) => {
          taskHelper.error(
            err?.response?.data?.message || "Failed to fetch dashboard summary",
          );
        },
        showToast: false,
      });
    },

    createTask: async (payload) => {
      taskHelper.start();
      const { tasks } = get();
      const res = await handleRequest<Task>({
        request: () => api.post("/tasks/create", payload),
        onSuccess: (data) => {
          taskHelper.success({
            dashboard: false,
            create: true,
            tasks: [...(tasks ?? []), data.task],
          });
        },
        onError: (err) => {
          taskHelper.error(
            err?.response?.data?.message || "Failed to create task",
          );
        },
        showToast: true,
      });
      return res.success
        ? { success: true, task: res.data.task }
        : { success: false, task: null };
    },

    updateTask: async () => {},

    deleteTask: async () => {},

    fetchDashboardSummary: async (userId) => {
      await handleRequest<DashboardSummary>({
        request: () => api.get(`/dashboard/stats?user_id=${userId}`),
        onSuccess: (data) => {
          taskHelper.success({ dashboard: true, dashboardSummary: data.data });
        },
        onError: (err) => {
          taskHelper.error(
            err?.response?.data?.message || "Failed to fetch dashboard summary",
          );
        },
        showToast: false,
      });
    },
    getTaskById: async (taskId: string) => {
      const res = await handleRequest<Task>({
        request: () => api.get(`/tasks/get/${taskId}`),
        onSuccess: (data) => {
          return data.data;
        },
        onError: (err) => {
          taskHelper.error(
            err?.response?.data?.message || "Failed to fetch task details",
          );
          return null;
        },
        showToast: false,
      });
      return res.success ? (res.data.task ?? null) : null;
    },
  };
});
