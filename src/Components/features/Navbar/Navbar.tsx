import React from "react";
import NavbarLeft from "./NavbarLeft";
import NavbarCenter from "./NavbarCenter";
import NavbarRight from "./NavbarRight";
import { useAppSelector } from "../../hooks/useRedux";
import { cn } from "../../../utils/cn";

const Navbar: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  return (
    <nav
      className={cn(
        "relative flex items-center justify-between px-4 py-2 h-16 w-full border-b transition-colors z-50",
        isDark ? "bg-[#171717] border-[#2A2B32]" : "bg-white border-gray-200"
      )}
    >
      {/* Left */}
      <div className="shrink-0 flex items-center">
        <NavbarLeft />
      </div>

      {/* Center - Hidden on Mobile to prevent overlap */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
        <NavbarCenter />
      </div>

      {/* Right */}
      <div className="shrink-0 flex items-center justify-end">
        <NavbarRight />
      </div>
    </nav>
  );
};

export default Navbar;
