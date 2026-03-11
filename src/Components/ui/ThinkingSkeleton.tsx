import React from "react";
import { cn } from "../../lib/utils";
import { Sparkles } from "lucide-react";

interface ThinkingSkeletonProps {
  isDark: boolean;
  provider: string;
  is_custom_gpt: boolean;
}

const ThinkingSkeleton: React.FC<ThinkingSkeletonProps> = ({ isDark, provider, is_custom_gpt }) => {
  const provider_src = is_custom_gpt ? isDark ? "/dark-theme-custom-gpt.png" : "/light-theme-custom-gpt.png" : 
  isDark
    ? provider === "openai"
      ? "/dark-theme-openai.png"
      : provider === "gemini"
      ? "/gemini.png"
      : provider === "grok"
      ? "/dark-theme-grok.png"
      : provider === "claude"
      ? "/claude.png"
      : provider === "deepseek"
      ? "/deepseek.png"
      : provider === "perplexity"
      ? "/perplexity.png"
      : provider === "mistral"
      ? "/mistral.png"
      : ""
    : provider === "openai"
    ? "/light-theme-openai.png"
    : provider === "gemini"
    ? "/gemini.png"
    : provider === "grok"
    ? "/light-theme-grok.png"
    : provider === "claude"
    ? "/claude.png"
    : provider === "deepseek"
    ? "/deepseek.png"
    : provider === "perplexity"
    ? "/perplexity.png"
    : provider === "mistral"
    ? "/mistral.png"
    : "";

  return (
    <div className="flex w-full mt-4 space-x-3 max-w-3xl mx-auto px-4">
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0 border select-none",
          isDark
            ? "bg-[#2F3336] border-transparent"
            : "bg-white border-transparent shadow-sm"
        )}
      >
        {provider_src ? (
          <img
            src={provider_src}
            alt={`${provider} logo`}
            className="w-5 h-5"
          />
        ) : (
          <Sparkles size={16} className="text-white" />
        )}
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
