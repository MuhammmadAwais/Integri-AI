import React from "react";
import { useAppSelector } from "../../hooks/useRedux";
import { cn } from "../../lib/utils";
import { Check, Bot, Sparkles } from "lucide-react";

interface AgentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedId: string | null;
  onSelect: (agent: any | null) => void;
  isDark: boolean;
}

const AgentMenu: React.FC<AgentMenuProps> = ({
  isOpen,
  onClose,
  selectedId,
  onSelect,
  isDark,
}) => {
  const { items: agents } = useAppSelector((state: any) => state.agents);
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for click-outside to close */}
      <div className="fixed inset-0 z-100 bg-transparent" onClick={onClose} />

      <div
        className={cn(
          "absolute top-full left-0 mt-2 w-64 p-2 rounded-xl border shadow-xl z-110 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200",
          isDark
            ? "bg-[#121212]/95 border-[#27272a]"
            : "bg-white/95 border-gray-200"
        )}
      >
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-500/10 mb-2">
          Select AI Agent
        </div>

        {/* Standard Chat Option (Selected when selectedId is null) */}
        <button
          onClick={() => {
            onSelect(null);
            onClose();
          }}
          className={cn(
            "w-full px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between mb-1 group",
            !selectedId
              ? isDark
                ? "bg-blue-500/10 text-blue-400"
                : "bg-blue-50 text-blue-600"
              : isDark
              ? "text-gray-300 hover:bg-white/5"
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <div className="flex items-center gap-2">
            <Bot
              size={16}
              className={!selectedId ? "text-blue-500" : "text-gray-400"}
            />
            <span className="font-medium">Standard Chat</span>
          </div>
          {!selectedId && <Check size={14} className="shrink-0" />}
        </button>

        {/* Custom Agents List */}
        {agents.map((agent: any) => {
          const isSelected = selectedId === agent.gpt_id;
          return (
            <button
              key={agent.gpt_id}
              onClick={() => {
                onSelect(agent);
                onClose();
              }}
              className={cn(
                "w-full px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between mb-1 group",
                isSelected
                  ? isDark
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                  : isDark
                  ? "text-gray-300 hover:bg-white/5 border border-transparent"
                  : "text-gray-700 hover:bg-gray-100 border border-transparent"
              )}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Sparkles
                  size={14}
                  className={
                    isSelected ? "text-indigo-500" : "text-gray-400 opacity-50"
                  }
                />
                <div className="flex flex-col items-start truncate">
                  <span className="font-medium truncate max-w-[140px]">
                    {agent.name}
                  </span>
                  <span className="text-[10px] opacity-60 uppercase">
                    {agent.model}
                  </span>
                </div>
              </div>
              {isSelected && <Check size={14} className="shrink-0 ml-2" />}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default AgentMenu;
