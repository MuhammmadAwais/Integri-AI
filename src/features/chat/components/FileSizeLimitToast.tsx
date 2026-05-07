import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../hooks/useRedux";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FileSizeLimitToastProps {
  /** Message from the backend, e.g. "File size 45.2 MB exceeds the 10 MB limit…" */
  message: string;
  /** Maximum allowed size string extracted from the error, e.g. "10 MB" */
  maxSize?: string;
  /** Whether the current user is on the Pro tier (highest tier — no upgrade CTA) */
  isPro: boolean;
  /** Called when the toast should be removed from state */
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Helper — dynamically extract size limit from backend error message
// e.g. "...exceeds the 10 MB limit..." → "10 MB"
// Zero hardcoded values — always reads from the live backend response.
// ---------------------------------------------------------------------------

export function extractMaxSizeFromError(message: string): string | undefined {
  const match = message.match(/(\d+(?:\.\d+)?\s*(?:MB|GB|KB))\s*limit/i);
  return match ? match[1].replace(/\s+/, " ").toUpperCase() : undefined;
}

// ---------------------------------------------------------------------------
// Inner Toast (theme-aware)
// ---------------------------------------------------------------------------

const FileSizeLimitToast: React.FC<FileSizeLimitToastProps> = ({
  message,
  maxSize,
  isPro,
  onClose,
}) => {
  const toastRef    = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const navigate    = useNavigate();

  // Read theme from Redux — same source used everywhere in the app
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  const AUTO_DISMISS_MS = 8000;

  // ── Dismiss with exit animation ─────────────────────────────────────────

  const dismissToast = useCallback(() => {
    if (!toastRef.current) return;
    gsap.to(toastRef.current, {
      opacity: 0,
      y: 20,
      scale: 0.97,
      duration: 0.28,
      ease: "power2.in",
      onComplete: onClose,
    });
    if (progressRef.current) {
      gsap.killTweensOf(progressRef.current);
      gsap.to(progressRef.current, { scaleX: 0, duration: 0.18, ease: "power1.in" });
    }
  }, [onClose]);

  // ── Mount / enter animation + auto-dismiss countdown ───────────────────

  useEffect(() => {
    const el  = toastRef.current;
    const bar = progressRef.current;
    if (!el) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: 36, scale: 0.93 },
      { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: "back.out(1.5)" }
    );

    if (bar) {
      gsap.fromTo(
        bar,
        { scaleX: 1, transformOrigin: "left center" },
        {
          scaleX: 0,
          duration: AUTO_DISMISS_MS / 1000,
          ease: "none",
          onComplete: dismissToast,
        }
      );
    }
  }, [dismissToast]);

  // ── Upgrade navigation ──────────────────────────────────────────────────

  const handleUpgrade = () => {
    dismissToast();
    setTimeout(() => navigate("/subscriptions"), 300);
  };

  // ── Theme tokens ────────────────────────────────────────────────────────
  // Mirrors the exact patterns used throughout ChatInput, ChatInterface, etc.

  const t = {
    // Container
    bg: isDark
      ? "rgba(24, 24, 27, 0.96)"   // zinc-900 @ 96% — matches #1a1a1a used in ChatInput
      : "rgba(255, 255, 255, 0.97)", // white @ 97%
    border: isDark
      ? "1px solid rgba(63, 63, 70, 0.8)"  // zinc-700
      : "1px solid rgba(228, 228, 231, 1)", // zinc-200
    shadow: isDark
      ? "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)"
      : "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",

    // Icon container
    iconBg: isDark
      ? "rgba(59, 130, 246, 0.12)"  // blue-500/12
      : "rgba(239, 246, 255, 1)",    // blue-50
    iconBorder: isDark
      ? "1px solid rgba(59, 130, 246, 0.22)"
      : "1px solid rgba(191, 219, 254, 1)", // blue-200
    iconColor: isDark ? "#60a5fa" : "#3b82f6", // blue-400 / blue-500

    // Text
    title:    isDark ? "#f4f4f5" : "#09090b",   // zinc-100 / zinc-950
    message:  isDark ? "#a1a1aa" : "#52525b",   // zinc-400 / zinc-600
    meta:     isDark ? "#71717a" : "#71717a",   // zinc-500 both modes

    // Pill (max size badge)
    pillBg:    isDark ? "rgba(39, 39, 42, 0.8)" : "rgba(244, 244, 245, 1)", // zinc-800 / zinc-100
    pillBorder: isDark ? "rgba(63, 63, 70, 0.6)"  : "rgba(228, 228, 231, 1)", // zinc-700 / zinc-200
    pillText:  isDark ? "#a1a1aa" : "#52525b",
    pillValue: isDark ? "#e4e4e7" : "#18181b",   // zinc-200 / zinc-900

    // Divider
    divider: isDark ? "rgba(39, 39, 42, 0.8)" : "rgba(228, 228, 231, 0.7)",

    // Footer note
    footerText: isDark ? "#52525b" : "#a1a1aa", // zinc-600 / zinc-400

    // Close button
    closeBg:       isDark ? "rgba(39, 39, 42, 0.6)" : "rgba(244, 244, 245, 1)",
    closeBorder:   isDark ? "rgba(63, 63, 70, 0.7)"  : "rgba(228, 228, 231, 1)",
    closeColor:    isDark ? "#71717a" : "#a1a1aa",
    closeHoverBg:  isDark ? "rgba(63, 63, 70, 0.8)"  : "rgba(228, 228, 231, 1)",
    closeHoverColor: isDark ? "#e4e4e7" : "#18181b",

    // Upgrade button — blue, consistent with send button in ChatInput
    upgradeBg:     "rgb(37, 99, 235)",  // blue-700
    upgradeHoverBg:"rgb(29, 78, 216)",  // blue-800
    upgradeText:   "#ffffff",

    // Progress bar
    progressTrack: isDark ? "rgba(39, 39, 42, 0.6)" : "rgba(228, 228, 231, 0.6)",
    progressFill:  isDark
      ? "linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6)" // blue gradient dark
      : "linear-gradient(90deg, #2563eb, #3b82f6, #2563eb)", // blue gradient light
  };

  return (
    <div
      ref={toastRef}
      role="alert"
      aria-live="assertive"
      id="file-size-limit-toast"
      style={{
        position: "fixed",
        bottom: "28px",
        right: "24px",
        zIndex: 9999,
        width: "min(400px, calc(100vw - 32px))",
        borderRadius: "16px",
        overflow: "hidden",
        background: t.bg,
        border: t.border,
        boxShadow: t.shadow,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* ── Countdown progress bar ─────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: t.progressTrack,
          overflow: "hidden",
        }}
      >
        <div
          ref={progressRef}
          style={{
            height: "100%",
            background: t.progressFill,
            transformOrigin: "left center",
          }}
        />
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div style={{ padding: "18px 18px 14px" }}>

        {/* Header row: icon + text + close */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          {/* Icon */}
          <div
            style={{
              flexShrink: 0,
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: t.iconBg,
              border: t.iconBorder,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Warning triangle icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={t.iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          {/* Title + message */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: "13.5px",
                fontWeight: 600,
                color: t.title,
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
              }}
            >
              File Too Large
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "12px",
                color: t.message,
                lineHeight: 1.55,
                wordBreak: "break-word",
              }}
            >
              {message}
            </p>
          </div>

          {/* Close × */}
          <button
            id="file-size-toast-close"
            onClick={dismissToast}
            aria-label="Dismiss notification"
            style={{
              flexShrink: 0,
              marginTop: "-1px",
              width: "26px",
              height: "26px",
              borderRadius: "7px",
              background: t.closeBg,
              border: `1px solid ${t.closeBorder}`,
              color: t.closeColor,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = t.closeHoverBg;
              (e.currentTarget as HTMLButtonElement).style.color = t.closeHoverColor;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = t.closeBg;
              (e.currentTarget as HTMLButtonElement).style.color = t.closeColor;
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M1.4 1.4a.7.7 0 011 0L5 4 8.6 1.4a.7.7 0 111 1L6 5l3.6 3.6a.7.7 0 11-1 1L5 6 1.4 9.6a.7.7 0 11-1-1L4 5 1.4 2.4a.7.7 0 010-1z" />
            </svg>
          </button>
        </div>

        {/* Plan limit pill — only shown when the backend gives a concrete size */}
        {maxSize && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 9px",
              borderRadius: "999px",
              background: t.pillBg,
              border: `1px solid ${t.pillBorder}`,
              marginBottom: "12px",
            }}
          >
            {/* Storage icon */}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke={t.pillText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
            <span style={{ fontSize: "11px", color: t.pillText }}>
              Plan limit:{" "}
              <strong style={{ color: t.pillValue, fontWeight: 600 }}>
                {maxSize}
              </strong>
            </span>
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: t.divider,
            marginBottom: "12px",
          }}
        />

        {/* Footer: contextual message + upgrade CTA */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <p
            style={{
              flex: 1,
              margin: 0,
              fontSize: "11px",
              color: t.footerText,
              lineHeight: 1.5,
            }}
          >
            {isPro
              ? "Our backend doesn't currently support files this large. We're working on it."
              : "Upgrade your plan to unlock higher file size limits."}
          </p>

          {/* Upgrade button — shown ONLY for free and premium users, NOT for pro */}
          {!isPro && (
            <button
              id="file-size-toast-upgrade-btn"
              onClick={handleUpgrade}
              style={{
                flexShrink: 0,
                padding: "7px 13px",
                borderRadius: "9px",
                background: t.upgradeBg,
                border: "none",
                color: t.upgradeText,
                fontSize: "11.5px",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.01em",
                boxShadow: isDark
                  ? "0 1px 8px rgba(37, 99, 235, 0.35)"
                  : "0 1px 6px rgba(37, 99, 235, 0.25)",
                transition: "background 0.15s, transform 0.12s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = t.upgradeHoverBg;
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = t.upgradeBg;
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              Upgrade ↗
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Portal wrapper — renders toast into document.body to escape any overflow:hidden
// ---------------------------------------------------------------------------

interface FileSizeLimitToastPortalProps extends FileSizeLimitToastProps {}

export const FileSizeLimitToastPortal: React.FC<FileSizeLimitToastPortalProps> = (props) => {
  return createPortal(<FileSizeLimitToast {...props} />, document.body);
};

export default FileSizeLimitToast;
