import { useState } from "react";
import { CalendarFold, CheckCircle, X } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { subtaskData } from "../components/data/subtaskData";
import SubtaskCard from "../components/cards/SubtaskCard";
import type { taskProps } from "../components/cards/TaskCard";

interface createTaskProps {
  setModel: (model: boolean) => void;
  onTaskCreate?: (task: taskProps) => void;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface subTask {
  id: number;
  title: string;
  completed: boolean;
}

const CreateTask = ({ setModel, onTaskCreate }: createTaskProps) => {
  const [subtasks, setSubtasks] = useState<subTask[]>(subtaskData);
  const [newSubtask, setNewSubtask] = useState("");
  const [date, setDate] = useState<Value>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const addSubtask = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newSubtask.trim()) {
      e.preventDefault();
      setSubtasks([
        ...subtasks,
        {
          id: Date.now(),
          title: newSubtask.trim(),
          completed: false,
        },
      ]);
      setNewSubtask("");
    }
  };

  const toggleSubtask = (id: number) => {
    setSubtasks(
      subtasks.map((subtask) =>
        subtask.id === id
          ? { ...subtask, completed: !subtask.completed }
          : subtask,
      ),
    );
  };

  const deleteSubtask = (id: number) => {
    setSubtasks(subtasks.filter((subtask) => subtask.id !== id));
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
        return "HIGH PRIORITY";
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
      const completedCount = subtasks.filter((s) => s.completed).length;
      const percentage =
        subtasks.length > 0
          ? Math.round((completedCount / subtasks.length) * 100)
          : 0;

      const newTask: taskProps = {
        id: Date.now(),
        tag: getPriorityTag(priority),
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        percentage: percentage,
        startDate: formatDateForTask(new Date()), // Today as start date
        endDate:
          date instanceof Date
            ? formatDateForTask(date)
            : formatDateForTask(new Date()),
        subtaskData: subtasks,
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Log the task (in real app, send to API)
      console.log("Task created:", newTask);

      // Call the parent callback if provided
      if (onTaskCreate) {
        onTaskCreate(newTask);
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
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#cfd7e7]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">
              <CheckCircle />
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Create New Task
            </h2>
          </div>
          <button
            onClick={() => setModel(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSaving}
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Modal Content (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          {/* Task Title Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full text-xl font-medium border-0 focus:ring-0 bg-transparent p-0 placeholder:text-gray-300 text-gray-900"
              placeholder="e.g., Implement OAuth2 flow"
              type="text"
              disabled={isSaving}
            />
          </div>

          {/* Horizontal Layout for Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Priority Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Priority
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="appearance-none w-full px-4 py-3 rounded-lg border border-[#cfd7e7] bg-[#f8f9fc] text-gray-900 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="space-y-2 relative">
              <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Due Date <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => !isSaving && setShowCalendar(!showCalendar)}
                className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg border border-[#cfd7e7] bg-[#f8f9fc] text-base focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${
                  isSaving
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:bg-gray-100"
                }`}
              >
                <span className="material-symbols-outlined text-primary">
                  <CalendarFold size={16} />
                </span>
                <span className="flex-1 text-gray-900">
                  {date instanceof Date ? formatDate(date) : "Select a date"}
                </span>
                {date instanceof Date && getDayLabel(date) && (
                  <span className="text-xs font-medium text-gray-400">
                    {getDayLabel(date)}
                  </span>
                )}
              </div>

              {/* Calendar Popup */}
              {showCalendar && !isSaving && (
                <div className="absolute top-full left-0 mt-2 z-10 bg-white rounded-lg shadow-xl border border-[#cfd7e7] p-2">
                  <Calendar
                    onChange={(value) => {
                      setDate(value);
                      setShowCalendar(false);
                    }}
                    value={date}
                    className="border-0"
                    minDate={new Date()} // Prevent selecting past dates
                    tileClassName={({ date, view }) =>
                      view === "month" &&
                      date.toDateString() === new Date().toDateString()
                        ? "react-calendar__tile--now bg-blue-700/10 text-primary font-bold"
                        : ""
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center justify-between">
              Description
              <span className="text-[10px] normal-case bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                Markdown Supported
              </span>
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full min-h-[120px] rounded-lg border border-[#cfd7e7] bg-[#f8f9fc] p-4 text-gray-900 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder:text-gray-400 disabled:opacity-50"
              placeholder="Add more details about the technical implementation..."
              disabled={isSaving}
            />
          </div>

          {/* Subtasks Section */}
          <div className="space-y-4">
            <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Subtasks
            </label>
            <div className="space-y-2">
              {/* Subtask Items */}
              {subtasks.map((subtask) => (
                <SubtaskCard
                  key={subtask.id}
                  todo={subtask}
                  onCompletedChange={toggleSubtask}
                  handleDelete={deleteSubtask}
                />
              ))}

              {/* Add Subtask Input */}
              <div className="flex items-center gap-3 pt-2">
                <span className="material-symbols-outlined text-primary/50">
                  add
                </span>
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={addSubtask}
                  className="flex-1 bg-transparent border-0 focus:ring-0 p-0 text-base placeholder:text-gray-400 italic text-gray-900 disabled:opacity-50"
                  placeholder="Add a step and press Enter..."
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 border-t border-[#cfd7e7] bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
            <kbd className="px-2 py-1 bg-white border border-gray-200 rounded shadow-sm">
              {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}
            </kbd>
            +
            <kbd className="px-2 py-1 bg-white border border-gray-200 rounded shadow-sm">
              Enter
            </kbd>
            <span>to quick save</span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setModel(false)}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTask}
              disabled={isSaving || !taskTitle.trim() || !date}
              className="flex-1 md:flex-none px-8 py-2.5 rounded-lg font-semibold bg-primary text-white hover:bg-primary-700/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-700 flex items-center justify-center gap-2 min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  <span>Saving...</span>
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
