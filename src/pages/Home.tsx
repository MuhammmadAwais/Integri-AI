import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../features/navabr/Navbar";
import Layout from "../Components/layout/Layout";
import Breadcrumbs from "../Components/ui/Breadcrumbs";
import { useAppSelector } from "../hooks/useRedux";

const ThemeController = ({ children }: { children: React.ReactNode }) => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);
  return <>{children}</>;
};

const Home: React.FC = () => {
  const { pathname } = useLocation();
  const isDark = useAppSelector((state) => state.theme.isDark);
  const showBreadcrumbs = pathname !== "/" && !pathname.match(/^\/chat\/|^\/c\//);

  return (
    <ThemeController>
      <Layout>
        <div className="flex flex-col h-full w-full relative">
          <div className="shrink-0 z-30 w-full">
            <Navbar />
          </div>
          {showBreadcrumbs && (
            <div className="shrink-0 px-4 md:px-6 lg:px-10 pt-2 pb-1 border-b border-gray-200 dark:border-[#1F1F1F]">
              <Breadcrumbs isDark={isDark} />
            </div>
          )}
          <main className="flex-1 w-full h-full overflow-hidden relative">
            <Outlet />
          </main>
        </div>
      </Layout>
    </ThemeController>
  );
};

export default Home;
