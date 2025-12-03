import React, { useEffect } from "react";
import { Outlet } from "react-router-dom"; // <--- Crucial Import
import Sidebar from "../features/Sidebar/Sidebar";
import Navbar from "../features/Navbar/Navbar";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../../utils/cn";

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
      <div className="flex h-screen w-full overflow-hidden">
        {/* 1. Sidebar (Left) */}
        <Sidebar />

        {/* 2. Main Content Area (Right) */}
        <div
          className={cn(
            "flex-1 flex flex-col h-full overflow-hidden transition-colors duration-300",
            isDark ? "bg-[#212121] text-white" : "bg-white text-gray-900"
          )}
        >
          {/* Navbar sits inside the main area on top */}
          <Navbar />

          {/* 3. The Outlet is where Welcome/ChatInterface appears */}
          <main className="flex-1 overflow-auto relative flex flex-col">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeController>
  );
};

export default Home;
