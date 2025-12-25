import React from "react";
import { Moon, Sun, MessageSquarePlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toggleTheme } from "../theme/themeSlice";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

const NavActionBtn = ({ icon: Icon, onClick, label, active = false }: any) => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer",
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
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 sm:gap-2 relative">
      {/* New Chat Button */}
      <NavActionBtn
        icon={MessageSquarePlus}
        label="New Chat"
        onClick={() => navigate("/")}
      />

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

      {/* Theme Toggle */}
      <NavActionBtn
        icon={isDark ? Sun : Moon}
        label="Toggle Theme"
        onClick={() => dispatch(toggleTheme())}
      />
    </div>
  );
};

export default NavbarRight;
