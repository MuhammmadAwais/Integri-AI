import React, { useState } from "react";
import { Sparkles, Wand2, Monitor, Box} from "lucide-react";
import ImageUploader from "./ImageUploader";
import GenDropdown from "./GenDropdown";
import { useAppSelector } from "../../../hooks/useRedux";
import LoginModal from "../../auth/components/LoginModal";

interface Props {
  isDark: boolean;
  isGenerating: boolean;
  onGenerate: (params: {
    model: any;
    prompt: string;
    ratio: any;
    res: any;
    file: File | null;
  }) => void;
}

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

const MODEL_OPTIONS = [ {
    id: "gpt-5.1",
    label: "GPT-5.1",
    provider: "openai",
    badge: "New",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPremium: true,
  },];
const GenLeftPanel: React.FC<Props> = ({
  isDark,
  isGenerating,
  onGenerate,
}) => {
  const user = useAppSelector((state: any) => state.auth.user);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0]);
  const [selectedRatio, setSelectedRatio] = useState(RATIOS[1]);
  const [selectedRes, setSelectedRes] = useState(RESOLUTIONS[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const handleGenerate = () => {
    if (!user) {
      setShowLoginModal(true)
      return
    }
    if (!prompt.trim()) return;
    onGenerate({
      model: selectedModel,
      prompt,
      ratio: selectedRatio,
      res: selectedRes,
      file: selectedFile,
    });
  };
{setSelectedModel;} //FOR VERCEL UNUSED VARIABLE WARNING (SUPPRESS)
  return (
    <div className="flex flex-col h-full font-sans">
        <LoginModal
              isOpen={showLoginModal}
              onClose={() => setShowLoginModal(false)}
            />
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
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

        <div className="space-y-2">
          <label
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            Prompt
          </label>
          <div
            className={`relative rounded-2xl border transition-all duration-200 ${
              isDark
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-zinc-200"
            }`}
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your imagination..."
              className={`w-full h-32 p-4 bg-transparent border-none resize-none text-sm outline-none placeholder-zinc-500/50 ${
                isDark ? "text-white" : "text-zinc-900"
              }`}
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

        <ImageUploader isDark={isDark} onFileChange={setSelectedFile} />
      </div>

      <div
        className={`p-6 border-t ${
          isDark ? "border-zinc-800 bg-black" : "border-zinc-200 bg-white"
        }`}
      >
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={`hover:cursor-pointer w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm tracking-wide uppercase transition-all transform active:scale-[0.98] shadow-lg
          ${
            isDark
              ? "bg-white text-black hover:bg-zinc-200"
              : "bg-black text-white hover:bg-zinc-800"
          }
          ${
            isGenerating || !prompt.trim()
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <Sparkles size={18} fill="currentColor" />
          {isGenerating ? "Generating..." : "Generate Image"}
        </button>
      </div>
    </div>
  );
};

export default GenLeftPanel;
