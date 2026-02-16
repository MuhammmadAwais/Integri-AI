import { useState, useEffect } from "react";
import { useSubscription } from "./useSubscription";

export interface DetectionResult {
  method: string;
  blocked: boolean;
  details: string;
}

export const useAdBlockDetector = () => {
  const { isFree, isPro, isPremium } = useSubscription();
  const [isBlocked, setIsBlocked] = useState(false);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    // Early exit: Pro/Premium users bypass all detection
    if (isPro || isPremium) {
      setIsBlocked(false);
      setIsDetecting(false);
      return;
    }

    // Only run detection for free users
    if (!isFree || typeof window === "undefined") {
      setIsBlocked(false);
      setIsDetecting(false);
      return;
    }

    setIsDetecting(true);
    const results: DetectionResult[] = [];

    // Async Timing Trap: Wait 1.5 seconds for cosmetic filtering to complete
    const detectionTimer = setTimeout(() => {
      // Vector 1: Honeypot Element Check
      const honeypotCheck = () => {
        const baitClasses = ["adsbox", "ad-placement", "banner-ads"];
        const baitElements: HTMLDivElement[] = [];
        let blockedCount = 0;

        baitClasses.forEach((className) => {
          const el = document.createElement("div");
          el.className = className;
          el.innerHTML = "&nbsp;";
          el.style.position = "absolute";
          el.style.left = "-9999px";
          el.style.height = "1px";
          el.style.width = "1px";
          el.setAttribute("data-ad-test", "true");
          document.body.appendChild(el);
          baitElements.push(el);
        });

        setTimeout(() => {
          baitElements.forEach((el) => {
            const computedStyle = window.getComputedStyle(el);
            const isBlocked =
              computedStyle.display === "none" ||
              el.offsetHeight === 0 ||
              el.offsetWidth === 0 ||
              computedStyle.visibility === "hidden" ||
              computedStyle.opacity === "0";

            if (isBlocked) blockedCount++;
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });

          results.push({
            method: "Honeypot Element",
            blocked: blockedCount > 0,
            details:
              blockedCount > 0
                ? `${blockedCount}/${baitClasses.length} bait elements were hidden or removed`
                : "All bait elements rendered normally",
          });

          evaluateResults();
        }, 100);
      };

      // Vector 2: Network Ghosting Check - Specifically catch ERR_BLOCKED_BY_CLIENT
      const networkGhostingCheck = async () => {
        try {
          // Also check adsbygoogle.js as it's more commonly blocked
          const response = await fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
            method: "HEAD",
            mode: "no-cors",
            cache: "no-cache",
          });
          results.push({
            method: "Network Ghosting",
            blocked: false,
            details: "AdSense script endpoint accessible",
          });
        {response} //vercel fixes
        } catch (error) {
          // Catch ERR_BLOCKED_BY_CLIENT, TypeError, or "Failed to fetch"
          const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
          const isBlocked = 
            error instanceof TypeError ||
            errorMessage.includes("failed to fetch") ||
            errorMessage.includes("blocked") ||
            errorMessage.includes("networkerror");
          
          results.push({
            method: "Network Ghosting",
            blocked: isBlocked,
            details: isBlocked
              ? `Network request intercepted: ${error instanceof Error ? error.message : "ERR_BLOCKED_BY_CLIENT"}`
              : `Network error: ${error instanceof Error ? error.message : "Unknown"}`,
          });
        }
        evaluateResults();
      };

      // Vector 3: Script Integrity Check
      const scriptIntegrityCheck = () => {
        // First check if already initialized (script loaded in HTML)
        let isInitialized = typeof window !== "undefined" && (window as any).isSystemInitialized === true;

        // If not initialized, try to load it dynamically
        if (!isInitialized) {
          const script = document.createElement("script");
          script.src = "/system-check.js";
          script.async = true;
          script.setAttribute("data-integrity-check", "true");
          
          let scriptLoaded = false;
          let scriptBlocked = false;

          script.onload = () => {
            scriptLoaded = true;
            isInitialized = (window as any).isSystemInitialized === true;
            results.push({
              method: "Script Integrity",
              blocked: !isInitialized,
              details: isInitialized
                ? "System initialization script loaded successfully"
                : "Script loaded but initialization flag not set",
            });
            evaluateResults();
          };

          script.onerror = () => {
            scriptBlocked = true;
            results.push({
              method: "Script Integrity",
              blocked: true,
              details: "Resource failed to load: system-check.js",
            });
            evaluateResults();
          };

          // Timeout fallback
          setTimeout(() => {
            if (!scriptLoaded && !scriptBlocked) {
              scriptBlocked = true;
              results.push({
                method: "Script Integrity",
                blocked: true,
                details: "Script load timeout - possible blocking detected",
              });
              evaluateResults();
            }
          }, 2000);

          document.head.appendChild(script);

          // Cleanup after check
          setTimeout(() => {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
          }, 5000);
        } else {
          // Already initialized
          results.push({
            method: "Script Integrity",
            blocked: false,
            details: "System initialization script loaded successfully",
          });
          evaluateResults();
        }
      };

      // Vector 4: AdSense Global Object Check (Fallback)
      const adsenseCheck = () => {
        const scriptBlocked = !window.adsbygoogle;
        results.push({
          method: "AdSense Global Object",
          blocked: scriptBlocked,
          details: scriptBlocked
            ? "AdSense global object not found"
            : "AdSense global object present",
        });
        evaluateResults();
      };

      // Run all detection vectors simultaneously
      honeypotCheck();
      networkGhostingCheck();
      scriptIntegrityCheck();
      adsenseCheck();
    }, 1500); // Async Timing Trap: 1.5 second delay

    const evaluateResults = () => {
      // Wait for all checks to complete (minimum 4 results expected)
      if (results.length < 4) return;

      setDetectionResults([...results]);
      setIsDetecting(false);

      // If ANY method detects blocking AND user is free tier, set blocked state
      const anyBlocked = results.some((r) => r.blocked);
      // Double-check: Only set blocked if user is free tier
      if (anyBlocked && isFree && !isPro && !isPremium) {
        setIsBlocked(true);
      } else {
        setIsBlocked(false);
      }
    };

    return () => {
      clearTimeout(detectionTimer);
    };
  }, [isFree, isPro, isPremium]);

  return {
    isBlocked,
    detectionResults,
    isDetecting,
  };
};
