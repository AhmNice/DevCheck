import { useState, useEffect } from "react";
import DashboardLayout from "../Layout/DashboardLayout";
import TaskCard from "../components/cards/TaskCard";
import { CheckCircle, Plus, Loader2 } from "lucide-react";
import CreateTask from "./CreateTask";
import { useTaskStore } from "../store/taskStore";
import { useAuthStore } from "../store/authstore";
import type { Task } from "../interface/task";

const Tasks = () => {
  const [isActive, setIsActive] = useState("all");
  const [modal, setModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { tasks, fetchTasks, createTask } = useTaskStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const handleTaskFetch = async () => {
      if (!user?._id) return;

      try {
        setIsLoading(true);
        await fetchTasks({ user_id: user._id });
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    handleTaskFetch();
  }, [user?._id, fetchTasks]);

  // Listen for sidebar collapse changes
  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setIsSidebarCollapsed(e.detail);
    };

    window.addEventListener("sidebarCollapse" as any, handleSidebarChange);

    const checkSidebarState = () => {
      const sidebar = document.querySelector('[class*="w-20"]');
      setIsSidebarCollapsed(!!sidebar);
    };

    setTimeout(checkSidebarState, 100);

    return () => {
      window.removeEventListener("sidebarCollapse" as any, handleSidebarChange);
    };
  }, []);

  const filterButtons = [
    { id: "all", label: "All Tasks", status: null },
    { id: "IN_PROGRESS", label: "In Progress", status: "IN_PROGRESS" },
    { id: "PLANNED", label: "Pending", status: "PLANNED" },
    { id: "IN_REVIEW", label: "In Review", status: "IN_REVIEW" },
    { id: "BLOCKED", label: "Blocked", status: "BLOCKED" },
    {id: "BACKLOG", label: "Backlog", status: "BACKLOG"},
    { id: "SHIPPED", label: "Completed", status: "SHIPPED" },
  ];

  // Safely get tasks array (default to empty array if undefined)
  const taskList = Array.isArray(tasks)
    ? tasks.filter((task) => task && typeof task === "object" && task._id)
    : [];

  const getFilteredTasks = () => {
    if (isActive === "all") return taskList;
    return taskList.filter((task) => task?.status === isActive);
  };

  const filteredTasks = getFilteredTasks();
  const inProgressCount = taskList.filter(
    (task) => task.status === "IN_PROGRESS",
  ).length;

  const EmptyState = ({
    icon: Icon,
    title,
    message,
  }: {
    icon: any;
    title: string;
    message: string;
  }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center col-span-full">
      <div className="bg-gray-100 rounded-full p-4 mb-3">
        <Icon size={24} className="text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{message}</p>
      <button
        onClick={() => setModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Create Task
      </button>
    </div>
  );

  const TasksGrid = ({ tasks }: { tasks: Task[] }) => (
    <div
      className={`grid gap-4 transition-all duration-300 ${
        isSidebarCollapsed
          ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          : "grid-cols-1 md:grid-cols-2"
      }`}
    >
      {tasks.map((task, index) => (
        <TaskCard task={task} key={task._id || index} />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2
              size={40}
              className="animate-spin text-blue-600 mx-auto mb-4"
            />
            <p className="text-gray-600">Loading your tasks...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="relative h-full">
        {/* Header Section */}
        <div className="flex flex-col p-3 border-b border-b-gray-200/60 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="py-2">
            <h2 className="text-xl font-bold text-gray-900">Active Tasks</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              You have {inProgressCount} task{inProgressCount !== 1 ? "s" : ""}{" "}
              in progress for this week
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

        {/* Tasks Content */}
        <div className="p-4">
          {filteredTasks.length > 0 ? (
            <TasksGrid tasks={filteredTasks} />
          ) : (
            <EmptyState
              icon={isActive === "SHIPPED" ? CheckCircle : Plus}
              title={
                isActive === "all"
                  ? "No tasks yet"
                  : isActive === "IN_PROGRESS"
                    ? "No tasks in progress"
                    : isActive === "PLANNED"
                      ? "No pending tasks"
                      : "No completed tasks"
              }
              message={
                isActive === "all"
                  ? "Create your first task to get started"
                  : isActive === "IN_PROGRESS"
                    ? "Start working on a task to see it here"
                    : isActive === "PLANNED"
                      ? "Tasks that are pending will appear here"
                      : "Completed tasks will appear here"
              }
            />
          )}
        </div>

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
        {modal && <CreateTask setModel={setModal} />}
      </div>
    </DashboardLayout>
  );
};

export default Tasks;
