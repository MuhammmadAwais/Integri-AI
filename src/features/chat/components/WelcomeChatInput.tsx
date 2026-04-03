import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  Paperclip,
  ArrowUp,
  AudioLines,
  FileText,
  PenTool,
  Search,
  SearchX,
  X,
  HardDrive,
  Github,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { useCloudStorage } from "../../../hooks/useCloudStorage";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import WhiteboardModal from "../../../Components/ui/WhiteboardModal";
import LoginModal from "../../auth/components/LoginModal";
import SubscribeModal from "../../subscriptions/components/SubscribeModal";
import { useSubscription } from "../../subscriptions/hooks/useSubscription";
import { useFilePreviews } from "../../../hooks/useFilePreviews";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import ImportCodeModal from "./ImportCodeModal";
import { clearAttachedRepo } from "../chatSlice";
import { repoBlobStore } from "../services/repoBlobStore";

type SearchMode = null | "search" | "deep-search";

type FileUploadStage = "idle" | "uploading" | "processing" | "error";

interface WelcomeChatInputProps {
  onStartChat: (text: string, files?: File[], searchMode?: SearchMode) => void;
  user: any;
  isDark: boolean;
  isLoading?: boolean;
  fileUploadStage?: FileUploadStage;
  isUploading?: boolean;
}

// Define the shape of our saved draft
interface SavedDraft {
  text: string;
  files?: Array<{
    fileName: string;
    fileType: string;
    fileBase64: string;
  }>;
}

const WelcomeChatInput = forwardRef<HTMLDivElement, WelcomeChatInputProps>(
  ({ onStartChat, user, isDark, isLoading, fileUploadStage = "idle", isUploading = false }, ref) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const attachedRepo = useAppSelector((state: any) => state.chat.attachedRepo);
    const [inputValue, setInputValue] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [searchMode, setSearchMode] = useState<SearchMode>(null);

    const filePreviews = useFilePreviews(selectedFiles);

    // State for dynamic menu positioning
    const [menuPosition, setMenuPosition] = useState<{
      top: number;
      left: number;
    } | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // --- 1. PERSISTENCE & RECOVERY (Guest Buffer) ---
    useEffect(() => {
      const savedDraft = localStorage.getItem("integri_guest_draft");
      if (savedDraft) {
        try {
          const parsed: SavedDraft = JSON.parse(savedDraft);
          if (parsed.text) setInputValue(parsed.text);

          if (parsed.files && parsed.files.length > 0) {
            Promise.all(
              parsed.files.map((pf) =>
                fetch(pf.fileBase64)
                  .then((res) => res.blob())
                  .then((blob) => new File([blob], pf.fileName, { type: pf.fileType }))
              )
            ).then((recoveredFiles) => setSelectedFiles(recoveredFiles));
          }
          localStorage.removeItem("integri_guest_draft");
        } catch (e) {
          console.error("Failed to restore draft", e);
        }
      }
    }, []);

    const saveDraftAndLogin = async () => {
      const draftFiles: any[] = [];
      for (const file of selectedFiles) {
        if (file.size < 3 * 1024 * 1024) {
          try {
            const fileBase64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });
            draftFiles.push({ fileName: file.name, fileType: file.type, fileBase64 });
          } catch (e) {
            console.warn("Could not save file to draft", e);
          }
        }
      }

      const draft: SavedDraft = {
        text: inputValue,
        files: draftFiles,
      };

      localStorage.setItem("integri_guest_draft", JSON.stringify(draft));
      setShowLoginModal(true);
    };

    // --- 2. DYNAMIC HEIGHT LOGIC (Gemini Style) ---
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        // We reset height to 'auto' to correctly calculate scrollHeight if text is deleted
        textarea.style.height = "auto";

        const scrollHeight = textarea.scrollHeight;

        // Config: Start big (60px internal), Cap at ~8 lines (200px)
        const MIN_HEIGHT = 60;
        const MAX_HEIGHT = 200;

        // Calculate the target height: Grow freely between MIN and MAX
        const targetHeight = Math.min(
          Math.max(scrollHeight, MIN_HEIGHT),
          MAX_HEIGHT
        );

        textarea.style.height = `${targetHeight}px`;

        // Only show scrollbar if we have hit the MAX cap
        if (scrollHeight > MAX_HEIGHT) {
          textarea.style.overflowY = "auto";
        } else {
          textarea.style.overflowY = "hidden";
        }
      }
    }, [inputValue]);

    // --- 3. CLOUD STORAGE ---
    const {
      handleGoogleDrivePick,
      handleOneDrivePick,
      isLoading: isCloudLoading,
    } = useCloudStorage((file) => {
      setSelectedFiles((prev) => [...prev, file]);
      setShowAttachMenu(false);
    });

    // --- 4. POSITIONING LOGIC FOR PORTAL ---
    const updateMenuPosition = () => {
      if (buttonRef.current && showAttachMenu) {
        const rect = buttonRef.current.getBoundingClientRect();
        setMenuPosition({
          top: rect.top - 10,
          left: rect.left,
        });
      }
    };

    useLayoutEffect(() => {
      if (showAttachMenu) updateMenuPosition();
    }, [showAttachMenu]);

    useEffect(() => {
      const handleResize = () => {
        if (showAttachMenu) setShowAttachMenu(false);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [showAttachMenu]);

    useEffect(() => {
      const handleScroll = () => {
        if (showAttachMenu) updateMenuPosition();
      };
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }, [showAttachMenu]);

    // --- 5. CLICK OUTSIDE MENU ---
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          buttonRef.current &&
          buttonRef.current.contains(event.target as Node)
        ) {
          return;
        }
        if (menuRef.current && menuRef.current.contains(event.target as Node)) {
          return;
        }
        setShowAttachMenu(false);
      };

      if (showAttachMenu) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [showAttachMenu]);

    // --- 6. HANDLERS ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        setShowAttachMenu(false);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData.items;
      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          const pastedFile = items[i].getAsFile();
          if (pastedFile) {
            e.preventDefault();
            pastedFiles.push(pastedFile);
          }
        }
      }
      if (pastedFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...pastedFiles]);
        setShowAttachMenu(false);
      }
    };

    // Check subscription tier for search features
    const {  isFree } = useSubscription();

    const isFileProcessing =
      isUploading || fileUploadStage === "uploading" || fileUploadStage === "processing";

    const handleSubmit = () => {
      // Allow send if there's text, regular files, OR an attached repo
      if (!inputValue.trim() && selectedFiles.length === 0 && !attachedRepo) return;

      if (!user?.id) {
        saveDraftAndLogin();
        return;
      }

      if (isFileProcessing) return;

      // ══ PROMPT BRIDGE ══
      // Must run here so ANY parent's onStartChat handler receives the
      // enriched text + blob — regardless of whether that parent is
      // ChatInterface, a standalone Welcome page, or anything else.
      let sendText = inputValue;
      let sendFiles = [...selectedFiles];

      if (attachedRepo) {
        const packBlob = repoBlobStore.get();
        if (packBlob) {
          sendText = `SYSTEM: The repository source code is attached as a PDF. Use the XML tags for navigation. ${inputValue}`;
          sendFiles = [packBlob, ...sendFiles];
        }
        // Clear immediately — single-use per turn
        repoBlobStore.clear();
        dispatch(clearAttachedRepo());
      }
      // ═════════════════

      onStartChat(sendText, sendFiles, searchMode);
      setInputValue("");
      setSelectedFiles([]);
      setSearchMode(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    // const firstName = user?.name?.split(" ")[0] || "Friend";  //for later use

    return (
      <div
        ref={ref}
        className={cn(
          // Container: Flex Column. "min-h-[140px]" ensures the big initial look.
          // It will grow naturally because it's a block element with dynamic children.
          "w-full relative group rounded-3xl transition-all duration-300 border shadow-sm flex flex-col justify-between min-h-[105px] hover:rounded-2xl",
          isDark
            ? "bg-[#121212] border-[#2A2B32] hover:border-gray-700"
            : "bg-gray-50 border-gray-200 hover:border-gray-300"
        )}
      >
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
        <SubscribeModal
          isOpen={showSubscribeModal}
          onClose={() => setShowSubscribeModal(false)}
          featureName="Search Features"
        />

        {/* GitHub Source Chip */}
        <AnimatePresence>
          {attachedRepo && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="px-4 pt-3 pb-0"
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
                <span className="max-w-[200px] truncate">
                  {attachedRepo.owner}/{attachedRepo.repo}
                </span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-md font-semibold",
                    isDark
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "bg-indigo-100 text-indigo-600"
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

        {/* --- TOP SECTION: File Preview & Text Area --- */}
        <div className="flex flex-col w-full flex-1">
          {/* File Previews */}
          {selectedFiles.length > 0 && (
            <div className="px-4 pt-3 pb-0 animate-in slide-in-from-bottom-2 fade-in">
              <div className="flex flex-wrap gap-3 px-1">
                {selectedFiles.map((fileObj, idx) => {
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
                      {/* Remove Button */}
                      {!isFileProcessing && (
                        <button
                          title={t("common.removeFile")}
                          onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
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
            </div>
          )}

          {/* Main Text Input */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            rows={1}
            placeholder={t("chat.askMeAnything")}
            className={cn(
              // Layout: w-full, transparent bg, no resize handle
              "w-full bg-transparent outline-none text-lg px-6 py-2 placeholder:text-gray-500/80 font-medium z-20 resize-none",

              // Colors
              isDark ? "text-gray-100" : "text-gray-900",

              // Spacing: Margin right ensures the scrollbar doesn't hit the rounded border
              "mr-0 mt-2",

              // Animation: Smooth height transition
              "transition-[height] duration-200 ease-out",

              // --- GEMINI SCROLLBAR STYLING ---
              // Width
              "[&::-webkit-scrollbar]:w-3",
              // Track (Transparent)
              "[&::-webkit-scrollbar-track]:bg-transparent",
              // Thumb (Rounded & Colored)
              "[&::-webkit-scrollbar-thumb]:rounded-tl-full hover:[&::-webkit-scrollbar-thumb]:rounded-lg",
              "[&::-webkit-scrollbar]:h-7",
              isDark
                ? "[&::-webkit-scrollbar-thumb]:bg-zinc-700 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600"
                : "[&::-webkit-scrollbar-thumb]:bg-zinc-300 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400"
            )}
            // IMPORTANT: Remove any fixed height here to let the useEffect control it strictly
            // But provide a min-height matching logic to prevent jump on load
            style={{ minHeight: "45px", overflowY: "hidden" }}
          />
        </div>

        {/* --- BOTTOM SECTION: Fixed Controls --- */}
        <div className="flex items-center justify-between w-full px-3 pb-1 pt-1">
          {/* LEFT: Attachment Menu Trigger */}
          <div className="relative">
            <input
              title="file"
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept=".jpg, .jpeg, .png, .gif, .pdf"
              multiple
            />
            <button
              ref={buttonRef}
              title={t("common.attachFile")}
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className={cn(
                "p-2.5 rounded-full transition-colors shrink-0 hover:cursor-pointer",
                showAttachMenu
                  ? isDark
                    ? "bg-white/10 text-white"
                    : "bg-black/5 text-black"
                  : isDark
                  ? "text-gray-400 hover:text-white hover:bg-white/10"
                  : "text-gray-500 hover:text-black hover:bg-black/5",
                selectedFiles.length > 0 && "text-blue-500"
              )}
            >
              <Paperclip size={20} strokeWidth={2.5} />
            </button>

            {/* PORTAL: Attachment Menu */}
            {createPortal(
              <AnimatePresence>
                {showAttachMenu && menuPosition && (
                  <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    style={{
                      position: "fixed",
                      top: menuPosition.top,
                      left: menuPosition.left,
                      transform: "translateY(-100%)",
                    }}
                    className={cn(
                      "w-56 p-1.5 rounded-xl border shadow-xl backdrop-blur-md z-9999 overflow-hidden",
                      isDark
                        ? "bg-[#18181b]/95 border-gray-700"
                        : "bg-white/95 border-gray-200"
                    )}
                  >
                    {/* Menu Options */}
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors hover:cursor-pointer",
                        isDark
                          ? "hover:bg-white/10 text-gray-200"
                          : "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      <HardDrive size={18} className="text-emerald-500" />
                      {t("chat.localComputer")}
                    </button>

                    <div
                      className={cn(
                        "h-px w-full my-1",
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      )}
                    />

                    <button
                      onClick={handleGoogleDrivePick}
                      disabled={isCloudLoading}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors hover:cursor-pointer",
                        isDark
                          ? "hover:bg-white/10 text-gray-200"
                          : "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      <svg
                        className="w-4 h-4 shrink-0"
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
                          d="m59.8 53.7h-32.35l-3.2 5.6-3.85 6.65h39.4c5.1 0 10.1-2.85 12.65-7.25l2.5-1.3c2.55 4.45 2.55 9.95 0 14.4l-2.5 1.3c-2.55 4.4-7.55 7.25-12.65 7.25h32.35z"
                          fill="#2684fc"
                        />
                        <path
                          d="m19.65 24.35 2.5 1.3 25.8 44.7c1.65 2.85 2.05 6.45 1.15 9.65l2.5-1.3c4.4-2.55 7.25-7.55 7.25-12.65 0-1.7-.3-3.35-.9-4.9l-25.8-44.7c-4.4-7.6-13.75-7.6-18.15 0z"
                          fill="#ffba00"
                        />
                      </svg>
                      {t("chat.googleDrive")}
                    </button>
                    <button
                      onClick={handleOneDrivePick}
                      disabled={isCloudLoading}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors hover:cursor-pointer",
                        isDark
                          ? "hover:bg-white/10 text-gray-200"
                          : "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      <svg
                        className="w-4 h-4 shrink-0"
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
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      )}
                    />

                    <button
                      onClick={() => {
                        setShowImportModal(true);
                        setShowAttachMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors hover:cursor-pointer",
                        isDark
                          ? "hover:bg-white/10 text-gray-200"
                          : "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      <Github size={18} className="text-gray-400" />
                      Import Code
                    </button>

                    <div
                      className={cn(
                        "h-px w-full my-1",
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      )}
                    />

                    <button
                      onClick={() => {
                        setShowWhiteboard(true);
                        setShowAttachMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors hover:cursor-pointer",
                        isDark
                          ? "hover:bg-white/10 text-gray-200"
                          : "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      <PenTool size={18} className="text-purple-500" />
                      {t("chat.drawSketch")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body
            )}
          </div>

          {/* RIGHT: Search Modes / Voice / Send Button */}
          <div className="flex gap-2 items-center">
            {/* Search Mode Icons - Show for all users, but free users see upgrade modal */}
            <>
              <button
                title={t("chat.searchMode")}
                onClick={() => {
                  if (!user?.id) {
                    setShowLoginModal(true);
                    return;
                  }
                  if (isFree) {
                    setShowSubscribeModal(true);
                    return;
                  }
                  setSearchMode(searchMode === "search" ? null : "search");
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:cursor-pointer",
                  searchMode === "search"
                    ? isDark
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-blue-100 text-blue-600 border border-blue-300"
                    : isDark
                    ? "text-gray-400 hover:bg-white/10 hover:text-white"
                    : "text-gray-500 hover:bg-black/5 hover:text-black"
                )}
              >
                <Search size={18} />
              </button>
              <button
                title={t("chat.deepSearchMode")}
                onClick={() => {
                  if (!user?.id) {
                    setShowLoginModal(true);
                    return;
                  }
                  if (isFree) {
                    setShowSubscribeModal(true);
                    return;
                  }
                  const newMode = searchMode === "deep-search" ? null : "deep-search";
                  setSearchMode(newMode);
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:cursor-pointer",
                  searchMode === "deep-search"
                    ? isDark
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-purple-100 text-purple-600 border border-purple-300"
                    : isDark
                    ? "text-gray-400 hover:bg-white/10 hover:text-white"
                    : "text-gray-500 hover:bg-black/5 hover:text-black"
                )}
              >
                <SearchX size={18} />
              </button>
            </>
            {inputValue.trim().length > 0 || selectedFiles.length > 0 ? null : (
              <Link to="/voice">
                <button
                  title={t("chat.voiceInput")}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:cursor-pointer",
                    isDark
                      ? "text-gray-400 hover:bg-white/10 hover:text-white"
                      : "text-gray-500 hover:bg-black/5 hover:text-black"
                  )}
                >
                  <AudioLines size={20} />
                </button>
              </Link>
            )}
            <button
              title={t("chat.sendMessage")}
              onClick={
                (inputValue.trim().length > 0 || selectedFiles.length > 0) && !isFileProcessing
                  ? handleSubmit
                  : undefined
              }
              disabled={isFileProcessing}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-95 animate-in zoom-in duration-200 hover:cursor-pointer",
                isFileProcessing
                  ? isDark
                    ? "bg-white/40 text-black/50 cursor-not-allowed"
                    : "bg-black/40 text-white/50 cursor-not-allowed"
                  : isDark
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
              )}
            >
              {isLoading || isCloudLoading || isFileProcessing ? (
                <div className="animate-spin h-4 w-4 border-2 border-black/30 border-t-black rounded-full dark:border-white/30 dark:border-t-white" />
              ) : (
                <ArrowUp size={18} strokeWidth={3} />
              )}
            </button>
          </div>
        </div>

        <WhiteboardModal
          isOpen={showWhiteboard}
          onClose={() => setShowWhiteboard(false)}
          onDone={(file) => {
            setSelectedFiles((prev) => [...prev, file]);
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
  }
);

WelcomeChatInput.displayName = "WelcomeChatInput";

export default WelcomeChatInput;
