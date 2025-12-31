import React, { useState } from "react";
import { Sparkles, Wand2, Monitor, Box, Zap} from "lucide-react";
import ImageUploader from "./ImageUploader";
import GenDropdown from "./GenDropdown";
import AVAILABLE_MODELS from "../../../../Constants";
interface Props {
  isDark: boolean;
}
const MODEL_OPTIONS = AVAILABLE_MODELS.map((m) => ({
  id: m.id,
  label: m.label,
  desc:
    m.provider === "integri"
      ? "High-end photorealism"
      : `Powered by ${m.provider}`,
  badge: m.badge,
}));

const RATIOS = [
  { id: "1:1", label: "Square (1:1)", desc: "Social Media" },
  { id: "9:16", label: "Vertical (9:16)", desc: "Stories / Reels / Shorts" },
  { id: "16:9", label: "Landscape (16:9)", desc: "Cinematic / Youtube" },
  { id: "4:5", label: "Portrait (4:5)", desc: "Instagram Feed" },
  { id: "3:4", label: "Classic Portrait (3:4)", desc: "Print" },
];

const RESOLUTIONS = [
  { id: "std", label: "Standard", desc: "Fast generation" },
  { id: "hd", label: "HD Quality", desc: "Slower, more detail" },
  { id: "uhd", label: "Ultra HD 4K", desc: "Maximum quality" },
];

const GenLeftPanel: React.FC<Props> = ({ isDark }) => {
  const [prompt, setPrompt] = useState("");

  // Settings State
  const [selectedModel, setSelectedModel] = useState(
    MODEL_OPTIONS[0] || MODEL_OPTIONS[0]
  );
  const [selectedRatio, setSelectedRatio] = useState(RATIOS[1]); // Default to 9:16 as requested
  const [selectedRes, setSelectedRes] = useState(RESOLUTIONS[0]);

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* 1. Header */}
        <div>
          <h2
            className={`text-xl font-bold flex items-center gap-2 ${
              isDark ? "text-white" : "text-zinc-900"
            }`}
          >
            <Wand2 className="w-5 h-5" />
            Generator
          </h2>
          <p
            className={`text-sm mt-1 ${
              isDark ? "text-zinc-500" : "text-zinc-500"
            }`}
          >
            Create stunning visuals with AI.
          </p>
        </div>

        {/* 2. Model Selector */}
        <GenDropdown
          label="Model"
          value={selectedModel}
          options={MODEL_OPTIONS}
          onChange={setSelectedModel as any}
          isDark={isDark}
          icon={Zap}
        />

        {/* 3. Prompt Input */}
        <div className="space-y-2">
          <label
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            Prompt
          </label>
          <div
            className={`relative rounded-2xl border transition-all duration-200 
            ${
              isDark
                ? "bg-zinc-900 border-zinc-800 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600"
                : "bg-white border-zinc-200 focus-within:border-zinc-900 focus-within:ring-1 focus-within:ring-zinc-900"
            }`}
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your imagination... e.g., A cyberpunk street food vendor in Tokyo, neon lights, rain reflections, 8k..."
              className={`w-full h-32 p-4 bg-transparent border-none resize-none text-sm outline-none placeholder-zinc-500/50
                ${isDark ? "text-white" : "text-zinc-900"}`}
            />
            <div
              className={`absolute bottom-3 right-3 text-xs font-mono opacity-50 ${
                isDark ? "text-zinc-500" : "text-zinc-400"
              }`}
            >
              {prompt.length} chars
            </div>
          </div>
        </div>

        {/* 4. Aspect Ratio & Resolution */}
        <div className="grid grid-cols-2 gap-4">
          <GenDropdown
            label="Aspect Ratio"
            value={selectedRatio}
            options={RATIOS}
            onChange={setSelectedRatio as any}
            isDark={isDark}
            icon={Box}
          />
          <GenDropdown
            label="Resolution"
            value={selectedRes}
            options={RESOLUTIONS}
            onChange={setSelectedRes as any}
            isDark={isDark}
            icon={Monitor}
          />
        </div>

        {/* 5. Image Upload */}
        <ImageUploader isDark={isDark} />        
      </div>

      {/* Footer / Generate Action */}
      <div
        className={`p-6 border-t ${
          isDark ? "border-zinc-800 bg-black" : "border-zinc-200 bg-white"
        }`}
      >
        <button
          className={`hover:cursor-pointer w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm tracking-wide uppercase transition-all transform active:scale-[0.98] shadow-lg
          ${
            isDark
              ? "bg-white text-black hover:bg-zinc-200 shadow-zinc-900/20"
              : "bg-black text-white hover:bg-zinc-800 shadow-zinc-200/50"
          }`}
        >
          <Sparkles size={18} fill="currentColor" />
          Generate Image
        </button>
        
      </div>
    </div>
  );
};

export default GenLeftPanel;
