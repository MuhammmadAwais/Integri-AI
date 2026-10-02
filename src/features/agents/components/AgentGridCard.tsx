import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, ArrowUpRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../hooks/useRedux";
import { resolveModel } from "../../../../Constants";
import { ChatService } from "../../chat/services/chatService";
import { setNewChatAgent } from "../../chat/chatSlice";
import { inferAgentCategory } from "../agentCategories";
import type { Agent } from "../agentsSlice";
import AgentCard, { type AgentCardAction } from "./AgentCard";

interface AgentGridCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (id: string) => void;
}

/** Binds an Agent record to the presentational AgentCard. */
const AgentGridCard: React.FC<AgentGridCardProps> = ({ agent, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.accessToken);
  const isDark = useAppSelector((state) => state.theme.isDark);
  const [starting, setStarting] = useState(false);

  const category = useMemo(
    () => inferAgentCategory(agent.name, agent.description),
    [agent.name, agent.description]
  );
  const modelId = agent.recommended_model || agent.model || "integri";
  const model = resolveModel(modelId);

  const openDetails = () => navigate(`/agents/${agent.gpt_id}`);

  // Same flow as the details page's "Start chat": new session bound to the
  // agent, seeded with one of its conversation starters.
  const startChat = async () => {
    if (!token) return openDetails(); // guests get the details page / login
    if (starting) return;
    setStarting(true);
    try {
      const starters = agent.conversation_starters ?? [];
      const initialMessage = starters.length
        ? starters[Math.floor(Math.random() * starters.length)]
        : undefined;
      dispatch(setNewChatAgent(agent.gpt_id));
      const sessionId = await ChatService.createChat(token, modelId, agent.gpt_id);
      navigate(`/chat/${sessionId}`, { state: { initialMessage } });
    } catch (error) {
      console.error("Failed to start agent chat:", error);
      openDetails();
    } finally {
      setStarting(false);
    }
  };

  const actions: AgentCardAction[] = [
    { label: "Details", icon: ArrowUpRight, onClick: openDetails },
  ];
  if (agent.is_owner !== false) {
    actions.unshift(
      { label: "Edit", icon: Pencil, onClick: () => onEdit(agent) },
      {
        label: "Delete",
        icon: Trash2,
        tone: "danger",
        onClick: () => {
          if (window.confirm("Are you sure you want to delete this agent?")) {
            onDelete(agent.gpt_id);
          }
        },
      }
    );
  }

  return (
    <AgentCard
      title={agent.name}
      description={agent.description}
      category={category.label}
      icon={category.icon}
      accentColor={category.accent}
      model={model.label}
      modelLogo={isDark ? model.dark_theme_logo : model.light_theme_logo}
      creator={agent.is_owner ? "You" : undefined}
      onSelect={openDetails}
      onPrimaryAction={startChat}
      primaryLoading={starting}
      actions={actions}
    />
  );
};

export default AgentGridCard;
