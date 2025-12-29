import React, { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  ArrowUp,
  X,
  FileText,
  Globe,
  Image as ImageIcon,
  HardDrive,
  PenTool, // Imported Pen Icon
} from "lucide-react";
import { useAppSelector } from "../../../hooks/useRedux";
import { cn } from "../../../lib/utils";
import { useCloudStorage } from "../../../hooks/useCloudStorage";
import { AnimatePresence, motion } from "framer-motion";
import WhiteboardModal from "../../../Components/ui/WhiteboardModal";// Make sure path is correct

interface ChatInputProps {
  onSend?: (text: string, file?: File | null) => void;
  placeholder?: string;
  isDark?: boolean;
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
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false); // State for whiteboard

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Hook for Cloud Storage
  const {
    handleGoogleDrivePick,
    handleOneDrivePick,
    isLoading: isCloudLoading,
  } = useCloudStorage((pickedFile) => {
    setFile(pickedFile);
    setShowAttachMenu(false);
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (disabled || isCloudLoading) return;
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
      setShowAttachMenu(false);
    }
  };

  return (
    <div
      className={cn(
        "w-full transition-all duration-200",
        !features && "relative"
      )}
    >
      {/* File Preview Bubble */}
      {file && (
        <div className="mb-2 flex w-fit items-center gap-2 rounded-xl bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-500 animate-in fade-in slide-in-from-bottom-2">
          {file.type.startsWith("image/") ? (
            <ImageIcon size={14} />
          ) : (
            <FileText size={14} />
          )}
          <span className="max-w-[150px] truncate">{file.name}</span>
          <button
            title="button"
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
          "relative flex flex-col overflow-visible transition-all duration-200",
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
          placeholder={features ? "Message Integri AI..." : "Ask a question..."}
          disabled={disabled || isCloudLoading}
          rows={1}
          className={cn(
            "w-full resize-none bg-transparent px-4 py-4 text-sm outline-none placeholder:text-gray-500 custom-scrollbar",
            !features && "pr-12"
          )}
          style={{ minHeight: "50px" }}
        />

        {/* --- FEATURES ENABLED --- */}
        {features && (
          <div className="flex items-center justify-between px-2 pb-2">
            {/* Left Tools (Attach Menu) */}
            <div className="flex items-center gap-1 relative" ref={menuRef}>
              <input
                title="button"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Toggle Attach Menu */}
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  showAttachMenu
                    ? "bg-blue-100 text-blue-600"
                    : isDark
                    ? "hover:bg-gray-800 text-gray-400"
                    : "hover:bg-gray-200 text-gray-500"
                )}
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>

              {/* ATTACHMENT POPUP MENU */}
              <AnimatePresence>
                {showAttachMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={cn(
                      "absolute bottom-full left-0 mb-2 w-48 rounded-xl border p-1 shadow-xl z-50",
                      isDark
                        ? "bg-[#1a1a1a] border-gray-700"
                        : "bg-white border-gray-200"
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      {/* Local Upload */}
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowAttachMenu(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                          isDark
                            ? "hover:bg-gray-800 text-gray-200"
                            : "hover:bg-gray-100 text-gray-700"
                        )}
                      >
                        <HardDrive size={16} className="text-blue-500" />
                        Local Computer
                      </button>

                      <div
                        className={cn(
                          "h-px w-full my-1",
                          isDark ? "bg-gray-800" : "bg-gray-100"
                        )}
                      />

                      {/* Google Drive */}
                      <button
                        onClick={handleGoogleDrivePick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                          isDark
                            ? "hover:bg-gray-800 text-gray-200"
                            : "hover:bg-gray-100 text-gray-700"
                        )}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 87.3 78"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="m6.6 66.85 3.85 6.65c.8 1.4 1.9 2.5 3.2 3.2l2.5 1.3 65-37.5-3.85-6.65c-.8-1.4-1.9-2.5-3.2-3.2l-2.4-1.3z"
                            fill="#0066da"
                          />
                          <path
                            d="m43.65 25-25.8 44.7 9.55 16.55 25.8-44.7c-1.65-2.85-4.75-4.9-8.25-4.9s-6.6 2.05-8.25 4.9z"
                            fill="#00ac47"
                          />
                          <path
                            d="m73.55 76.8c4.4 7.6 13.75 7.6 18.15 0l-3.85-6.65-3.2-5.6-35-60.6c-1.65-2.85-2.05-6.45-1.15-9.65l-2.5 1.3c-4.4 2.55-7.25 7.55-7.25 12.65z"
                            fill="#ea4335"
                          />
                          <path
                            d="m43.65 25c1.65-2.85 4.75-4.9 8.25-4.9l-.05.05h33.85c5.1 0 10.1 2.85 12.65 7.25l2.5 1.3c2.55-4.45 2.55-9.95 0-14.4l-2.5-1.3c-2.55-4.4-7.55-7.25-12.65-7.25h-33.85c-3.5 0-6.6 2.05-8.25 4.9z"
                            fill="#00832d"
                          />
                          <path
                            d="m59.8 53.7h-32.35l-3.2 5.6-3.85 6.65h39.4c5.1 0 10.1-2.85 12.65-7.25l2.5-1.3c2.55 4.45 2.55 9.95 0 14.4l-2.5 1.3c-2.55 4.4-7.55 7.25-12.65 7.25h-39.4c-5.1 0-10.1-2.85-12.65-7.25l-2.5-1.3c-2.55-4.4-2.55-9.95 0-14.4l2.5 1.3c2.55 4.4 7.55 7.25 12.65 7.25h32.35z"
                            fill="#2684fc"
                          />
                          <path
                            d="m19.65 24.35 2.5 1.3 25.8 44.7c1.65 2.85 2.05 6.45 1.15 9.65l2.5-1.3c4.4-2.55 7.25-7.55 7.25-12.65 0-1.7-.3-3.35-.9-4.9l-25.8-44.7c-4.4-7.6-13.75-7.6-18.15 0z"
                            fill="#ffba00"
                          />
                        </svg>
                        Google Drive
                      </button>

                      {/* OneDrive */}
                      <button
                        onClick={handleOneDrivePick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                          isDark
                            ? "hover:bg-gray-800 text-gray-200"
                            : "hover:bg-gray-100 text-gray-700"
                        )}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 64 64"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="m39.243 45.426 12.839 7.749 6.294-10.587-12.516-7.854z"
                            fill="#0072c6"
                          />
                          <path
                            d="m18.145 23.335-5.328 3.013-4.253 10.641 9.47 5.766 8.397-13.655z"
                            fill="#0072c6"
                          />
                          <path
                            d="m27.502 18.04-10.428 5.86-1.129 1.909 9.873 6.007 10.081-16.791z"
                            fill="#0072c6"
                          />
                          <path
                            d="m18.256 42.662-8.675-5.334-1.956 2.032 10.825 6.467z"
                            fill="#004578"
                          />
                          <path
                            d="m51.916 42.684 6.46-10.697-3.23-1.935-12.28 7.355 1.258 2.032z"
                            fill="#004578"
                          />
                          <path
                            d="m36.726 14.156 2.56-4.173-10.669-6.419-2.56 4.173z"
                            fill="#004578"
                          />
                          <path
                            d="m28.632 24.322 13.033 7.854 12.351-20.241-12.984-7.806z"
                            fill="#00bcf2"
                          />
                          <path
                            d="m39.292 11.935 14.721 24.793 6.697-3.951-14.722-24.793z"
                            fill="#00bcf2"
                          />
                          <path
                            d="m26.695 31.821-8.397 13.655 20.945 12.96 8.29-13.881z"
                            fill="#00bcf2"
                          />
                        </svg>
                        OneDrive
                      </button>

                      <div
                        className={cn(
                          "h-px w-full my-1",
                          isDark ? "bg-gray-800" : "bg-gray-100"
                        )}
                      />

                      {/* NEW: Draw Sketch Option */}
                      <button
                        onClick={() => {
                          setShowWhiteboard(true);
                          setShowAttachMenu(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                          isDark
                            ? "hover:bg-gray-800 text-gray-200"
                            : "hover:bg-gray-100 text-gray-700"
                        )}
                      >
                        <PenTool size={16} className="text-purple-500" />
                        Draw Sketch
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Other standard buttons */}
              <button
                title="button"
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
                title="button"
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
                disabled={
                  (!input.trim() && !file) || disabled || isCloudLoading
                }
                className={cn(
                  "p-2 rounded-full transition-all duration-200 flex items-center justify-center",
                  (input.trim() || file) && !disabled && !isCloudLoading
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                    : isDark
                    ? "bg-gray-800 text-gray-500"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                {isCloudLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <ArrowUp size={18} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        )}

        {/* --- PDF MODE (Simpler) --- */}
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

      {/* WHITEBOARD MODAL (Rendered via Portal inside component) */}
      <WhiteboardModal
        isOpen={showWhiteboard}
        onClose={() => setShowWhiteboard(false)}
        onDone={(file) => {
          setFile(file);
          setShowWhiteboard(false);
        }}
        isDark={isDark}
      />
    </div>
  );
};

export default ChatInput;
