import React, { useState, useRef } from "react";
import { Paperclip, Mic, ArrowUp, X, FileText } from "lucide-react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../../utils/cn";

interface ChatInputProps {
  onSend?: (text: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null); // File state
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((input.trim() || file) && onSend) {
      const msg = file ? `[Uploaded File: ${file.name}] ${input}` : input;
      onSend(msg);
      setInput("");
      setFile(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* File Preview Badge */}
      {file && (
        <div className="mb-2 inline-flex items-center gap-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm">
          <FileText size={14} className="text-indigo-500" />
          <span className={isDark ? "text-gray-200" : "text-gray-800"}>
            {file.name}
          </span>
          <button title="button" onClick={() => setFile(null)} className="hover:text-red-500">
            <X size={14} />
          </button>
        </div>
      )}

      <div
        className={cn(
          "relative flex items-end w-full p-3 rounded-2xl border shadow-lg transition-all",
          isDark ? "bg-[#2f2f38] border-[#42424e]" : "bg-white border-gray-200"
        )}
      >
        {/* Hidden File Input */}
        <input
        title="file input"
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
        />

        <button
          title="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "p-2 rounded-xl mr-2 transition-colors",
            isDark
              ? "hover:bg-white/10 text-gray-400"
              : "hover:bg-gray-100 text-gray-500"
          )}
        >
          <Paperclip size={20} />
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            !e.shiftKey &&
            (e.preventDefault(), handleSend())
          }
          rows={1}
          placeholder="Message Integri AI..."
          className={cn(
            "flex-1 max-h-[150px] py-2 bg-transparent outline-none resize-none text-sm",
            isDark
              ? "text-white placeholder-gray-500"
              : "text-gray-900 placeholder-gray-400"
          )}
        />

        <button
          title="button"
          onClick={handleSend}
          disabled={!input.trim() && !file}
          className={cn(
            "p-2 rounded-xl transition-all duration-200 ml-2",
            input.trim() || file
              ? "bg-indigo-600 text-white shadow-md hover:scale-105"
              : "bg-transparent text-gray-400 cursor-not-allowed"
          )}
        >
          <ArrowUp size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
