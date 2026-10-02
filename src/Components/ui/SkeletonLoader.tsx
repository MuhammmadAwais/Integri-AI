import React from "react";
import { cn } from "../../lib/utils";

interface SkeletonProps {
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonProps> = ({ count = 1, className }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={cn("animate-pulse bg-gray-200 dark:bg-[#1F1D25] rounded-md", className)} />
      ))}
    </>

  );
};

export default SkeletonLoader;
