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
import { useState } from "react";
import type { subTask } from "../components/data/subtaskData";

// Define types
// interface Subtask {
//   id: number;
//   title: string;
//   completed: boolean;
// }

interface TaskData {
  title?: string;
  description?: string;
  endDate?: string;
  subtaskData?: subTask[];
}

export const TaskDetials = () => {
  const location = useLocation();
  const [subtaskInput, setSubtaskInput] = useState("");
  const { title, description, endDate, subtaskData } = (location.state ||
    {}) as TaskData;

  const [subTasks, setSubTasks] = useState<subTask[]>(subtaskData || []);

  const setTaskCompleted = (id: number, completed: boolean) => {
    setSubTasks((prevSubtasks) =>
      prevSubtasks.map((subtask) =>
        subtask.id === id ? { ...subtask, completed } : subtask,
      ),
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;
    setSubTasks((prevSubtasks) => [
      ...prevSubtasks,
      {
        id: Date.now(),
        title: subtaskInput,
        completed: false,
      },
    ]);
    setSubtaskInput("");
  };

  const handleDelete = (id: number) => {
    setSubTasks((prevSubtasks) =>
      prevSubtasks.filter((subtask) => subtask.id !== id),
    );
  };

  const completedTaskCount = subTasks.filter((task) => task.completed).length;
  const progressPercentage =
    subTasks.length > 0 ? (completedTaskCount / subTasks.length) * 100 : 0;

  return (
    <DashboardLayout>
      <main className="max-w-[1280px] mx-auto py-4 px-4">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <a
            className="text-slate-500 hover:text-primary text-xs font-medium"
            href="#"
          >
            Project Alpha
          </a>
          <span className="text-slate-400 text-xs">/</span>
          <a
            className="text-slate-500 hover:text-primary text-xs font-medium"
            href="#"
          >
            Authentication
          </a>
          <span className="text-slate-400 text-xs">/</span>
          <span className="text-slate-900 text-xs font-semibold">
            OAuth2 Flow
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Area (8 Columns) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-3">
              <div className="flex-1">
                <h1 className="text-slate-900 text-2xl font-bold leading-tight tracking-tight mb-1">
                  {title || "Implement OAuth2 Authentication Flow"}
                </h1>
                <p className="text-slate-500 text-xs flex items-center gap-1.5">
                  <User size={12} /> Created by Alex Chen • Updated 2 hours ago
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
            <div className="border-b border-slate-200">
              <div className="flex gap-4">
                <a
                  className="flex items-center gap-1 border-b-2 border-primary text-primary pb-2 text-xs font-semibold"
                  href="#"
                >
                  <span className="material-symbols-outlined text-sm">description</span>
                  Task Details
                </a>
                <a
                  className="flex items-center gap-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 pb-2 text-xs font-semibold"
                  href="#"
                >
                  <span className="material-symbols-outlined text-sm">history</span>
                  Activity
                </a>
                <a
                  className="flex items-center gap-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 pb-2 text-xs font-semibold"
                  href="#"
                >
                  <span className="material-symbols-outlined text-sm">attach_file</span>
                  Files{" "}
                  <span className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">
                    3
                  </span>
                </a>
              </div>
            </div>

            {/* Description Section */}
            <section className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <h3 className="text-slate-900 text-base font-semibold mb-3 flex items-center gap-1.5">
                Description
              </h3>
              <div className="prose max-w-none text-slate-600 text-sm leading-relaxed">
                <p>
                  {description ||
                    "Configure the OAuth2 flow to support Google and GitHub providers. Ensure we follow the PKCE extension for the frontend SPA to mitigate authorization code injection attacks."}
                </p>
                <ul className="list-disc pl-4 mt-3 space-y-0.5 text-sm">
                  <li>Handle token refresh logic in the middleware.</li>
                  <li>Securely store JWTs in HTTP-only cookies.</li>
                  <li>Validate scope permissions for admin routes.</li>
                </ul>
              </div>
            </section>

            {/* Subtasks Checklist Section */}
            <section className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-slate-900 text-base font-semibold">Subtasks</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
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
                    key={task.id}
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
                    className="flex-1 bg-transparent border-none text-xs focus:ring-0 p-0 placeholder:text-slate-400 outline-none"
                    placeholder="Add a subtask..."
                  />
                </form>
              </div>
            </section>
          </div>

          {/* Sidebar (4 Columns) */}
          <aside className="lg:col-span-4 flex flex-col gap-4">
            {/* Metadata Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Status
                </label>
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">
                  In Progress
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                    Priority
                  </label>
                  <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold">
                    <span className="material-symbols-outlined !text-xs">
                      error
                    </span>{" "}
                    High
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                    Due Date
                  </label>
                  <div className="flex items-center gap-1.5 text-slate-900 text-xs font-semibold">
                    <Calendar size={12} className="text-slate-400" />{" "}
                    {endDate || "Oct 24, 2024"}
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-slate-900 text-sm font-semibold">Attachments</h3>
                <button className="text-primary text-xs font-medium hover:underline">
                  Add
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-1.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="size-8 rounded bg-red-100 flex items-center justify-center text-red-600">
                    <span className="material-symbols-outlined text-sm">
                      description
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-slate-900 truncate">
                      auth_flow_diagram.pdf
                    </p>
                    <p className="text-[10px] text-slate-500">1.2 MB • PDF</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-1.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="size-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined text-sm">image</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-slate-900 truncate">
                      login_screen_mockup.png
                    </p>
                    <p className="text-[10px] text-slate-500">4.5 MB • PNG</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-1.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="size-8 rounded bg-slate-100 flex items-center justify-center text-slate-600">
                    <span className="material-symbols-outlined text-sm">code</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-slate-900 truncate">
                      passport_config.js
                    </p>
                    <p className="text-[10px] text-slate-500">12 KB • JS</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-col gap-1.5">
              <button className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors">
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