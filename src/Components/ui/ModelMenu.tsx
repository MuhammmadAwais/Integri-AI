import React from "react";
import { cn } from "../../lib/utils";

interface ReasoningMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selected: string;
  onSelect: React.Dispatch<React.SetStateAction<string>>;
  isDark: any;
}
const ModelMenu : React.FC<ReasoningMenuProps> = ({ isOpen, onClose, selected, onSelect, isDark }) => {
  const models = [
    { id: "gpt-3.5-turbo", label: "GPT-3.5" },
    { id: "gpt-4o", label: "GPT-4o" },
    { id: "grok-2", label: "Grok 2 (Beta)" },
  ];

  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={cn(
          // Adjusted positioning: right-2 on mobile (to stay on screen), right-16 on desktop
          "absolute bottom-16 right-2 sm:right-16 w-[220px] rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-100 p-1.5",
          isDark
            ? "bg-[#181818] border-[#2A2B32] text-gray-200"
            : "bg-white border-gray-200 text-gray-900"
        )}
      >
        <div className="px-3 py-2 text-[10px] font-bold uppercase opacity-50 tracking-wider">
          System Models
        </div>
        {models.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              onSelect(m.id);
              onClose();
            }}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors text-sm font-medium hover:cursor-pointer",
              isDark ? "hover:bg-[#2A2B32]" : "hover:bg-gray-100",
              selected === m.id && (isDark ? "bg-[#2A2B32]" : "bg-gray-100")
            )}
          >
            <span className="hover:cursor-pointer">{m.label}</span>
          </button>
        ))}
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