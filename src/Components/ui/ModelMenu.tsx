import React from "react";
import { cn } from "../../lib/utils";
import AVAILABLE_MODELS from "../../../Constants";

interface ModelMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selected: string;
  onSelect: (id: string) => void; // Fixed type to be more flexible
  isDark: boolean;
  position?: "top" | "bottom"; // Added position control
}

const ModelMenu: React.FC<ModelMenuProps> = ({
  isOpen,
  onClose,
  selected,
  onSelect,
  isDark,
  position = "bottom", // Default to bottom (for Chat Input)
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-transparent" onClick={onClose} />

      {/* Menu Container */}
      <div
        className={cn(
          "absolute w-[280px] z-[101] flex flex-col p-1.5",
          "animate-in zoom-in-95 duration-100 ease-out",
          "rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-xl",

          // Dynamic Positioning
          position === "bottom"
            ? "bottom-full mb-2 right-0 origin-bottom-right" // Opens Upwards
            : "top-full mt-2 right-0 origin-top-right", // Opens Downwards

          // Theme
          isDark
            ? "bg-[#1a1b26]/95 border-[#2A2B32] shadow-black/50"
            : "bg-white/95 border-gray-200 shadow-xl"
        )}
      >
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-inherit z-10">
            Select Model
          </div>

          {AVAILABLE_MODELS.map((m) => {
            const isSelected = m.id === selected;
            return (
              <button
                key={m.id}
                onClick={() => {
                  onSelect(m.id);
                  onClose();
                }}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group mb-0.5",
                  isSelected
                    ? isDark
                      ? "bg-white/10 text-white"
                      : "bg-black/5 text-black"
                    : isDark
                    ? "text-gray-300 hover:bg-white/5"
                    : "text-gray-700 hover:bg-black/5"
                )}
              >
                <div>
                  <div className="font-medium">{m.label || m.id}</div>
                  <div className="text-[10px] opacity-60 capitalize">
                    {m.provider}
                  </div>
                </div>

                {/* Badge or Checkmark */}
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-green-500/50 shadow-lg" />
                )}
                {!isSelected && m.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded border opacity-60 group-hover:opacity-100 transition-opacity",
                      isDark
                        ? "border-white/20 bg-white/5"
                        : "border-black/10 bg-black/5"
                    )}
                  >
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ModelMenu;
