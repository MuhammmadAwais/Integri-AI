import React, { useState } from "react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import { Plus, LayoutGrid, Columns, Maximize2, Rows } from "lucide-react";
import ChatInput from "../features/chat/components/ChatInput";
import PlaygroundLane from "../features/playground/components/PlaygroundLane";
import AVAILABLE_MODELS from "../../Constants"; // Adjust path if needed

type LayoutMode = "1" | "2" | "3" | "4";

const Playground: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  // Default Models: Load first two available
  const [activeModels, setActiveModels] = useState<any[]>([
    AVAILABLE_MODELS[0],
    AVAILABLE_MODELS.length > 1 ? AVAILABLE_MODELS[1] : AVAILABLE_MODELS[0],
  ]);

  const [layoutMode, setLayoutMode] = useState<LayoutMode>("2");
  const [globalPrompt, setGlobalPrompt] = useState<string | undefined>(
    undefined
  );
  const [showModelMenu, setShowModelMenu] = useState(false);

  const handleAddModel = (model: any) => {
    setActiveModels((prev) => [...prev, model]);
    setShowModelMenu(false);
  };

  const handleGlobalSend = (text: string) => {
    setGlobalPrompt(undefined);
    // Small timeout to ensure prop change triggers effect
    setTimeout(() => setGlobalPrompt(text), 10);
  };

  const getGridClass = () => {
    // Force horizontal scroll if models overflow columns
    if (activeModels.length > Number(layoutMode)) {
      return "flex overflow-x-auto snap-x divide-x";
    }

    switch (layoutMode) {
      case "1":
        return "grid grid-cols-1";
      case "2":
        return "grid grid-cols-1 md:grid-cols-2 divide-x";
      case "3":
        return "grid grid-cols-1 md:grid-cols-3 divide-x";
      case "4":
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x";
      default:
        return "grid grid-cols-2 divide-x";
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full relative",
        isDark ? "bg-[#000]" : "bg-white"
      )}
    >
      {/* 1. Toolbar */}
      <div
        className={cn(
          "h-14 border-b flex items-center justify-between px-4 shrink-0 z-20",
          isDark ? "border-[#2A2B32] bg-[#181818]" : "border-gray-200 bg-white"
        )}
      >
        <div className="flex items-center gap-3">
          <h1
            className={cn(
              "font-bold text-sm hidden sm:block",
              isDark ? "text-white" : "text-black"
            )}
          >
            AI Playground
          </h1>

          {/* Add Model Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowModelMenu(!showModelMenu)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                isDark
                  ? "bg-[#2A2B32] hover:bg-[#3A3B42] text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-black"
              )}
            >
              <Plus size={14} />
              <span>Add Model</span>
            </button>

            {showModelMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowModelMenu(false)}
                />
                <div
                  className={cn(
                    "absolute top-full left-0 mt-2 w-52 rounded-xl shadow-xl border overflow-hidden z-20 max-h-80 overflow-y-auto",
                    isDark
                      ? "bg-[#1A1A1A] border-[#333]"
                      : "bg-white border-gray-200"
                  )}
                >
                  <div className="px-3 py-2 text-[10px] uppercase opacity-50 font-bold">
                    Select Model
                  </div>
                  {AVAILABLE_MODELS.map((m: any) => (
                    <button
                      key={m.id}
                      onClick={() => handleAddModel(m)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs hover:bg-opacity-10 flex justify-between",
                        isDark
                          ? "text-gray-200 hover:bg-white"
                          : "text-gray-700 hover:bg-black"
                      )}
                    >
                      <span>{m.label || m.name}</span>
                      <span className="opacity-50 text-[10px] uppercase">
                        {m.provider}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Layout Controls */}
        <div className="flex items-center gap-1 bg-opacity-10 rounded-lg p-1">
          <LayoutButton
            mode="1"
            icon={Maximize2}
            current={layoutMode}
            set={setLayoutMode}
            isDark={isDark}
          />
          <LayoutButton
            mode="2"
            icon={Columns}
            current={layoutMode}
            set={setLayoutMode}
            isDark={isDark}
          />
          <LayoutButton
            mode="3"
            icon={LayoutGrid}
            current={layoutMode}
            set={setLayoutMode}
            isDark={isDark}
          />
          <LayoutButton
            mode="4"
            icon={Rows}
            rotate
            current={layoutMode}
            set={setLayoutMode}
            isDark={isDark}
          />
        </div>
      </div>

      {/* 2. Main Grid */}
      <div
        className={cn(
          "flex-1 min-h-0 w-full",
          getGridClass(),
          isDark ? "divide-[#2A2B32]" : "divide-gray-200"
        )}
      >
        {activeModels.map((model, idx) => (
          <PlaygroundLane
            key={`${model.id}-${idx}`} // Unique key allows duplicates
            model={model}
            onRemove={() =>
              setActiveModels((prev) => prev.filter((_, i) => i !== idx))
            }
            isDark={isDark}
            globalPrompt={globalPrompt}
          />
        ))}
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
          <div className="text-center mt-2 text-[10px] text-gray-500">
            Broadcasting to {activeModels.length} active models.
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for Layout Buttons
const LayoutButton = ({
  mode,
  icon: Icon,
  current,
  set,
  isDark,
  rotate,
}: any) => (
  <button
    onClick={() => set(mode)}
    className={cn(
      "p-1.5 rounded transition-all",
      current === mode
        ? isDark
          ? "bg-[#333] text-white"
          : "bg-gray-200 text-black"
        : "text-gray-500 hover:text-gray-700"
    )}
    title={`${mode} columns`}
  >
    <Icon size={16} className={rotate ? "rotate-90" : ""} />
  </button>
);

export default Playground;
