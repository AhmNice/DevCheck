import { Trash2 } from "lucide-react";
import type { subTask } from "../data/subtaskData";

interface SubtaskProps {
  todo: subTask;
  onCompletedChange: (id: number, completed: boolean) => void;
  handleDelete: (id: number) => void;
}

const SubtaskCard = ({
  todo,
  onCompletedChange,
  handleDelete,
}: SubtaskProps) => {
  return (
    <div
      key={todo.id}
      className="flex items-center gap-4 group p-2 hover:bg-slate-50 rounded-lg transition-colors"
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => onCompletedChange(todo.id, e.target.checked)}
        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
      />
      <span
        className={`text-sm flex-1 ${
          todo.completed ? "text-slate-500 line-through" : "text-slate-900"
        }`}
      >
        {todo.title}
      </span>
      <button
        onClick={() => handleDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default SubtaskCard;
