import { cn } from "../../lib/utils";
import { Bot, User } from "lucide-react";
import React from "react";

const MessageAvatar: React.FC<{ isUser: boolean; isDark: boolean }> = ({
  isUser,
  isDark,
}) => (
  <div className="shrink-0 mt-1">
    <div
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center shadow-sm border transition-transform hover:scale-105 select-none",
        isUser
          ? isDark
            ? "bg-[#2F3336] border-[#2F3336] text-white"
            : "bg-white border-gray-200 text-gray-700"
          : isDark
          ? "bg-white text-black border-transparent"
          : "bg-black text-white border-transparent"
      )}
    >
      {isUser ? <User size={18} /> : <Bot size={20} />}
    </div>
  </div>
);
export default MessageAvatar;