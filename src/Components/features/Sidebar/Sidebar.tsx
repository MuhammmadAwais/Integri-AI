import React, { useEffect } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toggleMobileMenu } from "../../../store/chatSlice";
import FixedSidebar from "./FixedSidebar";
import ContextSidebar from "./ContextSidebar";
import MobileSidebar from "./MobileSidebar";
import { Menu } from "lucide-react";
import { cn } from "../../../utils/cn";

const Sidebar: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const isDark = useAppSelector((state) => state.theme.isDark);
  const dispatch = useAppDispatch();

  const isMobileOpen = useAppSelector((state) => state.chat.isMobileMenuOpen);
  const isContextOpen = useAppSelector(
    (state) => state.chat.isContextSidebarOpen
  );

  useEffect(() => {
    if (!isMobile) {
      dispatch(toggleMobileMenu(false));
    }
  }, [isMobile, dispatch]);

  // -- MOBILE VIEW --
  if (isMobile) {
    return (
      <>
        {!isMobileOpen && (
          <button
            title="button"  
            onClick={() => dispatch(toggleMobileMenu(true))}
            className={cn(
              "fixed top-[18px] left-4 z-40 p-2 rounded-lg transition-colors lg:hidden",
              isDark
                ? "text-gray-400 hover:text-white hover:bg-white/10"
                : "text-gray-600 hover:bg-black/5"
            )}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <MobileSidebar />
      </>
    );
  }

  // -- DESKTOP VIEW --
  return (
    <aside className="hidden lg:flex h-full shrink-0 shadow-xl z-30 relative bg-transparent">
      {/* 1. Fixed Rail (Always Visible) */}
      <FixedSidebar />

      {/* 2. Context Drawer (Collapsible) */}
      <div
        className={cn(
          "h-full overflow-hidden transition-all duration-300 ease-in-out border-r",
          isDark
            ? "bg-[#171717] border-[#2A2B32]"
            : "bg-[#F9F9FA] border-gray-200",
          isContextOpen ? "w-[280px] opacity-100" : "w-0 opacity-0 border-none"
        )}
      >
        {/* Inner Container: Holds width to prevent content squashing during slide */}
        <div className="w-[280px] h-full">
          <ContextSidebar />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
