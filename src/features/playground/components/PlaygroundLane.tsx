import React, { useEffect, useRef } from "react";
import { cn } from "../../../lib/utils";
import { X, Sparkles, Loader2 } from "lucide-react";
import MessageBubble from "../../../Components/ui/MessageBubble";
import { usePlaygroundLane } from "../hooks/usePlaygroundLane";

interface PlaygroundLaneProps {
  model: any;
  onRemove: () => void;
  isDark: boolean;
  globalPrompt: string;
  globalFile?: File | null; // Added prop
  triggerId: number;
}

const PlaygroundLane: React.FC<PlaygroundLaneProps> = ({
  model,
  onRemove,
  isDark,
  globalPrompt,
  globalFile,
  triggerId,
}) => {
  const { messages, sendMessage, isStreaming, isLoading } = usePlaygroundLane({
    id: model.id,
    provider: model.provider,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef(triggerId);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Handle Global Trigger
  useEffect(() => {
    if (triggerId > 0 && triggerId !== lastTriggerRef.current) {
      lastTriggerRef.current = triggerId;
      // Pass both prompt and file to the hook
      sendMessage(globalPrompt, globalFile);
    }
  }, [triggerId, globalPrompt, globalFile, sendMessage]);
  
  return (
    <div
      className={cn(
        "flex flex-col border rounded-xl relative overflow-hidden transition-all duration-300 h-full",
        isDark
          ? "bg-[#121212] border-zinc-800 shadow-xl"
          : "bg-white border-zinc-200 shadow-sm"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "px-4 py-3 border-b flex justify-between items-center backdrop-blur-md z-10 shrink-0",
          isDark
            ? "bg-[#121212]/95 border-zinc-800"
            : "bg-white/95 border-zinc-100"
        )}
      >
        <div className="flex items-center gap-3 relative min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            <img
              src={model.gpt_id ? isDark ? `/dark-theme-custom-gpt.png` : `/light-theme-custom-gpt.png` : isDark ? `${model.dark_theme_logo}` : `${model.light_theme_logo}`}
              alt={model.label}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex flex-col justify-center">
            <h3
              className={cn(
                "font-semibold text-sm truncate leading-none mb-1",
                isDark ? "text-zinc-200" : "text-zinc-800"
              )}
            >
              {model.label || model.id}
            </h3>
            <p className="text-[10px] text-zinc-500 font-medium capitalize leading-none truncate">
              {model.alt_provider || model.provider}
            </p>
          </div>
        </div>

        <button
          title="Remove Lane"
          onClick={onRemove}
          className={cn(
            "p-1.5 ml-2 rounded transition-colors shrink-0 hover:cursor-pointer",
            isDark
              ? "text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
              : "text-zinc-400 hover:bg-red-50 hover:text-red-500"
          )}
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50 gap-2">
            <Loader2 className="animate-spin text-indigo-500" size={20} />
            <span className="text-xs text-zinc-500">Connecting...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 text-center px-6">
            <Sparkles size={20} className="mb-2 text-indigo-500" />
            <p className="text-xs font-medium text-zinc-500">Ready to chat</p>
          </div>
        ) : (
          messages.map((msg: any, idx: number) => (
            <MessageBubble
              key={idx}
              role={msg.role}
              content={msg.content}
              attachment={msg.attachment} // This triggers the preview
              isGeneratingImage={msg.isGeneratingImage} // Triggers the skeleton
            />
          ))
        )}
        {isStreaming && (
          <div className="text-xs text-zinc-500 animate-pulse ml-2 font-medium">
            Generating...
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaygroundLane;
