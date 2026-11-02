import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../../lib/utils";
import { nativeLanguageName } from "../utils/newsLanguage";

interface Props {
  /** Language codes on offer, e.g. ["en", "ur"]. */
  languages: string[];
  value: string;
  onChange: (code: string) => void;
  isDark: boolean;
  /** Which side the menu lines up with. */
  align?: "left" | "right";
}

const englishName = (code: string) => {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
};

/** "Read in" dropdown listing the languages a story / feed is published in. */
const NewsLanguagePicker: React.FC<Props> = ({ languages, value, onChange, isDark, align = "left" }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (languages.length < 2) return null;

  return (
    <div ref={rootRef} className="relative" dir="ltr">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`News language: ${englishName(value)}. ${languages.length} languages available`}
        className={cn(
          "flex h-[42px] items-center gap-2 rounded-xl px-3.5 text-sm font-medium transition-colors hover:cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--integri-accent-600)",
          isDark
            ? "bg-[#18161C] border border-white/5 text-gray-200 hover:bg-[#2A2830]"
            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
        )}
      >
        <Languages size={16} aria-hidden className="opacity-70" />
        <span lang={value}>{nativeLanguageName(value)}</span>
        <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", isDark ? "bg-white/10 text-gray-400" : "bg-black/[0.06] text-gray-500")}>
          {languages.length}
        </span>
        <ChevronDown size={15} aria-hidden className={cn("opacity-60 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Languages"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            style={{ transformOrigin: align === "right" ? "top right" : "top left" }}
            className={cn(
              "absolute top-full z-40 mt-2 max-h-80 w-60 overflow-y-auto rounded-xl border py-1 shadow-xl",
              align === "right" ? "right-0" : "left-0",
              isDark ? "bg-[#18161C] border-white/10" : "bg-white border-gray-200"
            )}
          >
            {languages.map((code) => {
              const selected = code === value;
              return (
                <li key={code} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(code);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:cursor-pointer",
                      isDark ? "text-gray-200 hover:bg-white/5" : "text-gray-700 hover:bg-gray-50",
                      selected && "font-medium"
                    )}
                  >
                    <span lang={code} className="flex-1 truncate">{nativeLanguageName(code)}</span>
                    <span className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}>{englishName(code)}</span>
                    <Check size={14} aria-hidden className={cn("text-(--integri-accent-600)", !selected && "invisible")} />
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsLanguagePicker;
