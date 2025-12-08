import React, { useState } from "react";
import Sidebar from "../features/Sidebar/Sidebar"; // <--- MAKE SURE THIS IS CORRECT
import NavButton from "./NavButton";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../../utils/cn";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex h-screen w-full overflow-hidden font-sans selection:bg-gray-700 selection:text-white",
        isDark ? "bg-[#000000] text-gray-100" : "bg-white text-gray-900"
      )}
    >
      {/* =========================================================
          1. MOBILE SIDEBAR SETUP
      ========================================================= */}

      {/* Backdrop (Click to close) */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Mobile Sidebar Drawer (Slides in from Left) */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-full w-[280px] transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] md:hidden shadow-2xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar />
      </div>

      {/* Mobile Toggle Button (Visible ONLY on Mobile) */}
      {/* z-[60] ensures it stays ON TOP of the sidebar so you can click to close */}
      <div className="absolute top-4 left-4 z-[60] md:hidden">
        <NavButton
          isOpen={isMobileOpen}
          oneClick={() => setIsMobileOpen(!isMobileOpen)}
        />
      </div>

      {/* =========================================================
          2. DESKTOP SIDEBAR SETUP
      ========================================================= */}

      {/* This div is HIDDEN on mobile (md:flex) */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar />
      </div>

      {/* =========================================================
          3. MAIN CONTENT AREA
      ========================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <main className="flex-1 overflow-hidden relative w-full h-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
