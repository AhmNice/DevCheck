import { use, useState } from "react";
import { CalendarFold, CheckCircle, X } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import MDEditor from "@uiw/react-md-editor";
import SubtaskCard from "../components/cards/SubtaskCard";
import type { taskProps } from "../components/cards/TaskCard";
import type { Subtask, Task } from "../interface/task";
import { useTaskStore } from "../store/taskStore";
import { useAuthStore } from "../store/authstore";


interface createTaskProps {
  setModel: (model: boolean) => void;
  onTaskCreate?: (task: taskProps) => void;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface subTask {
  _id: string;
  task_id: string;
  title: string;
  completed: boolean;
}

const CreateTask = ({ setModel, onTaskCreate }: createTaskProps) => {
  const [subtasks, setSubtasks] = useState<Partial<Subtask>[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [date, setDate] = useState<Value>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const { createTask } = useTaskStore();
  // Form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuthStore();

  const addSubtask = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newSubtask.trim()) {
      e.preventDefault();
      setSubtasks([
        ...subtasks,
        {
          _id: `${Date.now()}`,
          task_id: "",
          title: newSubtask.trim(),
          status: "pending",
        },
      ]);
      setNewSubtask("");
    }
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((subtask) =>
        subtask._id === id
          ? {
              ...subtask,
              status: subtask.status === "completed" ? "pending" : "completed",
            }
          : subtask,
      ),
    );
  };

  const deleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((subtask) => subtask._id !== id));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateForTask = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  const getDayLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return null;
  };

  const getPriorityTag = (priority: string): string => {
    switch (priority) {
      case "urgent":
      case "high":
        return "HIGH PRIORITY";
      case "medium":
        return "MEDIUM PRIORITY";
      case "low":
        return "LOW PRIORITY";
      default:
        return "MEDIUM PRIORITY";
    }
  };

  const validateForm = (): boolean => {
    if (!taskTitle.trim()) {
      setError("Task title is required");
      return false;
    }
    if (!date) {
      setError("Due date is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleSaveTask = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      // Calculate completion percentage from subtasks
      const completedCount = subtasks.filter((s) => s.status).length;
      const percentage =
        subtasks.length > 0
          ? Math.round((completedCount / subtasks.length) * 100)
          : 0;

      const newTask: Partial<Task> = {
        _id: `${Date.now()}`,
        priority: (priority === "urgent" ? "high" : priority) as
          | "low"
          | "normal"
          | "high",
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        created_at: formatDateForTask(new Date()), // Today as start date
        due_date:
          date instanceof Date
            ? formatDateForTask(date)
            : formatDateForTask(new Date()),
        subtasks: subtasks as Subtask[],
      };
      console.log(newTask.status)
      // Simulate API call
      try {
      const isoDate = date instanceof Date ? date.toISOString() : new Date().toISOString();
      const newTaskWithISODate = {
        ...newTask,
        user_id: user?._id,
        status: 'pending',
        due_date: isoDate,
      };
      const res = await createTask(newTaskWithISODate as Omit<Task, "_id" | "created_at" | "updated_at">);
      if(!res.success){
        setModel(true);
        return;
      }
      setModel(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
      // Close modal
      setModel(false);
    } catch (error) {
      console.error("Error creating task:", error);
      setError("Failed to create task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Ctrl+Enter (or Cmd+Enter on Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSaveTask();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Modal Container */}
      <div className="bg-white w-full max-w-[800px] max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="text-blue-600 bg-blue-50 p-1.5 rounded-lg">
              <CheckCircle size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Create New Task
            </h2>
          </div>
          <button
            onClick={() => setModel(false)}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all"
            disabled={isSaving}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-xs font-medium">{error}</p>
          </div>
        )}

        {/* Modal Content (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Task Title Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
              Task Title
              <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full text-base font-medium outline-none border-0 focus:ring-0 bg-transparent p-0 placeholder:text-gray-300 text-gray-900"
              placeholder="e.g., Implement OAuth2 flow"
              type="text"
              disabled={isSaving}
            />
          </div>

          {/* Horizontal Layout for Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Priority
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="appearance-none w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Due Date Picker */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                Due Date
                <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => !isSaving && setShowCalendar(!showCalendar)}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all ${
                  isSaving
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:bg-gray-100"
                }`}
              >
                <CalendarFold size={16} className="text-blue-500" />
                <span className="flex-1 text-gray-900">
                  {date instanceof Date ? formatDate(date) : "Select a date"}
                </span>
                {date instanceof Date && getDayLabel(date) && (
                  <span className="text-[10px] font-medium text-gray-400 bg-white px-1.5 py-0.5 rounded">
                    {getDayLabel(date)}
                  </span>
                )}
              </div>

              {/* Calendar Popup */}
              {showCalendar && !isSaving && (
                <div className="absolute top-full left-0 mt-1 z-10 bg-white rounded-lg shadow-xl border border-gray-200 p-2">
                  <Calendar
                    onChange={(value) => {
                      setDate(value);
                      setShowCalendar(false);
                    }}
                    value={date}
                    className="border-0 text-sm"
                    minDate={new Date()} // Prevent selecting past dates
                    tileClassName={({ date, view }) =>
                      view === "month" &&
                      date.toDateString() === new Date().toDateString()
                        ? "react-calendar__tile--now bg-blue-50 text-blue-600 font-bold"
                        : ""
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-1.5 "data-color-mode="light">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center justify-between">
              Description
              <span className="text-[10px] normal-case bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                Markdown Supported
              </span>
            </label>
           <MDEditor
              value={taskDescription}
              onChange={(value: string | undefined) => setTaskDescription(value || "")}
              height={100}
              preview="edit"
              textareaProps={{
                placeholder: "Add a description to your task...",
                disabled: isSaving,
              }}
            />
          </div>

          {/* Subtasks Section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Subtasks ({subtasks.filter((s) => s.status !== "completed").length} remaining)
            </label>
            <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
              {/* Subtask Items */}
              {subtasks.map((subtask) => (
                <SubtaskCard
                  key={subtask._id}
                  todo={subtask}
                  onCompletedChange={toggleSubtask}
                  handleDelete={deleteSubtask}
                />
              ))}

              {/* Add Subtask Input */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-blue-400 text-lg">+</span>
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={addSubtask}
                  className="flex-1 bg-transparent outline-none border-0 focus:ring-0 p-0 text-sm placeholder:text-gray-400 italic text-gray-900 disabled:opacity-50"
                  placeholder="Add a step and press Enter..."
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-[10px] text-gray-400">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono shadow-sm">
              {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}
            </kbd>
            +
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono shadow-sm">
              Enter
            </kbd>
            <span>to quick save</span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setModel(false)}
              className="flex-1 md:flex-none px-4 py-2 text-sm rounded-lg font-medium text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTask}
              disabled={isSaving || !taskTitle.trim() || !date}
              className="flex-1 md:flex-none px-5 py-2 text-sm rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px]"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Saving</span>
                </>
              ) : (
                "Save Task"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
