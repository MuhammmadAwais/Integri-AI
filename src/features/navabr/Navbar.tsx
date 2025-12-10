import React from "react";

import NavbarRight from "./NavbarRight";
import { useAppSelector } from "../../hooks/useRedux";
import {cn} from "../../lib/utils";

const Navbar: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  return (
    <nav
      className={cn(
        "relative flex items-center justify-between px-4 py-2 h-16 w-full  transition-colors z-50",
        isDark ? "bg-[#000000]" : "bg-white"
      )}
    >
      {/* Left */}
      <div className="shrink-0 flex items-center"></div>

      {/* Center - Hidden on Mobile to prevent overlap */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block"></div>

      {/* Right */}
      <div className="shrink-0 flex items-center justify-end">
        <NavbarRight />
      </div>
    </nav>
  );
};

export default Navbar;
