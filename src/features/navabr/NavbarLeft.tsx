import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";
import ModelMenu from "../../Components/ui/ModelMenu";
import AVAILABLE_MODELS from "../../../Constants";
import { setNewChatModel } from "../chat/chatSlice";

const NavbarLeft: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((state) => state.theme.isDark);
  const { newChatModel } = useAppSelector((state) => state.chat);

  const [showModelMenu, setShowModelMenu] = useState(false);

  // Only show on the Welcome Screen (Home page)
  if (location.pathname !== "/") return null;

  const selectedModelLabel =
    AVAILABLE_MODELS.find((m) => m.id === newChatModel.id)?.label ||
    newChatModel.id;

  const handleSelectModel = (id: string) => {
    const model = AVAILABLE_MODELS.find((m) => m.id === id);
    if (model) {
      dispatch(setNewChatModel({ id: model.id, provider: model.provider }));
    }
  };

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
        onSelect={handleSelectModel}
        isDark={isDark}
        position="top"
        align="left"
      />
    </div>
  );
};

export default NavbarLeft;
