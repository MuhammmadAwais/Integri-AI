import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { cn } from "../../lib/utils";
import { ChevronDown, Plus, Sparkles, Mic, Captions } from "lucide-react"; // Added Captions icon
import ModelMenu from "../../Components/ui/ModelMenu";
import AgentMenu from "../../Components/ui/AgentMenu";
import VoiceModelMenu from "../voice/components/VoiceModelMenu";
import AVAILABLE_MODELS, { VOICE_MODELS } from "../../../Constants";
import {
  setNewChatModel,
  addPlaygroundModel,
  setNewChatAgent,
  setVoiceChatModel,
  setVoiceShowCaptions, // Import action
} from "../chat/chatSlice";

const NavbarLeft: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((state) => state.theme.isDark);
  const { token } = useAppSelector((state: any) => state.auth);

  const { newChatModel, selectedAgentId, voiceChatModel, voiceShowCaptions } =
    useAppSelector((state: any) => state.chat);
  const { items: agents } = useAppSelector((state: any) => state.agents);

  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddAgentMenu, setShowAddAgentMenu] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

  // --- Voice Page Logic ---
  if (location.pathname === "/voice") {
    const selectedVoiceModel =
      VOICE_MODELS.find((m) => m.id === voiceChatModel.id) || VOICE_MODELS[0];

    return (
      <div className="flex items-center gap-2 relative">
        {/* Model Selector */}
        <div className="relative hidden">
          <button
            onClick={() => setShowVoiceMenu(!showVoiceMenu)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all hover:cursor-pointer border ml-1 md:ml-0",
              isDark
                ? "border-white/10 text-gray-200 hover:bg-[#1A1A1A]"
                : "border-black/5 text-gray-700 hover:bg-gray-100"
            )}
          >
            <Mic size={14} className="opacity-70" />
            <span>{selectedVoiceModel.label}</span>
            <ChevronDown size={14} className="opacity-50" />
          </button>

          <VoiceModelMenu
            isOpen={showVoiceMenu}
            onClose={() => setShowVoiceMenu(false)}
            selectedId={voiceChatModel.id}
            isDark={isDark}
            position="top"
            align="left"
            onSelect={(id, provider) => {
              dispatch(setVoiceChatModel({ id, provider }));
              setShowVoiceMenu(false);
            }}
          />
        </div>

     

        {/* NEW: Toggle Captions Button */}
        <button
          onClick={() => dispatch(setVoiceShowCaptions(!voiceShowCaptions))}
          className={cn(
            "p-2 rounded-xl border transition-all hover:cursor-pointer relative group",
            voiceShowCaptions
              ? "bg-zinc-600 text-white border-zinc-500 shadow-lg shadow-indigo-500/20"
              : isDark
              ? "border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200"
              : "border-black/5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          )}
          title={voiceShowCaptions ? "Hide Captions" : "Show Captions"}
        >
          <Captions size={18} strokeWidth={voiceShowCaptions ? 2.5 : 2} />
        </button>
      </div>
    );
  }

  // ... (Rest of the component remains unchanged for Welcome/Playground) ...
  if (location.pathname === "/") {
    // Existing Welcome Screen code...
    const selectedAgent = agents.find((a: any) => a.gpt_id === selectedAgentId);
    const selectedModelLabel =
      AVAILABLE_MODELS.find((m) => m.id === newChatModel.id)?.label ||
      newChatModel.id;

    return (
      <div className="flex items-center gap-2 relative">
        <div className="relative">
          <button
            onClick={() => !selectedAgentId && setShowModelMenu(!showModelMenu)}
            className={cn(
              "flex items-center gap-2 px-2 py-2 rounded-xl text-xs md:text-md font-semibold transition-all hover:cursor-pointer border ml-1 md:ml-0",
              isDark
                ? "border-white/10 text-gray-200 hover:bg-[#1A1A1A]"
                : "border-black/5 text-gray-700 hover:bg-gray-100",
              selectedAgentId && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="opacity-90">
              {selectedAgentId ? "Agent Active" : selectedModelLabel}
            </span>
            {!selectedAgentId && <ChevronDown size={16} />}
          </button>

          <ModelMenu
            isOpen={showModelMenu}
            onClose={() => setShowModelMenu(false)}
            selected={newChatModel.id}
            isDark={isDark}
            position="top"
            align="left"
            onSelect={(id) => {
              const model = AVAILABLE_MODELS.find((m) => m.id === id);
              if (model) {
                dispatch(setNewChatAgent(null));
                dispatch(
                  setNewChatModel({ id: model.id, provider: model.provider })
                );
              }
            }}
          />
        </div>

        <div className="w-px h-6 bg-gray-500/20" />

        {/* Agent Selector */}
        <div className="relative">
          <button
            onClick={() => setShowAgentMenu(!showAgentMenu)}
            className={cn(
              "flex items-center gap-2 px-2 py-2 rounded-xl text-xs md:text-md font-semibold transition-all hover:cursor-pointer border",
              selectedAgentId
                ? "bg-zinc-600 text-white border-zinc-500 shadow-lg shadow-zinc-500/20"
                : isDark
                ? "border-white/10 text-gray-400 hover:bg-white/5"
                : "border-black/5 text-gray-600 hover:bg-black/5"
            )}
          >
            <Sparkles
              size={14}
              className={selectedAgentId ? "animate-pulse" : ""}
            />
            <span>{selectedAgent?.name || "Select Agent"}</span>
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform",
                showAgentMenu && "rotate-180"
              )}
            />
          </button>

          {/* FIX 2: Added position="top" so it drops DOWN instead of UP */}
          <AgentMenu
            isOpen={showAgentMenu}
            onClose={() => setShowAgentMenu(false)}
            selectedId={selectedAgentId}
            isDark={isDark}
            token={token}
            position="top"
            align="left"
            onSelect={(agent) => {
              dispatch(setNewChatAgent(agent ? agent.gpt_id : null));
              if (agent) {
                dispatch(
                  setNewChatModel({
                    id: agent.model,
                    provider: agent.recommended_provider || "openai",
                  })
                );
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (location.pathname === "/playground") {
    // Existing Playground code...
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className={cn(
              "p-2 px-3 rounded-lg transition-all flex items-center gap-2 hover:cursor-pointer",
              isDark
                ? "bg-zinc-800/50 text-zinc-400 hover:text-white"
                : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Plus size={16} />
            <span className="text-xs font-bold uppercase">Add Model</span>
          </button>
          <ModelMenu
            isOpen={showAddMenu}
            onClose={() => setShowAddMenu(false)}
            selected=""
            isDark={isDark}
            position="top"
            align="left"
            onSelect={(id) => {
              const model = AVAILABLE_MODELS.find((m) => m.id === id);
              if (model) dispatch(addPlaygroundModel(model));
              setShowAddMenu(false);
            }}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowAddAgentMenu(!showAddAgentMenu)}
            className={cn(
              "p-2 px-3 rounded-lg transition-all flex items-center gap-2 hover:cursor-pointer border border-dashed border-indigo-500/30",
              isDark
                ? "bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10"
                : "bg-indigo-50/50 text-indigo-600 hover:bg-indigo-50"
            )}
          >
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase">Add Agent</span>
          </button>

          <AgentMenu
            isOpen={showAddAgentMenu}
            onClose={() => setShowAddAgentMenu(false)}
            selectedId={null}
            isDark={isDark}
            token={token}
            position="top"
            align="left"
            onSelect={(agent) => {
              if (agent) {
                dispatch(
                  addPlaygroundModel({
                    id: agent.model,
                    label: agent.name,
                    provider: agent.recommended_provider || "openai",
                    gpt_id: agent.gpt_id,
                    instructions: agent.instructions,
                  })
                );
              }
              setShowAddAgentMenu(false);
            }}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default NavbarLeft;
