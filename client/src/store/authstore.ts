import { create } from "zustand";
import { handleRequest } from "../util/request";
import api from "../services/axios";
import { createAuthHelpers } from "./helper/authHelper";
import type { UserInterface } from "../interface/user";

export interface AuthState {
  isAuthenticated: boolean;
  user?: UserInterface | null;
  loadingUser: boolean;
  userError?: string | null;
  userSuccess: boolean | undefined;
  checkingAuth: boolean;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  account_role: string;
}

type AuthActions = {
  login: (
    payload: LoginPayload,
  ) => Promise<{ success: false } | { success: true; url: string }>;

  register: (
    payload: RegisterPayload,
  ) => Promise<{ success: false } | { success: true; url: string }>;
  checkAuthentication: () => Promise<void>;
  connectGitHub: () => Promise<
    { success: false } | { success: true; url: string }
  >;
  logOut: () => Promise<void>;
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loadingUser: false,
  userError: null,
  userSuccess: false,
  checkingAuth: false,
};

export const useAuthStore = create<AuthState & AuthActions>((set) => {
  const authHelpers = createAuthHelpers(set);

  return {
    ...initialState,
    login: async (payload) => {
      authHelpers.start();
      const res = await handleRequest<{ user: UserInterface }>({
        request: () => api.post("/auth/user/login", payload),

        onSuccess: (data) => {
          authHelpers.success(data.user);
        },

        onError: (error) => {
          authHelpers.error(error?.response?.data?.message || "Login failed");
        },
      });

      if (!res.success) return { success: false };
      return {
        success: true,
        url: "/dashboard",
      };
    },

    register: async (payload) => {
      authHelpers.start();
      const res = await handleRequest<{ user: UserInterface }>({
        request: () => api.post("/auth/user/register", payload),

        onSuccess: (data) => {
          authHelpers.success(data.user);
        },

        onError: (error) => {
          authHelpers.error(
            error?.response?.data?.message || "Registration failed",
          );
        },
      });

      if (!res.success) return { success: false };
      return {
        success: true,
        url: "/auth/verify-otp",
      };
    },
    connectGitHub: async () => {
      authHelpers.start();
      const res = await handleRequest<void>({
        request: () => api.get("/auth/github-auth"),

        onSuccess: () => {
          authHelpers.success(null);
        },

        onError: (error) => {
          authHelpers.error(
            error?.response?.data?.message || "GitHub connection failed",
          );
        },
      });

      if (!res.success) return { success: false };
      return {
        success: true,
        url: "/dashboard",
      };
    },

    checkAuthentication: async () => {
      authHelpers.start(true);
      await handleRequest({
        request: () => api.get(`/auth/user/authenticate`),
        onSuccess: (data) => {
          authHelpers.success(data.user);
        },
        onError: (error) => {
          authHelpers.error(
            error?.response?.data?.message || "Authentication check failed",
          );
        },
        showToast: false,
      });
      authHelpers.stopLoading();
    },
    logOut: async () => {
      authHelpers.start();
      await handleRequest({
        request: () => api.get("/auth/user/logout"),
        onSuccess: () => {
          authHelpers.success(null);
        },
        onError: (error) => {
          authHelpers.error(error?.response?.data?.message || "Logout failed");
        },
        showToast: true,
      });
      authHelpers.stopLoading();
      authHelpers.reset();
    },
  };
});
