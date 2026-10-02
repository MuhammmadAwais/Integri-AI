import React, { useState } from "react";
import { Bot, ChevronDown, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../hooks/useRedux";
import { cn } from "../../../lib/utils";
import { resolveModel } from "../../../../Constants";
import ModelMenu from "../../../Components/ui/ModelMenu";
import AgentMenu from "../../../Components/ui/AgentMenu";
import { setNewChatAgent, setNewChatModel } from "../chatSlice";
import type { Agent } from "../../agents/agentsSlice";

/**
 * Model + agent selection inside the composer (moved out of the top bar),
 * like Gemini's "Flash ▾" / ChatGPT's model pill. With an agent active the
 * pill shows the agent and an × to return to plain chat.
 */
const ComposerModelPicker: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.accessToken);
  const { newChatModel, selectedAgentId } = useAppSelector((state) => state.chat);
  const { items: agents, publicItems } = useAppSelector((state) => state.agents);
  const [menu, setMenu] = useState<"model" | "agent" | null>(null);

  const selectedAgent = [...(agents ?? []), ...(publicItems ?? [])].find(
    (a) => a.gpt_id === selectedAgentId
  );
  const model = resolveModel(newChatModel?.id);

  const pill = cn(
    "flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors hover:cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--integri-accent-600)",
    isDark ? "text-zinc-300 hover:bg-white/[0.06] hover:text-white" : "text-zinc-600 hover:bg-black/[0.04] hover:text-zinc-900"
  );

  return (
    <div className="flex items-center">
      {selectedAgent || selectedAgentId ? (
        <div className="relative flex items-center">
          <button type="button" onClick={() => setMenu(menu === "agent" ? null : "agent")} className={pill}>
            <Bot size={16} strokeWidth={1.75} className="text-(--integri-accent-600)" aria-hidden />
            <span className="max-w-[140px] truncate">{selectedAgent?.name ?? t("nav.agentActive")}</span>
          </button>
          <button
            type="button"
            onClick={() => dispatch(setNewChatAgent(null))}
            aria-label={t("chat.clearAgent", "Stop using this agent")}
            title={t("chat.clearAgent", "Stop using this agent")}
            className={cn(
              "-ml-1 flex h-7 w-7 items-center justify-center rounded-full hover:cursor-pointer",
              isDark ? "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200" : "text-zinc-400 hover:bg-black/[0.04] hover:text-zinc-700"
            )}
          >
            <X size={14} aria-hidden />
          </button>
          <AgentMenuAnchor isDark={isDark} open={menu === "agent"} onClose={() => setMenu(null)} token={token} selectedId={selectedAgentId} />
        </div>
      ) : (
        <>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenu(menu === "agent" ? null : "agent")}
              aria-label={t("nav.selectAgent")}
              title={t("nav.selectAgent")}
              className={cn(pill, "w-9 justify-center px-0")}
            >
              <Bot size={19} strokeWidth={1.75} aria-hidden />
            </button>
            <AgentMenuAnchor isDark={isDark} open={menu === "agent"} onClose={() => setMenu(null)} token={token} selectedId={selectedAgentId} />
          </div>
          <div className="relative">
            <button type="button" onClick={() => setMenu(menu === "model" ? null : "model")} className={pill} aria-haspopup="listbox">
              <img
                src={isDark ? model.dark_theme_logo : model.light_theme_logo}
                alt=""
                aria-hidden
                className="h-4 w-4 shrink-0 object-contain"
              />
              <span className="max-w-[140px] truncate">{model.label}</span>
              <ChevronDown size={14} strokeWidth={2} className={cn("transition-transform", menu === "model" && "rotate-180")} aria-hidden />
            </button>
            <ModelMenu
              isOpen={menu === "model"}
              onClose={() => setMenu(null)}
              selected={newChatModel?.id}
              isDark={isDark}
              position="top"
              align="right"
              onSelect={(id) => {
                const m = resolveModel(id);
                dispatch(setNewChatAgent(null));
                dispatch(setNewChatModel({ id: m.id, provider: m.provider }));
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

/** Shared agent menu wiring (same behaviour as the old navbar selector). */
const AgentMenuAnchor: React.FC<{
  isDark: boolean;
  open: boolean;
  onClose: () => void;
  token: string | null;
  selectedId: string | null;
}> = ({ isDark, open, onClose, token, selectedId }) => {
  const dispatch = useAppDispatch();
  return (
    <AgentMenu
      isOpen={open}
      onClose={onClose}
      selectedId={selectedId}
      isDark={isDark}
      token={token ?? ""}
      position="top"
      align="right"
      onSelect={(agent: Agent | null) => {
        dispatch(setNewChatAgent(agent ? agent.gpt_id : null));
        if (agent) {
          // List responses carry recommended_model; `model` is often absent.
          const m = resolveModel(agent.recommended_model || agent.model || "integri");
          dispatch(setNewChatModel({ id: m.id, provider: agent.recommended_provider || m.provider }));
        }
      }}
    />
  );
};

export default ComposerModelPicker;
