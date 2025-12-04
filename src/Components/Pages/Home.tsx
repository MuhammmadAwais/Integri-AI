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
      {/* Outer Container: Flex Row (Sidebar | Content) */}
      <div
        className={cn(
          "flex h-dvh w-full overflow-hidden transition-colors duration-300",
          isDark ? "bg-[#212121] text-white" : "bg-white text-gray-900"
        )}
      >
        {/* 1. Sidebar: Spans full height on the left */}
        <div className="shrink-0 h-full z-40">
          <Sidebar />
        </div>

        {/* 2. Right Content Area: Flex Column (Navbar / Main) */}
        <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">
          {/* Navbar: Sits at the top of the right area */}
          <div className="shrink-0 z-30 w-full">
            <Navbar />
          </div>

          {/* Main Scrollable Content */}
          <main className="flex-1 w-full h-full overflow-hidden relative">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeController>
  );
};

export default Home;
