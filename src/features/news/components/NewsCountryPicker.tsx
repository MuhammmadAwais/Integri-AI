import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../../lib/utils";
import { NEWS_COUNTRIES, NEWS_COUNTRY_BY_KEY, flagEmoji } from "../utils/newsCountries";

interface Props {
  value: string;
  onChange: (key: string) => void;
  isDark: boolean;
}

/** Country pill + searchable dropdown for the news feed. */
const NewsCountryPicker: React.FC<Props> = ({ value, onChange, isDark }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const current = NEWS_COUNTRY_BY_KEY[value];

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

  const q = query.trim().toLowerCase();
  const list = q ? NEWS_COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : NEWS_COUNTRIES;

  const select = (key: string) => {
    onChange(key);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`News country: ${current?.name ?? value}`}
        className={cn(
          "flex h-[42px] items-center gap-2 rounded-xl px-3.5 text-sm font-medium transition-colors hover:cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--integri-accent-600)",
          isDark
            ? "bg-[#18161C] border border-white/5 text-gray-200 hover:bg-[#2A2830]"
            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
        )}
      >
        {current && <span aria-hidden className="text-base leading-none">{flagEmoji(current.iso)}</span>}
        <span className="max-w-[160px] truncate">{current?.name ?? value}</span>
        <ChevronDown size={15} aria-hidden className={cn("opacity-60 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            style={{ transformOrigin: "top left" }}
            className={cn(
              "absolute left-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border shadow-xl",
              isDark ? "bg-[#18161C] border-white/10" : "bg-white border-gray-200"
            )}
          >
            <div className={cn("flex items-center gap-2 border-b px-3", isDark ? "border-white/10" : "border-gray-100")}>
              <Search size={14} aria-hidden className="opacity-50" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && list[0]) select(list[0].key);
                }}
                placeholder="Search country"
                aria-label="Search country"
                className={cn(
                  "h-10 w-full bg-transparent text-sm focus:outline-none",
                  isDark ? "text-white placeholder:text-gray-500" : "text-gray-900 placeholder:text-gray-400"
                )}
              />
            </div>
            <ul role="listbox" aria-label="Countries" className="max-h-72 overflow-y-auto py-1">
              {list.map((c) => {
                const selected = c.key === value;
                return (
                  <li key={c.key} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => select(c.key)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:cursor-pointer",
                        isDark ? "text-gray-200 hover:bg-white/5" : "text-gray-700 hover:bg-gray-50",
                        selected && "font-medium"
                      )}
                    >
                      <span aria-hidden className="text-base leading-none">{flagEmoji(c.iso)}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                      {selected && <Check size={14} aria-hidden className="text-(--integri-accent-600)" />}
                    </button>
                  </li>
                );
              })}
              {list.length === 0 && (
                <li className={cn("px-3 py-3 text-sm", isDark ? "text-gray-500" : "text-gray-400")}>No matches</li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsCountryPicker;
