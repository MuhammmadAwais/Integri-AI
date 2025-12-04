import React from "react";
import { cn } from "../../utils/cn";

interface SkeletonProps {
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 dark:bg-[#2A2B32] rounded-md",
        className
      )}
    />
  );
};

export default SkeletonLoader;
