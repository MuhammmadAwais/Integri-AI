import React from "react";

interface BaseInputProps {
  label: string;
  isDark: boolean;
  className?: string;
}

// --- SLIDER COMPONENT ---
interface SliderProps extends BaseInputProps {
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
}

export const GenSlider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  isDark,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex justify-between items-center">
        <label
          className={`text-sm font-semibold ${
            isDark ? "text-gray-200" : "text-gray-700"
          }`}
        >
          {label}
        </label>
        <span
          className={`text-xs font-mono py-1 px-2 rounded-md ${
            isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
          }`}
        >
          {value}
        </span>
      </div>
      <input
      title="range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-black dark:accent-white transition-all`}
      />
    </div>
  );
};

// --- SELECT DROPDOWN COMPONENT ---
interface SelectProps extends BaseInputProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

export const GenSelect: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  isDark,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        className={`text-sm font-semibold ${
          isDark ? "text-gray-200" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <select
        title="select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full p-3 text-sm rounded-xl border outline-none transition-all appearance-none
            ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white focus:border-gray-500"
                : "bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400"
            }`}
        >
          {options.map((opt) => (
            <option
              key={opt}
              value={opt}
              className={isDark ? "bg-gray-800" : "bg-white"}
            >
              {opt}
            </option>
          ))}
        </select>
        {/* Custom drop arrow icon */}
        <div
          className={`absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// --- NUMBER / TEXT INPUT COMPONENT ---
interface NumberInputProps extends BaseInputProps {
  value: number | string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: "text" | "number";
}

export const GenInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  isDark,
  type = "text",
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        className={`text-sm font-semibold ${
          isDark ? "text-gray-200" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full p-3 text-sm rounded-xl border outline-none transition-all
          ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white focus:border-gray-500 placeholder-gray-500"
              : "bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400 placeholder-gray-400"
          }`}
      />
    </div>
  );
};
