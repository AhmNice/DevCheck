import React from "react";
import { toast as hotToast, type Toast as HotToast } from "react-hot-toast";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

type NotificationStyle = {
  bg: string;
  text: string;
  icon: React.ElementType;
  border: string;
};

const notificationTypes: Record<ToastType, NotificationStyle> = {
  success: {
    bg: "bg-green-500",
    text: "text-white",
    icon: CheckCircle,
    border: "border-green-400",
  },
  error: {
    bg: "bg-red-500",
    text: "text-white",
    icon: AlertCircle,
    border: "border-red-400",
  },
  info: {
    bg: "bg-blue-500",
    text: "text-white",
    icon: Info,
    border: "border-blue-400",
  },
  warning: {
    bg: "bg-yellow-500",
    text: "text-black",
    icon: AlertTriangle,
    border: "border-yellow-400",
  },
};

type Props = {
  t: HotToast;
};

const Toast: React.FC<Props> = ({ t }) => {
  const toastType: ToastType =
    t.type === "success"
      ? "success"
      : t.type === "error"
        ? "error"
        : t.icon === "⚠️"
          ? "warning"
          : "info";

  const styles = notificationTypes[toastType] || notificationTypes.info;
  const IconComponent = styles.icon;

  return (
    <div
      className={`
        ${styles.bg} ${styles.text}
        rounded-lg shadow-lg border ${styles.border}
        transition-all duration-300 ease-in-out
        min-w-[300px] max-w-md
        ${t.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}
      `}
      {...t.ariaProps}
    >
      <div className="flex items-start gap-3 p-4">
        <IconComponent className="w-5 h-5" />

        <div className="flex-1">
          <p className="text-sm font-medium">{t.message as React.ReactNode}</p>
        </div>

        <button
          onClick={() => hotToast.dismiss(t.id)}
          className="ml-2 hover:opacity-70"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
