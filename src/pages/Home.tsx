import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../features/navabr/Navbar";
import Layout from "../components/ui/Layout"; // <--- IMPORT THE FIXED LAYOUT
import { useAppSelector } from "../hooks/useRedux";

const ThemeController = ({ children }: { children: React.ReactNode }) => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);
  return <>{children}</>;
};

const Home: React.FC = () => {
  return (
    <ThemeController>
      {/* 1. Use Layout wrapper. 
          It handles the Mobile/Desktop Sidebar and the 'NavButton' logic automatically. 
      */}
      <Layout>
        {/* 2. The Content Area 
            Everything inside <Layout> goes into the main screen area.
        */}
        <div className="flex flex-col h-full w-full relative">
          {/* Navbar sits at the top */}
          <div className="shrink-0 z-30 w-full">
            <Navbar />
          </div>

          {/* Main Scrollable Page Content */}
          <main className="flex-1 w-full h-full overflow-hidden relative">
            <Outlet />
          </main>
        </div>
      </Layout>
    </ThemeController>
  );
};

export default Home;
