import React from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { cn } from "../../utils/cn";
import { Sparkles, Compass, Lightbulb, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatInput from "../Chat/ChatInput";
import { createNewChat, addMessageToChat } from "../../store/chatSlice";

const cards = [
  {
    icon: Compass,
    title: "Plan a trip",
    sub: "I want to visit Japan on a budget",
    prompt: "Plan a 7-day budget trip to Japan.",
  },
  {
    icon: Lightbulb,
    title: "Explain concepts",
    sub: "Quantum physics for a 10 year old",
    prompt: "Explain quantum physics to a 10 year old.",
  },
  {
    icon: Sparkles,
    title: "Creative Writing",
    sub: "Write a sci-fi story about Mars",
    prompt: "Write a short sci-fi story about a colony on Mars.",
  },
  {
    icon: Code,
    title: "Debug Code",
    sub: "Find errors in this React component",
    prompt: "Help me find a bug in my React component.",
  },
];

const Welcome: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // --- LOGIC: Create Chat & Send Message Immediately ---
  const startChat = (text: string) => {
    const newChatId = Date.now().toString();

    // 1. Create the session
    dispatch(
      createNewChat({
        id: newChatId,
        title: "New Conversation",
      })
    );

    // 2. Add the user message immediately (This triggers the Title Rename in Redux)
    dispatch(
      addMessageToChat({
        chatId: newChatId,
        message: {
          id: Date.now().toString(),
          role: "user",
          content: text,
          timestamp: Date.now(),
        },
      })
    );

    // 3. Navigate to the new chat (it will load the message we just added)
    navigate(`/chat/${newChatId}`);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto relative overflow-hidden">
      {/* Background Glow (Pointer events none so it doesn't block clicks) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* --- SCROLLABLE CONTENT AREA --- */}
      {/* flex-1 and overflow-y-auto ensures this section scrolls on small screens, keeping input visible */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center z-10 custom-scrollbar">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-8 mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-2xl animate-bounce-slow">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1
            className={cn(
              "text-3xl md:text-5xl font-bold tracking-tight px-4",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            How can I help you today?
          </h1>
        </div>

        {/* Suggestion Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-4xl px-2">
          {cards.map((card, idx) => (
            <button
              key={idx}
              onClick={() => startChat(card.prompt)}
              className={cn(
                "group relative text-left p-4 md:p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer",
                isDark
                  ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50"
                  : "bg-white border-gray-100 hover:border-indigo-200 shadow-sm hover:shadow-indigo-100"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "p-2 md:p-3 rounded-lg shrink-0",
                    isDark ? "bg-white/10" : "bg-indigo-50 text-indigo-600"
                  )}
                >
                  <card.icon size={20} className="md:w-6 md:h-6" />
                </div>
                <div className="min-w-0">
                  {" "}
                  {/* min-w-0 forces text truncation if needed */}
                  <h3
                    className={cn(
                      "font-semibold mb-1 group-hover:text-indigo-500 transition-colors text-sm md:text-base",
                      isDark ? "text-gray-200" : "text-gray-800"
                    )}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={cn(
                      "text-xs md:text-sm line-clamp-2 opacity-80",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}
                  >
                    {card.sub}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* --- FIXED INPUT AREA --- */}
      {/* shrink-0 ensures this never gets squished or hidden */}
      <div
        className={cn(
          "w-full px-4 pb-6 pt-2 z-20 shrink-0",
          isDark
            ? "bg-linear-to-t from-[#212121] via-[#212121] to-transparent"
            : "bg-linear-to-t from-white via-white to-transparent"
        )}
      >
        <ChatInput onSend={(text) => startChat(text)} />
      </div>
    </div>
  );
};

export default Welcome;
