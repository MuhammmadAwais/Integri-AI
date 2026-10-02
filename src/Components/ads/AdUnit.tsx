import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { AD_CLIENT } from "../../config/ads";
import type { AdFormat, AdLayout } from "../../config/ads";

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

/**
 * Detect if we're running on localhost / dev server.
 * AdSense won't serve real ads on localhost, so we show placeholders instead.
 */
const IS_DEV =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "0.0.0.0" ||
        window.location.port !== "");

interface AdUnitProps {
    /** The ad-slot ID from your AdSense account */
    slot: string;
    /** Ad format: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical" */
    format?: AdFormat;
    /** Layout hint for in-article / in-feed ads */
    layout?: AdLayout;
    /** Whether the ad should be responsive (data-full-width-responsive) */
    responsive?: boolean;
    /** Custom inline style for the <ins> element */
    style?: React.CSSProperties;
    /** Additional CSS class names for the wrapper */
    className?: string;
    /** Whether dark mode is active (for wrapper styling) */
    isDark?: boolean;
    /** Unique test ID for the ad unit */
    testId?: string;
}

// ── Placeholder dimensions by format ────────────────────────────────
function getPlaceholderHeight(format: AdFormat, layout?: AdLayout): string {
    if (layout === "in-feed") return "120px";
    if (layout === "in-article") return "250px";
    switch (format) {
        case "horizontal":
            return "90px";
        case "vertical":
            return "600px";
        case "rectangle":
            return "250px";
        case "fluid":
            return layout === "in-feed" ? "120px" : "200px";
        default: // "auto"
            return "160px";
    }
}

/**
 * Visible test ad placeholder shown during development.
 * Displays the ad slot ID, format, and a dashed border so you can
 * see exactly where ads will appear in production.
 */
const TestAdPlaceholder: React.FC<{
    slot: string;
    format: AdFormat;
    layout?: AdLayout;
    isDark: boolean;
    testId?: string;
}> = ({ slot, format, layout, isDark, testId }) => {
    const height = getPlaceholderHeight(format, layout);

    return (
        <div
            className={cn(
                "ad-container overflow-hidden rounded-xl transition-colors",
                isDark
                    ? "bg-[#07060A] border border-dashed border-yellow-500/30"
                    : "bg-white border border-dashed border-yellow-500/50",
            )}
            data-testid={testId}
        >
            {/* Subtle "Ad" label */}
            <div
                className={cn(
                    "text-[9px] uppercase tracking-widest font-medium px-3 py-1 flex items-center justify-between",
                    isDark ? "text-yellow-500/60" : "text-yellow-600/60",
                )}
            >
                <span>Advertisement (Test)</span>
                <span className={cn(
                    "text-[8px] font-mono",
                    isDark ? "text-gray-600" : "text-gray-400",
                )}>
                    {format}{layout ? ` / ${layout}` : ""}
                </span>
            </div>

            {/* Placeholder body */}
            <div
                className={cn(
                    "flex flex-col items-center justify-center gap-2 px-4",
                    isDark ? "bg-yellow-500/5" : "bg-yellow-50/80",
                )}
                style={{ minHeight: height }}
            >
                {/* Ad icon */}
                <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold",
                    isDark
                        ? "bg-yellow-500/10 text-yellow-500/50"
                        : "bg-yellow-100 text-yellow-600/50",
                )}>
                    Ad
                </div>

                <p className={cn(
                    "text-xs font-medium text-center",
                    isDark ? "text-yellow-500/40" : "text-yellow-700/40",
                )}>
                    Google AdSense Ad Unit
                </p>

                <p className={cn(
                    "text-[10px] font-mono text-center max-w-xs leading-relaxed",
                    isDark ? "text-gray-600" : "text-gray-400",
                )}>
                    Slot: {slot}
                </p>

                <p className={cn(
                    "text-[9px] text-center max-w-xs mt-1",
                    isDark ? "text-gray-700" : "text-gray-300",
                )}>
                    Real ads will appear on your live domain after AdSense approval.
                    Replace dummy slot IDs in <code className="font-mono">src/config/ads.ts</code>
                </p>
            </div>
        </div>
    );
};

/**
 * Reusable Google AdSense ad unit.
 *
 * - In **development** (localhost): Shows a clearly visible test placeholder
 *   so you can see exactly where ads will appear.
 * - In **production** (live domain): Renders the real AdSense `<ins>` tag
 *   and pushes to `adsbygoogle`.
 *
 * Usage:
 * ```tsx
 * <AdUnit slot={AD_SLOTS.NEWS_LIST_TOP} format="auto" responsive isDark={isDark} />
 * ```
 */
