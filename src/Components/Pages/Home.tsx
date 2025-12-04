import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../features/Navbar/Navbar";
import Sidebar from "../features/Sidebar/Sidebar";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../../utils/cn";

const ThemeController = ({ children }: { children: React.ReactNode }) => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);
  return <>{children}</>;
};

const Home: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  return (
    <ThemeController>
      {/* Use 100dvh for mobile browsers to handle address bar resizing correctly */}
      <div
        className={cn(
          "flex flex-col h-dvh w-full overflow-hidden transition-colors duration-300",
          isDark ? "bg-[#212121] text-white" : "bg-white text-gray-900"
        )}
      >
        {/* Navbar - Fixed height, never shrinks */}
        <div className="shrink-0 z-50">
          <Navbar />
        </div>

        {/* Main Body - Takes remaining height */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar (Hidden on Mobile visually, handled via Portal) */}
          <Sidebar />

          {/* Chat Area */}
          <main className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
            {/* Outlet container must scroll internally */}
            <div className="flex-1 w-full h-full overflow-hidden relative">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ThemeController>
  );
};

export default Home;
