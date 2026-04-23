import { AlertCircle, Loader2, X } from "lucide-react";
import React from "react";
import { useTaskStore } from "../../store/taskStore";


interface ConfirmProps {
  id?: string;
  from?: string;
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
}
const DeleteModal = ({
  id,
  from,
  title,
  onConfirm,
  onCancel,
}: ConfirmProps) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const {deleteTask} = useTaskStore();
  const handleConfirm = async () => {
    setIsDeleting(true);
    
    try {
      const resp =await deleteTask(id || "");
      if (resp.success) {
        onConfirm();
        return;
      }
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle size={16} className="text-red-600" />
            </div>
            <h3 className="text-gray-900 text-base font-semibold">
              Delete Task
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600">
            Are you sure you want to delete this task ({title})? This action
            cannot be undone.
          </p>
        </div>
        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all flex items-center gap-1.5 ${
              isDeleting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isDeleting ? (
              <div className="flex gap-2">
                <Loader2
                  size={16}
                  className="animate-spin text-white mx-auto"
                />
                Deleting...
              </div>
            ) : (
              "Delete Task"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
