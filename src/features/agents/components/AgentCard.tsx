import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Bot, ArrowUpRight } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { Agent } from "../agentsSlice";

interface AgentCardProps {
  agent: Agent;
  isDark: boolean;
  onEdit: (agent: Agent) => void;
  onDelete: (id: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isDark,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative flex flex-col p-6 rounded-none border transition-all duration-300 cursor-pointer overflow-hidden",
        // Classic Bordered Look
        isDark
          ? "bg-black border-zinc-800 hover:border-zinc-500"
          : "bg-white border-zinc-200 hover:border-zinc-400 hover:shadow-xl"
      )}
      onClick={() => navigate(`/agents/${agent.gpt_id}`)}
    >
      {/* Top Row: Icon & Arrow */}
      <div className="flex justify-between items-start mb-6">
        <div
          className={cn(
            "w-10 h-10 flex items-center justify-center border transition-colors",
            isDark
              ? "bg-zinc-900 border-zinc-700 text-zinc-100 group-hover:bg-zinc-100 group-hover:text-black group-hover:border-white"
              : "bg-zinc-50 border-zinc-200 text-zinc-900 group-hover:bg-black group-hover:text-white group-hover:border-black"
          )}
        >
          <Bot size={20} strokeWidth={1.5} />
        </div>
        <ArrowUpRight
          size={18}
          className={cn(
            "transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1",
            isDark
              ? "text-zinc-600 group-hover:text-white"
              : "text-zinc-400 group-hover:text-black"
          )}
        />
      </div>

      {/* Content */}
      <h3
        className={cn(
          "text-xl font-bold mb-2 tracking-tight truncate",
          isDark ? "text-white" : "text-black"
        )}
      >
        {agent.name}
      </h3>
      <p
        className={cn(
          "text-sm leading-relaxed line-clamp-2 mb-8 flex-1",
          isDark ? "text-zinc-400" : "text-zinc-500"
        )}
      >
        {agent.description || "No description provided."}
      </p>

      {/* Footer / Meta & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800">
        <span
          className={cn(
            "text-[10px] uppercase tracking-widest font-bold px-2 py-1 border",
            isDark
              ? "bg-zinc-900 border-zinc-800 text-zinc-400"
              : "bg-zinc-50 border-zinc-200 text-zinc-600"
          )}
        >
          {agent.model}
        </span>

        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(agent)}
            className={cn(
              "p-1.5 transition-colors",
              isDark
                ? "text-zinc-500 hover:text-white"
                : "text-zinc-400 hover:text-black"
            )}
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete this agent?")
              ) {
                onDelete(agent.gpt_id);
              }
            }}
            className={cn(
              "p-1.5 transition-colors",
              isDark
                ? "text-zinc-500 hover:text-red-400"
                : "text-zinc-400 hover:text-red-600"
            )}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AgentCard;
