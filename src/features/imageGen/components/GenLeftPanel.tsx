import React, { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  Wand2,
  Monitor,
  Box,
  Zap,
} from "lucide-react";
import ImageUploader from "./ImageUploader";
import { SettingsModal, OptionItem } from "./GenModals";

interface Props {
  isDark: boolean;
}

// CONSTANTS FOR MENUS
const MODELS = [
  {
    id: "integri-v1",
    label: "Integri Realism V1",
    desc: "Best for photorealism",
  },
  {
    id: "integri-anime",
    label: "Integri Anime V2",
    desc: "Specialized 2D styles",
  },
  { id: "gpt-4-dalle", label: "DALL-E 3", desc: "High coherence" },
  {
    id: "stable-diffusion-xl",
    label: "SDXL Lightning",
    desc: "Fast generation",
  },
];

const RATIOS = [
  { id: "1:1", label: "Square (1:1)", desc: "1024 x 1024" },
  { id: "16:9", label: "Landscape (16:9)", desc: "1920 x 1080" },
  { id: "9:16", label: "Portrait (9:16)", desc: "1080 x 1920" },
  { id: "4:3", label: "Classic (4:3)", desc: "1024 x 768" },
];

const RESOLUTIONS = [
  { id: "std", label: "Standard", desc: "Fastest" },
  { id: "hd", label: "HD Quality", desc: "Slower, more detail" },
  { id: "uhd", label: "UHD 4K", desc: "Maximum detail" },
];

const GenLeftPanel: React.FC<Props> = ({ isDark }) => {
  const [prompt, setPrompt] = useState("");

  // Settings State
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [selectedRatio, setSelectedRatio] = useState(RATIOS[0]);
  const [selectedRes, setSelectedRes] = useState(RESOLUTIONS[0]);

  // Modal Visibility State
  const [showModelModal, setShowModelModal] = useState(false);
  const [showRatioModal, setShowRatioModal] = useState(false);
  const [showResModal, setShowResModal] = useState(false);

  // Helper for setting button style
  const settingBtnClass = `flex items-center justify-between w-full p-4 rounded-xl border transition-all duration-200 group
    ${
      isDark
        ? "bg-gray-900 border-gray-800 text-white hover:border-gray-600"
        : "bg-white border-gray-200 text-gray-900 hover:border-gray-400 hover:shadow-sm"
    }`;

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* 1. Header */}
        <div>
          <h2
            className={`text-xl font-bold flex items-center gap-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            <Wand2 className="w-5 h-5" />
            Generator
          </h2>
          <p
            className={`text-sm mt-1 ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}
          >
            Configure your parameters below.
          </p>
        </div>

        {/* 2. Image Upload */}
        <ImageUploader isDark={isDark} />

        {/* 3. Prompt Input */}
        <div className="space-y-3">
          <label
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A minimalist living room with a large window overlooking a rainy cyberpunk city, cinematic lighting..."
            className={`w-full h-32 p-4 rounded-2xl resize-none text-sm outline-none transition-all border
              ${
                isDark
                  ? "bg-gray-900 border-gray-800 text-white placeholder-gray-600 focus:border-white/30"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-black/20"
              }`}
          />
        </div>

        {/* 4. Settings Triggers (Modals) */}
        <div className="space-y-4">
          <label
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Configuration
          </label>

          {/* Model Selector Trigger */}
          <button
            onClick={() => setShowModelModal(true)}
            className={settingBtnClass}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  isDark ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <Zap size={18} />
              </div>
              <div className="text-left">
                <div className="text-xs font-medium opacity-50">Model</div>
                <div className="text-sm font-semibold">
                  {selectedModel.label}
                </div>
              </div>
            </div>
            <ChevronDown size={16} className="opacity-50" />
          </button>

          {/* Ratio Selector Trigger */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowRatioModal(true)}
              className={`${settingBtnClass} p-3`}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1 opacity-50 text-xs font-medium">
                  <Box size={14} /> Aspect Ratio
                </div>
                <div className="text-sm font-semibold truncate">
                  {selectedRatio.label}
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowResModal(true)}
              className={`${settingBtnClass} p-3`}
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1 opacity-50 text-xs font-medium">
                  <Monitor size={14} /> Resolution
                </div>
                <div className="text-sm font-semibold truncate">
                  {selectedRes.label}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer / Generate Action */}
      <div
        className={`p-6 border-t ${
          isDark ? "border-gray-800 bg-black" : "border-gray-200 bg-white"
        }`}
      >
        <button
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-base transition-all transform active:scale-[0.98]
          ${
            isDark
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-black text-white hover:bg-gray-800 shadow-xl shadow-black/10"
          }`}
        >
          <Sparkles size={20} fill="currentColor" />
          Generate Image
        </button>
      </div>

      {/* --- MODALS --- */}

      {/* Model Modal */}
      <SettingsModal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        title="Select AI Model"
        isDark={isDark}
      >
        <div className="space-y-1">
          {MODELS.map((m) => (
            <OptionItem
              key={m.id}
              label={m.label}
              subLabel={m.desc}
              isSelected={selectedModel.id === m.id}
              onClick={() => {
                setSelectedModel(m);
                setShowModelModal(false);
              }}
              isDark={isDark}
            />
          ))}
        </div>
      </SettingsModal>

      {/* Aspect Ratio Modal */}
      <SettingsModal
        isOpen={showRatioModal}
        onClose={() => setShowRatioModal(false)}
        title="Aspect Ratio"
        isDark={isDark}
      >
        <div className="space-y-1">
          {RATIOS.map((r) => (
            <OptionItem
              key={r.id}
              label={r.label}
              subLabel={r.desc}
              isSelected={selectedRatio.id === r.id}
              onClick={() => {
                setSelectedRatio(r);
                setShowRatioModal(false);
              }}
              isDark={isDark}
            />
          ))}
        </div>
      </SettingsModal>

      {/* Resolution Modal */}
      <SettingsModal
        isOpen={showResModal}
        onClose={() => setShowResModal(false)}
        title="Quality & Resolution"
        isDark={isDark}
      >
        <div className="space-y-1">
          {RESOLUTIONS.map((r) => (
            <OptionItem
              key={r.id}
              label={r.label}
              subLabel={r.desc}
              isSelected={selectedRes.id === r.id}
              onClick={() => {
                setSelectedRes(r);
                setShowResModal(false);
              }}
              isDark={isDark}
            />
          ))}
        </div>
      </SettingsModal>
    </div>
  );
};

export default GenLeftPanel;