const AdUnit: React.FC<AdUnitProps> = ({
    slot,
    format = "auto",
    layout,
    responsive = true,
    style,
    className,
    isDark = false,
    testId,
}) => {
    const adRef = useRef<HTMLModElement>(null);
    const pushed = useRef(false);
    const [adFailed, setAdFailed] = useState(false);

    useEffect(() => {
        // In dev mode, don't even try to push — show placeholder
        if (IS_DEV) return;

        // Only push ad once per mount
        if (pushed.current) return;
        try {
            if (typeof window !== "undefined" && adRef.current) {
                console.log(
                    `%c[AdSense] 📡 Loading ad slot: ${slot}%c\n` +
                    `  Format: ${format}${layout ? ` | Layout: ${layout}` : ""}\n` +
                    `  Test ID: ${testId || "(none)"}`,
                    "color: #4285f4; font-weight: bold",
                    "color: inherit"
                );

                (window.adsbygoogle = window.adsbygoogle || []).push({});
                pushed.current = true;

                // Check fill status after a delay
                setTimeout(() => {
                    if (!adRef.current) return;

                    const insEl = adRef.current;
                    const hasContent = insEl.childElementCount > 0;
                    const dataStatus = insEl.getAttribute("data-ad-status");
                    const isEmpty =
                        dataStatus === "unfilled" ||
                        insEl.innerHTML.trim() === "" ||
                        insEl.offsetHeight === 0;

                    if (hasContent && !isEmpty) {
                        console.log(
                            `%c[AdSense] ✅ Ad loaded successfully: ${slot}`,
                            "color: #34a853; font-weight: bold"
                        );
                    } else {
                        console.warn(
                            `%c[AdSense] ⚠️ Ad slot "${slot}" did not fill.%c\n` +
                            `  Status: ${dataStatus || "unknown"}\n` +
                            `  Has content: ${hasContent}\n\n` +
                            `  Possible reasons:\n` +
                            `  1. 🕐 Ad units were JUST created — wait 15-30 min for Google to activate them\n` +
                            `  2. 🔒 403 error = AdSense account is still PENDING APPROVAL\n` +
                            `  3. 🌐 Domain "${window.location.hostname}" may not be verified in AdSense → Sites\n` +
                            `  4. 📄 Check ads.txt is accessible at: ${window.location.origin}/ads.txt\n` +
                            `  5. 🚫 Ad blocker may be active in this browser`,
                            "color: #ea4335; font-weight: bold",
                            "color: inherit"
                        );
                    }
                }, 3000);
            }
        } catch (e: any) {
            console.error(
                `%c[AdSense] ❌ Failed to push ad slot: ${slot}%c\n` +
                `  Error: ${e?.message || e}\n\n` +
                `  This usually means:\n` +
                `  • The adsbygoogle script in index.html failed to load\n` +
                `  • An ad blocker is blocking the AdSense script\n` +
                `  • The publisher ID (ca-pub-...) is incorrect`,
                "color: #ea4335; font-weight: bold",
                "color: inherit"
            );
            setAdFailed(true);
        }
    }, []);

    // ── Development mode → show test placeholder ──
    if (IS_DEV || adFailed) {
        return (
            <div className={className}>
                <TestAdPlaceholder
                    slot={slot}
                    format={format}
                    layout={layout}
                    isDark={isDark}
                    testId={testId}
                />
            </div>
        );
    }

    // ── Production mode → real AdSense ──
    return (
        <div
            className={cn(
                "ad-container overflow-hidden rounded-xl transition-colors",
                isDark ? "bg-[#07060A] border border-white/5" : "bg-white border border-gray-100",
                className,
            )}
            data-testid={testId}
        >
            {/* Subtle "Ad" label for transparency */}
            <div
                className={cn(
                    "text-[9px] uppercase tracking-widest font-medium px-3 py-1",
                    isDark ? "text-gray-600" : "text-gray-400",
                )}
            >
                Advertisement
            </div>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={style ?? { display: "block" }}
                data-ad-client={AD_CLIENT}
                data-ad-slot={slot}
                data-ad-format={format}
                {...(layout ? { "data-ad-layout": layout } : {})}
                {...(responsive ? { "data-full-width-responsive": "true" } : {})}
            />
        </div>
    );
};

export default AdUnit;
