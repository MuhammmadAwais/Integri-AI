import React from "react";
import NavbarRight from "./NavbarRight";
import NavbarLeft from "./NavbarLeft"; //
import { useAppSelector } from "../../hooks/useRedux";
import { cn } from "../../lib/utils";

const Navbar: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  return (
    <nav
      className={cn(
        "relative flex items-center justify-between px-4 py-2 h-16 w-full transition-colors z-50",
        isDark ? "bg-[#000000]" : "bg-white"
      )}
    >
      {/* Left */}
      <div className="shrink-0 flex items-center md:pl-0 pl-8 ">
        <NavbarLeft /> {/* */}
      </div>

      {/* Right */}
      <div className="shrink-0 flex items-center justify-end">
        <NavbarRight />
      </div>
    </nav>
  );
};
export default Navbar;
