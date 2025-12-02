import React from "react";
import { useAppSelector } from "../../hooks/useRedux";

const NavbarCenter: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const logoSrc = isDark ? "/dark-theme-logo.png" : "/light-theme-logo.png";

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="relative w-10 h-10 flex items-center justify-center">
        <img
          src={logoSrc}
          alt="Company Logo"
          className="w-full h-full object-contain transition-opacity duration-300"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextElementSibling?.classList.remove("hidden");
          }}
        />
        <div className="hidden w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 items-center justify-center flex">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-300">
            LOGO
          </span>
        </div>
      </div>
    </div>
  );
};

export default NavbarCenter;
