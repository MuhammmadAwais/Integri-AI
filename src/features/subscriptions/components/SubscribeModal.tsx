import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Crown, Zap, ArrowRight } from "lucide-react";
import Portal from "../../../Components/ui/Portal"; // Adjust path if needed
import { useAppSelector } from "../../../hooks/useRedux";

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

const SubscribeModal: React.FC<SubscribeModalProps> = ({
  isOpen,
  onClose,
  featureName,
}) => {
  const navigate = useNavigate();
  const isDark = useAppSelector((state: any) => state.theme?.isDark ?? true);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    onClose();
    navigate("/subscriptions");
  };

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-9999 bg-black/60 backdrop-blur-sm transition-opacity flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className={`
            relative w-full max-w-md rounded-xl border shadow-2xl overflow-hidden
            transform transition-all scale-100 opacity-100 animate-in zoom-in-95 duration-200
            ${
              isDark
                ? "bg-[#09090b] border-[#27272a] text-white"
                : "bg-white border-gray-200 text-gray-900"
            }
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
          title="close"
            onClick={onClose}
            className={`
              absolute right-4 top-4 p-1 rounded-md transition-colors z-10 hover:cursor-pointer
              ${
                isDark
                  ? "hover:bg-[#27272a] text-gray-400"
                  : "hover:bg-gray-100 text-gray-500"
              }
            `}
          >
            <X size={18} />
          </button>

          {/* Header Section with Gradient Accent */}
          <div className="flex flex-col items-center pt-8 pb-2 px-6 text-center relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 blur-[60px] rounded-full opacity-20 pointer-events-none ${
                isDark ? "bg-amber-500" : "bg-amber-400"
              }`}
            />

            <div
              className={`
              p-3 rounded-full mb-5 relative
              ${
                isDark
                  ? "bg-linear-to-br from-amber-500/20 to-orange-500/10 text-amber-500 ring-1 ring-amber-500/20"
                  : "bg-amber-50 text-amber-600"
              }
            `}
            >
              <Crown size={28} strokeWidth={2} />
            </div>

            <h2 className="text-xl font-bold tracking-tight mb-2">
              Unlock {featureName}
            </h2>
            <p
              className={`text-sm leading-relaxed max-w-[280px] ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Subscribe to our premium plan to use the{" "}
              <span
                className={
                  isDark ? "text-white font-medium" : "text-black font-medium"
                }
              >
                {featureName}
              </span>{" "}
              feature and remove all limits.
            </p>
          </div>

          {/* Feature Highlight Pill (Optional visual flair) */}
          <div className="flex justify-center mb-6 mt-2">
            <div
              className={`
              flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border
              ${
                isDark
                  ? "bg-[#18181b] border-[#27272a] text-gray-300"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              }
            `}
            >
              <Zap size={12} className="text-amber-500" />
              <span>Instant Access • Cancel Anytime</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 pt-2 flex flex-col gap-3">
            <button
              onClick={handleSubscribe}
              className={`
                w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all shadow-lg hover:cursor-pointer
                ${
                  isDark
                    ? "bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-900/20"
                    : "bg-black text-white hover:bg-gray-800"
                }
              `}
            >
              <span>Upgrade Now</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onClose}
              className={`
                w-full py-2.5 px-4 rounded-lg font-medium transition-colors text-sm hover:cursor-pointer
                ${
                  isDark
                    ? "text-gray-400 hover:text-white hover:bg-[#27272a]"
                    : "text-gray-500 hover:text-black hover:bg-gray-100"
                }
              `}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default SubscribeModal;
