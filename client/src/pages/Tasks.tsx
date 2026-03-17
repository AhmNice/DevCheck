import { useState, useEffect } from "react";
import DashboardLayout from "../Layout/DashboardLayout";
import TaskCard, { type taskProps } from "../components/cards/TaskCard";
import { Plus } from "lucide-react";
import CreateTask from "./CreateTask";

const taskData: taskProps[] = [
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
  {
    tag: "MEDIUM PRIORITY",
    title: "API Rate Limiting",
    description:
      "Implement rate limiting for public API endpoints to prevent abuse and ensure fair usage.",
    percentage: 30,
    startDate: "Nov 1",
    endDate: "Nov 15",
    subtaskData: [
      {
        id: 1,
        title: "Research rate limiting strategies",
        completed: true,
      },
      {
        id: 2,
        title: "Implement Redis-based rate limiter",
        completed: false,
      },
    ],
  },
  {
    tag: "LOW PRIORITY",
    title: "UI Component Library",
    description:
      "Create reusable UI components and document them in Storybook.",
    percentage: 15,
    startDate: "Nov 5",
    endDate: "Nov 30",
    subtaskData: [
      {
        id: 1,
        title: "Set up Storybook",
        completed: true,
      },
      {
        id: 2,
        title: "Create Button component",
        completed: false,
      },
      {
        id: 3,
        title: "Create Input component",
        completed: false,
      },
    ],
  },
];

const Tasks = () => {
  const [isActive, setIsActive] = useState("all");
  const [modal, setModal] = useState(false);
  const [tasks, setTasks] = useState<taskProps[]>(taskData);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse changes
  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setIsSidebarCollapsed(e.detail);
    };

    window.addEventListener('sidebarCollapse' as any, handleSidebarChange);

    // Check initial sidebar state
    const checkSidebarState = () => {
      const sidebar = document.querySelector('[class*="w-20"]');
      setIsSidebarCollapsed(!!sidebar);
    };

    setTimeout(checkSidebarState, 100); // Small delay to ensure DOM is ready

    return () => {
      window.removeEventListener('sidebarCollapse' as any, handleSidebarChange);
    };
  }, []);

  const filterButtons = [
    { id: "all", label: "All Tasks" },
    { id: "progress", label: "In Progress" },
    { id: "review", label: "Review" },
    { id: "backlog", label: "Backlog" },
  ];

  function handleTaskCreate(task: taskProps): void {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      <DashboardLayout >
        <div className="relative h-full">
          {/* Header Section */}
          <div className="flex flex-col p-3 border-b border-b-gray-200/60 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="py-2">
              <h2 className="text-xl font-bold text-gray-900">Active Tasks</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                You have {tasks.length} tasks in progress for this week
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {filterButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => setIsActive(button.id)}
                  className={`flex items-center whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive === button.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/60"
                  }`}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Grid - Dynamic columns based on sidebar state */}
          {isActive === "all" && (
            <div className="p-4">
              <div
                className={`grid gap-4 transition-all duration-300 ${
                  isSidebarCollapsed
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {tasks.map((task, index) => (
                  <TaskCard
                    key={index}
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

              {/* Empty State */}
              {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-gray-100 rounded-full p-4 mb-3">
                    <Plus size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">No tasks yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Create your first task to get started</p>
                  <button
                    onClick={() => setModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Create Task
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Floating Action Button */}
          <div className="fixed bottom-6 right-6 z-20">
            <button
              onClick={() => setModal(true)}
              className="rounded-full cursor-pointer p-3 bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all duration-200"
              aria-label="Create new task"
            >
              <Plus size={20} className="font-bold" />
            </button>
          </div>

          {/* Create Task Modal */}
          {modal && (
            <CreateTask setModel={setModal} onTaskCreate={handleTaskCreate} />
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default Tasks;