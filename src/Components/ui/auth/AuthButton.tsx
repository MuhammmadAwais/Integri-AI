import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../../utils/cn";

interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  isLoading,
  className,
  ...props
}) => {
  return (
    <button
      disabled={isLoading}
      {...props}
      className={cn(
        "w-full relative flex items-center justify-center py-3.5 px-4 rounded-xl font-bold text-white overflow-hidden group",
        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500",
        "transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5",
        "disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none",
        className
      )}
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

      {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? "Processing..." : children}
      </span>
    </button>
  );
};

export default AuthButton;
