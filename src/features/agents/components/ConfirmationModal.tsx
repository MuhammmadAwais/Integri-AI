import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import Portal from "../../../Components/ui/Portal";
import { cn } from "../../../lib/utils";
import { useAppSelector } from "../../../hooks/useRedux";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDangerous?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  isDangerous = false,
}) => {
  const { isDark } = useAppSelector((state: any) => state.theme);

  if (!isOpen) return null;

  return (
    <Portal>
      <AnimatePresence>
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className={cn(
              "relative w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl",
              isDark
                ? "bg-[#121212] border-zinc-800"
                : "bg-white border-zinc-200"
            )}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full",
                    isDangerous
                      ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500"
                  )}
                >
                  <AlertTriangle size={24} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3
                    className={cn(
                      "text-lg font-bold",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {title}
                  </h3>
                </div>
                <button
                title="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isDark
                      ? "hover:bg-zinc-800 text-zinc-400"
                      : "hover:bg-gray-100 text-gray-500"
                  )}
                >
                  <X size={20} />
                </button>
              </div>

              <p
                className={cn(
                  "mb-8 text-sm leading-relaxed",
                  isDark ? "text-zinc-400" : "text-gray-600"
                )}
              >
                {message}
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    isDark
                      ? "bg-zinc-800 text-white hover:bg-zinc-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  )}
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg text-white transition-all flex items-center gap-2",
                    isDangerous
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700",
                    isLoading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
};

export default ConfirmationModal;
