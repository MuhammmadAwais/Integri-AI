import { useEffect, useRef } from "react";

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

// Global tracker to prevent duplicate pushes for the same ad slot
const processedAdSlots = new Set<string>();

const AdSense: React.FC<AdSenseProps> = ({
  adSlot,
  adClient,
  adFormat = "auto",
  fullWidthResponsive = true,
  className = "",
}) => {
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    // Only push once per component instance
    if (pushedRef.current) return;

    // Check if this ad slot has already been processed globally
    if (processedAdSlots.has(adSlot)) {
      pushedRef.current = true;
      return;
    }

    const pushAd = () => {
      if (pushedRef.current || !insRef.current) return;
      
      const insElement = insRef.current;
      
      // Check if this specific ins element already has ads loaded
      const status = insElement.getAttribute("data-adsbygoogle-status");
      if (status === "done" || status === "filled") {
        pushedRef.current = true;
        processedAdSlots.add(adSlot);
        return; // Already processed
      }

      // Check if it's already in the process of loading
      if (status === "loading") {
        return; // Already being processed
      }

      // Double-check global tracker
      if (processedAdSlots.has(adSlot)) {
        pushedRef.current = true;
        return;
      }

      try {
        // Initialize adsbygoogle array if it doesn't exist
        window.adsbygoogle = window.adsbygoogle || [];
        
        // Mark as processed before pushing
        processedAdSlots.add(adSlot);
        
        // Push the ad configuration - AdSense will handle the rest
        window.adsbygoogle.push({});
        pushedRef.current = true;
        
        // Debug log
        console.log(`AdSense: Pushed ad for slot ${adSlot}`);
      } catch (err) {
        // Log errors for debugging
        console.error(`AdSense push error for slot ${adSlot}:`, err);
        pushedRef.current = true; // Mark as attempted even if it failed
      }
    };

    // Wait for the element to be in the DOM and AdSense script to be loaded
    const checkAndPush = () => {
      if (!insRef.current) {
        setTimeout(checkAndPush, 50);
        return;
      }

      if (typeof window === "undefined") {
        setTimeout(checkAndPush, 50);
        return;
      }

      // Check if AdSense script is loaded
      if (!window.adsbygoogle) {
        // Wait a bit more for the script to load
        setTimeout(checkAndPush, 100);
        return;
      }

      pushAd();
    };

    // Start checking after a brief delay to ensure DOM is ready
    const timer = setTimeout(checkAndPush, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className={className} style={{ minHeight: "250px" }}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: "250px" }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
};

export default AdSense;
