import React, { useState, useLayoutEffect, useRef } from "react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import { Plus } from "lucide-react";
import ChatInput from "../features/chat/components/ChatInput";
import PlaygroundLane from "../features/playground/components/PlaygroundLane";
import ModelMenu from "../Components/ui/ModelMenu";
import AVAILABLE_MODELS from "../../Constants";
import gsap from "gsap";

const Playground: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  const [activeModels, setActiveModels] = useState<any[]>([
    AVAILABLE_MODELS[0],
    AVAILABLE_MODELS.length > 1 ? AVAILABLE_MODELS[1] : AVAILABLE_MODELS[0],
  ]);

  // Added globalFile state
  const [globalPrompt, setGlobalPrompt] = useState("");
  const [globalFile, setGlobalFile] = useState<File | null>(null);
  const [triggerId, setTriggerId] = useState(0);
  const [showAddModel, setShowAddModel] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".playground-lane",
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [activeModels.length]);

  const handleAddModel = (modelId: string) => {
    const fullModel = AVAILABLE_MODELS.find((m) => m.id === modelId);
    if (fullModel) {
      setActiveModels((prev) => [...prev, fullModel]);
      setShowAddModel(false);
    }
  };

  // Updated to accept file
  const handleGlobalSend = (text: string, file?: File | null) => {
    if (!text.trim() && !file) return;
    setGlobalPrompt(text);
    setGlobalFile(file || null); // Store the file
    setTriggerId((prev) => prev + 1);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-[calc(100vh-64px)] relative overflow-hidden transition-colors duration-300",
        isDark ? "bg-[#09090b]" : "bg-white"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "px-6 py-3 border-b flex justify-between items-center shrink-0 z-20",
          isDark
            ? "bg-[#09090b]/80 border-zinc-800 backdrop-blur-md"
            : "bg-white/80 border-zinc-200 backdrop-blur-md"
        )}
      >
        <h1
          className={cn(
            "font-bold text-lg tracking-tight",
            isDark ? "text-zinc-100" : "text-zinc-900"
          )}
        >
          Playground
        </h1>

        <div className="relative">
          <button
            title="Add Model"
            onClick={() => setShowAddModel(true)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:cursor-pointer",
              isDark
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200"
            )}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Model</span>
          </button>

          <ModelMenu
            isOpen={showAddModel}
            onClose={() => setShowAddModel(false)}
            selected=""
            onSelect={handleAddModel}
            isDark={isDark}
            position="top"
          />
        </div>
      </div>

      {/* Lanes */}
      <div
        ref={containerRef}
        className={cn(
          "flex-1 flex flex-row flex-nowrap overflow-x-auto overflow-y-hidden p-4 gap-4 snap-x scroll-smooth items-stretch",
          isDark ? "scrollbar-track-[#09090b]" : "scrollbar-track-white"
        )}
      >
        {activeModels.map((model, idx) => (
          <div
            key={`${model.id}-${idx}`}
            className="playground-lane flex-1 min-w-[320px] max-w-full h-full snap-center shrink-0 transition-all duration-300 ease-in-out"
          >
            <PlaygroundLane
              model={model}
              onRemove={() =>
                setActiveModels((prev) => prev.filter((_, i) => i !== idx))
              }
              isDark={isDark}
              globalPrompt={globalPrompt}
              globalFile={globalFile} // Pass file here
              triggerId={triggerId}
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className={cn(
          "p-4 border-t z-20 shrink-0",
          isDark ? "border-zinc-800 bg-[#09090b]" : "border-zinc-200 bg-white"
        )}
      >
        <div className="max-w-4xl mx-auto">
          {/* onSend now correctly receives (text, file) */}
          <ChatInput onSend={handleGlobalSend} />
        </div>
      </div>
    </div>
  );
};

export default Playground;
