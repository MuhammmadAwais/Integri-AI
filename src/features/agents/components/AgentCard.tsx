import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2,  Bot } from "lucide-react";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative flex flex-col p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg cursor-pointer",
        isDark
          ? "bg-[#121212] border-[#27272a] hover:border-blue-500/50 hover:bg-[#1a1a1d]"
          : "bg-white border-gray-200 hover:border-blue-200 hover:shadow-blue-500/5"
      )}
      onClick={() => navigate(`/agents/${agent.gpt_id}`)}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
          isDark
            ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white"
            : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
        )}
      >
        <Bot size={24} />
      </div>

      {/* Content */}
      <h3
        className={cn(
          "text-lg font-bold mb-2 truncate",
          isDark ? "text-white" : "text-gray-900"
        )}
      >
        {agent.name}
      </h3>
      <p
        className={cn(
          "text-sm line-clamp-3 mb-6 flex-1",
          isDark ? "text-gray-400" : "text-gray-500"
        )}
      >
        {agent.description || "No description provided."}
      </p>

      {/* Footer / Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-700/50">
        <span
          className={cn(
            "text-xs font-mono px-2 py-1 rounded",
            isDark ? "bg-[#222] text-gray-400" : "bg-gray-100 text-gray-600"
          )}
        >
          {agent.model}
        </span>

        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(agent)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDark
                ? "text-gray-400 hover:text-white hover:bg-[#333]"
                : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
            )}
            title="Edit"
          >
            <Edit2 size={16} />
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
              "p-2 rounded-lg transition-colors",
              isDark
                ? "text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                : "text-gray-400 hover:text-red-600 hover:bg-red-50"
            )}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AgentCard;
