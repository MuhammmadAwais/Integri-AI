import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/useRedux";
import Navbar from "../features/Navbar/Navbar";
import Sidebar from "../features/Sidebar/Sidebar";
import { cn } from "../../utils/cn";

// Theme Controller to apply global dark mode class
const ThemeController = ({ children }: { children: React.ReactNode }) => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return <>{children}</>;
};

const Home: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  return (
    <ThemeController>
      {/* Outer Container: Full Screen, Column Layout */}
      <div
        className={cn(
          "flex flex-col h-screen w-full overflow-hidden transition-colors duration-300",
          isDark ? "bg-[#212121]" : "bg-white" // Main background color
        )}
      >
        {/* 1. Navbar: Always on top, full width */}
        <div className="shrink-0 z-50">
          <Navbar />
        </div>

        {/* 2. Body Container: Sidebar + Main Content */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar: Sits below navbar, fixed width on desktop */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col relative min-w-0">
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ThemeController>
  );
};

export default Home;
