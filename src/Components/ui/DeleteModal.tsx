import React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";
import Portal from "./Portal"; 

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDark: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className={cn(
            "w-full max-w-sm rounded-2xl shadow-2xl transform transition-all animate-in zoom-in-95 duration-200 p-6 border relative",
            isDark
              ? "bg-[#181818] border-[#2A2B32] text-white"
              : "bg-white border-gray-200 text-gray-900"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className={cn(
                "p-4 rounded-full mb-2",
                isDark ? "bg-red-500/10 text-red-500" : "bg-red-50 text-red-600"
              )}
            >
              <AlertTriangle size={32} strokeWidth={2} />
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold mb-2">Delete Conversation?</h3>
            <p
              className={cn(
                "text-sm leading-relaxed px-2",
                isDark ? "text-gray-400" : "text-gray-500"
              )}
            >
              This action cannot be undone. The chat will be permanently
              removed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={cn(
                "hover:cursor-pointer flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm",
                isDark
                  ? "bg-[#2A2B32] hover:bg-[#3A3B42] text-gray-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              )}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="hover:cursor-pointer flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors text-sm bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default DeleteModal;
