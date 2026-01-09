import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Lock } from "lucide-react";
import { cn } from "../../../lib/utils"; // Adjust path to your utils
import { useAppSelector } from "../../../hooks/useRedux";

// Interface for the Model object
export interface Model {
  id: string;
  name: string;
  isPremium: boolean;
  provider?: string;
  light_theme_logo: string;
  dark_theme_logo: string;
}

interface ModelSelectorProps {
  models: Model[];
  selectedModelId: string;
  onChange: (modelId: string) => void;
  userIsPremium: boolean | null | undefined;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModelId,
  onChange,
  userIsPremium,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Access global theme state for conditional styling
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  // Find the currently selected model object for display
  const selectedModel = models.find((m) => m.id === selectedModelId);

  // Close dropdown when clicking outside
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

  const handleSelect = (model: Model) => {
    // Logic: If user is NOT premium AND model IS premium, prevent selection
    const isLocked = !userIsPremium && model.isPremium;

    if (isLocked) return;

    onChange(model.id);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* --- TRIGGER BUTTON --- */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border px-4 transition-all duration-200",
          // Conditional Styling based on isDark prop
          isDark
            ? "bg-black border-zinc-800 hover:border-zinc-700"
            : "bg-white border-zinc-200 hover:border-zinc-400",
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:shadow-sm",
          // Focus Ring
          isOpen &&
            (isDark
              ? "ring-2 ring-zinc-100 border-transparent"
              : "ring-2 ring-zinc-900 border-transparent")
        )}
      >
        <div className="flex items-center gap-2">
          {selectedModel ? (
            <>
              {/* Dynamic Logo based on Theme */}
              <img
                src={
                  isDark
                    ? selectedModel.dark_theme_logo
                    : selectedModel.light_theme_logo
                }
                alt={selectedModel.name}
                className="h-5 w-5 object-contain"
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  isDark ? "text-zinc-100" : "text-zinc-900"
                )}
              >
                {selectedModel.name}
              </span>
              {selectedModel.isPremium && (
                <img
                  src="/crown_icon.png"
                  alt="Premium"
                  className="h-4 w-4 object-contain ml-1"
                />
              )}
            </>
          ) : (
            <span
              className={cn(
                "text-sm",
                isDark ? "text-zinc-500" : "text-zinc-500"
              )}
            >
              Select a model...
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "transition-transform duration-200",
            isDark ? "text-zinc-500" : "text-zinc-500",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {/* --- DROPDOWN MENU --- */}
      {isOpen && (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border shadow-xl animate-in fade-in zoom-in-95 duration-100",
            // Menu Container Styles
            isDark
              ? "border-zinc-800 bg-[#09090b] text-white"
              : "border-zinc-200 bg-white"
          )}
        >
          <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
            {models.map((model) => {
              const isLocked = !userIsPremium && model.isPremium;
              const isSelected = selectedModelId === model.id;

              return (
                <li
                  key={model.id}
                  onClick={() => handleSelect(model)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 transition-colors",
                    // Selected State Background
                    isSelected && (isDark ? "bg-zinc-800/80" : "bg-zinc-100"),

                    // Locked/Disabled vs Normal Hover Logic
                    isLocked
                      ? isDark
                        ? "cursor-not-allowed opacity-50 bg-zinc-900/30"
                        : "cursor-not-allowed opacity-50 bg-zinc-50"
                      : isDark
                      ? "cursor-pointer hover:bg-zinc-800"
                      : "cursor-pointer hover:bg-zinc-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        isDark ? model.dark_theme_logo : model.light_theme_logo
                      }
                      alt={model.name}
                      className={cn(
                        "h-5 w-5 object-contain",
                        isLocked && "grayscale opacity-70"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm",
                        isSelected
                          ? isDark
                            ? "font-semibold text-white"
                            : "font-semibold text-zinc-900"
                          : isDark
                          ? "font-medium text-zinc-300"
                          : "font-medium text-zinc-600"
                      )}
                    >
                      {model.name}
                    </span>

                    {/* Icon Support: Crown for Premium */}
                    {model.isPremium && (
                      <div className="flex items-center gap-1.5 ml-1">
                        <img
                          src="/crown_icon.png"
                          alt="Premium"
                          className="h-4 w-4 object-contain"
                        />
                        {/* Lock icon for non-premium users */}
                        {isLocked && (
                          <Lock
                            size={12}
                            className={
                              isDark ? "text-zinc-500" : "text-zinc-400"
                            }
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Checkmark for selected item */}
                  {isSelected && (
                    <Check
                      size={16}
                      className={isDark ? "text-white" : "text-zinc-900"}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
