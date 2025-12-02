import React, { useState, useRef } from "react";
import { Share, MoreHorizontal } from "lucide-react";
import { createPortal } from "react-dom";
import Button from "../../ui/Button";
import { useAppSelector } from "../../hooks/useRedux";

const NavbarRight: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isDark = useAppSelector((state) => state.theme.isDark);

  const MenuDropdown = () => {
    if (!showMenu || !buttonRef.current) return null;

    const rect = buttonRef.current.getBoundingClientRect();

    return createPortal(
      <>
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setShowMenu(false)}
        />
        <div
          className={`
            fixed z-50 w-48 rounded-lg shadow-xl border p-1 flex flex-col gap-1
            ${
              isDark
                ? "bg-[#2A2B35] border-gray-700"
                : "bg-white border-gray-200"
            }
          `}
          style={{
            top: rect.bottom + 8,
            left: rect.right - 192,
          }}
        >
          {["Profile", "Account", "Logout"].map((item) => (
            <button
              key={item}
              className={`
                text-left px-3 py-2 rounded-md text-sm transition-colors
                ${
                  isDark
                    ? "text-gray-300 hover:bg-white/10"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {item}
            </button>
          ))}
        </div>
      </>,
      document.body
    );
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className={`
          ${
            isDark
              ? "text-gray-400 hover:text-white"
              : "text-gray-500 hover:text-black"
          }
        `}
      >
        <Share className="w-5 h-5" />
      </Button>

      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={() => setShowMenu(!showMenu)}
        className={`
          ${
            isDark
              ? "text-gray-400 hover:text-white"
              : "text-gray-500 hover:text-black"
          }
        `}
      >
        <MoreHorizontal className="w-5 h-5" />
      </Button>

      <MenuDropdown />
    </div>
  );
};

export default NavbarRight;
