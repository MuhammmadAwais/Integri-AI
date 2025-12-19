import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../../lib/utils";
import { X, Sparkles, Loader2, ChevronDown } from "lucide-react";
import MessageBubble from "../../../Components/ui/MessageBubble";
import { usePlaygroundLane } from "../hooks/usePlaygroundLane";
import ModelMenu from "../../../Components/ui/ModelMenu";

interface PlaygroundLaneProps {
  model: any;
  onRemove: () => void;
  onModelChange: (newId: string) => void;
  isDark: boolean;
  globalPrompt: string;
  triggerId: number;
}

const PlaygroundLane: React.FC<PlaygroundLaneProps> = ({
  model,
  onRemove,
  onModelChange,
  isDark,
  globalPrompt,
  triggerId,
}) => {
  const { messages, sendMessage, isStreaming, isLoading } = usePlaygroundLane({
    id: model.id,
    provider: model.provider,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef(0);
  const [showMenu, setShowMenu] = useState(false);

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
      sendMessage(globalPrompt);
    }
  }, [triggerId, globalPrompt, sendMessage]);

  return (
    <div
      className={cn(
        "flex flex-col border rounded-xl relative overflow-hidden transition-all duration-300 h-full",
        isDark
          ? "bg-[#1a1b26] border-[#2A2B32] shadow-xl"
          : "bg-white border-gray-200 shadow-sm hover:shadow-md"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "p-3 border-b flex justify-between items-center backdrop-blur-md z-10 shrink-0",
          isDark
            ? "bg-[#1a1b26]/90 border-[#2A2B32]"
            : "bg-white/90 border-gray-100"
        )}
      >
        <div className="flex items-center gap-3 relative">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 shrink-0">
            <Sparkles size={14} className="text-purple-400" />
          </div>

          <button
            onClick={() => setShowMenu(true)}
            className="text-left group flex items-center gap-2 hover:bg-white/5 p-1 rounded-lg transition"
          >
            <div>
              <h3
                className={cn(
                  "font-semibold text-sm truncate max-w-[120px]",
                  isDark ? "text-gray-100" : "text-gray-800"
                )}
              >
                {model.label || model.id}
              </h3>
              <p className="text-[10px] text-gray-500 capitalize">
                {model.provider}
              </p>
            </div>
            <ChevronDown
              size={12}
              className="text-gray-500 group-hover:text-gray-300"
            />
          </button>

          {/* Model Switcher for this Lane */}
          <ModelMenu
            isOpen={showMenu}
            onClose={() => setShowMenu(false)}
            selected={model.id}
            onSelect={onModelChange}
            isDark={isDark}
            position="top" // Drop DOWN since we are in a top header
          />
        </div>

        <button
          onClick={onRemove}
          className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded text-gray-400 transition-colors"
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
            <Loader2 className="animate-spin" size={20} />
            <span className="text-xs">Connecting...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 text-center px-6">
            <Sparkles size={20} className="mb-2" />
            <p className="text-xs font-medium">Ready</p>
          </div>
        ) : (
          messages.map((msg: any, idx: number) => (
            <MessageBubble key={idx} role={msg.role} content={msg.content} />
          ))
        )}
        {isStreaming && (
          <div className="text-xs text-gray-500 animate-pulse ml-2">
            Generating...
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaygroundLane;
