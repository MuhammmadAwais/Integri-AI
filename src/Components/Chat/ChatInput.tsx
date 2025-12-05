import React, { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  ArrowUp,
  X,
  FileText,
  Globe,
  Image as ImageIcon,
} from "lucide-react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../../utils/cn";

interface ChatInputProps {
  onSend?: (text: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  const handleSend = () => {
    if ((input.trim() || file) && onSend) {
      const msg = file ? `[Uploaded File: ${file.name}] ${input}` : input;
      onSend(msg);
      setInput("");
      setFile(null);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-2">
      {/* File Badge */}
      {file && (
        <div className="mb-2 inline-flex items-center gap-2 p-2 rounded-lg bg-[#181818] border border-gray-800 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-8 h-8 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <FileText size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-200">
              {file.name}
            </span>
          </div>
          <button
            title="Remove file"
            onClick={() => setFile(null)}
            className="ml-2 text-gray-500 hover:text-gray-300"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input Box */}
      <div
        className={cn(
          "relative flex flex-col w-full p-3 rounded-3xl border transition-all duration-200 shadow-sm",
          isDark
            ? "bg-[#181818] border-[#2f2f2f] focus-within:border-gray-600"
            : "bg-[#f4f4f4] border-[#f4f4f4] focus-within:border-gray-300"
        )}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Integri AI..."
          rows={1}
          className={cn(
            "w-full max-h-[200px] py-2 px-2 bg-transparent outline-none resize-none text-[15px] leading-relaxed scrollbar-none",
            isDark
              ? "text-white placeholder-gray-500"
              : "text-gray-900 placeholder-gray-500"
          )}
          style={{ minHeight: "24px" }}
        />

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <input
            title="file"
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && setFile(e.target.files[0])
              }
            />

            <button
            title="Attach file"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "p-2 rounded-full transition-colors",
                isDark
                  ? "text-gray-400 hover:text-white hover:bg-white/5"
                  : "text-gray-500 hover:bg-black/5"
              )}
            >
              <Paperclip size={18} />
            </button>
            <button
            title="Upload Image"
              className={cn(
                "p-2 rounded-full transition-colors",
                isDark
                  ? "text-gray-400 hover:text-white hover:bg-white/5"
                  : "text-gray-500 hover:bg-black/5"
              )}
            >
              <ImageIcon size={18} />
            </button>
            <button
            title="Select Language"
              className={cn(
                "p-2 rounded-full transition-colors",
                isDark
                  ? "text-gray-400 hover:text-white hover:bg-white/5"
                  : "text-gray-500 hover:bg-black/5"
              )}
            >
              <Globe size={18} />
            </button>
          </div>

          <button
            title="Send Message"
            onClick={handleSend}
            disabled={!input.trim() && !file}
            className={cn(
              "p-2 rounded-full transition-all duration-200 flex items-center justify-center",
              input.trim() || file
                ? isDark
                  ? "bg-white text-black"
                  : "bg-black text-white"
                : isDark
                ? "bg-[#333] text-gray-500 cursor-not-allowed"
                : "bg-[#e5e5e5] text-gray-400 cursor-not-allowed"
            )}
          >
            <ArrowUp size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
