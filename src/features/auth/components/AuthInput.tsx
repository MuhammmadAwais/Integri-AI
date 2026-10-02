import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../../lib/utils";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ElementType;
}

const AuthInput: React.FC<AuthInputProps> = ({
  label,
  icon: Icon,
  className,
  type,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-2 group">
      <label className="text-sm font-medium text-gray-400 group-focus-within:text-white transition-colors ml-1">
        {label}
      </label>
      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#5EEAD4] transition-colors z-10 pointer-events-none">
            <Icon size={20} />
          </div>
        )}

        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          {...props}
          className={cn(
            "w-full bg-[#18161C] border border-[#2A2830] rounded-xl py-2 text-white placeholder-[#666666]",
            "focus:outline-none focus:ring-2 focus:ring-[#5EEAD4]/20 focus:border-[#5EEAD4]",
            "transition-all duration-200 ease-out",
            Icon ? "pl-12" : "pl-4",
            isPassword ? "pr-12" : "pr-4", // Make room for eye icon
            className
          )}
        />

        {/* Password Toggle Button */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer p-1"
          >
            {showPassword ? (
              <EyeOff className="hover:text-[#5EEAD4]" size={20} />
            ) : (
              <Eye size={20} className="hover:text-[#5EEAD4]" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthInput;
