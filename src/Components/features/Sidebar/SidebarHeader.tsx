import React from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/useRedux";
import { cn } from "../../../utils/cn";
import ModelSelector from "./ModelSelector";

const SidebarHeader: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const navigate = useNavigate();

  const handleNewChat = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col pt-4 pb-2">
      {/* New Chat Button */}
      <div className="px-3 mb-4">
        <button
          onClick={handleNewChat}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 border text-left group",
            isDark
              ? "border-transparent bg-transparent hover:bg-[#2A2B32] text-gray-300 hover:text-white"
              : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
          )}
        >
          <div
            className={cn(
              "p-1 rounded-md transition-colors",
              isDark ? "bg-transparent group-hover:bg-gray-700" : "bg-gray-100"
            )}
          >
            <Plus className="w-5 h-5" />
          </div>
          <span className="font-medium text-sm">New chat</span>
        </button>
      </div>

      {/* Model Selector Dropdown */}
      <ModelSelector />
    </div>
  );
};

export default SidebarHeader;
