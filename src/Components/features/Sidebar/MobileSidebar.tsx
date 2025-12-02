import React from "react";
import { createPortal } from "react-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toggleMobileMenu } from "../../../store/chatSlice";
import { cn } from "../../../utils/cn";
import SidebarContent from "./SidebarContent";

const MobileSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.chat.isMobileMenuOpen);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => dispatch(toggleMobileMenu(false))}
      />

      {/* Drawer Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[70] w-[280px] shadow-2xl transform transition-transform duration-300 ease-in-out h-full",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Apply theme background
          "bg-white dark:bg-[#171717]"
        )}
      >
        <SidebarContent />
      </aside>
    </>,
    document.body
  );
};

export default MobileSidebar;
