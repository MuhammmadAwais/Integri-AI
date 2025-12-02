import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Zap, Sparkles, Box } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { setModel } from "../../../store/chatSlice";
import { cn } from "../../../utils/cn";

const models = [
  {
    id: "GPT-4o Mini",
    label: "GPT-4o Mini",
    icon: Zap,
    description: "Small, fast model",
  },
  {
    id: "GPT-4o",
    label: "GPT-4o",
    icon: Sparkles,
    description: "Most capable model",
  },
  {
    id: "GPT-4 Turbo",
    label: "GPT-4 Turbo",
    icon: Box,
    description: "Previous high-intelligence",
  },
];

const ModelSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const currentModel = useAppSelector((state:any) => state.chat.currentModel);
  const isDark = useAppSelector((state) => state.theme.isDark);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div className="relative px-3 mb-4" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-200 group",
          isDark
            ? "text-gray-300 hover:bg-[#2A2B32] hover:text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )}
      >
        <span className="flex items-center gap-2 font-medium text-sm">
          <Zap className="w-4 h-4" />
          {currentModel}
        </span>
        <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100" />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-3 right-3 mt-1 rounded-xl border shadow-xl z-50 overflow-hidden",
            isDark
              ? "bg-[#2A2B32] border-gray-700 text-gray-100"
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
                "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                isDark ? "hover:bg-[#343541]" : "hover:bg-gray-50",
                currentModel === model.id &&
                  (isDark ? "bg-[#343541]" : "bg-gray-50")
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    isDark ? "bg-gray-700" : "bg-gray-100"
                  )}
                >
                  <model.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{model.label}</p>
                  <p className="text-xs opacity-60">{model.description}</p>
                </div>
              </div>
              {currentModel === model.id && (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
