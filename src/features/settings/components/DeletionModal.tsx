import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X, Loader2, Trash2 } from "lucide-react";
import { cn } from "../../../lib/utils";

interface DeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDark: boolean;
  isLoading?: boolean;
}

const DeletionModal: React.FC<DeletionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDark,
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isMatch, setIsMatch] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      setIsMatch(false);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsMatch(val.toLowerCase() === "delete");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMatch && !isLoading) {
      onConfirm();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={cn(
              "relative w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl transition-all",
              isDark
                ? "bg-[#18181b] border-zinc-800 text-zinc-100"
                : "bg-white border-zinc-200 text-zinc-900"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-0">
              <div className="flex items-center gap-3 text-red-600">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-lg font-bold">Delete Account</h3>
              </div>
              <button
              title="close"
                onClick={onClose}
                disabled={isLoading}
                className={cn(
                  "rounded-full p-2 transition-colors hover:cursor-pointer",
                  isDark
                    ? "hover:bg-zinc-800 text-zinc-400"
                    : "hover:bg-zinc-100 text-zinc-500"
                )}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}
              >
                This action is <span className="font-bold">irreversible</span>.
                This will permanently delete your account, active subscriptions,
                and remove all your data from our servers.
              </p>

              {/* Confirmation Input */}
              <div className="space-y-2">
                <label
                  className={cn(
                    "block text-xs font-medium uppercase tracking-wider",
                    isDark ? "text-zinc-500" : "text-zinc-500"
                  )}
                >
                  Type <span className="text-red-500">delete</span> to confirm
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="delete"
                  disabled={isLoading}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition-all",
                    isDark
                      ? "bg-zinc-900/50 border-zinc-800 focus:border-red-500/50 placeholder:text-zinc-700"
                      : "bg-gray-50 border-gray-200 focus:border-red-500/50 placeholder:text-gray-400"
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:cursor-pointer",
                    isDark
                      ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isMatch || isLoading}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all shadow-lg hover:cursor-pointer",
                    !isMatch || isLoading
                      ? "opacity-50 cursor-not-allowed bg-red-600 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Forever
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default DeletionModal;
