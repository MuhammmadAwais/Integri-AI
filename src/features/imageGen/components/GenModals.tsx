import React from "react";
import { X, Check } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}

export const SettingsModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-2xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200
        ${isDark ? "bg-gray-900 border border-gray-800" : "bg-white"}`}
      >
        <div
          className={`flex items-center justify-between p-4 border-b ${
            isDark ? "border-gray-800" : "border-gray-100"
          }`}
        >
          <h3
            className={`font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
          <button
          title="button"
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition`}
          >
            <X
              size={18}
              className={isDark ? "text-gray-400" : "text-gray-500"}
            />
          </button>
        </div>
        <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

interface OptionItemProps {
  label: string;
  subLabel?: string;
  isSelected: boolean;
  onClick: () => void;
  isDark: boolean;
}

export const OptionItem: React.FC<OptionItemProps> = ({
  label,
  subLabel,
  isSelected,
  onClick,
  isDark,
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-3 rounded-xl flex items-center justify-between group transition-all
      ${
        isSelected
          ? isDark
            ? "bg-gray-800 text-white"
            : "bg-gray-100 text-black"
          : isDark
          ? "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
  >
    <div>
      <div className="font-medium text-sm">{label}</div>
      {subLabel && (
        <div
          className={`text-xs mt-0.5 ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {subLabel}
        </div>
      )}
    </div>
    {isSelected && <Check size={16} />}
  </button>
);
