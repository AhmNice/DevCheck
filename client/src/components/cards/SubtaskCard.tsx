import { Trash2 } from "lucide-react";
import type { Subtask } from "../../interface/task";

interface SubtaskProps {
  todo: Partial<Subtask>;
  onCompletedChange: (id: string, completed: boolean) => void;
  handleDelete: (id: string) => void;
}

const SubtaskCard = ({
  todo,
  onCompletedChange,
  handleDelete,
}: SubtaskProps) => {
  return (
    <div
      key={todo._id}
      className="flex items-center gap-3 group p-1.5 hover:bg-slate-50 rounded-md transition-all duration-200"
    >
      <input
        type="checkbox"
        checked={todo.status === "completed"}
        onChange={(e) => todo._id && onCompletedChange(todo._id, e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 transition-colors cursor-pointer"
      />
      <span
        className={`text-xs flex-1 transition-all ${
          todo.status === "completed"
            ? "text-slate-400 line-through"
            : "text-slate-700 font-medium"
        }`}
      >
        {todo.title}
      </span>
      <button
        onClick={() => todo._id && handleDelete(todo._id)}
        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all duration-200 p-1 hover:bg-red-50 rounded-md"
        aria-label="Delete subtask"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default SubtaskCard;