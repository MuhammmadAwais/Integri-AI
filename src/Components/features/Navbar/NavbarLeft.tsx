import React from "react";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toggleMobileMenu } from "../../../store/chatSlice";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { cn } from "../../../utils/cn";

const NavbarLeft: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1024px)");

  return (
    <div className="flex items-center gap-3">
      {/* 1. Mobile Toggle Fix */}
      {isMobile && (
        <button
          title="button"
          onClick={(e) => {
            e.stopPropagation(); // Prevent bubbling issues
            dispatch(toggleMobileMenu(true));
          }}
          className={cn(
            "p-2 rounded-lg transition-colors lg:hidden active:scale-95",
            isDark
              ? "text-gray-400 hover:text-white hover:bg-white/10"
              : "text-gray-600 hover:bg-black/5"
          )}
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* 2. Logo Fix (Clickable & Aligned) */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 select-none cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md transition-transform group-hover:rotate-12">
          IA
        </div>
        <span
          className={cn(
            "font-bold text-lg tracking-tight hidden sm:block",
            isDark ? "text-gray-100" : "text-gray-800"
          )}
        >
          Integri AI
        </span>
      </div>
    </div>
  );
};

export default NavbarLeft;
