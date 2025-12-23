import React, { useState, useRef, useLayoutEffect } from "react";
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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ChatService } from "../features/chat/services/chatService";
import gsap from "gsap";
import ParticleBackground from "../Components/ui/ParticleBackground";
import ReasoningMenu from "../Components/ui/ReasoningMenu";
import { RocketIcon } from "../Components/ui/ReasoningMenu";
import ModelMenu from "../Components/ui/ModelMenu";
import AVAILABLE_MODELS from "../../Constants"; // Import constants to get labels

const WelcomePage: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme?.isDark);
  const { user, accessToken } = useAppSelector((state: any) => state.auth);
  const [inputValue, setInputValue] = useState("");
  const [reasoningMode, setReasoningMode] = useState("Auto");
  const [modelMode, setModelMode] = useState("gpt-5.1");
  const [showReasoningMenu, setShowReasoningMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Helper to get Label
  const selectedModelLabel =
    AVAILABLE_MODELS.find((m) => m.id === modelMode)?.label || modelMode;

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
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const startChat = async (text: string) => {
    if ((!text.trim() && !selectedFile) || !accessToken) return;
    let content = text;
    if (selectedFile) content = `[File: ${selectedFile.name}] ${text}`;
    try {
      const newChatId = await ChatService.createChat(accessToken, modelMode);
      navigate(`/chat/${newChatId}`, {
        state: {
          initialMessage: content,
          initialFile: selectedFile,
          model: modelMode,
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
    { icon: Mic, label: "Voice" },
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

      {/* --- NEW: TOP LEFT MODEL SELECTOR --- */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowModelMenu(!showModelMenu)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-lg font-semibold transition-all hover:cursor-pointer",
              isDark
                ? "text-gray-200 hover:bg-[#1A1A1A]"
                : "text-gray-700 hover:bg-gray-100",
              showModelMenu && (isDark ? "bg-[#1A1A1A]" : "bg-gray-100")
            )}
          >
            <span className="opacity-90">{selectedModelLabel}</span>
            <ChevronDown
              size={16}
              className={cn(
                "opacity-50 transition-transform duration-200",
                showModelMenu && "rotate-180"
              )}
            />
          </button>

          {/* Render Menu: Top-Left alignment */}
          <ModelMenu
            isOpen={showModelMenu}
            onClose={() => setShowModelMenu(false)}
            selected={modelMode}
            onSelect={setModelMode}
            isDark={isDark}
            position="top" // Open downwards
            align="left" // Align to left edge of button
          />
        </div>
      </div>

      <input
        title="file"
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* CONTENT */}
      <div className="w-full max-w-[720px] px-4 flex flex-col items-center -mt-16 z-10 relative">
        {/* LOGO */}
        <div
          ref={logoRef}
          className="mb-12 flex items-center justify-center gap-3"
        >
          <img
            src={isDark ? "/dark-theme-logo.png" : "/light-theme-logo.png"}
            alt="logo"
            className="w-8 h-8 hover:cursor-pointer"
          />
          <Link to="/">
            <h1
              className={cn(
                "text-4xl font-bold tracking-tight hover:cursor-pointer",
                isDark ? "text-white" : "text-black"
              )}
            >
              Integri AI
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
          {/* Reasoning Menu remains in Input */}
          <ReasoningMenu
            isOpen={showReasoningMenu}
            onClose={() => setShowReasoningMenu(false)}
            selected={reasoningMode}
            onSelect={setReasoningMode}
            isDark={isDark}
          />

          {/* REMOVED: ModelMenu from here */}

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
                  <FileText className="hover:cursor-pointer" size={16} />
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
              <button
                title="Attach File"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "p-2.5 rounded-full transition-colors shrink-0 ml-1 hover:cursor-pointer",
                  isDark
                    ? "text-gray-400 hover:text-white hover:bg-white/10"
                    : "text-gray-500 hover:text-black hover:bg-black/5",
                  selectedFile && "text-blue-500"
                )}
              >
                <Paperclip size={20} strokeWidth={2.5} />
              </button>

              <input
                ref={textInputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything you want..."
                className={cn(
                  "flex-1 min-w-0 bg-transparent outline-none text-lg px-3 placeholder:text-gray-500/80 font-medium z-20",
                  isDark ? "text-gray-100" : "text-gray-900"
                )}
              />

              <div className="flex items-center gap-1.5 shrink-0">
                {/* REMOVED: Model Menu Toggle Button from here */}

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
                    <ArrowUp size={18} strokeWidth={3} />
                  </button>
                ) : (
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
          Integri AI can make mistakes. Verify the information you receive.
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
