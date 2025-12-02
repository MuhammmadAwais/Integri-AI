import React, { useState } from "react";
import { Globe, Image as ImageIcon, Send } from "lucide-react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../../utils/cn";

const ChatInput: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const [input, setInput] = useState("");

  return (
    <div className="w-full max-w-3xl mx-auto p-4 relative z-10">
      <div className="relative group">
        {/* Gradient Border Effect (Bottom) */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-blue-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur-[2px]"></div>

        <div
          className={cn(
            "relative flex items-center gap-2 p-2 rounded-2xl border transition-all duration-300",
            isDark
              ? "bg-[#2F3139] border-gray-700 focus-within:border-gray-600"
              : "bg-white border-gray-200 shadow-sm focus-within:border-gray-300"
          )}
        >
          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Integri AI..."
            className={cn(
              "flex-1 bg-transparent border-none outline-none px-3 py-3 text-sm font-medium h-[52px]",
              isDark
                ? "text-gray-100 placeholder-gray-400"
                : "text-gray-800 placeholder-gray-400"
            )}
          />

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 pr-2">
            {/* Web Search Icon */}
            <button
            title="button"
              className={cn(
                "p-2 rounded-lg transition-colors group/btn",
                isDark
                  ? "hover:bg-gray-700 text-teal-400"
                  : "hover:bg-gray-100 text-teal-600"
              )}
            >
              <div className="relative">
                <Globe className="w-5 h-5" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-[#2F3139]"></div>
              </div>
            </button>

            {/* Image Upload Icon */}
            <button
            title="button"
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDark
                  ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                  : "hover:bg-gray-100 text-gray-500"
              )}
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Send Button */}
            <button
            title="button"
              disabled={!input.trim()}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                input.trim()
                  ? "bg-teal-500 text-white shadow-md hover:bg-teal-600"
                  : isDark
                  ? "bg-gray-700 text-gray-500"
                  : "bg-gray-200 text-gray-400"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-[10px] mt-3 text-gray-400 opacity-70">
          Integri AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
