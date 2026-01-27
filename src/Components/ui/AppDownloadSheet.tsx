import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Portal from "./Portal";
import { cn } from "../../lib/utils";
import { useAppSelector } from "../../hooks/useRedux";

const STORAGE_KEY = "integri_web_visit_count";
const VISIT_INTERVAL = 5;

const APP_STORE_URL =
  "https://apps.apple.com/jo/app/integri/id6737592364";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.integri.integri&hl=en&pli=1";

function getVisitCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function incrementVisitCount(): number {
  if (typeof window === "undefined") return 0;
  const next = getVisitCount() + 1;
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    /* ignore */
  }
  return next;
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    ua.toLowerCase()
  );
}

function getMobilePlatform(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || navigator.vendor;
  const lower = ua.toLowerCase();
  if (/iphone|ipad|ipod/.test(lower)) return "ios";
  if (/android/.test(lower)) return "android";
  return "other";
}

const AppDownloadSheet: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isDark = useAppSelector((state: any) => state.theme?.isDark ?? true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    if (!isMobileDevice()) return;

    const count = incrementVisitCount();
    if (count % VISIT_INTERVAL === 0) {
      setOpen(true);
    }
  }, [mounted]);

  const handleClose = () => setOpen(false);

  const platform = mounted ? getMobilePlatform() : "other";

  if (!open) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[99998] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label="Download Integri app"
        className={cn(
          "fixed left-0 right-0 bottom-0 z-[99999] rounded-t-2xl border-t shadow-2xl",
          "animate-in slide-in-from-bottom duration-300",
          "pb-[env(safe-area-inset-bottom)]",
          isDark
            ? "bg-[#09090b] border-[#27272a]"
            : "bg-white border-gray-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3
            className={cn(
              "text-lg font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Get the Integri app
          </h3>
          <button
            type="button"
            onClick={handleClose}
            title="Close"
            className={cn(
              "p-2 rounded-full transition-colors",
              isDark
                ? "hover:bg-zinc-800 text-zinc-400"
                : "hover:bg-gray-100 text-gray-500"
            )}
          >
            <X size={22} />
          </button>
        </div>
        <p
          className={cn(
            "text-sm px-4 pb-4",
            isDark ? "text-zinc-400" : "text-gray-600"
          )}
        >
          Use Integri on the go. Download for your device.
        </p>
        <div className="flex flex-col gap-3 px-4 pb-6">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-4 w-full rounded-xl border p-4 transition-colors",
              platform === "ios"
                ? "ring-2 ring-offset-2 ring-zinc-400"
                : "hover:opacity-90",
              isDark
                ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            )}
          >
            <img
              src={isDark ? "/dark-theme-apple.png" : "/light-theme-apple.png"}
              alt="App Store"
              className="h-10 w-10 object-contain"
            />
            <div className="text-left">
              <span
                className={cn(
                  "text-xs font-medium uppercase tracking-wider",
                  isDark ? "text-zinc-500" : "text-gray-500"
                )}
              >
                Download on the
              </span>
              <span
                className={cn(
                  "block text-base font-semibold",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                App Store
              </span>
            </div>
          </a>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-4 w-full rounded-xl border p-4 transition-colors",
              platform === "android"
                ? "ring-2 ring-offset-2 ring-zinc-400"
                : "hover:opacity-90",
              isDark
                ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            )}
          >
            <img
              src="/playstore.png"
              alt="Google Play"
              className="h-10 w-10 object-contain"
            />
            <div className="text-left">
              <span
                className={cn(
                  "text-xs font-medium uppercase tracking-wider",
                  isDark ? "text-zinc-500" : "text-gray-500"
                )}
              >
                Get it on
              </span>
              <span
                className={cn(
                  "block text-base font-semibold",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Google Play
              </span>
            </div>
          </a>
        </div>
        <p
          className={cn(
            "text-center text-xs px-4 pb-4",
            isDark ? "text-zinc-500" : "text-gray-400"
          )}
        >
          You can continue using the website if you prefer.
        </p>
      </div>
    </Portal>
  );
};

export default AppDownloadSheet;
