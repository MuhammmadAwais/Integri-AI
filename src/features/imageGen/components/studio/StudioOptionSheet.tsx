import React, { useEffect, useRef } from "react";
import { Check, X, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../../lib/utils";

export interface OptionSection {
  label?: string;
  options: readonly string[];
  value: string | null;
  onChange: (value: string | null) => void;
  /** Adds a leading "None" chip that clears the value (Styles sheet). */
  noneLabel?: string;
}

interface StudioOptionSheetProps {
  open: boolean;
  onClose: () => void;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  sections: OptionSection[];
  /** Shows Reset + Done footer (Image settings sheet). */
  onReset?: () => void;
}

/**
 * Port of the app's ImageStylesSheet / ImageSettingsSheet: a bottom sheet on
 * mobile, a centred panel on larger screens. Selecting a chip again clears it.
 */
const StudioOptionSheet: React.FC<StudioOptionSheetProps> = ({
  open,
  onClose,
  icon: Icon,
  title,
  subtitle,
  sections,
  onReset,
}) => {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-lg outline-none",
          "rounded-t-3xl sm:rounded-3xl border border-b-0 sm:border-b",
          "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800",
          "px-5 pb-6 pt-3 shadow-2xl",
          "animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200"
        )}
      >
        {/* Grab handle (mobile) */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700 sm:hidden" aria-hidden />

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Icon size={20} className="text-(--integri-accent-600)" aria-hidden />
              <h2 className="text-[17px] font-semibold text-zinc-900 dark:text-white">{title}</h2>
            </div>
            <p className="mt-1 text-[12.5px] text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close", "Close")}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/5 dark:hover:text-zinc-200 hover:cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {sections.map((section, i) => (
          <div key={section.label ?? i} className="mt-5">
            {section.label && (
              <p className="mb-2.5 text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">{section.label}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {section.noneLabel && (
                <Chip label={section.noneLabel} selected={section.value === null} onClick={() => section.onChange(null)} />
              )}
              {section.options.map((opt) => (
                <Chip
                  key={opt}
                  label={opt}
                  selected={section.value === opt}
                  onClick={() => section.onChange(section.value === opt ? null : opt)}
                />
              ))}
            </div>
          </div>
        ))}

        {onReset && (
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onReset}
              className="h-11 flex-1 rounded-full border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-[#1F1D25] dark:text-zinc-400 dark:hover:text-zinc-200 hover:cursor-pointer"
            >
              {t("imageStudio.reset", "Reset")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-full bg-(--integri-accent-600) text-sm font-semibold text-white dark:text-[#07060A] hover:opacity-90 hover:cursor-pointer"
            >
              {t("imageStudio.done", "Done")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Chip: React.FC<{ label: string; selected: boolean; onClick: () => void }> = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] transition-colors hover:cursor-pointer",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--integri-accent-600)",
      selected
        ? "border-(--integri-accent-600) bg-[color-mix(in_oklab,var(--integri-accent-600)_14%,transparent)] font-semibold text-(--integri-accent-600)"
        : "border-zinc-200 bg-zinc-50 font-medium text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-[#1F1D25] dark:text-zinc-200 dark:hover:border-zinc-700"
    )}
  >
    {selected && <Check size={15} aria-hidden />}
    {label}
  </button>
);

export default StudioOptionSheet;
