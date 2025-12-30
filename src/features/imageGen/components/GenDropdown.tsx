import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
interface Option {
  id: string;
  label: string;
  desc?: string;
  badge?: string | undefined;
}
interface GenDropdownProps {
  label: string;
  value: Option;
  options: Option[];
  onChange: (option: Option) => void;
  isDark: boolean;
  icon?: React.ElementType | React.ComponentType<any>;
}

const GenDropdown: React.FC<GenDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  isDark,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
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
    <div className="relative w-full" ref={dropdownRef}>
      <label
        className={`text-xs font-bold uppercase tracking-wider mb-2 block ${
          isDark ? "text-zinc-500" : "text-zinc-400"
        }`}
      >
        {label}
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200
          ${
            isDark
              ? `bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700 ${
                  isOpen ? "ring-1 ring-zinc-600 border-zinc-600" : ""
                }`
              : `bg-white border-zinc-200 text-zinc-900 hover:border-zinc-400 ${
                  isOpen ? "ring-1 ring-zinc-900 border-zinc-900" : ""
                }`
          }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {Icon && (
            <div
              className={`p-1.5 rounded-md ${
                isDark
                  ? "bg-zinc-800 text-zinc-400"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              <Icon size={16} />
            </div>
          )}
          <div className="flex flex-col items-start truncate">
            <span className="text-sm font-medium truncate">{value.label}</span>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 w-full mt-2 rounded-xl shadow-xl border overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top
          ${
            isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
          }`}
        >
          <div className="max-h-[180px] overflow-y-auto custom-scrollbar p-1">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors group
                  ${
                    value.id === option.id
                      ? isDark
                        ? "bg-zinc-800 text-white"
                        : "bg-zinc-100 text-black"
                      : isDark
                      ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }
                `}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{option.label}</span>
                    {option.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-medium
                        ${
                          isDark
                            ? "bg-zinc-950 border-zinc-700 text-zinc-400"
                            : "bg-zinc-100 border-zinc-200 text-zinc-600"
                        }
                      `}
                      >
                        {option.badge}
                      </span>
                    )}
                  </div>
                  {option.desc && (
                    <p
                      className={`text-xs mt-0.5 truncate ${
                        isDark
                          ? "text-zinc-500 group-hover:text-zinc-400"
                          : "text-zinc-400 group-hover:text-zinc-500"
                      }`}
                    >
                      {option.desc}
                    </p>
                  )}
                </div>
                {value.id === option.id && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenDropdown;
