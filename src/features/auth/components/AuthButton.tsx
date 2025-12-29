import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";

interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "google" | "outline" | "createAccount";
}

const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  isLoading,
  className,
  variant = "primary",
  ...props
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/20 border-transparent",
    google:
      "bg-[#27272A] h-14 hover:bg-[#323236] text-white border border-[#3F3F46] hover:border-gray-500 w-50",
    outline:
      "bg-transparent hover:bg-[#27272A] text-gray-300 border border-[#3F3F46]",
    createAccount:
      "bg-gradient-to-r h-14 from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/20 border-transparen w-50",
  };

  return (
    <button
      disabled={isLoading}
      {...props}
      className={cn(
        "w-full relative flex items-center justify-center py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-200 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
      <span className="flex items-center gap-2">{children}</span>
    </button>
  );
};

export default AuthButton;
