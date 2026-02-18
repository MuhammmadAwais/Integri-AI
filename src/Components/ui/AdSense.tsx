import { useEffect, useRef} from "react";
import { useSubscription } from "../../features/subscriptions/hooks/useSubscription";
import { useAppSelector } from "../../hooks/useRedux";

interface AdSenseProps {
  adSlot: string;
  adClient: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

/**
 * AdSense Component - Simplified and robust implementation
 * 
 * Features:
 * - Displays ads for unauthenticated users (not logged in)
 * - Displays ads for authenticated free tier users
 * - Hides ads for Pro/Premium users
 * - Patient initialization - waits for script to load
 * - No premature error messages - lets AdSense handle loading
 * - No UI/UX glitches - seamlessly integrates
 */
const AdSense: React.FC<AdSenseProps> = ({
  adSlot,
  adClient,
  adFormat = "auto",
  fullWidthResponsive = true,
  className = "",
}) => {
  const user = useAppSelector((state: any) => state.auth.user);
  const { isFree } = useSubscription();
  const insRef = useRef<HTMLElement>(null);
  const initializedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show ads if:
  // 1. User is not logged in (user is null) OR
  // 2. User is logged in and has free tier
  // Hide ads if user is logged in and has Pro/Premium
  const shouldShowAds = !user || isFree;

  useEffect(() => {
    // Don't render ads for Pro/Premium users
    if (!shouldShowAds) {
      return;
    }

    // Prevent double initialization
    if (initializedRef.current) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 150; // 15 seconds max (150 * 100ms)

    const tryInitialize = () => {
      attempts++;

      // Check if element exists and is connected to DOM
      if (!insRef.current || !insRef.current.isConnected) {
        if (attempts < maxAttempts) {
          timeoutRef.current = setTimeout(tryInitialize, 100);
        }
        return;
      }

      // Check if script tag exists
      const scriptTag = document.querySelector('script[src*="adsbygoogle.js"]');
      if (!scriptTag) {
        if (attempts < maxAttempts) {
          timeoutRef.current = setTimeout(tryInitialize, 200);
        }
        return;
      }

      // Check if window and adsbygoogle are available
      if (typeof window === "undefined" || !window.adsbygoogle) {
        if (attempts < maxAttempts) {
          timeoutRef.current = setTimeout(tryInitialize, 150);
        }
        return;
      }

      // Ensure adsbygoogle is an array
      if (!Array.isArray(window.adsbygoogle)) {
        window.adsbygoogle = [];
      }

      // Check if already processed
      const status = insRef.current.getAttribute("data-adsbygoogle-status");
      if (status === "done" || status === "filled") {
        initializedRef.current = true;
        if (import.meta.env.DEV) {
          console.log(`✅ AdSense: Already initialized for slot ${adSlot}`);
        }
        return;
      }

      if (status === "loading") {
        // Wait for current loading to complete
        if (attempts < maxAttempts) {
          timeoutRef.current = setTimeout(tryInitialize, 300);
        }
        return;
      }

      // Push ad configuration - AdSense will read attributes from ins element
      try {
        window.adsbygoogle.push({});
        initializedRef.current = true;
        
        if (import.meta.env.DEV) {
          console.log(`✅ AdSense: Pushed ad request for slot ${adSlot}`);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(`❌ AdSense: Failed to push ad for slot ${adSlot}:`, error);
        }
        initializedRef.current = true; // Mark as attempted to prevent infinite retries
      }
    };

    // Start initialization after a delay to ensure DOM is ready
    timeoutRef.current = setTimeout(() => {
      tryInitialize();
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [shouldShowAds, adSlot, adClient]);

  // Don't render anything for Pro/Premium users
  if (!shouldShowAds) {
    return null;
  }

  return (
    <div 
      className={className}
      style={{ 
        minHeight: "250px", 
        width: "100%",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <ins
        ref={insRef as React.RefObject<HTMLModElement>}
        className="adsbygoogle"
        style={{ 
          display: "block", 
          minHeight: "250px", 
          width: "100%",
          height: "100%"
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
};

export default AdSense;
