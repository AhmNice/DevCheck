import { useState } from "react";
import DashboardLayout from "../Layout/DashboardLayout";
import TaskCard, { type taskProps } from "../components/cards/TaskCard";
import { Plus } from "lucide-react";
import CreateTask from "./CreateTask";

export const taskData: taskProps[] = [
  {
    tag: "HIGH PRIORITY",
    title: "Refactor Auth Middleware",
    description:
      "Ensure OAuth providers are correctly handled in the new microservices architecture and update dependencies",
    percentage: 60,
    startDate: "Oct 24",
    endDate: "Nov 18",
    subtaskData: [
      {
        id: 1,
        title: "Setup Google Cloud Console credentials",
        completed: false,
      },
      {
        id: 2,
        title: "Configure redirect URIs for development environment",
        completed: false,
      },
      {
        id: 3,
        title: "Implement Passport.js strategy for GitHub",
        completed: false,
      },
    ],
  },
  {
    tag: "MEDIUM PRIORITY",
    title: "Design System Audth",
    description:
      "Review the current Figma components against the production React library for visual consistency.",
    percentage: 20,
    startDate: "Oct 24",
    endDate: "Nov 18",
    subtaskData: [
      {
        id: 1,
        title: "Setup Google Cloud Console credentials",
        completed: false,
      },
      {
        id: 2,
        title: "Configure redirect URIs for development environment",
        completed: false,
      },
    ],
  },
  {
    tag: "LOW PRIORITY",
    title: "Update Documentation",
    description:
      "Refresh the README and API references to reflect the recent endpoint changes in v2.4.",
    percentage: 95,
    startDate: "Oct 24",
    endDate: "Nov 18",
    subtaskData: [
      {
        id: 1,
        title: "Setup Google Cloud Console credentials",
        completed: false,
      },
      {
        id: 2,
        title: "Configure redirect URIs for development environment",
        completed: false,
      },
      {
        id: 3,
        title: "Implement Passport.js strategy for GitHub",
        completed: false,
      },
    ],
  },
  {
    tag: "HIGH PRIORITY",
    title: "Server Migration",
    description:
      "Move current staging environment to AWS us-east-1 and verify database latency benchmarks.",
    percentage: 45,
    startDate: "Oct 30",
    endDate: "Nov 18",
    subtaskData: [
      {
        id: 1,
        title: "Setup Google Cloud Console credentials",
        completed: false,
      },
      {
        id: 2,
        title: "Configure redirect URIs for development environment",
        completed: false,
      },
      {
        id: 3,
        title: "Implement Passport.js strategy for GitHub",
        completed: false,
      },
    ],
  },
];

const Tasks = () => {
  const [isActive, setIsActive] = useState("all");
  const [model, setModel] = useState(false);
  const [tasks, setTasks] = useState<taskProps[]>(taskData);

  const handleTaskCreate = (newTask: taskProps) => {
    setTasks((prevTask) => [...prevTask, newTask]);
  };

  return (
    <>
      <DashboardLayout>
        <div className="relative">
          <div className="flex flex-col p-4 border-b border-b-gray-400/20">
            <div className="p-2">
              <h2 className="text-xl font-bold text-gray-900">Active Tasks</h2>
              <p className="text-xs text-gray-400 mt-0.5 mb-5">
                You have {tasks.length} tasks in progress for this week
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsActive("all")}
                className={`flex items-center gap-3 px-5 py-2 rounded-full transition-all duration-200 ${isActive === "all" ? "bg-blue-500 text-white" : "bg-white text-gray-700"} `}
              >
                All Tasks
              </button>
              <button
                onClick={() => setIsActive("progress")}
                className={`flex items-center gap-3 px-5 py-2 rounded-full transition-all duration-200 ${isActive === "progress" ? "bg-blue-500 text-white" : "bg-white text-gray-700"} `}
              >
                In Progress
              </button>
              <button
                onClick={() => setIsActive("review")}
                className={`flex items-center gap-3 px-5 py-2 rounded-full transition-all duration-200 ${isActive === "review" ? "bg-blue-500 text-white" : "bg-white text-gray-700"} `}
              >
                Review
              </button>
              <button
                onClick={() => setIsActive("backlog")}
                className={`flex items-center gap-3 px-5 py-2 rounded-full transition-all duration-200 ${isActive === "backlog" ? "bg-blue-500 text-white" : "bg-white text-gray-700"} `}
              >
                Backlog
              </button>
            </div>
          </div>
          {isActive === "all" && (
            <div className="p-8 flex">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tasks.map((task) => (
                  <TaskCard
                    subtaskData={task.subtaskData}
                    tag={task.tag}
                    title={task.title}
                    description={task.description}
                    percentage={task.percentage}
                    startDate={task.startDate}
                    endDate={task.endDate}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex  p-6 mt-20 cursor-pointer bottom-0 right-0 sticky items-end justify-end">
            <button
              onClick={() => setModel((prev) => !prev)}
              className="rounded-full cursor-pointer px-4 font-bold py-4 hover:bg-blue-700  hover:scale-105 bg-blue-500 text-white transition-all delay-150 duration-150"
            >
              <Plus size={24} className="font-bold" />
            </button>
          </div>

          {model && (
            <div>
              <CreateTask setModel={setModel} onTaskCreate={handleTaskCreate} />
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default Tasks;
