import React from "react";
import { cn } from "../../utils/cn";

interface SkeletonProps {
  className?: string;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonProps> = ({ className, count = 1 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-gray-200 dark:bg-[#2A2B32] rounded-md",
            className
          )}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
