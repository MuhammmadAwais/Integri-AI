import React, { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  ArrowUp,
  X,
  FileText,
  Globe,
  Image as ImageIcon
} from "lucide-react";
import { useAppSelector } from "../../../hooks/useRedux";
import { cn } from "../../../lib/utils";

interface ChatInputProps {
  onSend?: (text: string, file?: File | null) => void;
  disabled?: boolean;
  features?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled,
  features = true,
}) => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight = features ? 160 : 120;
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        maxHeight
      )}px`;
    }
  }, [input, features]);

  const handleSend = () => {
    if (disabled) return;
    if ((input.trim() || file) && onSend) {
      onSend(input, file);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={cn(
        "w-full transition-all duration-200",
        // If features are hidden (PDF mode), use a cleaner container style
        !features && "relative"
      )}
    >
      {/* File Preview Bubble */}
      {file && (
        <div className="mb-2 flex w-fit items-center gap-2 rounded-xl bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-500">
          <FileText size={14} />
          <span className="max-w-[150px] truncate">{file.name}</span>
          <button
          title="file"
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="ml-1 hover:text-blue-700"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Input Container */}
      <div
        className={cn(
          "relative flex flex-col overflow-hidden transition-all duration-200",
          // Different border radius based on mode
          features ? "rounded-3xl border shadow-sm" : "rounded-2xl border",
          isDark
            ? "bg-[#1a1a1a] border-gray-800 focus-within:border-gray-700"
            : "bg-[#f4f4f4] border-transparent focus-within:bg-white focus-within:border-gray-200 focus-within:shadow-md"
        )}
      >
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            features
              ? "Message Integri AI..."
              : "Ask a question about this PDF..."
          }
          disabled={disabled}
          rows={1}
          className={cn(
            "w-full resize-none bg-transparent px-4 py-4 text-sm outline-none placeholder:text-gray-500 custom-scrollbar",
            // If features off, add padding right for the send button
            !features && "pr-12"
          )}
          style={{ minHeight: "50px" }}
        />

        {/* --- MODE 1: FEATURES ENABLED (Standard) --- */}
        {features && (
          <div className="flex items-center justify-between px-2 pb-2">
            {/* Left Tools */}
            <div className="flex items-center gap-1">
              <input
              title="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
              
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isDark
                    ? "hover:bg-gray-800 text-gray-400"
                    : "hover:bg-gray-200 text-gray-500"
                )}
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>
              <button
              title="translate"
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isDark
                    ? "hover:bg-gray-800 text-gray-400"
                    : "hover:bg-gray-200 text-gray-500"
                )}
              >
                <Globe size={18} />
              </button>
              <button
              title="image"
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isDark
                    ? "hover:bg-gray-800 text-gray-400"
                    : "hover:bg-gray-200 text-gray-500"
                )}
              >
                <ImageIcon size={18} />
              </button>
            </div>

            {/* Right Tools (Send) */}
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
              title="button"
                onClick={handleSend}
                disabled={(!input.trim() && !file) || disabled}
                className={cn(
                  "p-2 rounded-full transition-all duration-200 flex items-center justify-center",
                  (input.trim() || file) && !disabled
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                    : isDark
                    ? "bg-gray-800 text-gray-500"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* --- MODE 2: FEATURES DISABLED (PDF Mode) --- */}
        {!features && (
          <div className="absolute bottom-2 right-2">
            <button
            title="button"
              onClick={handleSend}
              disabled={(!input.trim() && !file) || disabled}
              className={cn(
                "p-2 rounded-xl transition-all duration-200 flex items-center justify-center",
                (input.trim() || file) && !disabled
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  : "text-gray-400 cursor-not-allowed"
              )}
            >
              <ArrowUp size={20} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
