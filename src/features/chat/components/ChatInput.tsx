import React, { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  ArrowUp,
  X,
  FileText,
  Globe,
  Image as ImageIcon,
  Mic,
} from "lucide-react";
import { useAppSelector } from "../../../hooks/useRedux";
import { cn } from "../../../lib/utils";
interface ChatInputProps {
  onSend?: (text: string) => void;
}
const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const isDark = useAppSelector((state:any) => state.theme.isDark);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
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
    <div className="w-full max-w-3xl mx-auto px-2 pb-4">
      {file && (
        <div className="mb-2 inline-flex items-center gap-3 p-3 rounded-2xl bg-[#181818] border border-[#2f2f2f] animate-in fade-in slide-in-from-bottom-2">
          <div className="w-10 h-10 rounded-xl bg-[#2f2f2f] text-gray-300 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-200">
              {file.name}
            </span>
            <span className="text-xs text-gray-500">Ready to upload</span>
          </div>
          <button
            title="Remove File"
            onClick={() => setFile(null)}
            className="ml-2 p-1 hover:bg-[#333] rounded-full text-gray-500 hover:text-gray-300"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {/* Grok Style Input Container */}
      <div
        className={cn(
          "relative flex flex-col w-full p-2 rounded-[26px] border transition-all duration-200 shadow-sm group",
          isDark
            ? "bg-[#181818] border-[#2f2f2f] focus-within:border-gray-600 focus-within:shadow-lg focus-within:shadow-blue-900/5"
            : "bg-[#f4f4f4] border-[#e5e5e5] focus-within:border-gray-300"
        )}
      >
        <textarea
          title="Chat Input"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          rows={1}
          className={cn(
            "w-full max-h-40 py-3 px-4 bg-transparent outline-none resize-none text-[16px] leading-relaxed scrollbar-none",
            isDark
              ? "text-white placeholder-gray-500"
              : "text-gray-900 placeholder-gray-500"
          )}
          style={{ minHeight: "52px" }}
        />

        <div className="flex items-center justify-between pl-2 pr-2 pb-1">
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
              title="Attach File"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "p-2 rounded-full transition-colors hover:cursor-pointer",
                isDark
                  ? "text-gray-400 hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10"
                  : "text-gray-500 hover:bg-black/5"
              )}
            >
              <Paperclip size={20} strokeWidth={1.5} />
            </button>
            <button
              title="Insert Image"
              className={cn(
                "p-2 rounded-full transition-colors hover:cursor-pointer",
                isDark
                  ? "text-gray-400 hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10"
                  : "text-gray-500 hover:bg-black/5"
              )}
            >
              <ImageIcon size={20} strokeWidth={1.5} />
            </button>
            <button
              title="Translate"
              className={cn(
                "p-2 rounded-full transition-colors hidden sm:block hover:cursor-pointer",
                isDark
                  ? "text-gray-400 hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10"
                  : "text-gray-500 hover:bg-black/5"
              )}
            >
              <Globe size={20} strokeWidth={1.5} />
            </button>
            <button
              title="Voice Input"
              className={cn(
                "p-2 rounded-full transition-colors hidden sm:block hover:cursor-pointer",
                isDark
                  ? "text-gray-400 hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10"
                  : "text-gray-500 hover:bg-black/5"
              )}
            >
              <Mic size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-xs hidden sm:block",
                isDark ? "text-gray-600" : "text-gray-400"
              )}
            >
              {input.length} / 2000
            </span>
            <button
              title="Send Message"
              onClick={handleSend}
              disabled={!input.trim() && !file}
              className={cn(
                "p-2 rounded-full transition-all duration-200 flex items-center justify-center ",
                input.trim() || file
                  ? "bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] shadow-md transform hover:scale-105 hover:cursor-pointer"
                  : isDark
                  ? "bg-[#2f2f2f] text-gray-500 cursor-not-allowed"
                  : "bg-[#e5e5e5] text-gray-400 cursor-not-allowed"
              )}
            >
              <ArrowUp size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatInput;
