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
      <main className="max-w-[1280px] mx-auto py-6">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <a
            className="text-slate-500 hover:text-primary text-sm font-medium"
            href="#"
          >
            Project Alpha
          </a>
          <span className="text-slate-400 text-sm">/</span>
          <a
            className="text-slate-500 hover:text-primary text-sm font-medium"
            href="#"
          >
            Authentication
          </a>
          <span className="text-slate-400 text-sm">/</span>
          <span className="text-slate-900 text-sm font-semibold">
            OAuth2 Flow
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area (8 Columns) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h1 className="text-slate-900 text-4xl font-black leading-tight tracking-tight mb-2">
                  {title || "Implement OAuth2 Authentication Flow"}
                </h1>
                <p className="text-slate-500 text-sm flex items-center gap-2">
                  <User size={14} /> Created by Alex Chen • Updated 2 hours ago
                </p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold tracking-tight hover:bg-blue-700 transition-all">
                  <CheckCircle size={16} />
                  <span>Mark Complete</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
              <div className="flex gap-8">
                <a
                  className="flex items-center gap-2 border-b-2 border-primary text-primary pb-3 text-sm font-bold"
                  href="#"
                >
                  <span className="material-symbols-outlined">description</span>
                  Task Details
                </a>
                <a
                  className="flex items-center gap-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 pb-3 text-sm font-bold"
                  href="#"
                >
                  <span className="material-symbols-outlined">history</span>
                  Activity
                </a>
                <a
                  className="flex items-center gap-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 pb-3 text-sm font-bold"
                  href="#"
                >
                  <span className="material-symbols-outlined">attach_file</span>
                  Files{" "}
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                    3
                  </span>
                </a>
              </div>
            </div>

            {/* Description Section */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-slate-900 text-xl font-bold mb-4 flex items-center gap-2">
                Description
              </h3>
              <div className="prose max-w-none text-slate-600 leading-relaxed">
                <p>
                  {description ||
                    "Configure the OAuth2 flow to support Google and GitHub providers. Ensure we follow the PKCE extension for the frontend SPA to mitigate authorization code injection attacks."}
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-1">
                  <li>Handle token refresh logic in the middleware.</li>
                  <li>Securely store JWTs in HTTP-only cookies.</li>
                  <li>Validate scope permissions for admin routes.</li>
                </ul>
              </div>
            </section>

            {/* Subtasks Checklist Section */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-slate-900 text-xl font-bold">Subtasks</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {completedTaskCount} of {subTasks.length} completed
                  </p>
                </div>
                <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{
                      width: `${progressPercentage}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
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
                  className="flex items-center gap-3 pt-4"
                >
                  <button
                    type="submit"
                    className="flex items-center justify-center text-white bg-primary rounded-full p-1 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!subtaskInput.trim()}
                  >
                    <Plus size={20} />
                  </button>
                  <input
                    type="text"
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-0 placeholder:text-slate-400 outline-none"
                    placeholder="Add a subtask..."
                  />
                </form>
              </div>
            </section>
          </div>

          {/* Sidebar (4 Columns) */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* Metadata Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Status
                </label>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  In Progress
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    Priority
                  </label>
                  <div className="flex items-center gap-2 text-red-600 text-sm font-semibold">
                    <span className="material-symbols-outlined !text-base">
                      error
                    </span>{" "}
                    High
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    Due Date
                  </label>
                  <div className="flex items-center gap-2 text-slate-900 text-sm font-semibold">
                    <Calendar size={14} className="text-slate-400" />{" "}
                    {endDate || "Oct 24, 2024"}
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-900 font-bold">Attachments</h3>
                <button className="text-primary text-sm font-semibold hover:underline">
                  Add
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="size-10 rounded bg-red-100 flex items-center justify-center text-red-600">
                    <span className="material-symbols-outlined">
                      description
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      auth_flow_diagram.pdf
                    </p>
                    <p className="text-xs text-slate-500">1.2 MB • PDF</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="size-10 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined">image</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      login_screen_mockup.png
                    </p>
                    <p className="text-xs text-slate-500">4.5 MB • PNG</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="size-10 rounded bg-slate-100 flex items-center justify-center text-slate-600">
                    <span className="material-symbols-outlined">code</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      passport_config.js
                    </p>
                    <p className="text-xs text-slate-500">12 KB • JS</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-col gap-2">
              <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors">
                <Share2 size={16} /> Share Task
              </button>
              <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-red-100 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
                <Trash2 size={16} /> Delete Task
              </button>
            </div>
          </aside>
        </div>
      </main>
    </DashboardLayout>
  );
};
