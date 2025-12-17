import React from "react";
import { cn } from "../../lib/utils";
import AVAILABLE_MODELS from "../../../Constants"; // Ensure this matches your file structure

interface ReasoningMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selected: string;
  onSelect: React.Dispatch<React.SetStateAction<string>>;
  isDark: any;
}

const ModelMenu: React.FC<ReasoningMenuProps> = ({
  isOpen,
  onClose,
  selected,
  onSelect,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* 1. Backdrop: Closes menu when clicking outside */}
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />

      {/* Menu Container */}
      <div
        className={cn(
          // Layout & Animation
          "absolute bottom-16 right-2 sm:right-16 w-[240px] z-50 flex flex-col p-1.5",
          "animate-in zoom-in-95 duration-100 ease-out origin-bottom-right",
          "rounded-2xl border shadow-2xl overflow-hidden",

          // Responsive Height Constraints (Fixes "out of screen" issue)
          "max-h-[55vh] sm:max-h-[450px]",

          // Theme Styling
          isDark
            ? "bg-[#181818] border-[#2A2B32] text-gray-200"
            : "bg-white border-gray-200 text-gray-900"
        )}
      >
        {/* Fixed Header */}
        <div className="px-3 py-2.5 text-[10px] font-bold uppercase opacity-50 tracking-wider flex-shrink-0 border-b border-dashed border-gray-500/20 mb-1">
          System Models
        </div>

        {/* Scrollable List Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 max-h-60 pr-0.5">
          {AVAILABLE_MODELS.map((m: any) => (
            <button
              title={m.label}
              key={m.id}
              onClick={() => {
                onSelect(m.id);
                onClose();
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 text-sm font-medium hover:cursor-pointer mb-0.5",
                isDark ? "hover:bg-[#2A2B32]" : "hover:bg-gray-100",
                selected === m.id &&
                  (isDark
                    ? "bg-[#2A2B32] text-white"
                    : "bg-gray-100 text-black")
              )}
            >
              <span className="truncate mr-2">{m.label || m.name}</span>
              {m.badge && (
                <span
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide shadow-sm flex-shrink-0",
                    isDark
                      ? "bg-[#3A3B42] text-gray-300"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {m.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Beautiful Scrollbar Styles (Scoped to this component) */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px; /* Slim width */
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: transparent; /* Hidden by default */
            border-radius: 20px;
          }
          /* Show scrollbar only on hover */
          .custom-scrollbar:hover::-webkit-scrollbar-thumb {
            background: ${
              isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"
            };
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${
              isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"
            };
          }
        `}</style>
      </div>
    </>
  );
};

export const ModalToggle = ({ isDark }: any) => (
  <div
    className={cn(
      "w-5 h-5 rounded flex items-center justify-center font-bold text-xs select-none border transition-colors",
      isDark
        ? "bg-[#1A1A1A] border-gray-600 text-gray-300"
        : "bg-gray-100 border-gray-300 text-gray-600"
    )}
  >
    G
  </div>
);

export default ModelMenu;
