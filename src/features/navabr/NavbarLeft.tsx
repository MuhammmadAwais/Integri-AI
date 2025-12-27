// src/features/navabr/NavbarLeft.tsx
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { cn } from "../../lib/utils";
import { ChevronDown, Plus } from "lucide-react";
import ModelMenu from "../../Components/ui/ModelMenu";
import AVAILABLE_MODELS from "../../../Constants";
import { setNewChatModel, addPlaygroundModel } from "../chat/chatSlice";

const NavbarLeft: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((state) => state.theme.isDark);
  const { newChatModel } = useAppSelector((state) => state.chat);

  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Welcome Screen Selector
  if (location.pathname === "/") {
    const selectedModelLabel =
      AVAILABLE_MODELS.find((m) => m.id === newChatModel.id)?.label ||
      newChatModel.id;

    return (
      <div className="relative">
        <button
          onClick={() => setShowModelMenu(!showModelMenu)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl text-lg font-semibold transition-all hover:cursor-pointer",
            isDark
              ? "text-gray-200 hover:bg-[#1A1A1A]"
              : "text-gray-700 hover:bg-gray-100",
            showModelMenu && (isDark ? "bg-[#1A1A1A]" : "bg-gray-100")
          )}
        >
          <span className="opacity-90">{selectedModelLabel}</span>
          <ChevronDown
            size={16}
            className={cn(
              "opacity-50 transition-transform duration-200",
              showModelMenu && "rotate-180"
            )}
          />
        </button>

        <ModelMenu
          isOpen={showModelMenu}
          onClose={() => setShowModelMenu(false)}
          selected={newChatModel.id}
          onSelect={(id) => {
            const model = AVAILABLE_MODELS.find((m) => m.id === id);
            if (model)
              dispatch(
                setNewChatModel({ id: model.id, provider: model.provider })
              );
          }}
          isDark={isDark}
          position="top"
          align="left"
        />
      </div>
    );
  }

  // Playground Add Model Button
  if (location.pathname === "/playground") {
    return (
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className={cn(
            "p-2 rounded-lg transition-all flex items-center gap-2 hover:cursor-pointer",
            isDark
              ? "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800"
              : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
          )}
        >
          <Plus size={18} />
          <span className="text-sm font-medium">Add Model</span>
        </button>
        <ModelMenu
          isOpen={showAddMenu}
          onClose={() => setShowAddMenu(false)}
          selected=""
          onSelect={(id) => {
            const model = AVAILABLE_MODELS.find((m) => m.id === id);
            if (model) dispatch(addPlaygroundModel(model));
            setShowAddMenu(false);
          }}
          isDark={isDark}
          position="top"
          align="left"
        />
      </div>
    );
  }

  return null;
};

export default NavbarLeft;
