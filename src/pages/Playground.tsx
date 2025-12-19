import React, { useState } from "react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import { Plus } from "lucide-react";
import ChatInput from "../features/chat/components/ChatInput";
import PlaygroundLane from "../features/playground/components/PlaygroundLane";
import ModelMenu from "../Components/ui/ModelMenu";
import AVAILABLE_MODELS from "../../Constants";

const Playground: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  // Initialize with at least one model
  const [activeModels, setActiveModels] = useState<any[]>([
    AVAILABLE_MODELS[0],
    AVAILABLE_MODELS.length > 1 ? AVAILABLE_MODELS[1] : AVAILABLE_MODELS[0],
  ]);

  const [globalPrompt, setGlobalPrompt] = useState("");
  const [triggerId, setTriggerId] = useState(0); // Triggers the send in child components
  const [showAddModel, setShowAddModel] = useState(false);

  const handleAddModel = (modelId: string) => {
    const fullModel = AVAILABLE_MODELS.find((m) => m.id === modelId);
    if (fullModel) {
      setActiveModels((prev) => [...prev, fullModel]);
      setShowAddModel(false);
    }
  };

  const handleUpdateModel = (index: number, newId: string) => {
    const fullModel = AVAILABLE_MODELS.find((m) => m.id === newId);
    if (fullModel) {
      const next = [...activeModels];
      next[index] = fullModel;
      setActiveModels(next);
    }
  };

  const handleGlobalSend = (text: string) => {
    if (!text.trim()) return;
    setGlobalPrompt(text);
    setTriggerId((prev) => prev + 1);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-[calc(100vh-64px)] relative overflow-hidden transition-colors duration-300",
        isDark ? "bg-[#0a0a0a]" : "bg-gray-50"
      )}
    >
      {/* 1. Header Toolbar */}
      <div
        className={cn(
          "px-6 py-3 border-b flex justify-between items-center shrink-0 z-20",
          isDark
            ? "bg-[#0a0a0a]/80 border-[#2A2B32] backdrop-blur-md"
            : "bg-white/80 border-gray-200 backdrop-blur-md"
        )}
      >
        <h1
          className={cn(
            "font-bold text-lg",
            isDark ? "text-white" : "text-gray-900"
          )}
        >
          Playground
        </h1>

        {/* Add Model Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAddModel(true)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              isDark
                ? "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                : "bg-black/5 hover:bg-black/10 text-gray-700 border border-gray-200"
            )}
          >
            <Plus size={16} />
            <span>Add Model</span>
          </button>

          {/* Correctly positioned Model Selector */}
          <ModelMenu
            isOpen={showAddModel}
            onClose={() => setShowAddModel(false)}
            selected=""
            onSelect={handleAddModel}
            isDark={isDark}
            position="top" // Drop DOWN for header
          />
        </div>
      </div>

      {/* 2. Horizontal Scrolling Grid */}
      <div
        className={cn(
          // Flex container with scrolling
          "flex-1 flex overflow-x-auto overflow-y-hidden p-4 gap-4 snap-x scroll-smooth",
          // Scrollbar styling
          isDark ? "scrollbar-track-[#0a0a0a]" : "scrollbar-track-gray-50"
        )}
      >
        {activeModels.map((model, idx) => (
          <div
            key={`${model.id}-${idx}`}
            className="min-w-[350px] md:min-w-[400px] h-full snap-center"
          >
            <PlaygroundLane
              model={model}
              onRemove={() =>
                setActiveModels((prev) => prev.filter((_, i) => i !== idx))
              }
              onModelChange={(newId) => handleUpdateModel(idx, newId)}
              isDark={isDark}
              globalPrompt={globalPrompt}
              triggerId={triggerId}
            />
          </div>
        ))}

        {/* Empty State / Add Helper */}
        <div className="min-w-[100px] flex items-center justify-center opacity-50">
          <button
            onClick={() => setShowAddModel(true)}
            className="w-12 h-12 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center hover:border-purple-500 hover:text-purple-500 transition"
          >
            <Plus />
          </button>
        </div>
      </div>

      {/* 3. Footer Input */}
      <div
        className={cn(
          "p-4 border-t z-20 shrink-0",
          isDark ? "border-[#2A2B32] bg-[#000]" : "border-gray-200 bg-white"
        )}
      >
        <div className="max-w-4xl mx-auto">
          <ChatInput onSend={handleGlobalSend} />
        </div>
      </div>
    </div>
  );
};

export default Playground;
