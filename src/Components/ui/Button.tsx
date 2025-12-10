import React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "glass" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
  isActive?: boolean; 
}

const Button: React.FC<ButtonProps> = ({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isActive = false,
  children,
  ...props
}) => {
  const variants = {
    primary:
      "bg-[#00A9A4] text-white hover:bg-[#008c87] border-transparent shadow-sm",
    secondary:
      "bg-gray-900 text-white hover:bg-gray-800 border-transparent shadow-sm",
    outline:
      "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 border shadow-sm",
    glass: "bg-transparent text-gray-600 hover:bg-gray-100 border-transparent",
    ghost:
      "bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-inherit border-transparent",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2 aspect-square", 
  };

  return (
    <button
      className={cn(
        // 1. Base styles
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none active:scale-95 border cursor-pointer select-none",
        // 2. Variant styles
        variants[variant],
        // 3. Size styles
        sizes[size],
        // 4. Conditionals
        fullWidth ? "w-full" : "",
        isActive ? "border-2 border-gray-300 dark:border-gray-500" : "", // Active state border
        // 5. Custom className
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;
