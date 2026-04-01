import { Calendar, ChevronRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Subtask, Task, TaskStatus } from "../../interface/task";
import { formatDateTime } from "../../util/dateUtils";
import { getPlainFirstLine } from "../../util/generalUtils";


export interface taskProps {
  _id: string;
  user_id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date: Date |string;
  status: TaskStatus;
  total_subtasks: number;
  completed_subtasks: number;
  priority: "low" | "normal" | "high";
  created_at: string;
  updated_at: string;
  subtasks: Subtask[];
}

export const MiniTaskCard = ({ task }: { task: taskProps }) => {
  const percentage = ((task.completed_subtasks / task.total_subtasks)) * 100;

  return (
    <div>
      <div className="flex items-center px-4 justify-between hover:bg-gray-50/50 transition-colors">
        <div className="flex items-center gap-4 py-3">
          <div className="rounded-full w-3 h-3 bg-blue-500 flex-shrink-0"></div>
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
  let tagStyle = "";
  const percentage = task.status && task.status ==='completed' ? 100 : Math.round(
    (Number(task.completed_subtasks) / Number(task.total_subtasks)) * 100
  ) || 0;


  if (task.priority.includes("high")) {
    tagStyle = "bg-red-50 text-red-600 border border-red-200/50";
  } else if (task.priority.includes("medium")) {
    tagStyle = "bg-orange-50 text-orange-600 border border-orange-200/50";
  } else if (task.priority.includes("low")) {
    tagStyle = "bg-green-50 text-green-600 border border-green-200/50";
  } else if (task.priority.includes("normal")) {
    tagStyle = "bg-blue-50 text-blue-600 border border-blue-200/50";
  }

  return (
    <div className="bg-white border border-gray-200/60 shadow-sm rounded-xl p-5 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs px-3 py-1 rounded-md font-semibold ${tagStyle}`}
        >
          {task.priority.toUpperCase()}
        </span>
      </div>

      <h2 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h2>

      {task.description && (
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {getPlainFirstLine(task.description)}
        </p>
      )}

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