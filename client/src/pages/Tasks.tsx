import { useState, useEffect } from "react";
import DashboardLayout from "../Layout/DashboardLayout";
import TaskCard, { type taskProps } from "../components/cards/TaskCard";
import { CheckCircle, Plus } from "lucide-react";
import CreateTask from "./CreateTask";
import { useTaskStore } from "../store/taskStore";
import { useAuthStore } from "../store/authstore";
import type { Task } from "../interface/task";


const Tasks = () => {
  const [isActive, setIsActive] = useState("all");
  const [modal, setModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { tasks, fetchTasks,createTask } = useTaskStore();
  const { user } = useAuthStore();
  useEffect(() => {
    const handleTaskFetch = async () => {
      try {
        await fetchTasks({ user_id: `${user?._id}` });
      } catch (error) {
        console.log(error);
      }
    };
    handleTaskFetch();
  }, []);
  // Listen for sidebar collapse changes
  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setIsSidebarCollapsed(e.detail);
    };

    window.addEventListener("sidebarCollapse" as any, handleSidebarChange);

    // Check initial sidebar state
    const checkSidebarState = () => {
      const sidebar = document.querySelector('[class*="w-20"]');
      setIsSidebarCollapsed(!!sidebar);
    };

    setTimeout(checkSidebarState, 100); // Small delay to ensure DOM is ready

    return () => {
      window.removeEventListener("sidebarCollapse" as any, handleSidebarChange);
    };
  }, []);

  const filterButtons = [
    { id: "all", label: "All Tasks" },
    { id: "in_progress", label: "In Progress" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
  ];

  async function handleTaskCreate(task: Task): Promise<void> {
    try {
      const res = await createTask(task);
      if(!res.success){
        setModal(true);
        return;
      }
      setModal(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  }

  return (
    <>
      <DashboardLayout>
        <div className="relative h-full">
          {/* Header Section */}
          <div className="flex flex-col p-3 border-b border-b-gray-200/60 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="py-2">
              <h2 className="text-xl font-bold text-gray-900">Active Tasks</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                You have {tasks.filter((task) => task.status === "in_progress").length} tasks in progress for this week
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
                  <TaskCard task={task} key={index} />
                ))}
              </div>

              {/* Empty State */}
              {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-gray-100 rounded-full p-4 mb-3">
                    <Plus size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    No tasks yet
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Create your first task to get started
                  </p>
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
          {/* In Progress Tasks */}
          {isActive === "in_progress" && (
            <div className="p-4">
              <div
                className={`grid gap-4 transition-all duration-300 ${
                  isSidebarCollapsed
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {tasks.filter((task) => task.status === "in_progress").length >
                0 ? (
                  tasks
                    .filter((task) => task.status === "in_progress")
                    .map((task, index) => <TaskCard task={task} key={index} />)
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center col-span-full">
                    <div className="bg-gray-100 rounded-full p-4 mb-3">
                      <Plus size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      No tasks in progress
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Start working on a task to see it here
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* pending Tasks */}
          {isActive === "pending" && (
            <div className="p-4">
              <div
                className={`grid gap-4 transition-all duration-300 ${
                  isSidebarCollapsed
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {tasks.filter((task) => task.status === "pending").length >
                0 ? (
                  tasks
                    .filter((task) => task.status === "pending")
                    .map((task, index) => <TaskCard task={task} key={index} />)
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center col-span-full">
                    <div className="bg-gray-100 rounded-full p-4 mb-3">
                      <Plus size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      No pending tasks
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Tasks that are pending will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* completed Tasks */}
          {isActive === "completed" && (
            <div className="p-4">
              <div
                className={`grid gap-4 transition-all duration-300 ${
                  isSidebarCollapsed
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {tasks.filter((task) => task.status === "completed").length >
                0 ? (
                  tasks
                    .filter((task) => task.status === "completed")
                    .map((task, index) => <TaskCard task={task} key={index} />)
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center col-span-full">
                    <div className="bg-gray-100 rounded-full p-4 mb-3">
                      <CheckCircle size={24} className="text-green-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      No completed tasks
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Completed tasks will appear here
                    </p>
                  </div>
                )}
              </div>
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
            <CreateTask setModel={setModal}  />
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default Tasks;
