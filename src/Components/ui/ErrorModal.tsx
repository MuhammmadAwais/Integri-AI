import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, X } from "lucide-react";
import Portal from "./Portal";
import { cn } from "../../lib/utils";
import { useAppSelector } from "../../hooks/useRedux";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title = "Error Occurred",
  message,
}) => {
  const { isDark } = useAppSelector((state: any) => state.theme);

  if (!isOpen) return null;

  return (
    <Portal>
      <AnimatePresence>
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className={cn(
              "relative w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl",
              isDark
                ? "bg-[#121212] border-red-900/50"
                : "bg-white border-red-200"
            )}
          >
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
              </div>

              <h3
                className={cn(
                  "mb-2 text-lg font-bold",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {title}
              </h3>

              <p
                className={cn(
                  "mb-6 text-sm",
                  isDark ? "text-zinc-400" : "text-gray-600"
                )}
              >
                {message}
              </p>

              <button
                onClick={onClose}
                className={cn(
                  "w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors",
                  "bg-red-600 hover:bg-red-700"
                )}
              >
                Close
              </button>
            </div>

            <button
            type="button"
            title="cross"
              onClick={onClose}
              className={cn(
                "absolute top-4 right-4 p-1 rounded-full transition-colors",
                isDark
                  ? "text-zinc-500 hover:bg-zinc-800"
                  : "text-gray-400 hover:bg-gray-100"
              )}
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
};

export default ErrorModal;
