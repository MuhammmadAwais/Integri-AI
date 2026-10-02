import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";

interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "google" | "apple" | "outline" | "createAccount";
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
      // The app's primary button: light pill, dark text (IntegriColors.buttonWhite)
      "bg-[#F2F4F7] hover:bg-white text-[#07060A] shadow-lg shadow-black/20 border-transparent",
    google:
      "bg-[#1F1D25] h-14 hover:bg-[#323236] text-white border border-[#3A3845] hover:border-gray-500 w-50",
    apple:
      "bg-[#1F1D25] h-14 hover:bg-[#323236] text-white border border-[#3A3845] hover:border-gray-500 w-50",
    outline:
      "bg-transparent hover:bg-[#1F1D25] text-gray-300 border border-[#3A3845]",
    createAccount:
      "bg-[#F2F4F7] h-14 hover:bg-white text-[#07060A] shadow-lg shadow-black/20 border-transparent w-50",
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
