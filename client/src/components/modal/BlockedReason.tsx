import React from "react";
import { X, AlertCircle, Save, Loader2 } from "lucide-react";

interface BlockedReasonProps {
  reason: string;
  setBlockedReason: (reason: string) => void;
  onClose: () => void;
  onSave: () => void;
  isUpdating?: boolean;
}

const BlockedReason = ({
  reason,
  setBlockedReason,
  onClose,
  onSave,
  isUpdating,
}: BlockedReasonProps) => {
  const handleSave = () => {
    if (!reason.trim() || isUpdating) return;
    onSave(); // Just call onSave directly
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
              Block Task
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
            Reason for Blockage
          </label>
          <textarea
            value={reason}
            onChange={(e) => setBlockedReason(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            placeholder="Enter the reason why this task is blocked..."
            rows={4}
            autoFocus
          />
          <p className="text-[10px] text-gray-500 mt-1.5">
            This reason will be visible to all team members.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-gray-700 bg-gray-100 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!reason.trim() || isUpdating}
            className={`px-4 py-1.5 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              reason.trim() && !isUpdating
                ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isUpdating ? (
              <div className="flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Save size={12} />
                Save Reason & Block Task
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockedReason;