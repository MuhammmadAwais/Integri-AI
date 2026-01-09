import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import {
  Paperclip,
  ArrowUp,
  Image as ImageIcon,
  AudioLines,
  X as XIcon,
  FileText,
  HardDrive,
  PenTool,
} from "lucide-react";
import { cn } from "../../../lib/utils"; // Adjust path as needed
import { useCloudStorage } from "../../../hooks/useCloudStorage"; // Adjust path
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import WhiteboardModal from "../../../Components/ui/WhiteboardModal"; // Adjust path
import LoginModal from "../../auth/components/LoginModal"; // Adjust path

// Define the shape of our saved draft
interface SavedDraft {
  text: string;
  fileBase64?: string | null;
  fileName?: string;
  fileType?: string;
}

interface WelcomeChatInputProps {
  onStartChat: (text: string, file: File | null) => void;
  user: any;
  isDark: boolean;
  isLoading?: boolean;
}

const WelcomeChatInput = forwardRef<HTMLDivElement, WelcomeChatInputProps>(
  ({ onStartChat, user, isDark, isLoading }, ref) => {
    const [inputValue, setInputValue] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // State for dynamic menu positioning
    const [menuPosition, setMenuPosition] = useState<{
      top: number;
      left: number;
    } | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // We need refs for both the button (trigger) and the menu (content) for click-outside logic
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // --- 1. PERSISTENCE & RECOVERY (Guest Buffer) ---
    useEffect(() => {
      // Recover draft on mount
      const savedDraft = localStorage.getItem("integri_guest_draft");
      if (savedDraft) {
        try {
          const parsed: SavedDraft = JSON.parse(savedDraft);
          if (parsed.text) setInputValue(parsed.text);

          // Attempt to reconstruct file from base64 if it exists
          if (parsed.fileBase64 && parsed.fileName && parsed.fileType) {
            fetch(parsed.fileBase64)
              .then((res) => res.blob())
              .then((blob) => {
                const recoveredFile = new File([blob], parsed.fileName!, {
                  type: parsed.fileType,
                });
                setSelectedFile(recoveredFile);
              });
          }
          // Clear immediately to prevent stale state on next legitimate reload
          localStorage.removeItem("integri_guest_draft");
        } catch (e) {
          console.error("Failed to restore draft", e);
        }
      }
    }, []);

    const saveDraftAndLogin = async () => {
      let fileBase64: string | null = null;

      // If file exists and is small enough (< 3MB), try to save it
      if (selectedFile && selectedFile.size < 3 * 1024 * 1024) {
        try {
          fileBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(selectedFile);
          });
        } catch (e) {
          console.warn("Could not save file to draft", e);
        }
      }

      const draft: SavedDraft = {
        text: inputValue,
        fileName: selectedFile?.name,
        fileType: selectedFile?.type,
        fileBase64,
      };

      localStorage.setItem("integri_guest_draft", JSON.stringify(draft));
      setShowLoginModal(true);
    };

    // --- 2. DYNAMIC HEIGHT LOGIC (Refined) ---
    useEffect(() => {
      if (textareaRef.current) {
        // Reset to auto to calculate new scrollHeight
        textareaRef.current.style.height = "auto";
        const scrollHeight = textareaRef.current.scrollHeight;

        // Ensure a decent minimum height for the 'big' look is respected logically
        const maxHeight = 300;

        textareaRef.current.style.height = `${Math.min(
          scrollHeight,
          maxHeight
        )}px`;

        textareaRef.current.style.overflowY =
          scrollHeight > maxHeight ? "auto" : "hidden";
      }
    }, [inputValue]);

    // --- 3. CLOUD STORAGE ---
    const {
      handleGoogleDrivePick,
      handleOneDrivePick,
      isLoading: isCloudLoading,
    } = useCloudStorage((file) => {
      setSelectedFile(file);
      setShowAttachMenu(false);
    });

    // --- 4. POSITIONING LOGIC FOR PORTAL ---
    const updateMenuPosition = () => {
      if (buttonRef.current && showAttachMenu) {
        const rect = buttonRef.current.getBoundingClientRect();
        // Calculate position: align left with button, sit above button
        // 10px gap is roughly margin-bottom-2 (8px) + slop
        setMenuPosition({
          top: rect.top - 10,
          left: rect.left,
        });
      }
    };

    // Recalculate position when menu opens
    useLayoutEffect(() => {
      if (showAttachMenu) {
        updateMenuPosition();
      }
    }, [showAttachMenu]);

    // Close on resize to prevent floating menu in wrong place
    useEffect(() => {
      const handleResize = () => {
        if (showAttachMenu) setShowAttachMenu(false);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [showAttachMenu]);

    // Update scroll listener to reposition if user scrolls while menu is open
    useEffect(() => {
      const handleScroll = () => {
        if (showAttachMenu) updateMenuPosition();
      };
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }, [showAttachMenu]);

    // --- 5. CLICK OUTSIDE MENU (Updated for Portal) ---
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        // Check if click is inside the trigger button
        if (
          buttonRef.current &&
          buttonRef.current.contains(event.target as Node)
        ) {
          return;
        }
        // Check if click is inside the portal menu
        if (menuRef.current && menuRef.current.contains(event.target as Node)) {
          return;
        }

        // If neither, close the menu
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
      if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
        setShowAttachMenu(false);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          const pastedFile = items[i].getAsFile();
          if (pastedFile) {
            e.preventDefault();
            setSelectedFile(pastedFile);
            setShowAttachMenu(false);
            return;
          }
        }
      }
    };

    const handleSubmit = () => {
      if (!inputValue.trim() && !selectedFile) return;

      if (!user?.id) {
        saveDraftAndLogin();
        return;
      }

      onStartChat(inputValue, selectedFile);
      setInputValue("");
      setSelectedFile(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    const firstName = user?.name?.split(" ")[0] || "Friend";

    return (
      <div
        ref={ref}
        className={cn(
          // Layout: Flex Column with substantial min-height for the "Big Input" look
          "w-full relative group rounded-3xl transition-all duration-300 border shadow-sm flex flex-col justify-between",
          // Height: Starts big , grows with content
          "min-h-40",
          isDark
            ? "bg-[#121212] border-[#2A2B32] hover:border-gray-700"
            : "bg-gray-50 border-gray-200 hover:border-gray-300"
        )}
      >
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />

        {/* --- TOP SECTION: File Preview & Text Area --- */}
        <div className="flex flex-col w-full flex-1">
          {/* File Preview Bubble */}
          {selectedFile && (
            <div className="px-4 pt-3 pb-0 animate-in slide-in-from-bottom-2 fade-in">
              <div
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg w-fit text-sm font-medium border",
                  isDark
                    ? "bg-[#2A2B32] border-[#3A3B42] text-gray-200"
                    : "bg-white border-gray-200 text-gray-800"
                )}
              >
                {selectedFile.type.startsWith("image/") ? (
                  <ImageIcon size={16} className="text-blue-500" />
                ) : (
                  <FileText size={16} className="text-blue-500" />
                )}
                <span className="max-w-[150px] truncate">
                  {selectedFile.name}
                </span>
                <button
                  title="Remove File"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full ml-1"
                >
                  <XIcon size={14} />
                </button>
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
            placeholder={`Hey ${firstName} .......`}
            className={cn(
              "flex-1 w-full bg-transparent outline-none text-lg px-6 py-4 placeholder:text-gray-500/80 font-medium z-20 resize-none custom-scrollbar",
              // Ensure it fills the space but respects the bottom bar
              "min-h-20",
              isDark ? "text-gray-100" : "text-gray-900"
            )}
          />
        </div>

        {/* --- BOTTOM SECTION: Fixed Controls --- */}
        <div className="flex items-center justify-between w-full px-3 pb-3 pt-2">
          {/* LEFT: Attachment Menu Trigger */}
          <div className="relative">
            <input
              title="file"
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept=".jpg, .jpeg, .png, .gif, .pdf"
            />
            <button
              ref={buttonRef} // Reference for positioning logic
              title="Attach File"
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
                selectedFile && "text-blue-500"
              )}
            >
              <Paperclip size={20} strokeWidth={2.5} />
            </button>

            {/* PORTAL: Renders Menu into document.body */}
            {createPortal(
              <AnimatePresence>
                {showAttachMenu && menuPosition && (
                  <motion.div
                    ref={menuRef} // Reference for click-outside logic
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    style={{
                      position: "fixed",
                      top: menuPosition.top,
                      left: menuPosition.left,
                      // Adjust translateY to render *above* the calculated top (which is button top)
                      transform: "translateY(-100%)",
                    }}
                    className={cn(
                      "w-56 p-1.5 rounded-xl border shadow-xl backdrop-blur-md z-9999 overflow-hidden",
                      isDark
                        ? "bg-[#18181b]/95 border-gray-700"
                        : "bg-white/95 border-gray-200"
                    )}
                  >
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                        isDark
                          ? "hover:bg-white/10 text-gray-200"
                          : "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      <HardDrive size={18} className="text-emerald-500" />
                      Local Computer
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
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
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
                      </svg>
                      Google Drive
                    </button>
                    <button
                      onClick={handleOneDrivePick}
                      disabled={isCloudLoading}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
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
                      OneDrive
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
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                        isDark
                          ? "hover:bg-white/10 text-gray-200"
                          : "hover:bg-gray-100 text-gray-700"
                      )}
                    >
                      <PenTool size={18} className="text-purple-500" />
                      Draw Sketch
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body
            )}
          </div>

          {/* RIGHT: Send / Voice Button */}
          <div>
            {inputValue.trim().length > 0 || selectedFile ? (
              <button
                title="Send Message"
                onClick={handleSubmit}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-95 animate-in zoom-in duration-200 hover:cursor-pointer",
                  isDark
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-black text-white hover:bg-gray-800"
                )}
              >
                {isLoading || isCloudLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-black/30 border-t-black rounded-full dark:border-white/30 dark:border-t-white" />
                ) : (
                  <ArrowUp size={18} strokeWidth={3} />
                )}
              </button>
            ) : (
              <Link to="/voice">
                <button
                  title="Voice Input"
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
          </div>
        </div>

        {/* WHITEBOARD MODAL */}
        <WhiteboardModal
          isOpen={showWhiteboard}
          onClose={() => setShowWhiteboard(false)}
          onDone={(file) => {
            setSelectedFile(file);
            setShowWhiteboard(false);
          }}
          isDark={isDark}
        />
      </div>
    );
  }
);

WelcomeChatInput.displayName = "WelcomeChatInput";

export default WelcomeChatInput;
