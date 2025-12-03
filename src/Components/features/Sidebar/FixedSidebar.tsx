import React from "react";
import { Home, History, Library, Settings, HelpCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import {
  setActiveSidebarTab,
  setContextSidebarOpen,
} from "../../../store/chatSlice";
import { cn } from "../../../utils/cn";

// --- 1. Define the Props Interface ---
interface SidebarIconProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  showTooltip: boolean;
  onClick: () => void;
}

// --- 2. Define the SidebarIcon Component ---
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
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
            : "bg-black text-white shadow-md"
          : isDark
          ? "text-gray-400 hover:bg-[#2A2B32] hover:text-white"
          : "text-gray-500 hover:bg-gray-100 hover:text-black"
      )}
    >
      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />

      {/* Tooltip Logic */}
      {showTooltip && (
        <span
          className={cn(
            "absolute left-14 px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-md",
            "translate-x-2 group-hover:translate-x-0 transition-transform",
            isDark ? "bg-gray-800 text-white" : "bg-gray-900 text-white"
          )}
        >
          {label}
        </span>
      )}
    </button>
  );
};

// --- 3. The Main FixedSidebar Component ---
const FixedSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useAppSelector((state) => state.chat.activeSidebarTab);
  const isContextOpen = useAppSelector(
    (state) => state.chat.isContextSidebarOpen
  );
  const isDark = useAppSelector((state) => state.theme.isDark);

  const handleNavigation = (
    path: string,
    tab: "home" | "history" | "library" | "settings"
  ) => {
    // 1. Navigate to the page
    if (path) navigate(path);

    // 2. Update Redux State
    dispatch(setActiveSidebarTab(tab));

    // 3. Smart Toggle Logic:
    // If we are already on this tab and the sidebar is open, close it (toggle).
    // Otherwise, ensure it opens.
    if (activeTab === tab && isContextOpen) {
      dispatch(setContextSidebarOpen(false));
    } else {
      dispatch(setContextSidebarOpen(true));
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between w-[72px] h-full py-6 border-r z-40 shrink-0 transition-colors duration-300 relative",
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
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg text-white font-bold text-lg mb-6 select-none cursor-pointer hover:scale-105 transition-transform"
        >
          AI
        </div>

        {/* Navigation Icons */}
        <SidebarIcon
          icon={Home}
          label="Home"
          isActive={
            location.pathname === "/" || location.pathname.startsWith("/chat")
          }
          showTooltip={!isContextOpen}
          onClick={() => handleNavigation("/", "home")}
        />
        <SidebarIcon
          icon={History}
          label="History"
          isActive={activeTab === "history"}
          showTooltip={!isContextOpen}
          onClick={() => {
            dispatch(setActiveSidebarTab("history"));
            if (!isContextOpen) dispatch(setContextSidebarOpen(true));
          }}
        />
        <SidebarIcon
          icon={Library}
          label="Library"
          isActive={location.pathname === "/library"}
          showTooltip={!isContextOpen}
          onClick={() => handleNavigation("/library", "library")}
        />
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-2 w-full items-center">
        <SidebarIcon
          icon={Settings}
          label="Settings"
          isActive={location.pathname === "/settings"}
          showTooltip={!isContextOpen}
          onClick={() => handleNavigation("/settings", "settings")}
        />

        <div className="w-8 h-[1px] bg-gray-200 dark:bg-gray-800 my-2" />

        {/* User Avatar */}
        <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all cursor-pointer">
          <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold text-xs">
            US
          </div>
        </button>
      </div>
    </div>
  );
};

export default FixedSidebar;
