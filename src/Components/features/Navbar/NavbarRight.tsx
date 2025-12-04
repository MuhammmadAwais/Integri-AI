import React from "react";
import { Share2, Moon, Sun, MoreVertical} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toggleTheme } from "../../../store/themeSlice";
import { cn } from "../../../utils/cn";

// Reusable Action Button for consistency
const NavActionBtn = ({
  icon: Icon,
  onClick,
  label,
  active = false,
}: {
  icon: any;
  onClick: () => void;
  label?: string;
  active?: boolean;
}) => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "p-2 rounded-lg transition-colors flex items-center justify-center",
        isDark
          ? "text-gray-400 hover:text-white hover:bg-white/10"
          : "text-gray-600 hover:text-gray-900 hover:bg-black/5",
        active && (isDark ? "bg-white/10 text-white" : "bg-black/5 text-black")
      )}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};

const NavbarRight: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const dispatch = useAppDispatch();

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* 1. Theme Toggle */}
      <NavActionBtn
        icon={isDark ? Sun : Moon}
        label="Toggle Theme"
        onClick={() => dispatch(toggleTheme())}
      />

      {/* 2. Share Button (Visible on tablet+) */}
      <div className="hidden sm:block">
        <NavActionBtn
          icon={Share2}
          label="Share Chat"
          onClick={() => console.log("Share clicked")}
        />
      </div>

      {/* 3. Settings / Options (Three Dots) */}
      <NavActionBtn
        icon={MoreVertical}
        label="More Options"
        onClick={() => console.log("Settings clicked")}
      />

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

      {/* 4. User Profile / Logout */}
      <button
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ml-1",
          isDark ? "hover:bg-white/10" : "hover:bg-black/5"
        )}
      >
        <div className="w-7 h-7 rounded-full bg-linear-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs text-white font-bold ring-2 ring-transparent group-hover:ring-indigo-500">
          DA
        </div>
      </button>
    </div>
  );
};

export default NavbarRight;
