import React from "react";
import { cn } from "../../../utils/cn";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ElementType;
}

const AuthInput: React.FC<AuthInputProps> = ({
  label,
  icon: Icon,
  className,
  ...props
}) => {
  return (
    <div className="space-y-2 group">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-focus-within:text-indigo-500 transition-colors">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          {...props}
          className={cn(
            "w-full bg-gray-50 dark:bg-[#2A2B32] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10",
            "text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500",
            "transition-all duration-300 ease-out",
            className
          )}
        />
      </div>
    </div>
  );
};

export default AuthInput;
