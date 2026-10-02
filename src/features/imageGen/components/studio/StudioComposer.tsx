import React, { useEffect, useRef } from "react";
import { ArrowUp, Crown, Loader2, SlidersHorizontal, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../../../lib/utils";

interface StudioComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  styleActive: boolean;
  settingsActive: boolean;
  onOpenStyles: () => void;
  onOpenSettings: () => void;
  /** null = unknown / unlimited → no hint (same rule as the app). */
  imagesRemaining: number | null;
}

/** Port of the app's GenerateImageInputField. */
const StudioComposer: React.FC<StudioComposerProps> = ({
  value,
  onChange,
  onSubmit,
  isGenerating,
  styleActive,
  settingsActive,
  onOpenStyles,
  onOpenSettings,
  imagesRemaining,
}) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLTextAreaElement>(null);
  const ready = value.trim().length > 0 && !isGenerating;

  // Auto-grow up to 4 lines, like the app's maxLines: 4.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 4 * 24 + 16)}px`;
  }, [value]);

  const exhausted = imagesRemaining !== null && imagesRemaining <= 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-3 sm:px-4 sm:pb-5">
      {imagesRemaining !== null && (
        <p
          className={cn(
            "mb-2 flex items-center justify-center gap-1.5 text-[11.5px] font-medium",
            exhausted ? "text-[#B7832F] dark:text-[#E0A858]" : "text-zinc-500 dark:text-zinc-400"
          )}
        >
          {exhausted ? <Crown size={13} aria-hidden /> : <Sparkles size={13} aria-hidden />}
          {exhausted
            ? t("imageStudio.limitReached", "Monthly limit reached · upgrade to generate more")
            : t("imageStudio.imagesLeft", "{{count}} images left this month", { count: imagesRemaining })}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onSubmit();
        }}
        className="rounded-[28px] border border-zinc-200 bg-white px-3.5 pb-2.5 pt-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none focus-within:border-zinc-300 dark:focus-within:border-zinc-700"
      >
        <label htmlFor="studio-prompt" className="sr-only">
          {t("imageStudio.promptLabel", "Image prompt")}
        </label>
        <textarea
          id="studio-prompt"
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (ready) onSubmit();
            }
          }}
          placeholder={t("imageStudio.placeholder", "Describe the image you want to create…")}
          className="block w-full resize-none bg-transparent px-1 py-2 text-[15px] leading-6 text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-400"
        />

        <div className="mt-1 flex items-center gap-2.5">
          <CircleButton
            label={t("imageStudio.styles", "Styles")}
            active={styleActive}
            onClick={onOpenStyles}
            icon={<Sparkles size={19} aria-hidden />}
          />
          <CircleButton
            label={t("imageStudio.settings", "Image settings")}
            active={settingsActive}
            onClick={onOpenSettings}
            icon={<SlidersHorizontal size={19} aria-hidden />}
          />
          <div className="flex-1" />
          <button
            type="submit"
            disabled={!ready}
            aria-label={t("imageStudio.generate", "Generate image")}
            className={cn(
              "flex h-[46px] w-[46px] items-center justify-center rounded-full border transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--integri-accent-600) focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900",
              ready
                ? "border-(--integri-accent-600) bg-(--integri-accent-600) text-white dark:text-[#07060A] hover:cursor-pointer"
                : "border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-[#1F1D25] dark:text-zinc-600"
            )}
          >
            {isGenerating ? <Loader2 size={20} className="animate-spin" aria-hidden /> : <ArrowUp size={22} aria-hidden />}
          </button>
        </div>
      </form>
    </div>
  );
};

const CircleButton: React.FC<{ label: string; active: boolean; onClick: () => void; icon: React.ReactNode }> = ({
  label,
  active,
  onClick,
  icon,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    aria-pressed={active}
    className={cn(
      "flex h-[46px] w-[46px] items-center justify-center rounded-full border transition-colors hover:cursor-pointer",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--integri-accent-600)",
      active
        ? "border-(--integri-accent-600) bg-[color-mix(in_oklab,var(--integri-accent-600)_14%,transparent)] text-(--integri-accent-600)"
        : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:text-zinc-800 dark:border-zinc-800 dark:bg-[#1F1D25] dark:text-zinc-400 dark:hover:text-zinc-200"
    )}
  >
    {icon}
  </button>
);

export default StudioComposer;
