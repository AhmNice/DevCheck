import { useLocation } from "react-router-dom";
import DashboardLayout from "../Layout/DashboardLayout";
import {
  Calendar,
  Share2,
  Trash2,
  User,
  CheckCircle,
  Plus,
} from "lucide-react";
import SubtaskCard from "../components/cards/SubtaskCard";
import { useEffect, useState } from "react";
import { useTaskStore } from "../store/taskStore";
import type { Subtask, Task } from "../interface/task";
import { formatDate } from "../util/dateUtils";
import { MarkdownRenderer } from "../components/RenderMarkdown";

interface TaskData {
  title?: string;
  description?: string;
  endDate?: string;
  subtaskData?: Subtask[];
}

export const TaskDetials = () => {
  const location = useLocation();
  const { getTaskById } = useTaskStore();
  const [taskData, setTaskData] = useState<Task | null>(null);
  const taskId = location.pathname.split("/").pop();
  const [subtaskInput, setSubtaskInput] = useState("");
  const { title, description, endDate, subtaskData } = (location.state ||
    {}) as TaskData;

  const [subTasks, setSubTasks] = useState<Subtask[]>(subtaskData || []);

  const setTaskCompleted = (id: string, completed: boolean) => {
    setSubTasks((prevSubtasks) =>
      prevSubtasks.map((subtask) =>
        subtask._id === id
          ? { ...subtask, status: completed ? "COMPLETED" : "PLANNED" }
          : subtask,
      ),
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;
    setSubTasks((prevSubtasks) => [
      ...prevSubtasks,
      {
        _id: `${Date.now()}`,
        task_id: taskId || "",
        title: subtaskInput,
        completed: false,
        due_date: new Date().toISOString(),
        status: "PLANNED",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
    setSubtaskInput("");
  };

  const handleDelete = (id: string) => {
    setSubTasks((prevSubtasks) =>
      prevSubtasks.filter((subtask) => subtask._id !== id),
    );
  };

  const completedTaskCount = subTasks.filter(
    (task) => task.status === "COMPLETED",
  ).length;
  const progressPercentage =
    subTasks.length > 0 ? (completedTaskCount / subTasks.length) * 100 : 0;

  useEffect(() => {
    const fetchTaskDetails = async () => {
      const taskDetails = await getTaskById(taskId || "");
      if (taskDetails) {
        setTaskData(taskDetails);
        setSubTasks(taskDetails.subtasks || []);
      }
    };
    fetchTaskDetails();
    return () => {
      setTaskData(null);
    };
  }, [getTaskById, taskId]);

  const getPriorityStyles = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return {
          color: "text-red-600",
          icon: "error",
          bgColor: "bg-red-50",
        };
      case "medium":
        return {
          color: "text-orange-600",
          icon: "warning",
          bgColor: "bg-orange-50",
        };
      case "normal":
        return {
          color: "text-blue-600",
          icon: "info",
          bgColor: "bg-blue-50",
        };
      case "low":
        return {
          color: "text-green-600",
          icon: "check_circle",
          bgColor: "bg-green-50",
        };
      default:
        return {
          color: "text-gray-600",
          icon: "error",
          bgColor: "bg-gray-50",
        };
    }
  };

  const priority = taskData?.priority || "normal";
  const priorityStyles = getPriorityStyles(priority);

  return (
    <DashboardLayout>
      <main className="max-w-[1280px] mx-auto py-4 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Area (8 Columns) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-3">
              <div className="flex-1">
                <h1 className="text-gray-900 text-2xl font-bold leading-tight tracking-tight mb-1">
                  {title ||
                    taskData?.title ||
                    "Implement OAuth2 Authentication Flow"}
                </h1>
                <p className="text-gray-500 text-xs flex items-center gap-1.5">
                  <User size={12} /> Created by{" "}
                  {taskData?.created_by?.name || "Alex Chen"} • Updated{" "}
                  {taskData?.updated_at
                    ? formatDate(taskData.updated_at)
                    : "2 hours ago"}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button className="flex items-center justify-center gap-1.5 rounded-lg h-8 px-3 bg-primary text-white text-xs font-semibold tracking-tight hover:bg-primary-700 transition-all">
                  <CheckCircle size={14} />
                  <span>Mark Complete</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex gap-4">
                <a
                  className="flex items-center gap-1 border-b-2 border-primary text-primary pb-2 text-xs font-semibold"
                  href="#"
                >
                  <span className="material-symbols-outlined text-sm">
                    description
                  </span>
                  Task Details
                </a>
                <a
                  className="flex items-center gap-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-2 text-xs font-semibold"
                  href="#"
                >
                  <span className="material-symbols-outlined text-sm">
                    history
                  </span>
                  Activity
                </a>
                <a
                  className="flex items-center gap-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-2 text-xs font-semibold"
                  href="#"
                >
                  <span className="material-symbols-outlined text-sm">
                    attach_file
                  </span>
                  Files{" "}
                  <span className="bg-gray-100 px-1 py-0.5 rounded text-[10px]">
                    3
                  </span>
                </a>
              </div>
            </div>

            {/* Description Section */}
            <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h3 className="text-gray-900 text-base font-semibold mb-3 flex items-center gap-1.5">
                Description
              </h3>
              <MarkdownRenderer
                content={
                  description ||
                  taskData?.description ||
                  "No description provided for this task."
                }
              />
            </section>

            {/* Subtasks Checklist Section */}
            <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-gray-900 text-base font-semibold">
                    Subtasks
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {completedTaskCount} of {subTasks.length} completed
                  </p>
                </div>
                <div className="w-24 bg-primary/15 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary-700 h-full transition-all duration-300"
                    style={{
                      width: `${progressPercentage}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                {subTasks.map((task) => (
                  <SubtaskCard
                    key={task._id}
                    todo={task}
                    onCompletedChange={setTaskCompleted}
                    handleDelete={handleDelete}
                  />
                ))}

                {/* Add Subtask */}
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2 pt-2"
                >
                  <button
                    type="submit"
                    className="flex text-white items-center justify-center bg-primary rounded-full p-0.5 hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!subtaskInput.trim()}
                  >
                    <Plus size={16} className="text-white" />
                  </button>
                  <input
                    type="text"
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs focus:ring-0 p-0 placeholder:text-gray-400 outline-none"
                    placeholder="Add a subtask..."
                  />
                </form>
              </div>
            </section>
          </div>

          {/* Sidebar (4 Columns) */}
          <aside className="lg:col-span-4 flex flex-col gap-4">
            {/* Metadata Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Status
                </label>
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">
                  {taskData?.status
                    ? taskData.status
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())
                    : "In Progress"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                    Priority
                  </label>
                  <div
                    className={`flex items-center gap-1.5 ${priorityStyles.color} text-xs font-semibold px-2 py-1 rounded-md`}
                  >
                    <span className="material-symbols-outlined !text-xs">
                      {priorityStyles.icon}
                    </span>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                    Due Date
                  </label>
                  <div className="flex items-center gap-1.5 text-gray-900 text-xs font-semibold">
                    <Calendar size={12} className="text-gray-400" />{" "}
                    {taskData?.due_date
                      ? formatDate(taskData.due_date)
                      : endDate || "Oct 24, 2024"}
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-gray-900 text-sm font-semibold">
                  Attachments
                </h3>
                <button className="text-primary text-xs font-medium hover:underline">
                  Add
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-1.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="size-8 rounded bg-red-100 flex items-center justify-center text-red-600">
                    <span className="material-symbols-outlined text-sm">
                      description
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      auth_flow_diagram.pdf
                    </p>
                    <p className="text-[10px] text-gray-500">1.2 MB • PDF</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-1.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="size-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined text-sm">
                      image
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      login_screen_mockup.png
                    </p>
                    <p className="text-[10px] text-gray-500">4.5 MB • PNG</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-1.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="size-8 rounded bg-gray-100 flex items-center justify-center text-gray-600">
                    <span className="material-symbols-outlined text-sm">
                      code
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      passport_config.js
                    </p>
                    <p className="text-[10px] text-gray-500">12 KB • JS</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-col gap-1.5">
              <button className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-100 transition-colors">
                <Share2 size={14} /> Share Task
              </button>
              <button className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-red-100 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors">
                <Trash2 size={14} /> Delete Task
              </button>
            </div>
          </aside>
        </div>
      </main>
    </DashboardLayout>
  );
};
