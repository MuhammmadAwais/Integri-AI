import React from "react";
import {
  ArrowRight,
  Loader2,
  MessageSquare,
  Play,
  Star,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../../lib/utils";

export interface AgentCardAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  tone?: "default" | "danger";
}

export interface AgentCardProps {
  title: string;
  description?: string;
  category: string;
  /** Display name of the underlying model, e.g. "Claude Haiku 4.5". */
  model: string;
  /** Provider logo for the model pill; a dot in the accent colour otherwise. */
  modelLogo?: string;
  icon: LucideIcon;
  /** Any CSS colour. Used as-is on dark surfaces, darkened for light mode. */
  accentColor: string;
  runsCount?: number;
  rating?: number;
  /** Short creator / ownership tag, e.g. "You" or "Integri". */
  creator?: string;
  /** Opens the agent (details page). Triggered by the card surface. */
  onSelect: () => void;
  /** Bottom-bar primary action, e.g. start a chat. Falls back to onSelect. */
  onPrimaryAction?: () => void;
  primaryLabel?: string;
  primaryLoading?: boolean;
  /** Secondary icon actions in the bottom bar (edit, delete, …). */
  actions?: AgentCardAction[];
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  className?: string;
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/**
 * Design tokens (shared with the app palette in src/index.css)
 *  surface   dark: zinc-900/60 → zinc-950 gradient   light: white
 *  border    dark: white/10 → zinc-500/40 on hover    light: zinc-200 → zinc-300
 *  accent    --accent (per category); --accent-fg is the readable foreground
 *            for the current theme; tints are color-mix() of --accent.
 *  radius    card 16px · icon tile 12px · pills full
 *  spacing   card p-5 · section gap 16px · meta gap 8px
 *  type      title 16/600 tight · body 14/400 relaxed · meta 11–12/500
 */
const AgentCard: React.FC<AgentCardProps> = ({
  title,
  description,
  category,
  model,
  modelLogo,
  icon: Icon,
  accentColor,
  runsCount,
  rating,
  creator,
  onSelect,
  onPrimaryAction,
  primaryLabel = "Start chat",
  primaryLoading = false,
  actions = [],
  isFavorite,
  onToggleFavorite,
  className,
}) => {
  const accentVars = {
    "--accent": accentColor,
    "--accent-soft": `color-mix(in oklab, ${accentColor} 14%, transparent)`,
    "--accent-ring": `color-mix(in oklab, ${accentColor} 30%, transparent)`,
    "--accent-glow": `color-mix(in oklab, ${accentColor} 22%, transparent)`,
  } as React.CSSProperties;

  return (
    <article
      style={accentVars}
      className={cn(
        "group relative isolate flex flex-col overflow-hidden rounded-2xl border p-5",
        // Readable accent foreground per theme
        "[--accent-fg:color-mix(in_oklab,var(--accent)_52%,black)] dark:[--accent-fg:var(--accent)]",
        // Surface + border
        "bg-white border-zinc-200 shadow-sm",
        "dark:bg-zinc-950 dark:bg-linear-to-b dark:from-zinc-900/60 dark:to-zinc-950 dark:border-white/10 dark:shadow-none",
        // Hover / focus / active
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:border-zinc-300 hover:shadow-[0_18px_40px_-18px_var(--accent-glow)]",
        "dark:hover:border-zinc-500/40",
        "motion-safe:hover:-translate-y-1 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.99]",
        "has-[[data-card-main]:focus-visible]:ring-2 has-[[data-card-main]:focus-visible]:ring-(--accent-fg) has-[[data-card-main]:focus-visible]:ring-offset-2 has-[[data-card-main]:focus-visible]:ring-offset-white dark:has-[[data-card-main]:focus-visible]:ring-offset-black",
        className
      )}
    >
      {/* Ambient glow + top hairline, revealed on hover/focus */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
        style={{
          background:
            "radial-gradient(120% 70% at 0% 0%, var(--accent-soft), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-70"
        style={{
          background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
        }}
      />

      {/* Header: icon tile · category · favourite */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-(--accent-fg) ring-1 ring-(--accent-ring) bg-(--accent-soft) transition-transform duration-300 motion-safe:group-hover:scale-105"
        >
          <Icon size={20} strokeWidth={1.75} aria-hidden />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-(--accent-fg)" />
            {category}
          </span>
          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-pressed={!!isFavorite}
              aria-label={isFavorite ? `Remove ${title} from favourites` : `Add ${title} to favourites`}
              className={cn(
                "relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-fg)",
                isFavorite
                  ? "text-amber-400"
                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200"
              )}
            >
              <Star size={15} fill={isFavorite ? "currentColor" : "none"} aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mt-4 flex-1">
        <h3 className="text-base font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
          {/* Stretched main action: the whole card opens the agent */}
          <button
            type="button"
            data-card-main
            onClick={onSelect}
            className="line-clamp-1 text-left after:absolute after:inset-0 after:content-[''] hover:cursor-pointer focus-visible:outline-none"
          >
            {title}
          </button>
        </h3>
        <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {description || "No description provided."}
        </p>

        {/* Metadata */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2 py-1 font-medium text-zinc-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200"
            title={`Runs on ${model}`}
          >
            {modelLogo ? (
              <img src={modelLogo} alt="" className="h-3.5 w-3.5 shrink-0 object-contain" />
            ) : (
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-(--accent-fg)" />
            )}
            <span className="truncate">{model}</span>
          </span>

          {typeof runsCount === "number" && (
            <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
              <Play size={11} aria-hidden />
              {compact.format(runsCount)} runs
            </span>
          )}
          {typeof rating === "number" && (
            <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
              <Star size={11} className="text-amber-400" fill="currentColor" aria-hidden />
              {rating.toFixed(1)}
            </span>
          )}
          {creator && (
            <span className="text-zinc-400 dark:text-zinc-500">
              by <span className="font-medium text-zinc-600 dark:text-zinc-300">{creator}</span>
            </span>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-zinc-100 pt-4 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={onPrimaryAction ?? onSelect}
          disabled={primaryLoading}
          className={cn(
            "relative z-10 inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-300 hover:cursor-pointer disabled:cursor-wait disabled:opacity-70",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-fg) focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black",
            // Subtle at rest, filled with the accent when the card is engaged
            "bg-zinc-100 text-zinc-800 dark:bg-white/[0.06] dark:text-zinc-100",
            "group-hover:bg-(--accent-fg) group-hover:text-white group-focus-within:bg-(--accent-fg) group-focus-within:text-white",
            "dark:group-hover:bg-(--accent) dark:group-hover:text-[#07060A] dark:group-focus-within:bg-(--accent) dark:group-focus-within:text-[#07060A]"
          )}
        >
          {primaryLoading ? (
            <Loader2 size={15} className="animate-spin" aria-hidden />
          ) : (
            <MessageSquare size={15} aria-hidden />
          )}
          {primaryLabel}
          <ArrowRight
            size={14}
            aria-hidden
            className="-ml-1 w-0 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:w-3.5 group-hover:opacity-100"
          />
        </button>

        {actions.length > 0 && (
          <div className="relative z-10 flex items-center gap-0.5">
            {actions.map(({ label, icon: ActionIcon, onClick, tone }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                aria-label={`${label} ${title}`}
                title={label}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:cursor-pointer",
                  "text-zinc-400 dark:text-zinc-500",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-fg)",
                  tone === "danger"
                    ? "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    : "hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100"
                )}
              >
                <ActionIcon size={15} aria-hidden />
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default AgentCard;
