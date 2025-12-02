import React, { useEffect } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toggleMobileMenu } from "../../../store/chatSlice";
import SidebarContent from "./SidebarContent";
import MobileSidebar from "./MobileSidebar";
import { Menu } from "lucide-react";
import { cn } from "../../../utils/cn";

const Sidebar: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const isDark = useAppSelector((state) => state.theme.isDark);
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.chat.isMobileMenuOpen);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      dispatch(toggleMobileMenu(false));
    }
  }, [isMobile, dispatch]);

  // Mobile View: Render hamburger trigger and Portal Sidebar
  if (isMobile) {
    return (
      <>
        {/* Hamburger Trigger - positioned fixed below navbar */}
        {!isOpen && (
          <button
          title="button"
            onClick={() => dispatch(toggleMobileMenu(true))}
            className={cn(
              "fixed top-[80px] left-4 z-30 p-2 rounded-lg transition-colors md:hidden",
              isDark
                ? "text-gray-400 hover:text-white hover:bg-white/10"
                : "text-gray-600 hover:bg-black/5"
            )}
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <MobileSidebar />
      </>
    );
  }

  // Desktop View: Static Sidebar
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-[260px] h-full shrink-0 transition-colors duration-300 border-r",
        isDark
          ? "bg-[#171717] border-[#2A2B32]"
          : "bg-[#F9F9FA] border-gray-200"
      )}
    >
      <SidebarContent />
    </aside>
  );
};

export default Sidebar;
