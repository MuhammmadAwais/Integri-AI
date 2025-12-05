import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Check,
  Zap,
  Sparkles,
  Box,
  Bot,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { setModel } from "../../../store/chatSlice";
import { useGetModelsQuery } from "../../../store/apis/chatAPI";
import { cn } from "../../../utils/cn";

// Map icon strings from DB to actual Lucide components
const IconMap: Record<string, React.ElementType> = {
  Sparkles: Sparkles,
  Zap: Zap,
  Box: Box,
  Bot: Bot,
};

const ModelSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const currentModelId = useAppSelector((state) => state.chat.currentModel);
  const isDark = useAppSelector((state) => state.theme.isDark);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch models from DB
  const { data: models = [], isLoading, isError } = useGetModelsQuery();

  const activeModel = models.find((m) => m.id === currentModelId) || models[0];
  const ActiveIcon =
    activeModel && IconMap[activeModel.icon]
      ? IconMap[activeModel.icon]
      : Sparkles;

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

  if (isLoading) {
    return (
      <div
        className={cn(
          "w-full h-10 rounded-xl animate-pulse mb-4",
          isDark ? "bg-[#2A2B32]" : "bg-gray-200"
        )}
      />
    );
  }

  if (isError || models.length === 0) {
    return null; // Hide if API fails
  }

  return (
    <div className="relative w-full z-30 mb-4" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-200 group outline-none",
          isDark
            ? "bg-[#212121] border-[#2A2B32] hover:bg-[#2A2B32] text-gray-200"
            : "bg-white border-gray-200 hover:border-gray-300 text-gray-700 shadow-sm"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={cn("p-1 rounded-md shrink-0", activeModel?.color)}>
            <ActiveIcon size={16} />
          </div>
          <span className="font-semibold text-sm truncate">
            {activeModel?.label}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "opacity-50 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top",
            isDark
              ? "bg-[#1a1a1a] border-[#2A2B32] text-gray-100"
              : "bg-white border-gray-100 text-gray-900"
          )}
        >
          <div
            className={cn(
              "px-3 py-2 text-[10px] font-bold uppercase tracking-wider opacity-50",
              isDark ? "bg-white/5" : "bg-black/5"
            )}
          >
            Select Model
          </div>

          <div className="p-1">
            {models.map((model) => {
              const Icon = IconMap[model.icon] || Bot;
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    dispatch(setModel(model.id));
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer mb-0.5",
                    isDark ? "hover:bg-[#2A2B32]" : "hover:bg-gray-100",
                    currentModelId === model.id &&
                      (isDark ? "bg-[#2A2B32]" : "bg-gray-50")
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-6 h-6 rounded flex items-center justify-center",
                        model.color
                      )}
                    >
                      <Icon size={14} />
                    </div>
                    <span className="text-sm font-medium">{model.label}</span>
                  </div>
                  {currentModelId === model.id && (
                    <Check size={14} className="text-indigo-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
