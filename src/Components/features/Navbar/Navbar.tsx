import React, { useEffect } from "react";
import NavbarLeft from "./NavbarLeft";
import NavbarCenter from "./NavbarCenter";
import NavbarRight from "./NavbarRight";
import { useAppSelector } from "../../hooks/useRedux";

const Navbar: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <nav
      className={`
        relative flex items-center justify-between px-4 py-3 h-[72px] w-full border-b transition-colors duration-300
        ${
          isDark
            ? "bg-[#1a1b23] border-[#2A2B35]" // Deep dark blue/gray
            : "bg-white border-gray-200" // Clean white
        }
      `}
    >
      
      <NavbarLeft />
      <NavbarCenter />
      <NavbarRight />
    </nav>
  );
};

export default Navbar;
