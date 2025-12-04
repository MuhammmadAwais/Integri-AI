import React from "react";
import { Home, History, Library, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import {
  setActiveSidebarTab,
  setContextSidebarOpen,
} from "../../../store/chatSlice";
import { cn } from "../../../utils/cn";

// --- Props & Component ---
interface SidebarIconProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  showTooltip: boolean;
  onClick: () => void;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({
  icon: Icon,
  label,
  isActive,
  showTooltip,
  onClick,
}) => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ease-out my-1 cursor-pointer",
        isActive
          ? isDark
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
            : "bg-black text-white shadow-md"
          : isDark
          ? "text-gray-400 hover:bg-[#2A2B32] hover:text-white"
          : "text-gray-500 hover:bg-gray-100 hover:text-black"
      )}
    >
      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />

      {showTooltip && (
        <span
          className={cn(
            "absolute left-14 px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-md",
            "translate-x-2 group-hover:translate-x-0 transition-transform duration-200", // Smooth slide-in
            isDark ? "bg-gray-800 text-white" : "bg-gray-900 text-white"
          )}
        >
          {label}
        </span>
      )}
    </button>
  );
};

// --- Main Component ---
const FixedSidebar: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useAppSelector((state) => state.chat.activeSidebarTab);
  const isContextOpen = useAppSelector(
    (state) => state.chat.isContextSidebarOpen
  );

  // Helper to handle navigation + state + drawer logic
  const handleNav = (
    tab: "home" | "history" | "library" | "settings",
    path: string
  ) => {
    // 1. Navigate first (Ensures page content changes immediately)
    if (location.pathname !== path) {
      navigate(path);
    }

    // 2. Logic: If clicking the ALREADY active tab, toggle the drawer
    if (activeTab === tab) {
      dispatch(setContextSidebarOpen(!isContextOpen));
      return;
    }

    // 3. Otherwise, set active tab and FORCE open the drawer
    dispatch(setActiveSidebarTab(tab));
    dispatch(setContextSidebarOpen(true));
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between w-[72px] h-full py-6 border-r z-40 shrink-0 relative transition-colors duration-300",
        isDark
          ? "bg-[#171717] border-[#2A2B32]"
          : "bg-[#F9F9FA] border-gray-200"
      )}
    >
      {/* Top Section */}
      <div className="flex flex-col items-center w-full gap-2">
        {/* App Logo */}
        <div
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg text-white font-bold text-lg mb-6 cursor-pointer hover:scale-105 transition-transform"
        >
          AI
        </div>

        {/* HOME */}
        <SidebarIcon
          icon={Home}
          label="Home"
          isActive={
            activeTab === "home" &&
            (location.pathname === "/" || location.pathname.startsWith("/chat"))
          }
          showTooltip={!isContextOpen}
          onClick={() => handleNav("home", "/")}
        />

        {/* HISTORY */}
        <SidebarIcon
          icon={History}
          label="History"
          isActive={activeTab === "history" || location.pathname === "/history"}
          showTooltip={!isContextOpen}
          onClick={() => handleNav("history", "/history")}
        />

        {/* LIBRARY */}
        <SidebarIcon
          icon={Library}
          label="Library"
          isActive={activeTab === "library" || location.pathname === "/library"}
          showTooltip={!isContextOpen}
          onClick={() => handleNav("library", "/library")}
        />
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-2 w-full items-center">
        <SidebarIcon
          icon={Settings}
          label="Settings"
          isActive={
            activeTab === "settings" || location.pathname === "/settings"
          }
          showTooltip={!isContextOpen}
          onClick={() => handleNav("settings", "/settings")}
        />
      </div>
    </div>
  );
};

export default FixedSidebar;
