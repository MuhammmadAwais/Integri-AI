import React, { useState } from "react";
import Sidebar from "../features/Sidebar/Sidebar"; // Ensure this imports your MAIN Sidebar.tsx
import NavButton from "./NavButton"; // Ensure correct path
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../../utils/cn";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex h-screen w-full overflow-hidden font-sans",
        isDark ? "bg-[#000000] text-gray-100" : "bg-white text-gray-900"
      )}
    >
      {/* =================================================================
          MOBILE SIDEBAR SYSTEM (Only visible on small screens)
      ================================================================= */}

      {/* 1. NAV BUTTON (Hamburger) 
          - Logic: It is VISIBLE only when sidebar is CLOSED (!isMobileOpen).
          - When sidebar opens, this button disappears.
          - z-50 ensures it sits above the main content but below the sidebar.
      */}
      <div
        className={cn(
          "absolute top-4 left-4 z-50 md:hidden transition-opacity duration-200",
          isMobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <NavButton
          isOpen={isMobileOpen}
          oneClick={() => setIsMobileOpen(true)}
        />
      </div>

      {/* 2. BACKDROP OVERLAY
          - Appears when sidebar is OPEN.
          - Clicking this closes the sidebar.
          - z-[60] ensures it covers the main content/navbar.
      */}
      <div
        className={cn(
          "fixed inset-0 z-60 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* 3. MOBILE SIDEBAR DRAWER 
          - z-[70] ensures it is THE HIGHEST element (covers Top Navbar).
          - Solid background prevents "glitchy" transparency.
      */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-70 h-full shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // Explicit Background Colors are CRITICAL to fix the "glitch"
          isDark
            ? "bg-[#000000] border-r border-[#1F1F1F]"
            : "bg-white border-r border-gray-200"
        )}
      >
        <Sidebar />
      </div>

      {/* =================================================================
          DESKTOP SIDEBAR (Hidden on mobile, Visible on Desktop)
      ================================================================= */}
      <div className="hidden md:flex h-full shrink-0 z-30 relative ">
        <Sidebar />
      </div>

      {/* =================================================================
          MAIN CONTENT AREA
      ================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <main className="flex-1 overflow-hidden relative w-full h-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
