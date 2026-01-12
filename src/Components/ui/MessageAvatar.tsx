import { cn } from "../../lib/utils";
import { User } from "lucide-react";
import React from "react";

const MessageAvatar: React.FC<{
  isUser: boolean;
  isDark: boolean;
  provider: string;
  is_custom_gpt: boolean;
}> = ({ isUser, isDark, provider, is_custom_gpt }) => {
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
    <div className="shrink-0 mt-1">
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shadow-sm border transition-transform hover:scale-105 select-none",
          isUser
            ? isDark
              ? "bg-[#2F3336] border-[#2F3336] text-white"
              : "bg-white border-gray-200 text-gray-700"
            : isDark
            ? "bg-[#2F3336]  border-transparent"
            : "bg-white border-transparent"
        )}
      >
        {isUser ? (
          <User size={18} />
        ) : (
          <img
            src={provider_src}
            alt={`${provider} logo`}
            className="w-5 h-5"
          />
        )}
      </div>
    </div>
  );
};
export default MessageAvatar;