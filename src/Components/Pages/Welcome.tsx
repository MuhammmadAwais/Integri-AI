import React, { useState, useRef, useLayoutEffect } from "react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../../utils/cn";
import {
  Paperclip,
  ArrowUp,
  Search,
  Image as ImageIcon,
  Users,
  Mic,
  AudioLines,
  Zap,
  ChevronDown,
  Sparkles,
  X as XIcon,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useAddChatMutation,
  useAddMessageMutation,
  useGetModelsQuery,
} from "../../store/apis/chatAPI";
import gsap from "gsap";
import ParticleBackground from "../ui/ParticleBackground";

// --- REASONING MENU ---
const ReasoningMenu = ({
  isOpen,
  onClose,
  selected,
  onSelect,
  isDark,
}: any) => {
  if (!isOpen) return null;
  const options = [
    {
      id: "Auto",
      label: "Auto",
      desc: "Chooses Fast or Expert",
      icon: RocketIcon,
    },
    { id: "Fast", label: "Fast", desc: "Quick responses", icon: Zap },
    { id: "Expert", label: "Expert", desc: "Thinks hard", icon: Sparkles },
  ];
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={cn(
          "absolute bottom-16 right-0 w-[260px] rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-100 p-2",
          isDark
            ? "bg-[#181818] border-[#2A2B32] text-gray-200"
            : "bg-white border-gray-200 text-gray-900"
        )}
      >
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => {
              onSelect(opt.id);
              onClose();
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
              isDark ? "hover:bg-[#2A2B32]" : "hover:bg-gray-100",
              selected === opt.id && (isDark ? "bg-[#2A2B32]" : "bg-gray-100")
            )}
          >
            <opt.icon
              size={18}
              className={isDark ? "text-gray-400" : "text-gray-600"}
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold">{opt.label}</span>
              <span className="text-xs opacity-50">{opt.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

// --- MODEL MENU ---
const ModelMenu = ({ isOpen, onClose, selected, onSelect, isDark }: any) => {
  const { data: models = [], isLoading } = useGetModelsQuery();
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={cn(
          "absolute bottom-16 right-16 w-[220px] rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-100 p-1.5",
          isDark
            ? "bg-[#181818] border-[#2A2B32] text-gray-200"
            : "bg-white border-gray-200 text-gray-900"
        )}
      >
        <div className="px-3 py-2 text-[10px] font-bold uppercase opacity-50 tracking-wider">
          System Models
        </div>
        {isLoading ? (
          <div className="px-3 py-2 text-xs opacity-50">Loading...</div>
        ) : models.length > 0 ? (
          models.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onSelect(m.id);
                onClose();
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors text-sm font-medium",
                isDark ? "hover:bg-[#2A2B32]" : "hover:bg-gray-100",
                selected === m.id && (isDark ? "bg-[#2A2B32]" : "bg-gray-100")
              )}
            >
              <span>{m.label || m.id}</span>
            </button>
          ))
        ) : (
          <div className="px-3 py-2 text-xs opacity-50">No models</div>
        )}
      </div>
    </>
  );
};

// --- MAIN WELCOME COMPONENT ---
const Welcome: React.FC = () => {
  const isDark = useAppSelector((state :any) => state.theme?.isDark);
  const user = useAppSelector((state) => state.auth?.user);

  // State
  const [inputValue, setInputValue] = useState("");
  const [reasoningMode, setReasoningMode] = useState("Auto");
  const [modelMode, setModelMode] = useState("grok-2");
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
  const [addChat] = useAddChatMutation();
  const [addMessage] = useAddMessageMutation();

  // --- FIXED ANIMATION LOGIC ---
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Using .fromTo prevents the "stuck at opacity: 0" glitch
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

      // Ensure focus sets after animation starts
      if (textInputRef.current) textInputRef.current.focus();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const startChat = async (text: string) => {
    if (!text.trim() && !selectedFile) return;
    if (!user || !user.id) return;

    const newChatId = crypto.randomUUID();
    let content = text;
    if (selectedFile) content = `[File: ${selectedFile.name}] ${text}`;

    try {
      await addChat({
        id: newChatId,
        userId: user.id,
        title: text.slice(0, 30) || "New Conversation",
        date: new Date().toISOString(),
        preview: content.slice(0, 50),
        model: modelMode,
      }).unwrap();

      await addMessage({
        id: crypto.randomUUID(),
        chatId: newChatId,
        role: "user",
        content: content,
        timestamp: Date.now(),
      }).unwrap();

      navigate(`/chat/${newChatId}`);
    } catch (error) {
      console.error("Failed to start chat:", error);
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
        "flex flex-col items-center justify-center h-full w-full relative overflow-hidden transition-colors duration-300 font-sans",
        isDark
          ? "bg-[#000000] selection:bg-gray-800 selection:text-white"
          : "bg-white selection:bg-blue-100 selection:text-black"
      )}
    >
      {/* BACKGROUND - z-0 */}
      <ParticleBackground />

      <input
      title="file"
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* CONTENT - z-10 */}
      <div className="w-full max-w-[720px] px-4 flex flex-col items-center -mt-16 z-10 relative">
        {/* LOGO */}
        <div
          ref={logoRef}
          className="mb-12 flex items-center justify-center gap-3 opacity-0"
        >
          <img src={isDark ? "/dark-theme-logo.png" : "/light-theme-logo.png"} alt="logo" className="w-8 h-8" />
          <h1
            className={cn(
              "text-4xl font-bold tracking-tight",
              isDark ? "text-white" : "text-black"
            )}
          >
            Integri AI
          </h1>
        </div>

        {/* INPUT CONTAINER */}
        <div
          ref={inputRef}
          className={cn(
            "w-full relative group rounded-4xl transition-all duration-300 border shadow-sm opacity-0",
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
          <ModelMenu
            isOpen={showModelMenu}
            onClose={() => setShowModelMenu(false)}
            selected={modelMode}
            onSelect={setModelMode}
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
                  <FileText size={16} />
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
                  "p-2.5 rounded-full transition-colors shrink-0 ml-1",
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
                  "flex-1 bg-transparent outline-none text-lg px-3 placeholder:text-gray-500/80 font-medium z-20",
                  isDark ? "text-gray-100" : "text-gray-900"
                )}
              />

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                title="Select Model"
                  onClick={() => setShowModelMenu(!showModelMenu)}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full transition-all",
                    isDark ? "hover:bg-white/10" : "hover:bg-black/5",
                    showModelMenu && "bg-white/10"
                  )}
                >
                  <GrokIconToggle isDark={isDark} />
                </button>

                <button
                  onClick={() => setShowReasoningMenu(!showReasoningMenu)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-sm font-semibold",
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
                      "w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-95 animate-in zoom-in duration-200",
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
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
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
          className="flex flex-wrap justify-center gap-2 mt-6 opacity-0"
        >
          {features.map((feat, idx) => (
            <button
              key={idx}
              onClick={() => startChat(feat.label)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold border transition-all duration-200",
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

// ICONS
const RocketIcon = ({ className, size = 16 }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
  </svg>
);
const GrokIconToggle = ({ isDark }: any) => (
  <div
    className={cn(
      "w-5 h-5 rounded flex items-center justify-center font-bold text-xs select-none border transition-colors",
      isDark
        ? "bg-[#1A1A1A] border-gray-600 text-gray-300"
        : "bg-gray-100 border-gray-300 text-gray-600"
    )}
  >
    G
  </div>
);



export default Welcome;
