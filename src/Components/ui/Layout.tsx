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
          isDark ? "bg-[#000000] text-gray-100" : "bg-white text-gray-900" // Grok Black
        )}
      >
        <Navbar />
        <main className="flex-1 overflow-auto p-0 relative">
          {/* Removed padding to allow Welcome screen to touch edges if needed */}
          {/* Inner container can add padding back */}
          <div className="h-full w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};
export default Layout;
