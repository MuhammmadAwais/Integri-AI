import React from "react";
import { cn } from "../../lib/utils";
import AVAILABLE_MODELS from "../../../Constants";
import { Bot, Check } from "lucide-react";

interface ModelMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selected: string;
  onSelect: (id: string) => void;
  isDark: boolean;
  position?: "top" | "bottom";
  align?: "left" | "right";
}

export const ModalToggle = ({ isDark }: { isDark: boolean }) => {
  return (
    <Bot
      size={20}
      strokeWidth={1.5}
      className={isDark ? "text-gray-300" : "text-gray-600"}
    />
  );
};

const ModelMenu: React.FC<ModelMenuProps> = ({
  isOpen,
  onClose,
  selected,
  onSelect,
  isDark,
  position = "bottom",
  align = "right",
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* FIX: Backdrop to handle "Click Outside". 
        Uses z-[100] to ensure it sits above the Playground header (z-20).
      */}
      <div
        className="fixed inset-0 z-100 bg-transparent cursor-default"
        onClick={onClose}
      />

      {/* Menu Container */}
      <div
        className={cn(
          "absolute w-[280px] z-101 flex flex-col p-1.5",
          "animate-in zoom-in-95 duration-100 ease-out",
          "rounded-2xl border shadow-2xl overflow-hidden",

          // Dynamic Positioning
          position === "bottom"
            ? cn(
                "bottom-full mb-2",
                align === "left"
                  ? "left-0 origin-bottom-left"
                  : "right-0 origin-bottom-right"
              )
            : cn(
                "top-full mt-2",
                align === "left"
                  ? "left-0 origin-top-left"
                  : "right-0 origin-top-right"
              ),

          // Theme Colors
          isDark
            ? "bg-[#18181b] border-[#27272a] shadow-black/50"
            : "bg-white border-gray-200 shadow-xl"
        )}
      >
        <div className="max-h-80 overflow-y-auto custom-scrollbar relative">
          <div
            className={cn(
              "px-2 py-2 text-[11px] font-bold uppercase tracking-wider sticky top-0 z-10 mb-1 backdrop-blur-md",
              isDark
                ? "bg-[#18181b]/95 text-gray-500 border-b border-[#27272a]"
                : "bg-white/95 text-gray-400 border-b border-gray-100"
            )}
          >
            Available Models
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
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group mb-0.5 relative",
                  isSelected
                    ? isDark
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "bg-indigo-50 text-indigo-600"
                    : isDark
                    ? "text-gray-300 hover:bg-[#27272a]"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <div>
                  <div className="font-medium">{m.label || m.id}</div>
                  <div className="text-[10px] opacity-60 capitalize flex items-center gap-1.5">
                    {m.provider}
                    {m.badge && (
                      <span
                        className={cn(
                          "px-1 rounded-[3px] text-[9px] font-medium leading-none py-0.5",
                          isDark
                            ? "bg-gray-800 text-gray-400"
                            : "bg-gray-200 text-gray-600"
                        )}
                      >
                        {m.badge}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <Check size={14} className="shrink-0 stroke-3" />
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
