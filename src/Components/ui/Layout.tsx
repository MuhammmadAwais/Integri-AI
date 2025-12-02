import React from "react";
import Sidebar from "../features/Sidebar/Sidebar";
import Navbar from "../features/Navbar/Navbar";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../../utils/cn";

// Main Layout with Sidebar + Navbar + Content
const Layout = ({ children }: { children: React.ReactNode }) => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar (Left) */}
      <Sidebar />

      {/* Main Content Area (Right) */}
      <div
        className={cn(
          "flex-1 flex flex-col h-full overflow-hidden transition-colors duration-300",
          isDark ? "bg-[#212121]" : "bg-white" // Main chat area bg
        )}
      >
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
export default Layout;