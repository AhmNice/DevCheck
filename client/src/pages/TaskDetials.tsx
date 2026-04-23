import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../Layout/DashboardLayout";
import {
  Calendar,
  Share2,
  Trash2,
  User,
  CheckCircle,
  Plus,
  File,
  Edit2,
  X,
  Check,
} from "lucide-react";
import SubtaskCard from "../components/cards/SubtaskCard";
import { useEffect, useState } from "react";
import { useTaskStore } from "../store/taskStore";
import type { Subtask, Task, TaskStatus } from "../interface/task";
import { formatDate } from "../util/dateUtils";
import { MarkdownRenderer } from "../components/RenderMarkdown";
import FileUpload from "../components/modal/FileUpload";
import { StatusBadge } from "../components/StatusBadge";
import DeleteModal from "../components/modal/Confirm";

interface TaskData {
  title?: string;
  description?: string;
  endDate?: string;
  subtaskData?: Subtask[];
}

export const TaskDetials = () => {
  const location = useLocation();
  const { getTaskById, changeStatus, updateTask } = useTaskStore();
  const [taskData, setTaskData] = useState<Task | null>(null);
  const taskId = location.pathname.split("/").pop();
  const [subtaskInput, setSubtaskInput] = useState("");
  const { title, description, endDate, subtaskData } = (location.state ||
    {}) as TaskData;
  const [openAttachmentModal, setOpenAttachmentModal] = useState(false);
  const [subTasks, setSubTasks] = useState<Subtask[]>(subtaskData || []);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const navigate = useNavigate();

  // Inline editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDeleteTask = () => {
    setOpenDeleteModal(false);
    navigate("/task");
  };

  const setTaskCompleted = (id: string, completed: boolean) => {
    setSubTasks((prevSubtasks) =>
      prevSubtasks.map((subtask) =>
        subtask._id === id
          ? { ...subtask, status: completed ? "SHIPPED" : "PLANNED" }
          : subtask,
      ),
    );
  };

  // Update task field
  const handleUpdateTaskField = async (field: keyof Task, value: any) => {
    if (!taskData || isUpdating) return;

    const previousValue = taskData[field];
    setIsUpdating(true);

    // Optimistic update
    setTaskData({ ...taskData, [field]: value });

    try {
      const response = await updateTask(taskData._id, { [field]: value });
      if (!response.success) {
        // Revert on error
        setTaskData({ ...taskData, [field]: previousValue });
      }
    } catch (error) {
      // Revert on error
      setTaskData({ ...taskData, [field]: previousValue });
      console.error("Failed to update task:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle title edit
  const handleTitleEdit = () => {
    setEditedTitle(taskData?.title || "");
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (editedTitle.trim() && editedTitle !== taskData?.title) {
      await handleUpdateTaskField("title", editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setEditedTitle("");
  };

  // Handle description edit
  const handleDescriptionEdit = () => {
    setEditedDescription(taskData?.description || "");
    setIsEditingDescription(true);
  };

  const handleDescriptionSave = async () => {
    if (editedDescription !== taskData?.description) {
      await handleUpdateTaskField(
        "description",
        editedDescription.trim() || undefined,
      );
    }
    setIsEditingDescription(false);
  };

  const handleDescriptionCancel = () => {
    setIsEditingDescription(false);
    setEditedDescription("");
  };

  // Handle key presses
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      handleTitleCancel();
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleDescriptionCancel();
    }
  };

  // Rename page title based on task title
  useEffect(() => {
    document.title = taskData?.title
      ? `${taskData.title} - Task Details`
      : "Task Details";
  }, [taskData?.title]);

  // Status styling helper
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "BACKLOG":
        return "bg-gray-100 text-gray-700";
      case "PLANNED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "BLOCKED":
        return "bg-red-100 text-red-800";
      case "IN_REVIEW":
        return "bg-purple-100 text-purple-800";
      case "SHIPPED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Status formatting helper
  const formatStatus = (status: string): string => {
    switch (status) {
      case "BACKLOG":
        return "Backlog";
      case "PLANNED":
        return "Planned";
      case "IN_PROGRESS":
        return "In Progress";
      case "BLOCKED":
        return "Blocked";
      case "IN_REVIEW":
        return "In Review";
      case "SHIPPED":
        return "Shipped";
      default:
        return status
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
    }
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
    (task) => task.status === "SHIPPED",
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

  const handleOnStatusChange = async (
    newStatus: TaskStatus,
    blockedReason?: string,
  ) => {
    if (!taskData) return;
    const previousStatus = taskData.status;
    try {
      setTaskData({ ...taskData, status: newStatus });
      const response = await changeStatus({
        taskId: taskData._id,
        status: newStatus,
        blockedReason: blockedReason,
      });
      if (!response.success) {
        setTaskData({ ...taskData, status: previousStatus });
      }
    } catch (error) {
      setTaskData({ ...taskData, status: previousStatus });
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
                {/* Editable Title */}
                {isEditingTitle ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyDown={handleTitleKeyDown}
                      className="text-2xl font-bold border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                      autoFocus
                      disabled={isUpdating}
                    />
                    <button
                      onClick={handleTitleSave}
                      disabled={isUpdating}
                      className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={handleTitleCancel}
                      disabled={isUpdating}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1 group">
                    <h1 className="text-gray-900 text-2xl font-bold leading-tight tracking-tight">
                      {taskData?.title || "Untitled Task"}
                    </h1>
                    <button
                      onClick={handleTitleEdit}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                      aria-label="Edit title"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                )}
                <p className="text-gray-500 text-xs flex items-center gap-1.5">
                  <User size={12} /> Created by{" "}
                  {taskData?.created_by?.name || "Unknown"} • Updated{" "}
                  {taskData?.updated_at
                    ? formatDate(taskData.updated_at)
                    : "Just now"}
                </p>
              </div>
              <div className="flex gap-1.5 items-center">
                <StatusBadge
                  status={taskData?.status || "BACKLOG"}
                  onStatusChange={handleOnStatusChange}
                />
                <button
                  className="flex items-center justify-center gap-1.5 rounded-lg h-8 px-3 bg-primary text-white text-xs font-semibold tracking-tight hover:bg-primary-700 transition-all"
                  onClick={() => setOpenAttachmentModal(true)}
                >
                  <File size={14} />
                  <span>Attach File</span>
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
                    {taskData?.attachments?.length || 0}
                  </span>
                </a>
              </div>
            </div>

            {/* Description Section - Editable */}
            <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900 text-base font-semibold flex items-center gap-1.5">
                  Description
                </h3>
                {!isEditingDescription && (
                  <button
                    onClick={handleDescriptionEdit}
                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Edit description"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>

              {isEditingDescription ? (
                <div className="space-y-3">
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    onKeyDown={handleDescriptionKeyDown}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                    placeholder="Add a description..."
                    autoFocus
                    disabled={isUpdating}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleDescriptionCancel}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDescriptionSave}
                      disabled={isUpdating}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      {isUpdating ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <MarkdownRenderer
                  content={
                    taskData?.description ||
                    "No description provided. Click edit to add one."
                  }
                />
              )}
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
                    taskId={taskData?._id}
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
                <div
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusStyles(taskData?.status || "PLANNED")}`}
                >
                  {formatStatus(taskData?.status || "PLANNED")}
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
                      : endDate || "Not set"}
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments Card */}
            {taskData &&
              taskData.attachments &&
              taskData.attachments.length > 0 && (
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
                    {taskData.attachments.map((attachment, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-1.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="size-8 rounded bg-gray-100 flex items-center justify-center text-gray-600">
                          <File size={14} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {attachment.filename}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {attachment.size
                              ? `${(attachment.size / 1024).toFixed(1)} KB`
                              : "Size not available"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Attachment Modal */}
            {openAttachmentModal && (
              <FileUpload
                onClose={() => setOpenAttachmentModal(false)}
                onFileUpload={() => {}}
              />
            )}

            {/* Delete Modal */}
            {openDeleteModal && (
              <DeleteModal
                id={taskData?._id}
                from="task"
                title={taskData?.title}
                onConfirm={handleDeleteTask}
                onCancel={() => setOpenDeleteModal(false)}
              />
            )}

            {/* Secondary Actions */}
            <div className="flex flex-col gap-1.5">
              <button className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-100 transition-colors">
                <Share2 size={14} /> Share Task
              </button>
              <button
                onClick={() => setOpenDeleteModal(true)}
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-red-100 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} /> Delete Task
              </button>
            </div>
          </aside>
        </div>
      </main>
    </DashboardLayout>
  );
};
