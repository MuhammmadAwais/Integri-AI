import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { cn } from "../../lib/utils";
import { ChevronDown, Plus, Sparkles, Mic, Captions } from "lucide-react"; // Added Captions icon
import ModelMenu from "../../Components/ui/ModelMenu";
import AgentMenu from "../../Components/ui/AgentMenu";
import VoiceModelMenu from "../voice/components/VoiceModelMenu";
import { useSubscription } from "../subscriptions/hooks/useSubscription";
import { VOICE_MODELS, resolveModel } from "../../../Constants";
import {
  addPlaygroundModel,
  setVoiceChatModel,
  setVoiceShowCaptions, // Import action
} from "../chat/chatSlice";
import SubscribeModal from "../subscriptions/components/SubscribeModal";

const NavbarLeft: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const isDark = useAppSelector((state) => state.theme.isDark);
  const { playgroundModels } = useAppSelector((state: any) => state.chat);
  const { multiChatLimit } = useSubscription();
  const { token } = useAppSelector((state: any) => state.auth);

  const { voiceChatModel, voiceShowCaptions } = useAppSelector((state: any) => state.chat);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddAgentMenu, setShowAddAgentMenu] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

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
                ? "border-white/10 text-gray-200 hover:bg-[#18161C]"
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
            "p-2 rounded-xl border transition-all hover:cursor-pointer relative group sm:m-0 ml-10 ",
            voiceShowCaptions
              ? "bg-zinc-600 text-white border-zinc-500 shadow-lg shadow-indigo-500/20"
              : isDark
              ? "border-white/10 text-gray-400 hover:bg-white/5 hover:text-gray-200"
              : "border-black/5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          )}
          title={voiceShowCaptions ? t("nav.hideCaptions") : t("nav.showCaptions")}
        >
          <Captions size={18} strokeWidth={voiceShowCaptions ? 2.5 : 2} />
        </button>
      </div>
    );
  }

  // Welcome ("/"): model and agent pickers live in the composer
  // (ComposerModelPicker), so the top bar stays empty there.

  if (location.pathname === "/playground") {
    // Existing Playground code...
    return (
      <>
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
              <span className="text-xs font-bold uppercase">
                {t("nav.addModel")}
              </span>
            </button>
            <ModelMenu
              isOpen={showAddMenu}
              onClose={() => setShowAddMenu(false)}
              selected=""
              isDark={isDark}
              position="top"
              align="left"
              onSelect={(id) => {
                if (playgroundModels.length >= multiChatLimit) {
                  setShowLimitModal(true);
                  return;
                }
                dispatch(addPlaygroundModel(resolveModel(id)));
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
              <span className="text-xs font-bold uppercase">
                {t("nav.addAgent")}
              </span>
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
                  if (playgroundModels.length >= multiChatLimit) {
                    setShowLimitModal(true);
                    return;
                  }
                  dispatch(
                    addPlaygroundModel({
                      id: agent.recommended_model || agent.model || "integri",
                      label: agent.name,
                      provider:
                        agent.recommended_provider ||
                        resolveModel(agent.recommended_model || agent.model).provider,
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

        <SubscribeModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          featureName="Multi-Chat"
        />
      </>
    );
  }

  return null;
};

export default NavbarLeft;
