import { Calendar, ChevronRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Subtask, Task, TaskStatus } from "../../interface/task";
import { formatDateTime } from "../../util/dateUtils";
import { getPlainFirstLine } from "../../util/generalUtils";

// Status configuration matching your design system
const statusConfig = {
  BACKLOG: {
    label: "Backlog",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    dotColor: "bg-gray-500"
  },
  PLANNED: {
    label: "Planned",
    color: "text-blue-800",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    dotColor: "bg-blue-500"
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-yellow-800",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-200",
    dotColor: "bg-yellow-500"
  },
  BLOCKED: {
    label: "Blocked",
    color: "text-red-800",
    bgColor: "bg-red-100",
    borderColor: "border-red-200",
    dotColor: "bg-red-500"
  },
  IN_REVIEW: {
    label: "In Review",
    color: "text-purple-800",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-200",
    dotColor: "bg-purple-500"
  },
  SHIPPED: {
    label: "Shipped",
    color: "text-green-800",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    dotColor: "bg-green-500"
  }
};



// Helper function to get status styles
const getStatusStyles = (status: TaskStatus) => {
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.PLANNED;
};

// Helper function to format status label
const formatStatusLabel = (status: TaskStatus): string => {
  const config = getStatusStyles(status);
  return config.label;
};

export const MiniTaskCard = ({ task }: { task: Task }) => {
  return (
    <div>
      <div className="flex items-center px-4 justify-between hover:bg-gray-50/50 transition-colors">
        <div className="flex items-center gap-4 py-3">
          <div>
            <h2 className="text-sm font-medium text-gray-700">{task?.title}</h2>
            <div className="flex items-center gap-4 text-gray-500 mt-1">
              <div className="flex text-xs items-center gap-1.5">
                <Calendar size={14} />
                <span>Created: {formatDateTime(task?.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar size={14} />
                <span>Due: {formatDateTime(task?.due_date)}</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <ChevronRight size={18} className="text-gray-400" />
        </div>
      </div>
      <div className="w-full h-px bg-gray-200/60"></div>
    </div>
  );
};

const TaskCard = ({ task }: { task: Task }) => {
  const navigate = useNavigate();
  const statusStyle = getStatusStyles(task.status);

  // Calculate percentage based on status
  const percentage = task.status === "SHIPPED"
    ? 100
    : Math.round((Number(task.completed_subtasks) / Number(task.total_subtasks)) * 100) || 0;

  // Priority styles
  const getPriorityStyles = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-600 border border-red-200/50";
      case "medium":
        return "bg-orange-50 text-orange-600 border border-orange-200/50";
      case "low":
        return "bg-green-50 text-green-600 border border-green-200/50";
      case "normal":
        return "bg-blue-50 text-blue-600 border border-blue-200/50";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200/50";
    }
  };

  const priorityStyle = getPriorityStyles(task.priority);

  return (
    <div className={`bg-white border ${task.isOverDue ? 'border-red-200' : 'border-gray-200/60'} shadow-sm rounded-xl p-5 hover:shadow-md transition-all duration-300`}>
      {/* Status and Priority Badges */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span
            className={`text-xs px-3 py-1 rounded-md font-semibold ${statusStyle.bgColor} ${statusStyle.color} border ${statusStyle.borderColor}`}
          >
            {formatStatusLabel(task.status)}
          </span>

          {/* Priority Badge */}
          <span className={`text-xs px-3 py-1 rounded-md font-semibold ${priorityStyle}`}>
            {task.priority.toUpperCase()}
          </span>
        </div>

        {/* Status indicator dot */}
        <div className={`rounded-full w-2 h-2 ${statusStyle.dotColor}`}></div>
      </div>

      <h2 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h2>

      {task.description && (
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {getPlainFirstLine(task.description)}
        </p>
      )}

      {/* Progress Bar - only show if not SHIPPED */}
      {task.status !== "SHIPPED" && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-gray-500 text-xs">Progress</p>
            <p className="font-semibold text-sm">{percentage}%</p>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${percentage}%` }}
              className="bg-blue-500 rounded-full h-1.5 transition-all duration-300"
            ></div>
          </div>
        </div>
      )}

      {/* Show completion indicator for SHIPPED tasks */}
      {task.status === "SHIPPED" && (
        <div className="mb-4 flex items-center gap-2 text-green-600">
          <div className="w-full h-px bg-green-200/60"></div>
          <span className="text-xs font-medium whitespace-nowrap">Completed</span>
          <div className="w-full h-px bg-green-200/60"></div>
        </div>
      )}

      {/* Blocked indicator */}
      {task.status === "BLOCKED" && (
        <div className="mb-4 p-2 bg-red-50 rounded-lg border border-red-100">
          <p className="text-xs text-red-700 truncate">
            {task.blocked_reason || "Task is currently blocked"}
          </p>
        </div>
      )}

      <div className="w-full h-px bg-gray-200/60 my-3"></div>

      <div className="flex items-center justify-between text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar size={14} className="text-gray-400" />
            <span>Created: {formatDateTime(task.created_at)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar size={14} className="text-gray-400" />
            <span>Due: {formatDateTime(task.due_date)}</span>
          </div>
        </div>
        <button
          onClick={() =>
            navigate(`/task/${task.title}/${task._id}`, {
              state: task,
            })
          }
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
          aria-label="View task details"
        >
          <ExternalLink
            size={16}
            className="text-gray-400 group-hover:text-blue-500 transition-colors"
          />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;