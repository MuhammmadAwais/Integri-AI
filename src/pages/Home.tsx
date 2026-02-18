import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../features/navabr/Navbar";
import Layout from "../Components/layout/Layout";
import { useAppSelector } from "../hooks/useRedux";

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
      <Layout>
        <div className="flex flex-col h-full w-full relative">
          <div className="shrink-0 z-30 w-full">
            <Navbar />
          </div>
          <main className="flex-1 w-full h-full overflow-hidden relative">
            <Outlet />
          </main>
        </div>
      </Layout>
    </ThemeController>
  );
};

export default Home;
