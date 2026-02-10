import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Globe } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAppSelector } from "../../hooks/useRedux";
import i18n, {
  persistLocale,
  supportedLngs,
  languageMetadata,
  type SupportedLocale,
} from "../../i18n";
import Portal from "./Portal";

const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const isDark = useAppSelector((state) => state.theme.isDark);
  const current = i18n.language as SupportedLocale;
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLang = languageMetadata[current] || languageMetadata.en;

  const handleChange = (lng: SupportedLocale) => {
    i18n.changeLanguage(lng);
    persistLocale(lng);
    setIsOpen(false);
  };

  // Calculate menu position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={t("nav.language")}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors hover:cursor-pointer text-xs font-medium border",
          isDark
            ? "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
            : "border-black/10 bg-black/5 text-gray-700 hover:bg-black/10 hover:text-black"
        )}
      >
        <Globe size={14} />
        <span className="hidden sm:inline">{currentLang.flag}</span>
        <ChevronDown
          size={12}
          className={cn("transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && menuPosition && (
        <Portal>
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              zIndex: 9999,
            }}
            className={cn(
              "mt-1 w-56 rounded-xl border shadow-2xl overflow-hidden py-1 max-h-[400px] overflow-y-auto",
              isDark
                ? "bg-[#1E1E1E] border-gray-700"
                : "bg-white border-gray-200"
            )}
          >
            {supportedLngs.map((lng) => {
              const meta = languageMetadata[lng];
              const isSelected = current === lng;
              return (
                <button
                  key={lng}
                  type="button"
                  onClick={() => handleChange(lng)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors hover:cursor-pointer",
                    isSelected
                      ? isDark
                        ? "bg-white/10 text-white"
                        : "bg-black/5 text-black"
                      : isDark
                        ? "text-gray-300 hover:bg-white/5"
                        : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <span className="text-lg">{meta.flag}</span>
                  <span className="flex-1">{meta.name}</span>
                  {isSelected && (
                    <span
                      className={cn(
                        "text-xs",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Portal>
      )}
    </>
  );
};

export default LanguageSwitcher;
