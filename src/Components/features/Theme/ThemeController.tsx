import React, { useEffect } from "react";
import { useAppSelector } from "../../hooks/useRedux";

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

export default ThemeController;
