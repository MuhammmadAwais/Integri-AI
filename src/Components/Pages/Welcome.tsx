import React from "react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../../utils/cn";
import { Sparkles, Compass, Lightbulb, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatInput from "../Chat/ChatInput"; // Ensure path is correct

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

  const handleCardClick = (prompt: string) => {
    // Navigate to a new chat with the prompt (Mocking ID for now)
    const newChatId = Date.now().toString();
    navigate(`/chat/${newChatId}?initial=${encodeURIComponent(prompt)}`);
  };

  const handleInputSend = (text: string) => {
    const newChatId = Date.now().toString();
    navigate(`/chat/${newChatId}?initial=${encodeURIComponent(text)}`);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-12 z-10">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl mb-4 animate-bounce-slow">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1
            className={cn(
              "text-4xl md:text-5xl font-bold tracking-tight",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            How can I help you today?
          </h1>
        </div>

        {/* Interactive Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl">
          {cards.map((card, idx) => (
            <button
              key={idx}
              onClick={() => handleCardClick(card.prompt)}
              className={cn(
                "group relative text-left p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                isDark
                  ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50"
                  : "bg-white border-gray-100 hover:border-indigo-200 shadow-sm hover:shadow-indigo-100"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "p-3 rounded-lg",
                    isDark ? "bg-white/10" : "bg-indigo-50 text-indigo-600"
                  )}
                >
                  <card.icon size={24} />
                </div>
                <div>
                  <h3
                    className={cn(
                      "font-semibold mb-1 group-hover:text-indigo-500 transition-colors",
                      isDark ? "text-gray-200" : "text-gray-800"
                    )}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={cn(
                      "text-sm line-clamp-1",
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

      {/* Input Area */}
      <div className="w-full pb-8 px-4 z-20">
        <ChatInput onSend={handleInputSend} />
      </div>
    </div>
  );
};

export default Welcome;
