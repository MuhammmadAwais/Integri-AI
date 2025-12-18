import React, { useEffect, useRef } from "react";
import { cn } from "../../../lib/utils";
import { X, Bot, Loader2, Sparkles } from "lucide-react";
import MessageBubble from "../../../Components/ui/MessageBubble";
import { usePlaygroundLane } from "../hooks/usePlaygroundLane";

interface PlaygroundLaneProps {
  model: {
    id: string;
    name?: string;
    label?: string;
    provider: string;
    badge?: string;
  };
  onRemove: () => void;
  isDark: boolean;
  globalPrompt?: string;
  onPromptHandled?: () => void;
}

const PlaygroundLane: React.FC<PlaygroundLaneProps> = ({
  model,
  onRemove,
  isDark,
  globalPrompt,
  onPromptHandled,
}) => {
  // Use the rewritten hook
  const { messages, sendMessage, isStreaming, isLoading } = usePlaygroundLane({
    id: model.id,
    provider: model.provider,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastPromptRef = useRef<string | null>(null);

  // Auto-scroll on new tokens
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Listen to Global Prompt Trigger
  useEffect(() => {
    if (globalPrompt && globalPrompt !== lastPromptRef.current) {
      sendMessage(globalPrompt);
      lastPromptRef.current = globalPrompt;
      onPromptHandled?.();
    }
  }, [globalPrompt]);

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r last:border-r-0 min-w-[320px] relative transition-all snap-start",
        isDark ? "border-[#2A2B32] bg-[#121212]" : "border-gray-200 bg-white"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-3 border-b shrink-0",
          isDark
            ? "border-[#2A2B32] bg-[#181818]"
            : "border-gray-100 bg-gray-50"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Bot size={16} />
          </div>
          <div>
            <div
              className={cn(
                "text-xs font-bold",
                isDark ? "text-white" : "text-black"
              )}
            >
              {model.label || model.name}
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-[9px] uppercase tracking-wider font-semibold opacity-50",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                {model.provider}
              </span>
              {model.badge && (
                <span className="text-[8px] bg-indigo-500/20 text-indigo-500 px-1 rounded font-bold">
                  {model.badge}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
        title="remove"
          onClick={onRemove}
          className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded text-gray-400 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50 gap-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-xs">Initializing Session...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 text-center px-6">
            <div className="w-12 h-12 bg-gray-500/10 rounded-2xl flex items-center justify-center mb-3">
              <Sparkles size={20} />
            </div>
            <p className="text-xs font-medium">
              Ready to chat with {model.name}
            </p>
          </div>
        ) : (
          messages.map((msg: any, idx: number) => (
            <MessageBubble
              key={idx}
              role={msg.role}
              content={msg.content}
              isLoading={
                idx === messages.length - 1 &&
                msg.role === "assistant" &&
                isStreaming
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PlaygroundLane;
