import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAppSelector } from "../../hooks/useRedux";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  onRetry?: () => void; // Added capability for retry actions
  retryLabel?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title = "Error Occurred",
  message,
  onRetry,
  retryLabel = "Try Again",
}) => {
  const { isDark } = useAppSelector((state: any) => state.theme);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-10000 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={cn(
              "relative w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl transition-all",
              isDark
                ? "bg-[#18181b] border-zinc-800 text-zinc-100"
                : "bg-white border-zinc-200 text-zinc-900"
            )}
          >
            <div className="p-6 text-center">
              {/* Icon */}
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
              </div>

              {/* Text */}
              <h3 className="mb-2 text-lg font-bold tracking-tight">{title}</h3>

              <p
                className={cn(
                  "mb-6 text-sm leading-relaxed",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}
              >
                {message}
              </p>

              {/* Actions */}
              <div className="grid gap-3">
                {onRetry && (
                  <button
                    onClick={() => {
                      onRetry();
                      onClose();
                    }}
                    className={cn(
                      "w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-md hover:cursor-pointer hover:shadow-lg",
                      "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                    )}
                  >
                    {retryLabel}
                  </button>
                )}

                <button
                  onClick={onClose}
                  className={cn(
                    "w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors hover:cursor-pointer",
                    isDark
                      ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900",
                    !onRetry && "bg-red-600 hover:bg-red-700 text-white" // Primary style if no retry
                  )}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Close X */}
            <button
              type="button"
              title="Close"
              onClick={onClose}
              className={cn(
                "absolute top-4 right-4 p-2 rounded-full transition-colors hover:cursor-pointer",
                isDark
                  ? "text-zinc-500 hover:bg-zinc-800 hover:text-white"
                  : "text-gray-400 hover:bg-gray-100 hover:text-black"
              )}
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ErrorModal;
