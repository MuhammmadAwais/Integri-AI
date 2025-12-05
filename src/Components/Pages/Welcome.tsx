import React, { useState } from "react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../../utils/cn";
import {
  Search,
  Image as ImageIcon,
  Users,
  Mic,
  Rocket,
  ArrowUp,
  Paperclip,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useAddChatMutation,
  useAddMessageMutation,
} from "../../store/apis/chatAPI";

const Welcome: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const user = useAppSelector((state) => state.auth?.user);

  // FIX: Get the currently selected model from Redux state
  const currentModel = useAppSelector((state) => state.chat.currentModel);

  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");

  const [addChat] = useAddChatMutation();
  const [addMessage] = useAddMessageMutation();

  const startChat = async (text: string) => {
    if (!text.trim()) return;

    const userId = user?.id || "guest";
    const newChatId = crypto.randomUUID();

    try {
      // 1. Create Chat with CORRECT Model
      await addChat({
        id: newChatId,
        userId: userId,
        title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
        date: new Date().toISOString(),
        preview: text.slice(0, 50),
        model: currentModel, // Use dynamic model
      }).unwrap();

      // 2. Create Initial Message
      await addMessage({
        id: crypto.randomUUID(),
        chatId: newChatId,
        role: "user",
        content: text,
        timestamp: Date.now(),
      }).unwrap();

      // 3. Navigate
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
    { icon: Users, label: "Pick Personas" },
    { icon: Mic, label: "Voice" },
  ];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-full w-full relative overflow-hidden transition-colors duration-300",
        isDark ? "bg-[#000000]" : "bg-white"
      )}
    >
      <div className="w-full max-w-[680px] px-4 flex flex-col items-center -mt-20">
        {/* Logo */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="w-12 h-12 relative flex items-center justify-center">
            <div
              className={cn(
                "absolute inset-0 border-[3px] rounded-full",
                isDark ? "border-white" : "border-black"
              )}
            ></div>
            <div
              className={cn(
                "w-0.5 h-5 rotate-45",
                isDark ? "bg-white" : "bg-black"
              )}
            ></div>
          </div>
          <h1
            className={cn(
              "text-4xl font-bold tracking-tight",
              isDark ? "text-white" : "text-black"
            )}
          >
            Integri AI
          </h1>
        </div>

        {/* Input Bar */}
        <div
          className={cn(
            "w-full relative group rounded-4xl transition-all duration-200",
            isDark ? "bg-[#181818]" : "bg-gray-100"
          )}
        >
          <div className="relative flex flex-col w-full p-4 min-h-14">
            <div className="flex items-center gap-3 w-full">
              <button
              title="Attach File"
                className={cn(
                  "p-1 rounded-full transition-colors",
                  isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-black"
                )}
              >
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What do you want to know?"
                className={cn(
                  "flex-1 bg-transparent outline-none text-lg placeholder:text-gray-500",
                  isDark ? "text-white" : "text-gray-900"
                )}
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between mt-4 pl-10">
              <div className="flex items-center gap-2">
                <button
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    isDark
                      ? "bg-[#2a2a2a] text-gray-200 hover:bg-[#333]"
                      : "bg-white border border-gray-200 text-gray-700"
                  )}
                >
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span>{currentModel.split("-")[0].toUpperCase()}</span>{" "}
                  {/* Display reduced model name */}
                </button>
                <button
                title="Use Voice Input"
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    isDark
                      ? "text-gray-400 hover:bg-[#2a2a2a]"
                      : "text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <Rocket size={12} />
                  <span>Auto</span>
                </button>
              </div>

              {inputValue && (
                <button
                  title="Send Message"
                  onClick={() => startChat(inputValue)}
                  className={cn(
                    "p-2 rounded-full",
                    isDark
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-black text-white hover:bg-gray-800"
                  )}
                >
                  <ArrowUp size={18} strokeWidth={3} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feature Chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {features.map((feat, idx) => (
            <button
              key={idx}
              onClick={() => startChat(feat.label)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                isDark
                  ? "bg-transparent border-gray-800 text-gray-400 hover:text-white hover:bg-gray-900 hover:border-gray-700"
                  : "bg-white border-gray-200 text-gray-600 hover:text-black hover:bg-gray-50"
              )}
            >
              <feat.icon size={16} />
              <span>{feat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Welcome;
