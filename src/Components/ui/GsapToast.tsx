import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "../../lib/utils";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning";
  visible: boolean;
  onClose: () => void;
  isDark?: boolean;
}

const GsapToast: React.FC<ToastProps> = ({ message, type, visible, onClose, isDark }) => {
  const toastRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  // Manage rendering logic and exit animation
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
    } else if (shouldRender && toastRef.current) {
      gsap.to(toastRef.current, {
        y: -50,
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setShouldRender(false);
        }
      });
    }
  }, [visible]);

  // Entrance animation & auto-dismiss
  useEffect(() => {
    let timer: number;
    if (shouldRender && visible && toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        { y: -50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
      );

      // Auto dismiss after 5 seconds
      timer = window.setTimeout(() => {
        onClose();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [shouldRender, visible, onClose]);

  if (!shouldRender) return null;

  return (
    <div className="fixed top-6 right-6 z-50 pointer-events-none">
      <div 
        ref={toastRef}
        className={cn(
          "pointer-events-auto flex items-center gap-3 px-4 py-4 rounded-xl shadow-2xl border w-80",
          isDark ? "bg-[#18161C] border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
        )}
      >
        <div className={cn(
          "flex-shrink-0",
          type === "success" ? "text-green-500" : type === "error" ? "text-red-500" : "text-yellow-500"
        )}>
          {type === "success" && <CheckCircle size={20} />}
          {type === "error" && <AlertCircle size={20} />}
          {type === "warning" && <Info size={20} />}
        </div>
        <p className="flex-1 text-sm font-medium pr-2">{message}</p>
        <button 
          onClick={() => onClose()} 
          className={cn(
            "p-1.5 rounded-md transition-colors border",
            isDark ? "hover:bg-zinc-800 text-zinc-500 border-transparent hover:border-zinc-700" : "hover:bg-zinc-100 text-zinc-400 border-transparent hover:border-zinc-200"
          )}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default GsapToast;
