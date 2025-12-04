import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Zap, Sparkles, Box } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { setModel } from "../../../store/chatSlice";
import { cn } from "../../../utils/cn";

const models = [
  {
    id: "GPT-4o",
    label: "GPT-4o",
    icon: Sparkles,
    color: "text-purple-400 bg-purple-500/10",
  },
  {
    id: "GPT-4o Mini",
    label: "GPT-4o Mini",
    icon: Zap,
    color: "text-yellow-400 bg-yellow-500/10",
  },
  {
    id: "Claude 3.5",
    label: "Claude 3.5",
    icon: Box,
    color: "text-orange-400 bg-orange-500/10",
  },
];

const NavbarCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const currentModelId = useAppSelector((state) => state.chat.currentModel);
  const isDark = useAppSelector((state) => state.theme.isDark);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeModel = models.find((m) => m.id === currentModelId) || models[0];

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
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-[200px]"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 group cursor-pointer select-none border border-transparent hover:border-gray-200 dark:hover:border-gray-700",
          isDark
            ? "hover:bg-[#2A2B32] text-gray-200"
            : "hover:bg-gray-100 text-gray-800"
        )}
      >
        <span className={cn("shrink-0", activeModel.color.split(" ")[0])}>
          <activeModel.icon
            size={16}
            fill="currentColor"
            className="opacity-80"
          />
        </span>

        {/* Fix: Truncate text so it doesn't overflow */}
        <span className="font-semibold text-sm truncate max-w-[100px] sm:max-w-[140px]">
          {activeModel.label}
        </span>

        <ChevronDown
          size={14}
          className={cn(
            "text-gray-500 transition-transform duration-200 shrink-0",
            isOpen ? "rotate-180" : "group-hover:translate-y-0.5"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100",
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
                "flex items-center justify-between w-full px-4 py-3 text-left text-sm transition-colors cursor-pointer",
                isDark ? "hover:bg-[#2A2B32]" : "hover:bg-gray-50",
                currentModelId === model.id &&
                  (isDark ? "bg-[#2A2B32]" : "bg-gray-50")
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <model.icon
                  size={16}
                  className={cn("shrink-0", model.color.split(" ")[0])}
                />
                <span className="truncate">{model.label}</span>
              </div>
              {currentModelId === model.id && (
                <Check size={14} className="text-indigo-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavbarCenter;
