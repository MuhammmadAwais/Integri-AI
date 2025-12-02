import React from "react";
import { Sun, Moon, Settings } from "lucide-react";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toggleTheme } from "../../../store/themeSlice";

const NavbarLeft: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isDark = useAppSelector((state) => state.theme.isDark);
  const dispatch = useAppDispatch();

  return (
    <div className="flex items-center gap-3">
      {!isMobile && (
        <Badge
          variant="theme-pill"
          className={`
            border transition-all duration-300
            ${
              isDark
                ? "bg-[#2A2B35] border-[#3F414D] text-gray-200"
                : "bg-gray-100 border-gray-200 text-gray-600"
            }
          `}
        >
          {isDark ? "Dark Mode" : "Light Mode"}
        </Badge>
      )}

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleTheme())}
          isActive={true}
          className={`
            rounded-lg border
            ${
              isDark
                ? "text-gray-200 border-gray-600 hover:bg-white/10"
                : "text-gray-600 border-gray-300 hover:bg-black/5"
            }
          `}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`
            rounded-lg border
            ${
              isDark
                ? "text-gray-400 border-[#3F414D] hover:bg-white/10"
                : "text-gray-500 border-gray-200 hover:bg-black/5"
            }
          `}
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default NavbarLeft;
