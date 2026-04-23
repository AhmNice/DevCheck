import axios from "axios";
import { toastError } from "../components/Toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});

const public_pages = [
  "/",
  "/auth/login",
  "/auth/success",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/verify-otp",
  "/auth/reset-password",
  "/auth/change-password",
  "/user-auth/oauth-callback",
];

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || "An error occurred";
    const currentPath = window.location.pathname;

    //  Unauthorized
    if (status === 401) {
      if (!public_pages.includes(currentPath)) {
        toastError(message || "Session expired. Please log in again.");
        window.location.href = "/auth/login";
      }

      return Promise.reject(error);
    }
    if (status === 403) {
      toastError(message);
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

export default api;
