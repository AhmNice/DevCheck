// utils/toast.js
import toast from "react-hot-toast";

export const toastWarn = (msg: string) =>
  toast(msg, {
    icon: "⚠️",
    style: {
      border: "1px solid #facc15",
      color: "#facc15",
      background: "#0f172a",
    },
  });

export const toastSuccess = (msg: string) => toast.success(msg);
export const toastError = (msg: string) => toast.error(msg);