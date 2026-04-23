import { create } from "zustand";
import type { DashboardSummary, Task, TaskStatus } from "../interface/task";
import { createTaskHelpers } from "./helper/taskHelper";
import { handleRequest, type errorResponse } from "../util/request";
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
  ) => Promise<{
    success: boolean;
    task: Task | null;
    error?: errorResponse | null;
  }>;
  updateTask: (
    taskId: string,
    payload: Partial<Omit<Task, "_id" | "created_at" | "updated_at">>,
  ) => Promise<{
    success: boolean;
    task?: Task | null;
    error?: errorResponse | null;
  }>;
  uploadJsonTaskFile: (file: File) => Promise<{
    success: boolean;
    error?: errorResponse | null;
  }>;
  deleteTask: (taskId: string) => Promise<{
    success: boolean;
    error?: errorResponse | null;
  }>;
  fetchDashboardSummary: (userId: string) => Promise<void>;
  getTaskById: (taskId: string) => Promise<Task | null>;
  changeStatus: (payload: {
    taskId: string;
    status: TaskStatus;
    blockedReason?: string;
  }) => Promise<{ success: boolean }>;
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
          const tasks: Task[] = Array.isArray(data.data)
            ? (data.data as Task[])
            : [];
          taskHelper.success({ dashboard: false, tasks });
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
            tasks: [...(tasks ?? []), data.data as Task],
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
        ? { success: true, task: res.data?.task || res.data, error: null }
        : { success: false, task: null, error: res.errors ?? null };
    },

    updateTask: async (taskId: string, payload) => {
      const res = await handleRequest<Task>({
        request: () => api.put(`/tasks/update/${taskId}`, payload),
        onSuccess: (data) => {
          const updatedTask: Task = data.data as Task;
          const { tasks } = get();
          const updatedTasks = tasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task,
          );
          set({ tasks: updatedTasks });
        },
        onError: (err) => {
          taskHelper.error(
            err?.response?.data?.message || "Failed to update task",
          );
        },
        showToast: true,
      });
      return res.success
        ? { success: true, task: res.data?.task || res.data, error: null }
        : { success: false, task: null, error: res.errors ?? null };
    },

    deleteTask: async (taskId: string) => {
      const res = await handleRequest({
        request: () => api.delete(`/tasks/delete/${taskId}`),
        onSuccess: () => {
          const { tasks } = get();
          set({ tasks: tasks.filter((task) => task._id !== taskId) });
        },
        onError: (err) => {
          taskHelper.error(
            err?.response?.data?.message || "Failed to delete task",
          );
        },
        showToast: true,
      });
      return {
        success: res.success,
        error: res.success ? null : (res.errors ?? null),
      };
    },
    uploadJsonTaskFile: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await handleRequest({
        request: () =>
          api.post("/tasks/import", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }),
        onSuccess: (data) => {
          const { tasks } = get();
          const newTasks: Task[] = Array.isArray(data.data)
            ? (data.data as Task[])
            : [];
          set({ tasks: [...(tasks ?? []), ...newTasks] });
        },
        onError: (err) => {
          taskHelper.error(
            err?.response?.data?.message || "Failed to upload task file",
          );
        },
        showToast: true,
      });
      return {
        success: res.success,
        error: res.success ? null : (res.errors ?? null),
      };
    },
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
          const task: Task = data.data as Task;
          return task;
        },
        onError: (err) => {
          taskHelper.error(
            err?.response?.data?.message || "Failed to fetch task details",
          );
          return null;
        },
        showToast: false,
      });
      return res.success ? ((res.data?.data as Task) ?? null) : null;
    },
    changeStatus: async (payload: {
      taskId: string;
      status: TaskStatus;
      blockedReason?: string;
    }) => {
      const res = await handleRequest<Task>({
        request: () =>
          api.put(`/tasks/transition/${payload.taskId}`, {
            newStatus: payload.status,
            task_id: payload.taskId,
            blockedReason: payload?.blockedReason,
          }),
        onSuccess: (data) => {
          const updatedTask: Task = data.data as Task;
          const { tasks } = get();
          const updatedTasks = tasks.map((task) =>
            task._id === updatedTask._id ? updatedTask : task,
          );
          set({ tasks: updatedTasks });
        },
        onError: (err) => {
          taskHelper.error(
            err?.response?.data?.message || "Failed to update task status",
          );
        },
        showToast: true,
      });
      return res.success ? { success: true } : { success: false };
    },
  };
});
