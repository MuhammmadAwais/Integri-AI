import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import {
  Paperclip,
  ArrowUp,
  Search,
  Image as ImageIcon,
  Users,
  Mic,
  AudioLines,
  ChevronDown,
  X as XIcon,
  FileText,
  HardDrive,
  Sparkles,
  ArrowRight,
  PenTool, // Added for Sketch Icon
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ChatService } from "../features/chat/services/chatService";
import gsap from "gsap";
import ParticleBackground from "../Components/ui/ParticleBackground";
import ReasoningMenu from "../Components/ui/ReasoningMenu";
import { RocketIcon } from "../Components/ui/ReasoningMenu";
import { useCloudStorage } from "../hooks/useCloudStorage";
import { AnimatePresence, motion } from "framer-motion";
import WhiteboardModal from "../Components/ui/WhiteboardModal"; // Import the modal
import SubscriptionOfferingCard from "../features/subscriptions/components/SubscriptionOfferingCard";

const WelcomePage: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme?.isDark);
  const { user, accessToken } = useAppSelector((state: any) => state.auth);

  // Model and Agent state from Redux
  const { newChatModel, selectedAgentId } = useAppSelector(
    (state: any) => state.chat
  );

  const [inputValue, setInputValue] = useState("");
  const [reasoningMode, setReasoningMode] = useState("Auto");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showReasoningMenu, setShowReasoningMenu] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false); // State for Whiteboard

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const userName = user?.name || "User";
  const names = userName.split(" ");
  const firstName = names.length > 1 ? names[0] : userName;

  // --- Cloud Storage Integration ---
  const {
    handleGoogleDrivePick,
    handleOneDrivePick,
    isLoading: isCloudLoading,
  } = useCloudStorage((file) => {
    setSelectedFile(file);
    setShowAttachMenu(false);
  });

  // Click Outside Listener for Attachment Menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- ANIMATION LOGIC ---
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        logoRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      )
        .fromTo(
          inputRef.current,
          { scale: 0.95, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(
          chipsRef.current,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=0.3"
        );

      if (textInputRef.current) textInputRef.current.focus();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setShowAttachMenu(false);
    }
  };

  const startChat = async (text: string) => {
    if ((!text.trim() && !selectedFile) || !accessToken) return;

    const currentModelId = newChatModel.id;

    // Check if we should route to PDF Chat
    if (selectedFile?.type === "application/pdf") {
      try {
        const newChatId = await ChatService.createChat(
          accessToken,
          currentModelId,
          selectedAgentId || undefined
        );
        navigate(`/chat/${newChatId}`, {
          state: {
            initialMessage: text || "Explain this",
            initialFile: selectedFile,
            file: selectedFile,
          },
        });
      } catch (error) {
        console.error(`Hey ${user?.name} Failed to start your chat:`, error);
      }
      return;
    }

    // Standard/Agent Chat Logic
    let content = text;
    if (selectedFile) content = `[File: ${selectedFile.name}] ${text}`;
    try {
      const newChatId = await ChatService.createChat(
        accessToken,
        currentModelId,
        selectedAgentId || undefined
      );
      navigate(`/chat/${newChatId}`, {
        state: {
          initialMessage: content,
          initialFile: selectedFile,
          model: currentModelId,
        },
      });
    } catch (error) {
      console.error(`Hey ${user?.name} Failed to start your chat:`, error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      startChat(inputValue);
    }
  };

  const features = [
    { icon: Search, label: "DeepSearch" },
    { icon: ImageIcon, label: "Create Image" },
    { icon: Users, label: "Pick Persons" },
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col items-center justify-center h-dvh w-full relative overflow-hidden transition-colors duration-300 font-sans",
        isDark
          ? "bg-[#000000] selection:bg-gray-800 selection:text-white"
          : "bg-white selection:bg-blue-100 selection:text-black"
      )}
    >
      <ParticleBackground />

   <SubscriptionOfferingCard />

      <input
        title="file"
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
        accept=".jpg, .jpeg, .png, .gif, .pdf"
      />

      {/* CONTENT */}
      <div className="w-full max-w-[720px] px-4 flex flex-col items-center -mt-16 z-10 relative">
        <div
          ref={logoRef}
          className="mb-18 flex items-center-safe justify-center "
        >
          <Link to="/">
            <h1
              className={cn(
                "text-5xl font-extrabold tracking-tight hover:cursor-pointer",
                isDark ? "text-white" : "text-black"
              )}
            >
              Integri
            </h1>
          </Link>
        </div>

        {/* INPUT CONTAINER */}
        <div
          ref={inputRef}
          className={cn(
            "w-full relative group rounded-4xl transition-all duration-300 border shadow-sm",
            isDark
              ? "bg-[#121212] border-[#2A2B32] hover:border-gray-700"
              : "bg-gray-50 border-gray-200 hover:border-gray-300"
          )}
        >
          <ReasoningMenu
            isOpen={showReasoningMenu}
            onClose={() => setShowReasoningMenu(false)}
            selected={reasoningMode}
            onSelect={setReasoningMode}
            isDark={isDark}
          />

          <div className="flex flex-col w-full">
            {/* File Preview */}
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

            <div className="relative flex items-center w-full p-2.5 min-h-[60px]">
              {/* ATTACHMENT MENU WRAPPER */}
              <div className="relative" ref={menuRef}>
                <button
                  title="Attach File"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className={cn(
                    "p-2.5 rounded-full transition-colors shrink-0 ml-1 hover:cursor-pointer",
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

                {/* POPUP MENU */}
                <AnimatePresence>
                  {showAttachMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className={cn(
                        "absolute bottom-full left-0 mb-2 w-56 p-1.5 rounded-xl border shadow-xl backdrop-blur-md z-50 overflow-hidden",
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

                      {/* --- NEW SKETCH BUTTON --- */}
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
                </AnimatePresence>
              </div>

              <input
                ref={textInputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Hey ${firstName || "Friend"} .......`}
                className={cn(
                  "flex-1 min-w-0 bg-transparent outline-none text-lg px-3 placeholder:text-gray-500/80 font-medium z-20",
                  isDark ? "text-gray-100" : "text-gray-900"
                )}
              />

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setShowReasoningMenu(!showReasoningMenu)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-sm font-semibold hover:cursor-pointer",
                    isDark
                      ? "text-gray-400 hover:text-gray-200 hover:bg-white/10"
                      : "text-gray-500 hover:text-black hover:bg-black/5"
                  )}
                >
                  <RocketIcon
                    size={14}
                    className={isDark ? "text-gray-400" : "text-gray-600"}
                  />
                  <span className="hidden sm:inline">{reasoningMode}</span>
                  <ChevronDown size={12} strokeWidth={3} />
                </button>

                <div
                  className={cn(
                    "w-px h-5 mx-1",
                    isDark ? "bg-gray-800" : "bg-gray-300"
                  )}
                />

                {inputValue.trim().length > 0 || selectedFile ? (
                  <button
                    title="Send Message"
                    onClick={() => startChat(inputValue)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-95 animate-in zoom-in duration-200 hover:cursor-pointer",
                      isDark
                        ? "bg-white text-black hover:bg-gray-200"
                        : "bg-black text-white hover:bg-gray-800"
                    )}
                  >
                    {isCloudLoading ? (
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
          </div>
        </div>

        {/* FEATURE CHIPS */}
        <div
          ref={chipsRef}
          className="flex flex-wrap justify-center gap-2 mt-6"
        >
          {features.map((feat, idx) => (
            <button
              key={idx}
              onClick={() => startChat(feat.label)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 hover:cursor-pointer",
                isDark
                  ? "bg-transparent border-[#2A2B32] text-gray-400 hover:text-white hover:bg-[#181818] hover:border-gray-600"
                  : "bg-white border-gray-200 text-gray-600 hover:text-black hover:bg-gray-50 hover:border-gray-300"
              )}
            >
              <feat.icon size={15} />
              <span>{feat.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 text-xs text-gray-500 opacity-60">
          All LLMs can make mistakes. Verify the information you receive.
        </div>
      </div>

      {/* --- WHITEBOARD MODAL (Rendered outside DOM hierarchy) --- */}
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
};

export default WelcomePage;
