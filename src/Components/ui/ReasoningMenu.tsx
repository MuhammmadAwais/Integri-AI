import { Zap, Sparkles  } from "lucide-react";
import React from "react";
import { cn } from "../../lib/utils";

interface ReasoningMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selected: string;
  onSelect: React.Dispatch<React.SetStateAction<string>>;
  isDark: any;
}
const ReasoningMenu : React.FC<ReasoningMenuProps> = ({
  isOpen,
  onClose,
  selected,
  onSelect,
  isDark,
}) => {
  if (!isOpen) return null;
  const options = [
    {
      id: "Auto",
      label: "Auto",
      desc: "Chooses Fast or Expert",
      icon: RocketIcon,
    },
    { id: "Fast", label: "Fast", desc: "Quick responses", icon: Zap },
    { id: "Expert", label: "Expert", desc: "Thinks hard", icon: Sparkles },
  ];
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={cn(
          "absolute bottom-16 right-0 w-[90vw] sm:w-[260px] rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-100 p-2 ",
          isDark
            ? "bg-[#181818] border-[#2A2B32] text-gray-200"
            : "bg-white border-gray-200 text-gray-900"
        )}
      >
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => {
              onSelect(opt.id);
              onClose();
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:cursor-pointer",
              isDark ? "hover:bg-[#2A2B32]" : "hover:bg-gray-100",
              selected === opt.id && (isDark ? "bg-[#2A2B32]" : "bg-gray-100")
            )}
          >
            <opt.icon
              size={18}
              className={isDark ? "text-gray-400" : "text-gray-600"}
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold">{opt.label}</span>
              <span className="text-xs opacity-50">{opt.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
};


// ICONS
export const RocketIcon = ({ className, size = 16 }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
  </svg>
);

export default ReasoningMenu;