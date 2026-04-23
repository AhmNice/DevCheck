import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Subtask } from "../../interface/task";

interface SubtaskProps {
  todo: Partial<Subtask>;
  onCompletedChange: (id: string, completed: boolean) => void;
  handleDelete: (id: string) => void;
  taskId?: string; // Add taskId to build the navigation path
}

const SubtaskCard = ({
  todo,
  onCompletedChange,
  handleDelete,
  taskId,
}: SubtaskProps) => {
  const navigate = useNavigate();
  const isCompleted = todo.status === "SHIPPED";

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (todo._id && taskId) {
      // Navigate to subtask detail page
      navigate(`/task/${taskId}/subtask/${todo._id}`, {
        state: { subtask: todo, taskId }
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (todo._id) {
      onCompletedChange(todo._id, e.target.checked);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (todo._id) {
      handleDelete(todo._id);
    }
  };

  return (
    <div
      className="flex items-center gap-3 cursor-pointer group p-1.5 hover:bg-gray-50 rounded-lg transition-all duration-200"
      onClick={handleCardClick}
    >
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={handleCheckboxChange}
        onClick={(e) => e.stopPropagation()}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 transition-colors cursor-pointer"
      />

      <span
        className={`text-xs flex-1 transition-all ${
          isCompleted
            ? "text-gray-400 line-through"
            : "text-gray-700 font-medium"
        }`}
      >
        {todo.title || "Untitled Subtask"}
      </span>

      <button
        onClick={handleDeleteClick}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all duration-200 p-1 hover:bg-red-50 rounded-md"
        aria-label="Delete subtask"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default SubtaskCard;