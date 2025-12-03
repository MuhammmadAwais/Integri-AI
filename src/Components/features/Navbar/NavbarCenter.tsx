import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Sparkles, Zap, Box, Check } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { setModel } from "../../../store/chatSlice";
import { cn } from "../../../utils/cn";

// Reuse the model definitions for consistency
const models = [
  { id: "GPT-4o Mini", label: "GPT-4o Mini", icon: Zap },
  { id: "GPT-4o", label: "GPT-4o", icon: Sparkles },
  { id: "GPT-4 Turbo", label: "GPT-4 Turbo", icon: Box },
];

const NavbarCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const currentModelId = useAppSelector((state) => state.chat.currentModel);
  const isDark = useAppSelector((state) => state.theme.isDark);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 group cursor-pointer select-none",
          isDark
            ? "hover:bg-[#2A2B32] text-gray-200"
            : "hover:bg-gray-100 text-gray-800"
        )}
      >
        <span
          className={cn(
            "text-indigo-500",
            isDark ? "text-indigo-400" : "text-indigo-600"
          )}
        >
          <Sparkles size={16} fill="currentColor" className="opacity-80" />
        </span>
        <span className="font-semibold text-sm">{currentModelId}</span>
        <ChevronDown
          size={14}
          className={cn(
            "text-gray-500 transition-transform duration-200",
            isOpen ? "rotate-180" : "group-hover:translate-y-0.5"
          )}
        />
      </button>

      {/* Floating Dropdown */}
      <div
        className={cn(
          "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border shadow-xl overflow-hidden transition-all duration-200 origin-top",
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none",
          isDark
            ? "bg-[#1f1f1f] border-[#2A2B32] text-gray-100"
            : "bg-white border-gray-200 text-gray-900"
        )}
      >
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => {
              dispatch(setModel(model.id));
              setIsOpen(false);
            }}
            className={cn(
              "flex items-center justify-between w-full px-4 py-3 text-left text-sm transition-colors hover:opacity-100",
              isDark ? "hover:bg-[#2A2B32]" : "hover:bg-gray-50",
              currentModelId === model.id &&
                (isDark ? "bg-[#2A2B32]" : "bg-gray-50")
            )}
          >
            <span className="flex items-center gap-2">
              <model.icon size={16} />
              {model.label}
            </span>
            {currentModelId === model.id && (
              <Check size={14} className="text-indigo-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavbarCenter;
