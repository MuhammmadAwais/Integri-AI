import React from "react";
import { cn } from "../../../lib/utils";

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
      <label className="text-sm font-medium text-gray-400 group-focus-within:text-white transition-colors">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors">
            <Icon size={20} />
          </div>
        )}
        <input
          {...props}
          className={cn(
            "w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-4 py-4",
            Icon ? "pl-12" : "pl-4",
            "text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-[#303035]",
            "transition-all duration-200 ease-out",
            className
          )}
        />
      </div>
    </div>
  );
};

export default AuthInput;
