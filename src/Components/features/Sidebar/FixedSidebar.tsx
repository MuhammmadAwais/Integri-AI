import React from "react";
import {
  Home,
  Search,
  SquareTerminal,
  Users,
  Bell
} from "lucide-react";
import { useAppSelector } from "../../hooks/useRedux";
import { cn } from "../../../utils/cn";
import UserProfile from "./UserProfile";

// exact Grok Navigation Items
const navItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "search", icon: Search, label: "Search" },
  { id: "grok", icon: SquareTerminal, label: "Grok" },
  { id: "communities", icon: Users, label: "Communities" },
  { id: "notifications", icon: Bell, label: "Notifications" },
];

interface FixedSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (id: string) => void;
}

const FixedSidebar: React.FC<FixedSidebarProps> = ({
  isExpanded,
  onToggle,
  activeTab,
  onTabChange,
}) => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  return (
    <div
      className={cn(
        "flex flex-col justify-between h-full py-2 border-r transition-all duration-300 ease-in-out z-40",
        isDark ? "bg-black border-[#2F3336]" : "bg-white border-gray-200",
        // Width: 68px (Collapsed) vs 275px (Expanded)
        isExpanded ? "w-[275px] px-4" : "w-[68px] items-center"
      )}
    >
      {/* --- TOP SECTION --- */}
      <div className="flex flex-col w-full">
        {/* Logo (X) */}
        <div className={cn("py-3 mb-2", !isExpanded && "flex justify-center")}>
          <div
            className={cn(
              "w-8 h-8 flex items-center justify-center text-2xl font-bold rounded-full transition-colors",
              isDark
                ? "text-white hover:bg-[#181818]"
                : "text-black hover:bg-gray-200"
            )}
          >
            𝕏
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center gap-5 p-3 rounded-full transition-colors duration-200 outline-none",
                isExpanded ? "w-full" : "w-[50px] h-[50px] justify-center",
                // Active State Styling (Bold text, no background change typically in Grok/X, just hover)
                activeTab === item.id ? "font-bold" : "font-normal",
                isDark
                  ? "text-[#E7E9EA] hover:bg-[#181818]"
                  : "text-black hover:bg-gray-100"
              )}
            >
              <item.icon
                size={26}
                strokeWidth={activeTab === item.id ? 3 : 2} // Thicker icon when active
              />

              {/* Label (Only visible when expanded) */}
              {isExpanded && (
                <span className="text-xl leading-6 mr-4">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* --- BOTTOM SECTION (Profile) --- */}
      <div className="w-full pb-2">
        <UserProfile isExpanded={isExpanded} onToggle={onToggle} />
      </div>
    </div>
  );
};

export default FixedSidebar;
