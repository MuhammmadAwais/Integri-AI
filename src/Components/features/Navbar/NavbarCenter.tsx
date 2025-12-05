import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Check,
  Sparkles,
  Zap,
  Box,
  Bot,
  
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { setModel } from "../../../store/chatSlice";
import { useGetModelsQuery } from "../../../store/apis/chatAPI";
import { cn } from "../../../utils/cn";

const IconMap: Record<string, React.ElementType> = {
  Sparkles: Sparkles,
  Zap: Zap,
  Box: Box,
  Bot: Bot,
};

const NavbarCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const currentModelId = useAppSelector((state) => state.chat.currentModel);
  const isDark = useAppSelector((state) => state.theme.isDark);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch models using RTK Query
  const { data: models = [], isLoading } = useGetModelsQuery();

  const activeModel = models.find((m) => m.id === currentModelId) || models[0];
  const ActiveIcon =
    activeModel && IconMap[activeModel.icon]
      ? IconMap[activeModel.icon]
      : Sparkles;

  // Click Outside Handler
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

  if (isLoading) return null;

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 group cursor-pointer select-none border",
          isDark
            ? "bg-[#212121] border-[#2A2B32] hover:bg-[#2A2B32] text-gray-200"
            : "bg-white border-gray-200 hover:border-gray-300 text-gray-700 shadow-sm"
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center",
            activeModel?.color
              ? activeModel.color.split(" ")[0]
              : "text-indigo-500"
          )}
        >
          <ActiveIcon size={16} className="opacity-90" />
        </span>
        <span className="font-semibold text-sm">
          {activeModel?.label || "Select Model"}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-gray-500 transition-transform duration-200",
            isOpen ? "rotate-180" : "group-hover:translate-y-0.5"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top",
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
            Available Models
          </div>

          <div className="p-1 max-h-[300px] overflow-y-auto custom-scrollbar">
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
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        model.color
                      )}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{model.label}</div>
                      <div className="text-[10px] opacity-50">
                        {model.provider}
                      </div>
                    </div>
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

export default NavbarCenter;
