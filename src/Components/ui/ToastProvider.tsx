import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "../../lib/utils";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((msg: string) => addToast(msg, "success"), [addToast]);
  const error = useCallback((msg: string) => addToast(msg, "error"), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error }}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
              {toasts.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={cn(
                    "pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl min-w-[280px] max-w-sm backdrop-blur-xl border font-sans",
                    "bg-zinc-900/90 shadow-black/40",
                    t.type === "success" && "border-blue-500/20",
                    t.type === "error" && "border-red-500/20",
                    t.type === "info" && "border-zinc-700/50"
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {t.type === "success" && <CheckCircle2 size={16} className="text-blue-400" />}
                    {t.type === "error" && <AlertCircle size={16} className="text-red-400" />}
                    {t.type === "info" && <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 inline-block" />}
                  </div>
                  
                  <p className="flex-1 text-sm text-zinc-100 font-medium leading-relaxed">{t.message}</p>
                  
                  <button 
                    onClick={() => removeToast(t.id)} 
                    className="shrink-0 p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors hover:cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};
