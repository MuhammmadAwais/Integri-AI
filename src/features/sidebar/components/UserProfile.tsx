import React from "react";
import { ChevronRight, ChevronLeft, MoreHorizontal } from "lucide-react";
import { useAppSelector } from "../../../hooks/useRedux";
import { cn } from "../../../lib/utils";
interface UserProfileProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isExpanded, onToggle }) => {
  const isDark = useAppSelector((state:any) => state.theme.isDark);
  const user = useAppSelector((state) => state.auth.user);

  // Mock Data
  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : "DU";
  const fullName = user?.name || "Danish Usman";
  const username = "@danishusman";

  return (
    <div
      className={cn(
        "flex items-center rounded-full transition-colors cursor-pointer relative group",
        isExpanded ? "p-3 hover:bg-[#181818]" : "justify-center p-0 mt-2"
      )}
    >
      {/* 1. Avatar */}
      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0 border border-black">
        {initials}
      </div>

      {/* 2. Text Info (Visible only when Expanded) */}
      <div
        className={cn(
          "flex-1 ml-3 overflow-hidden transition-opacity duration-200",
          isExpanded ? "opacity-100" : "opacity-0 w-0 hidden"
        )}
      >
        <p
          className={cn(
            "font-bold text-sm truncate",
            isDark ? "text-[#E7E9EA]" : "text-black"
          )}
        >
          {fullName}
        </p>
        <p className="text-[#71767B] text-sm truncate">{username}</p>
      </div>

      {/* 3. The "Dots" menu (Standard UI) */}
      {isExpanded && (
        <MoreHorizontal
          size={18}
          className={cn("ml-2", isDark ? "text-[#E7E9EA]" : "text-black")}
        />
      )}

      {/* 4. THE TOGGLE ARROW (Your Specific Request) 
         We place a small floating arrow button next to the profile to handle expansion.
      */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          "absolute flex items-center justify-center rounded-full transition-all duration-200 z-50",
          // Styling the arrow button
          isDark
            ? "bg-[#2F3336] text-white hover:bg-blue-500 border border-black"
            : "bg-white text-black border border-gray-200 hover:bg-blue-50",
          // Positioning:
          // If Expanded: Place it slightly outside or on the edge? Or replace the dots?
          // Let's place it to the right of the container for easy collapsing.
          isExpanded
            ? "right-2 top-[-15px] w-6 h-6 opacity-0 group-hover:opacity-100" // Hidden until you hover the profile area
            : "left-12 top-2 w-6 h-6 shadow-md" // Visible when collapsed so you can click to expand
        )}
      >
        {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </div>
  );
};

export default UserProfile;
