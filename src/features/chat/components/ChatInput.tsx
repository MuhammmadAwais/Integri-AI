import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Paperclip,
  ArrowUp,
  X,
  FileText,
  HardDrive,
  PenTool,
  Search,
  SearchX,
  Ban,
  Github,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import { cn } from "../../../lib/utils";
import { useCloudStorage } from "../../../hooks/useCloudStorage";
import { AnimatePresence, motion } from "framer-motion";
import WhiteboardModal from "../../../Components/ui/WhiteboardModal";
import LoginModal from "../../auth/components/LoginModal";
import { useSubscription } from "../../subscriptions/hooks/useSubscription";
import { useLimits } from "../../limits/hooks/useLimits";
import { useFilePreviews } from "../../../hooks/useFilePreviews";
import ImportCodeModal from "./ImportCodeModal";
import { clearAttachedRepo } from "../chatSlice";
import { repoBlobStore } from "../services/repoBlobStore";

type SearchMode = null | "search" | "deep-search";

type FileUploadStage = "idle" | "uploading" | "processing" | "error";

interface ChatInputProps {
  onSend?: (text: string, files?: File[], searchMode?: SearchMode) => void;
  placeholder?: string;
  isDark?: boolean;
  disabled?: boolean;
  features?: boolean;
  fileUploadStage?: FileUploadStage;
  isUploading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled,
  features = true,
  fileUploadStage = "idle",
  isUploading = false,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: any) => state.auth.user);
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const attachedRepo = useAppSelector((state: any) => state.chat.attachedRepo);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>(null);

  // Check subscription tier for search features
  const { isPro, isPremium } = useSubscription();
  const canUseSearch = isPro || isPremium;
  const { limits, resetTimeFormatted } = useLimits();
  const limitReached = limits?.is_daily_limit_reached ?? false;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const filePreviews = useFilePreviews(files);

  // Hook for Cloud Storage
  const {
    handleGoogleDrivePick,
    handleOneDrivePick,
    isLoading: isCloudLoading,
  } = useCloudStorage((pickedFile) => {
    setFiles((prev) => [...prev, pickedFile]);
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

  const isFileProcessing =
    isUploading || fileUploadStage === "uploading" || fileUploadStage === "processing";

  const handleSend = () => {
    if (!user?.id) {
      setShowLoginModal(true);
      return;
    }
    if (disabled || isCloudLoading || isFileProcessing) return;

    // ══ PROMPT BRIDGE ══
    // Runs here so it fires on EVERY send path regardless of which parent
    // component handles the message (ChatInterface, App, WelcomePage, etc.)
    let sendText = input;
    let sendFiles = [...files];

    if (attachedRepo) {
      const packBlob = repoBlobStore.get();
      if (packBlob) {
        sendText = `SYSTEM: The repository source code is attached as a PDF. Use the XML tags for navigation. ${input}`;
        sendFiles = [packBlob, ...sendFiles];
      }
      // Clear immediately — single-use per turn
      repoBlobStore.clear();
      dispatch(clearAttachedRepo());
    }
    // ═════════════════

    if ((sendText.trim() || sendFiles.length > 0) && onSend) {
      onSend(sendText, sendFiles, searchMode);
      setInput("");
      setFiles([]);
      setSearchMode(null);
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
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
      setShowAttachMenu(false);
    }
  };

  // --- NEW: Paste Handler Implementation ---
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const pastedFiles: File[] = [];

    // Iterate through clipboard items to find a file
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const pastedFile = items[i].getAsFile();
        if (pastedFile) {
          pastedFiles.push(pastedFile);
        }
      }
    }
    
    if (pastedFiles.length > 0) {
      e.preventDefault();
      setFiles((prev) => [...prev, ...pastedFiles]);
      setShowAttachMenu(false);
    }
    // If no file is found, the event bubbles up normally
    // and text is pasted into the textarea via default browser behavior.
  };

  return (
    <div
      className={cn(
        "w-full transition-all duration-200",
        !features && "relative"
      )}
    >
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Limit-reached banner */}
      <AnimatePresence>
        {limitReached && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "mb-2 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs",
              isDark
                ? "bg-zinc-900 border-zinc-700 text-zinc-400"
                : "bg-zinc-50 border-zinc-200 text-zinc-500"
            )}
          >
            <Ban className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Daily message limit reached.
              {resetTimeFormatted ? ` Resets at ${resetTimeFormatted}.` : " Upgrade to continue."}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GitHub Source Chip — replaces the default file preview for attached repos */}
      <AnimatePresence>
        {attachedRepo && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="mb-3 px-1"
          >
            <div
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium",
                isDark
                  ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-300"
                  : "bg-indigo-50 border-indigo-200 text-indigo-700"
              )}
            >
              <Github size={13} className="shrink-0" />
              <span className="max-w-[180px] truncate">
                {attachedRepo.owner}/{attachedRepo.repo}
              </span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-md font-semibold",
                  isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"
                )}
              >
                {attachedRepo.fileCount} files
              </span>
              <button
                onClick={() => dispatch(clearAttachedRepo())}
                className="ml-0.5 text-current opacity-50 hover:opacity-100 transition-opacity"
                title="Remove repo context"
              >
                <X size={11} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Previews — mapped to multiple files */}
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-2 px-1">
          {files.map((fileObj, idx) => {
            const isImage = fileObj.type.startsWith("image/");
            const fileKey = `${fileObj.name}-${fileObj.size}-${fileObj.lastModified}`;
            const previewUrl = filePreviews[fileKey];

            return (
              <div
                key={idx}
                className={cn(
                  "group relative flex items-center shrink-0 border transition-colors duration-200",
                  isImage ? "w-12 h-12 rounded-xl overflow-hidden" : "h-12 px-3 gap-3 rounded-xl min-w-[140px] max-w-[200px]",
                  fileUploadStage === "error"
                    ? isDark ? "bg-red-900/20 border-red-900/40" : "bg-red-50 border-red-200"
                    : isDark ? "bg-[#2A2B32] border-[#3A3B42]" : "bg-white border-gray-200 shadow-sm"
                )}
              >
                {/* Remove Button (Floating for images, absolute right otherwise) */}
                {!isFileProcessing && (
                  <button
                    title="Remove file"
                    onClick={() => {
                      setFiles(files.filter((_, i) => i !== idx));
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className={cn(
                      "absolute z-10 flex items-center justify-center rounded-full bg-gray-500/80 text-white hover:bg-gray-600 transition-colors",
                      isImage ? "top-1 right-1 w-4 h-4 backdrop-blur-md opacity-0 group-hover:opacity-100" : "top-1.5 right-1.5 w-4 h-4 opacity-50 hover:opacity-100"
                    )}
                  >
                    <X size={10} />
                  </button>
                )}

                {/* Processing Overlay for Images */}
                {isImage && isFileProcessing && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" />
                  </div>
                )}

                {isImage && previewUrl ? (
                  <img src={previewUrl} alt={fileObj.name} className="w-full h-full object-cover" />
                ) : (
                  <>
                    {/* Non-Image Content */}
                    <div className={cn("shrink-0 p-1.5 rounded-md", isDark ? "bg-black/20" : "bg-gray-100")}>
                      {isFileProcessing ? (
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-indigo-400/40 border-t-indigo-500 rounded-full" />
                      ) : fileUploadStage === "error" ? (
                        <X size={14} className="text-red-400" />
                      ) : (
                        <FileText size={14} className="text-indigo-500" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1 justify-center">
                      <span className={cn(
                        "text-[11px] font-semibold tracking-tight truncate",
                        isDark ? "text-gray-200" : "text-gray-700"
                      )}>
                        {fileObj.name}
                      </span>
                      {isFileProcessing ? (
                         <span className="text-[9px] text-gray-500 font-medium">Processing...</span>
                      ) : (
                         <span className="text-[9px] text-gray-400 font-medium">{fileObj.name.split('.').pop()?.toUpperCase() || 'FILE'}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
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
          onPaste={handlePaste} // Attached the paste handler here
          placeholder={features ? t("chat.messageIntegriAi") : t("chat.askQuestion")}
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
                title="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".jpg, .jpeg, .png, .gif, .pdf"
                multiple
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
                title={t("common.attachFile")}
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
                        {t("chat.localComputer")}
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
                        {t("chat.googleDrive")}
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
                        {t("chat.oneDrive")}
                      </button>

                      <div
                        className={cn(
                          "h-px w-full my-1",
                          isDark ? "bg-gray-800" : "bg-gray-100"
                        )}
                      />

                      {/* Import Code — GitHub Repo */}
                      <button
                        onClick={() => {
                          setShowImportModal(true);
                          setShowAttachMenu(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                          isDark
                            ? "hover:bg-gray-800 text-gray-200"
                            : "hover:bg-gray-100 text-gray-700"
                        )}
                      >
                        <Github size={16} className="text-gray-400" />
                        Import Code
                      </button>

                      <div
                        className={cn(
                          "h-px w-full my-1",
                          isDark ? "bg-gray-800" : "bg-gray-100"
                        )}
                      />

                      {/* Draw Sketch Option */}
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
                        {t("chat.drawSketch")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Tools (Search Modes / Send) */}
            <div className="flex items-center gap-2">
              {/* Search Mode Icons - Only show for Pro/Premium users when input has content */}
              {canUseSearch && (input.trim() || files.length > 0) && (
                <>
                  <button
                    title={t("chat.searchMode")}
                    onClick={() => setSearchMode(searchMode === "search" ? null : "search")}
                    className={cn(
                      "p-2 rounded-full transition-colors flex items-center justify-center",
                      searchMode === "search"
                        ? isDark
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-blue-100 text-blue-600 border border-blue-300"
                        : isDark
                        ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                        : "text-gray-500 hover:bg-gray-200 hover:text-black"
                    )}
                  >
                    <Search size={18} />
                  </button>
                  <button
                    title={t("chat.deepSearchMode")}
                    onClick={() => setSearchMode(searchMode === "deep-search" ? null : "deep-search")}
                    className={cn(
                      "p-2 rounded-full transition-colors flex items-center justify-center",
                      searchMode === "deep-search"
                        ? isDark
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : "bg-purple-100 text-purple-600 border border-purple-300"
                        : isDark
                        ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                        : "text-gray-500 hover:bg-gray-200 hover:text-black"
                    )}
                  >
                    <SearchX size={18} />
                  </button>
                </>
              )}
              <span
                className={cn(
                  "text-xs hidden sm:block",
                  isDark ? "text-gray-600" : "text-gray-400"
                )}
              >
                {t("chat.characterCount", { current: input.length })}
              </span>
              <button
                title="button"
                onClick={handleSend}
                disabled={
                  (!input.trim() && files.length === 0) || disabled || isCloudLoading || isFileProcessing
                }
                className={cn(
                  "p-2 rounded-full transition-all duration-200 flex items-center justify-center",
                  (input.trim() || files.length > 0) && !disabled && !isCloudLoading && !isFileProcessing
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                    : isDark
                    ? "bg-gray-800 text-gray-500"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                {isCloudLoading || isFileProcessing ? (
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
              disabled={(!input.trim() && files.length === 0) || disabled}
              className={cn(
                "p-2 rounded-xl transition-all duration-200 flex items-center justify-center",
                (input.trim() || files.length > 0) && !disabled
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  : "text-gray-400 cursor-not-allowed"
              )}
            >
              <ArrowUp size={20} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* WHITEBOARD MODAL */}
      <WhiteboardModal
        isOpen={showWhiteboard}
        onClose={() => setShowWhiteboard(false)}
        onDone={(file) => {
          setFiles((prev) => [...prev, file]);
          setShowWhiteboard(false);
        }}
        isDark={isDark}
      />

      {/* IMPORT CODE MODAL */}
      <ImportCodeModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
};

export default ChatInput;
