// components/StatusBadge.tsx
import React, { useState } from "react";
import {
  ChevronDown,
  CheckCircle,
  Archive,
  Clock,
  AlertCircle,
  Eye,
  Package
} from "lucide-react";
import BlockedReason from "./modal/BlockedReason";


export type Status =
  | "BACKLOG"
  | "PLANNED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "IN_REVIEW"
  | "SHIPPED";

interface StatusConfig {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  dotColor: string;
  order: number;
}

interface StatusBadgeProps {
  status: Status;
  onStatusChange: (newStatus: Status, blockedReason?: string) => Promise<void>;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig: Record<Status, StatusConfig> = {
  BACKLOG: {
    label: "Backlog",
    icon: Archive,
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    dotColor: "bg-gray-500",
    order: 0
  },
  PLANNED: {
    label: "Planned",
    icon: Clock,
    color: "text-blue-800",
    bgColor: "bg-blue-100",
    dotColor: "bg-blue-500",
    order: 1
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Clock,
    color: "text-yellow-800",
    bgColor: "bg-yellow-100",
    dotColor: "bg-yellow-500",
    order: 2
  },
  BLOCKED: {
    label: "Blocked",
    icon: AlertCircle,
    color: "text-red-800",
    bgColor: "bg-red-100",
    dotColor: "bg-red-500",
    order: 3
  },
  IN_REVIEW: {
    label: "In Review",
    icon: Eye,
    color: "text-purple-800",
    bgColor: "bg-purple-100",
    dotColor: "bg-purple-500",
    order: 4
  },
  SHIPPED: {
    label: "Shipped",
    icon: Package,
    color: "text-green-800",
    bgColor: "bg-green-100",
    dotColor: "bg-green-500",
    order: 5
  }
};

const sizeStyles = {
  sm: {
    badge: "px-1.5 py-0.5 text-[9px] gap-1",
    icon: "size-3",
    chevron: "size-2.5",
    menu: "min-w-[120px]",
    item: "px-2 py-1 text-[10px] gap-1.5",
    itemIcon: "size-3"
  },
  md: {
    badge: "px-2 py-0.5 text-[10px] gap-1.5",
    icon: "size-3.5",
    chevron: "size-3",
    menu: "min-w-[140px]",
    item: "px-3 py-1.5 text-xs gap-2",
    itemIcon: "size-3.5"
  },
  lg: {
    badge: "px-3 py-1 text-xs gap-2",
    icon: "size-4",
    chevron: "size-3.5",
    menu: "min-w-[160px]",
    item: "px-3 py-2 text-sm gap-2",
    itemIcon: "size-4"
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  onStatusChange,
  showLabel = true,
  size = "md",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null);
  const [blockedReason, setBlockedReason] = useState("");

  const currentConfig = statusConfig[status];
  const styles = sizeStyles[size];

  const handleStatusChange = async (newStatus: Status) => {
    if (newStatus === status || isUpdating) return;

    // If changing to BLOCKED, show the reason modal
    if (newStatus === "BLOCKED") {
      setPendingStatus(newStatus);
      setShowBlockedModal(true);
      return;
    }

    // For other status changes, proceed directly
    setIsUpdating(true);
    try {
      await onStatusChange(newStatus);
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  const handleBlockedReasonSave = async () => {
    if (!pendingStatus || !blockedReason.trim()) return;

    setIsUpdating(true);
    try {
      await onStatusChange(pendingStatus, blockedReason);
      setShowBlockedModal(false);
      setBlockedReason("");
      setPendingStatus(null);
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  const handleCloseBlockedModal = () => {
    setShowBlockedModal(false);
    setBlockedReason("");
    setPendingStatus(null);
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isUpdating}
          className={`inline-flex items-center ${styles.badge} rounded-full font-medium transition-all hover:scale-105 ${
            currentConfig.bgColor
          } ${currentConfig.color} ${isUpdating ? "opacity-50 cursor-wait" : ""}`}
        >
          {showLabel ? (
            <>
              <currentConfig.icon className={styles.icon} />
              {currentConfig.label}
              <ChevronDown className={`${styles.chevron} transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </>
          ) : (
            <>
              <currentConfig.icon className={styles.icon} />
              <ChevronDown className={`${styles.chevron} transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </>
          )}
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className={`absolute left-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 ${styles.menu}`}>
              {Object.entries(statusConfig).map(([statusKey, config]) => (
                <button
                  key={statusKey}
                  onClick={() => handleStatusChange(statusKey as Status)}
                  disabled={isUpdating}
                  className={`w-full ${styles.item} text-left hover:bg-gray-50 transition-colors flex items-center ${
                    status === statusKey
                      ? `${config.color} font-medium`
                      : "text-gray-700"
                  } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <config.icon className={styles.itemIcon} />
                  <span className="flex-1">{config.label}</span>
                  {status === statusKey && (
                    <CheckCircle className={`${styles.itemIcon} text-green-500`} />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Blocked Reason Modal */}
      {showBlockedModal && (
        <BlockedReason
          reason={blockedReason}
          isUpdating={isUpdating}
          setBlockedReason={setBlockedReason}
          onClose={handleCloseBlockedModal}
          onSave={handleBlockedReasonSave}
        />
      )}
    </>
  );
};