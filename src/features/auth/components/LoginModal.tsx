import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Lock, LogIn, UserPlus } from "lucide-react";
import Portal from "../../../Components/ui/Portal";
import { useAppSelector } from "../../../hooks/useRedux";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  title = "Authentication Required",
  description = "Login or Signup to continue using Integri AI features.",
}) => {
  const navigate = useNavigate();
  const isDark = useAppSelector((state: any) => state.theme?.isDark ?? true); // Default to dark if theme slice invalid

  if (!isOpen) return null;

  const handleNavigation = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-9999 bg-black/60 backdrop-blur-sm transition-opacity flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className={`
            relative w-full max-w-md rounded-xl border shadow-2xl overflow-hidden
            transform transition-all scale-100 opacity-100
            ${
              isDark
                ? "bg-[#09090b] border-[#27272a] text-white"
                : "bg-white border-gray-200 text-gray-900"
            }
          `}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          {/* Close Button */}
          <button
          title="Close"
            onClick={onClose}
            className={`
              absolute right-4 top-4 p-1 rounded-md transition-colors hover:cursor-pointer
              ${
                isDark
                  ? "hover:bg-[#27272a] text-gray-400"
                  : "hover:bg-gray-100 text-gray-500"
              }
            `}
          >
            <X size={18} />
          </button>

          {/* Header Section */}
          <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center">
            <div
              className={`
              p-3 rounded-full mb-4
              ${isDark ? "bg-[#27272a] text-white" : "bg-gray-100 text-black"}
            `}
            >
              <Lock size={24} />
            </div>

            <h2 className="text-xl font-bold tracking-tight mb-2">{title}</h2>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="p-6 pt-2 flex flex-col gap-3">
            <button
              onClick={() => handleNavigation("/login")}
              className={`
                w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all hover:cursor-pointer
                ${
                  isDark
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-black text-white hover:bg-gray-800"
                }
              `}
            >
              <LogIn size={16} />
              Log In
            </button>

            <button
              onClick={() => handleNavigation("/signup")}
              className={`
                w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium border transition-all hover:cursor-pointer
                ${
                  isDark
                    ? "border-[#27272a] hover:bg-[#27272a] text-white"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }
              `}
            >
              <UserPlus size={16} />
              Sign Up
            </button>
          </div>

          {/* Footer / Disclaimer */}
          <div
            className={`
            py-3 px-6 text-center text-[11px] border-t
            ${
              isDark
                ? "border-[#27272a] bg-[#101012] text-gray-500"
                : "border-gray-100 bg-gray-50 text-gray-400"
            }
          `}
          >
            By continuing, you agree to our Terms of Service.
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default LoginModal;
