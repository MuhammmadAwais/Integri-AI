import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";

interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "google" | "apple";
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
      "bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-lg shadow-red-900/20",
    google:
      "bg-[#27272A] hover:bg-[#3F3F46] text-white border border-[#3F3F46]",
    apple: "bg-[#27272A] hover:bg-[#3F3F46] text-white border border-[#3F3F46]",
  };

  return (
    <button
      disabled={isLoading}
      {...props}
      className={cn(
        "w-full relative flex items-center justify-center py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
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
