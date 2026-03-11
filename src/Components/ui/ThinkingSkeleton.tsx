import React from "react";
import { cn } from "../../lib/utils";
import { Sparkles } from "lucide-react";

interface ThinkingSkeletonProps {
  isDark: boolean;
}

const ThinkingSkeleton: React.FC<ThinkingSkeletonProps> = ({ isDark }) => {
  return (
    <div className="flex w-full mt-4 space-x-3 max-w-3xl mx-auto px-4">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          "bg-linear-to-b from-indigo-500 to-purple-500"
        )}
      >
        <Sparkles size={16} className="text-white" />
      </div>
      <div 
        className={cn(
          "flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm w-fit",
          isDark ? "bg-[#2A2B32]/70" : "bg-white shadow-sm border border-gray-100"
        )}
      >
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default ThinkingSkeleton;
