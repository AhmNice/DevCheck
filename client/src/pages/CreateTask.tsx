import { useState } from "react";
import { Calendar1, CalendarFold, CheckCircle, ChevronDown, ChevronRight, X } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import MDEditor from "@uiw/react-md-editor";
import SubtaskCard from "../components/cards/SubtaskCard";
import type { Subtask, Task } from "../interface/task";
import { useTaskStore } from "../store/taskStore";
import { useAuthStore } from "../store/authstore";

interface createTaskProps {
  setModel: (model: boolean) => void;
  onTaskCreate?: (task: Task) => void;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface FormError {
  field: string;
  message: string;
}

interface SubtaskWithDetails extends Partial<Subtask> {
  isExpanded?: boolean;
  description?: string;
  due_date?: string;
}

const CreateTask = ({ setModel, onTaskCreate }: createTaskProps) => {
  const [subtasks, setSubtasks] = useState<SubtaskWithDetails[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [newSubtaskDescription, setNewSubtaskDescription] = useState("");
  const [newSubtaskDueDate, setNewSubtaskDueDate] = useState<Date | null>(null);
  const [showNewSubtaskDetails, setShowNewSubtaskDetails] = useState(false);
  const [showSubtaskCalendar, setShowSubtaskCalendar] = useState(false);

  const [date, setDate] = useState<Value>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const { createTask } = useTaskStore();

  // Form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FormError[]>([]);
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
          description: newSubtaskDescription.trim() || undefined,
          due_date: newSubtaskDueDate ? newSubtaskDueDate.toISOString() : undefined,
          status: "PLANNED",
          isExpanded: false,
        },
      ]);
      // Reset new subtask form
      setNewSubtask("");
      setNewSubtaskDescription("");
      setNewSubtaskDueDate(null);
      setShowNewSubtaskDetails(false);
    }
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((subtask) =>
        subtask._id === id
          ? {
              ...subtask,
              status: subtask.status === "SHIPPED" ? "PLANNED" : "SHIPPED",
            }
          : subtask,
      ),
    );
  };

  const deleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((subtask) => subtask._id !== id));
  };

  const toggleSubtaskExpand = (id: string) => {
    setSubtasks(
      subtasks.map((subtask) =>
        subtask._id === id
          ? { ...subtask, isExpanded: !subtask.isExpanded }
          : subtask,
      ),
    );
  };

  const updateSubtaskField = (id: string, field: string, value: any) => {
    setSubtasks(
      subtasks.map((subtask) =>
        subtask._id === id ? { ...subtask, [field]: value } : subtask,
      ),
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
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

  const validateForm = (): boolean => {
    const newErrors: FormError[] = [];

    if (!taskTitle.trim()) {
      newErrors.push({
        field: "title",
        message: "Task title is required",
      });
    }

    if (!date) {
      newErrors.push({
        field: "due_date",
        message: "Due date is required",
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const getFieldError = (fieldName: string): string => {
    const error = errors.find((err) => err.field === fieldName);
    return error?.message || "";
  };

  const handleSaveTask = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setError("");
    setErrors([]);

    try {
      const isoDate = date instanceof Date ? date.toISOString() : new Date().toISOString();

      const newTask = {
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        priority: (priority === "URGENT" ? "HIGH" : priority === "LOW" ? "LOW" : priority) as "LOW" | "MEDIUM" | "HIGH",
        status: "BACKLOG" as const,
        user_id: user?._id,
        due_date: isoDate,
        subtasks: subtasks.map(st => ({
          title: st.title,
          description: st.description,
          due_date: st.due_date,
          status: st.status || "PLANNED",
        }))
      };

      const res = await createTask(newTask as Omit<Task, "_id" | "created_at" | "updated_at">);

      if (!res.success) {
        if (res.error && Array.isArray(res.error)) {
          const apiErrors: FormError[] = res.error.map((err: any) => ({
            field: err.field.replace("body.", ""),
            message: err.message,
          }));
          setErrors(apiErrors);
        }
        return;
      }

      setModel(false);
    } catch (error: any) {
      console.error("Error creating task:", error);
      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const apiErrors: FormError[] = error.response.data.errors.map((err: any) => ({
          field: err.field.replace("body.", ""),
          message: err.message,
        }));
        setErrors(apiErrors);
      } else if (error?.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to create task. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSaveTask();
    }
  };

  const handleTitleChange = (value: string) => {
    setTaskTitle(value);
    if (getFieldError("title")) {
      setErrors(errors.filter((err) => err.field !== "title"));
    }
  };

  const handleDateChange = (value: Value) => {
    setDate(value);
    if (getFieldError("due_date")) {
      setErrors(errors.filter((err) => err.field !== "due_date"));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white w-full max-w-[800px] max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="text-blue-600 bg-blue-50 p-1.5 rounded-lg">
              <CheckCircle size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Create New Task</h2>
          </div>
          <button
            onClick={() => setModel(false)}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-all"
            disabled={isSaving}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mx-6 mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-xs font-medium">{error}</p>
          </div>
        )}

        {errors.length > 0 && (
          <div className="mx-6 mt-3 space-y-1.5">
            {errors.map((err, idx) => (
              <div key={idx} className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-xs font-medium">
                  <span className="font-semibold uppercase text-[10px]">
                    {err.field.replace(/_/g, " ")}:
                  </span>{" "}
                  {err.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Task Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              value={taskTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-base font-medium outline-none border-0 focus:ring-0 bg-transparent p-0 placeholder:text-gray-300 text-gray-900"
              placeholder="e.g., Implement OAuth2 flow"
              disabled={isSaving}
            />
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                disabled={isSaving}
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Due Date <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => !isSaving && setShowCalendar(!showCalendar)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100"
              >
                <CalendarFold size={16} className="text-blue-500" />
                <span className="flex-1 text-gray-900">
                  {date instanceof Date ? formatDate(date) : "Select a date"}
                </span>
              </div>
              {showCalendar && !isSaving && (
                <div className="absolute top-full left-0 mt-1 z-10 bg-white rounded-lg shadow-xl border border-gray-200 p-2">
                  <Calendar
                    onChange={(value) => {
                      handleDateChange(value);
                      setShowCalendar(false);
                    }}
                    value={date}
                    minDate={new Date()}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5" data-color-mode="light">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Description
            </label>
            <MDEditor
              value={taskDescription}
              onChange={(value) => setTaskDescription(value || "")}
              height={100}
              preview="edit"
            />
          </div>

          {/* Subtasks Section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Subtasks ({subtasks.filter((s) => s.status !== "SHIPPED").length} remaining)
            </label>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {/* Existing Subtasks */}
              {subtasks.map((subtask) => (
                <div key={subtask._id} className="border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-2 p-2">
                    <button
                      onClick={() => toggleSubtaskExpand(subtask._id!)}
                      className="p-0.5 hover:bg-gray-100 rounded"
                    >
                      {subtask.isExpanded ? (
                        <ChevronDown size={14} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={14} className="text-gray-400" />
                      )}
                    </button>

                    <input
                      type="checkbox"
                      checked={subtask.status === "SHIPPED"}
                      onChange={() => subtask._id && toggleSubtask(subtask._id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />

                    <span className={`text-sm flex-1 ${subtask.status === "SHIPPED" ? "text-gray-400 line-through" : "text-gray-700"}`}>
                      {subtask.title}
                    </span>

                    {subtask.due_date && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Calendar1 size={10} />
                        {formatDisplayDate(subtask.due_date)}
                      </span>
                    )}

                    <button
                      onClick={() => subtask._id && deleteSubtask(subtask._id)}
                      className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {/* Expanded Subtask Details */}
                  {subtask.isExpanded && (
                    <div className="ml-8 mr-2 mb-2 p-2 bg-gray-50 rounded-lg space-y-2">
                      <textarea
                        value={subtask.description || ""}
                        onChange={(e) => updateSubtaskField(subtask._id!, "description", e.target.value)}
                        placeholder="Add description..."
                        className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        rows={2}
                      />
                      <div className="flex items-center gap-2">
                        <Calendar1 size={12} className="text-gray-400" />
                        <input
                          type="date"
                          value={subtask.due_date?.split('T')[0] || ""}
                          onChange={(e) => updateSubtaskField(subtask._id!, "due_date", e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add New Subtask */}
              <div className="border border-dashed border-gray-200 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 text-lg">+</span>
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={addSubtask}
                    className="flex-1 bg-transparent outline-none border-0 focus:ring-0 p-0 text-sm placeholder:text-gray-400"
                    placeholder="Add a subtask..."
                    disabled={isSaving}
                  />
                  <button
                    onClick={() => setShowNewSubtaskDetails(!showNewSubtaskDetails)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Add details
                  </button>
                </div>

                {showNewSubtaskDetails && (
                  <div className="ml-6 mt-2 space-y-2">
                    <textarea
                      value={newSubtaskDescription}
                      onChange={(e) => setNewSubtaskDescription(e.target.value)}
                      placeholder="Subtask description (optional)"
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={2}
                    />
                    <div className="flex items-center gap-2">
                      <Calendar1 size={12} className="text-gray-400" />
                      <input
                        type="date"
                        value={newSubtaskDueDate ? newSubtaskDueDate.toISOString().split('T')[0] : ""}
                        onChange={(e) => setNewSubtaskDueDate(e.target.value ? new Date(e.target.value) : null)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-2">
          <button
            onClick={() => setModel(false)}
            className="px-4 py-2 text-sm rounded-lg font-medium text-gray-600 hover:bg-gray-200"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveTask}
            disabled={isSaving || !taskTitle.trim() || !date}
            className="px-5 py-2 text-sm rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;