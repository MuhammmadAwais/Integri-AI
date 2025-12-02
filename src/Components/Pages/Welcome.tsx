import React from "react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../../utils/cn";
import ChatInput from "../Chat/ChatInput";

const cards = [
  { title: "Write a birthday wish", sub: "500 words for a close friend" },
  { title: "Help me plan a trip", sub: "Budget-friendly vacation ideas" },
  { title: "Explain a concept", sub: "Quantum physics in simple terms" },
  { title: "Write a story", sub: "Sci-fi adventure tale" },
];

const Welcome: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto">
      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-10">
        {/* Logo/Icon */}
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg",
            isDark ? "bg-[#2F3139] text-white" : "bg-white text-gray-900"
          )}
        >
          <span className="text-3xl">🤖</span>
        </div>

        <h1
          className={cn(
            "text-3xl font-bold mb-8",
            isDark ? "text-white" : "text-gray-900"
          )}
        >
          How can I help you today?
        </h1>

        {/* Suggestion Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
          {cards.map((card) => (
            <button
              key={card.title}
              className={cn(
                "text-left p-4 rounded-xl border transition-all duration-200",
                isDark
                  ? "border-gray-700 hover:bg-[#2A2B32] bg-[#212121]"
                  : "border-gray-200 hover:bg-gray-50 bg-white"
              )}
            >
              <h3
                className={cn(
                  "font-semibold text-sm mb-1",
                  isDark ? "text-gray-200" : "text-gray-800"
                )}
              >
                {card.title}
              </h3>
              <p
                className={cn(
                  "text-xs",
                  isDark ? "text-gray-500" : "text-gray-500"
                )}
              >
                {card.sub}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Area (Fixed at bottom of flex container) */}
      <div className="w-full pb-4">
        <ChatInput />
      </div>
    </div>
  );
};

export default Welcome;
