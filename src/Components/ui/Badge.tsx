import React from "react";
import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "info" | "glass" | "theme-pill";
  className?: string;
  icon?: string;
}

const Badge = ({
  icon,
  children,
  variant = "default",
  className,
}: BadgeProps) => {
  const variants = {
    default: "bg-white text-black",
    success: "bg-green-100 text-green-700",
    info: "bg-blue-50 text-blue-700",
    glass: "bg-black/50 text-white backdrop-blur-sm",
    "theme-pill": "rounded-full px-3 py-1.5 transition-colors duration-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border border-transparent shadow-sm whitespace-nowrap h-fit font-medium normal-case",
        variants[variant as keyof typeof variants] || variants.default,
        variant === "default" && "border-gray-200 text-gray-600",
        className
      )}
    >
      {icon && (
        <div className="shrink-0">
          <img src={icon} alt="icon" className="w-auto h-auto object-contain" />
        </div>
      )}
      {children}
    </span>
  );
};
export default Badge;
