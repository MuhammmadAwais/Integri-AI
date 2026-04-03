import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSubscription } from "../hooks/useSubscription";
import { useAdBlockLogic } from "../hooks/useAdBlockLogic";
import { cn } from "../../../lib/utils";
import { RefreshCw, Chrome, Globe, Shield as ShieldIcon, ChevronDown, ArrowLeft, Power, Settings } from "lucide-react";
import { languageMetadata, supportedLngs } from "../../../i18n";

interface AdBlockGuardProps {
  children?: React.ReactNode;
}

// Global state to track subscription page activity
let globalSubscriptionPageActive = false;
let globalModalDisabled = false;

const AdBlockGuard: React.FC<AdBlockGuardProps> = ({ children }) => {
  const { isPro, isPremium } = useSubscription();
  const { shouldShowAdBlock, isInitialized } = useAdBlockLogic();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isOnSubscriptionPage, setIsOnSubscriptionPage] = useState(false);
  const [suspiciousActivityDetected, setSuspiciousActivityDetected] = useState(false);

  // Check if we're on subscription page using window.location
  useEffect(() => {
    let previousPath = window.location.pathname;
    
    const checkPath = () => {
      const currentPath = window.location.pathname;
      const isCurrentlyOnSubscriptions = currentPath === "/subscriptions";
      const wasOnSubscriptions = previousPath === "/subscriptions";
      
      setIsOnSubscriptionPage(isCurrentlyOnSubscriptions);
      
      // Update global state
      globalSubscriptionPageActive = isCurrentlyOnSubscriptions;
      
      // If user is on subscription page, disable modal (unless suspicious activity)
      if (isCurrentlyOnSubscriptions) {
        if (!suspiciousActivityDetected) {
          globalModalDisabled = true;
        }
      } else if (wasOnSubscriptions && !isCurrentlyOnSubscriptions) {
        // User tried to navigate away from subscription page - suspicious activity
        setSuspiciousActivityDetected(true);
        globalModalDisabled = false;
      }
      
      previousPath = currentPath;
    };
    checkPath();
    
    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", checkPath);
    
    // Poll for pathname changes (since we can't use useLocation)
    const interval = setInterval(checkPath, 100);
    
    return () => {
      window.removeEventListener("popstate", checkPath);
      clearInterval(interval);
    };
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const isNavigatingToSubscriptionsRef = useRef(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<SVGSVGElement>(null);
  const shieldGlowRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const shimmerPrimaryRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [activeGuide, setActiveGuide] = useState<string | null>(null);
  const rightPaneContentRef = useRef<HTMLDivElement>(null);
  const guideContentRef = useRef<HTMLDivElement>(null);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // FULL LOCKDOWN: Disable body scroll, hide scrollbar, block keyboard
  useEffect(() => {
    if (shouldShowAdBlock && isInitialized) {
      const scrollY = window.scrollY;
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalWidth = document.body.style.width;
      const originalTop = document.body.style.top;
      const originalPaddingRight = document.body.style.paddingRight;

      // Lock scroll
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollY}px`;

      // Hide scrollbar (calculate scrollbar width)
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Block keyboard events (Esc, Tab, etc.)
      const handleKeyDown = (e: KeyboardEvent) => {
        // Block all keyboard shortcuts that could bypass the modal
        if (
          e.key === "Escape" ||
          e.key === "Tab" ||
          (e.ctrlKey && e.key === "w") ||
          (e.ctrlKey && e.key === "r") ||
          (e.metaKey && e.key === "w") ||
          (e.metaKey && e.key === "r")
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };

      // Block focus trap attempts
      const handleFocus = (e: FocusEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          e.preventDefault();
          containerRef.current.focus();
        }
      };

      window.addEventListener("keydown", handleKeyDown, { capture: true });
      window.addEventListener("focus", handleFocus, { capture: true });

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.width = originalWidth;
        document.body.style.top = originalTop;
        document.body.style.paddingRight = originalPaddingRight;
        window.scrollTo(0, scrollY);
        window.removeEventListener("keydown", handleKeyDown, { capture: true });
        window.removeEventListener("focus", handleFocus, { capture: true });
      };
    }
  }, [shouldShowAdBlock, isInitialized]);

  // GSAP Animations - Entrance with Elastic.out and shield pulse
  useLayoutEffect(() => {
    if (!shouldShowAdBlock || !isInitialized || !modalRef.current) return;

    const ctx = gsap.context(() => {
      // Modal entrance: expand from center line (scaleY 0.01 to 1) with Elastic.out
      gsap.fromTo(
        modalRef.current,
        {
          scaleY: 0.01,
          opacity: 0,
          transformOrigin: "center center",
        },
        {
          scaleY: 1,
          opacity: 1,
          duration: 1.2,
          ease: "elastic.out(1, 0.5)",
        },
      );

      // Stagger animation for panes (no scale, only opacity and y translation)
      if (leftPaneRef.current && rightPaneRef.current) {
        gsap.fromTo(
          [leftPaneRef.current, rightPaneRef.current],
          {
            opacity: 0,
            y: 20,
            scale: 1, // Explicitly set scale to 1 to prevent any scaling
          },
          {
            opacity: 1,
            y: 0,
            scale: 1, // Keep scale at 1
            duration: 0.6,
            delay: 0.4,
            stagger: 0.1,
            ease: "power2.out",
          },
        );
      }

      // Shield pulse animation disabled - static display only
      // Shield glow animation disabled - static display only

      // Constant slow shimmer ray for Pro button (continuous loop)
      // Only animate if shimmer element exists (default view)
      if (shimmerPrimaryRef.current) {
        const shimmerTimeline = gsap.timeline({
          repeat: -1,
        });
        shimmerTimeline.set(shimmerPrimaryRef.current, { 
          x: "-100%",
        });
        shimmerTimeline.to(shimmerPrimaryRef.current, {
          x: "200%",
          duration: 4,
          ease: "none",
        });
      }
    }, modalRef);

    return () => ctx.revert();
  }, [shouldShowAdBlock, isInitialized]);

  // Sidebar item hover effect - shift 5px to the right
  useEffect(() => {
    if (!shouldShowAdBlock || !isInitialized || isMobile) return;

    const items = sidebarItemsRef.current.filter(Boolean);
    const cleanupFunctions: (() => void)[] = [];
    
    items.forEach((item) => {
      if (!item) return;

      const handleMouseEnter = () => {
        gsap.to(item, {
          x: 5,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      const handleMouseLeave = () => {
        gsap.to(item, {
          x: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      item.addEventListener("mouseenter", handleMouseEnter);
      item.addEventListener("mouseleave", handleMouseLeave);

      cleanupFunctions.push(() => {
        item.removeEventListener("mouseenter", handleMouseEnter);
        item.removeEventListener("mouseleave", handleMouseLeave);
      });
    });

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [shouldShowAdBlock, isInitialized, isMobile]);

  // GSAP transition for guide content swap (no scale, only opacity and x translation)
  useEffect(() => {
    if (!shouldShowAdBlock || !isInitialized || isMobile || !rightPaneContentRef.current) return;

    const content = rightPaneContentRef.current;
    
    if (activeGuide) {
      // Slide in guide view from left
      gsap.fromTo(
        content,
        {
          opacity: 0,
          x: -20,
          scale: 1, // Explicitly prevent scaling
        },
        {
          opacity: 1,
          x: 0,
          scale: 1, // Keep scale at 1
          duration: 0.4,
          ease: "power2.out",
        }
      );
    } else {
      // Slide out guide view to right, then slide in main view from left
      gsap.to(content, {
        opacity: 0,
        x: 20,
        scale: 1, // Keep scale at 1
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          // Reset position and slide in main view
          gsap.set(content, { x: -20, scale: 1 });
          gsap.to(content, {
            opacity: 1,
            x: 0,
            scale: 1, // Keep scale at 1
            duration: 0.4,
            ease: "power2.out",
          });
        },
      });
    }
  }, [activeGuide, shouldShowAdBlock, isInitialized, isMobile]);

  // Magnetic button effect
  useEffect(() => {
    if (!buttonRef.current || !shouldShowAdBlock || !isInitialized) return;

    const button = buttonRef.current;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2),
      );

      if (distance < 120) {
        const strength = (120 - distance) / 120;
        targetX = (e.clientX - centerX) * 0.25 * strength;
        targetY = (e.clientY - centerY) * 0.25 * strength;
      } else {
        targetX = 0;
        targetY = 0;
      }
    };

    const animate = () => {
      x += (targetX - x) * 0.15;
      y += (targetY - y) * 0.15;
      gsap.set(button, { x, y, force3D: true });
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      gsap.set(button, { x: 0, y: 0 });
    };
  }, [shouldShowAdBlock, isInitialized]);

  const handleRefresh = () => {
    // Navigate to home page - this will reload and check adblock status again
    window.location.href = "/";
  };

  const handleUpgrade = () => {
    // Set global flags to disable modal when navigating to subscription page
    isNavigatingToSubscriptionsRef.current = true;
    globalSubscriptionPageActive = true;
    globalModalDisabled = true;
    // Reset suspicious activity flag when user clicks upgrade again
    setSuspiciousActivityDetected(false);
    window.location.href = "/subscriptions";
  };

  // NO automatic redirect - only navigate when user clicks "Upgrade to Pro"
  // Reset navigation flag after a delay if user is on subscription page
  useEffect(() => {
    if (isOnSubscriptionPage && isNavigatingToSubscriptionsRef.current) {
      setTimeout(() => {
        isNavigatingToSubscriptionsRef.current = false;
      }, 500);
    }
  }, [isOnSubscriptionPage]);

  // Detect suspicious activity when user tries to navigate away from subscription page
  useEffect(() => {
    if (!shouldShowAdBlock || !isInitialized || isPro || isPremium || !isOnSubscriptionPage) return;

    // If user tries to navigate away, mark as suspicious and show modal again
    const handleBeforeUnload = () => {
      if (globalSubscriptionPageActive) {
        setSuspiciousActivityDetected(true);
        globalModalDisabled = false;
      }
    };

    // Block navigation away from subscription page when adblock is detected

    // Store original pushState and replaceState
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    // Override pushState to block navigation away from /subscriptions
    window.history.pushState = function(...args) {
      const url = args[2] as string;
      if (url && url !== "/subscriptions" && !url.includes("/subscriptions")) {
        // Suspicious activity detected - user trying to navigate away
        setSuspiciousActivityDetected(true);
        globalModalDisabled = false;
        // Block navigation, keep user on subscription page
        return;
      }
      return originalPushState.apply(window.history, args);
    };

    // Override replaceState similarly
    window.history.replaceState = function(...args) {
      const url = args[2] as string;
      if (url && url !== "/subscriptions" && !url.includes("/subscriptions")) {
        // Suspicious activity detected - user trying to navigate away
        setSuspiciousActivityDetected(true);
        globalModalDisabled = false;
        // Block navigation, keep user on subscription page
        return;
      }
      return originalReplaceState.apply(window.history, args);
    };

    // Block clicks on links that navigate away
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (link) {
        const href = link.getAttribute("href");
        // Block navigation to other routes, allow only subscription page
        if (href && href !== "/subscriptions" && !href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:") && !href.startsWith("http")) {
          e.preventDefault();
          e.stopPropagation();
          // Mark as suspicious activity and show modal again
          setSuspiciousActivityDetected(true);
          globalModalDisabled = false;
          // The modal will remain visible
          return false;
        }
      }
    };

    // Block browser back/forward navigation
            const handlePopState = (e: PopStateEvent) => {
              if (shouldShowAdBlock && isInitialized && !isPro && !isPremium && isOnSubscriptionPage) {
        const currentPath = window.location.pathname;
        if (currentPath !== "/subscriptions" && globalSubscriptionPageActive) {
          // User tried to navigate away - suspicious activity
          setSuspiciousActivityDetected(true);
          globalModalDisabled = false;
          // Push subscription page back to history
          window.history.pushState(null, "", "/subscriptions");
          // Don't auto-redirect - let user stay where they are but show modal
        }
      }
      {e} //VERCEL FIXES
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      // Restore original functions
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [shouldShowAdBlock, isInitialized, isPro, isPremium, isOnSubscriptionPage]);

  // Bypass for Pro/Premium users - return children immediately
  // Only show guard if subscription !== 'pro' (i.e., not pro and not premium)
  if (isPro || isPremium) {
    return <>{children}</>;
  }

  // Don't show guard if not initialized, not logged in, or visit count <= 2
  // Early exit prevents flicker
  if (!shouldShowAdBlock || !isInitialized) {
    return <>{children}</>;
  }

  // Don't show modal if user is on subscription page and modal is disabled (unless suspicious activity detected)
  if (isOnSubscriptionPage && globalModalDisabled && !suspiciousActivityDetected) {
    return <>{children}</>;
  }

  // Bypass for Auth Routes
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return <>{children}</>;
  }

  // Show guard modal - user must be on subscription page when adblock is detected

  // Browser instructions data
  const browserInstructions = [
    {
      id: "chrome",
      name: t("adBlockGuard.browsers.chromeEdge.name", "Chrome/Edge"),
      icon: Chrome,
      instruction: t("adBlockGuard.browsers.chromeEdge.instruction", "Click the Puzzle/Shield icon in your toolbar → find your AdBlocker → Toggle 'OFF' for this site."),
      detailedSteps: [
        { icon: ShieldIcon, text: t("adBlockGuard.browsers.chromeEdge.step1", "Look for the Puzzle piece icon or Shield icon in your browser toolbar"), action: "click", color: "#3b82f6" },
        { icon: Settings, text: t("adBlockGuard.browsers.chromeEdge.step2", "Find your AdBlocker extension in the dropdown menu"), action: "click", color: "#3b82f6" },
        { icon: Power, text: t("adBlockGuard.browsers.chromeEdge.step3", "Toggle the switch to 'OFF' for this site"), action: "disable", color: "#ef4444" },
        { icon: RefreshCw, text: t("adBlockGuard.browsers.chromeEdge.step4", "Refresh the page to continue"), action: "click", color: "#3b82f6" },
      ],
    },
    {
      id: "brave",
      name: t("adBlockGuard.browsers.brave.name", "Brave"),
      icon: ShieldIcon,
      instruction: t("adBlockGuard.browsers.brave.instruction", "Click the Lion icon next to the URL bar → Toggle Shields to 'Down'."),
      detailedSteps: [
        { icon: ShieldIcon, text: t("adBlockGuard.browsers.brave.step1", "Locate the Brave Lion icon next to the address bar"), action: "click", color: "#3b82f6" },
        { icon: Power, text: t("adBlockGuard.browsers.brave.step2", "Click 'Shields' and toggle it to 'Down' for this site"), action: "disable", color: "#ef4444" },
        { icon: RefreshCw, text: t("adBlockGuard.browsers.brave.step3", "Refresh the page to continue"), action: "click", color: "#3b82f6" },
      ],
    },
    {
      id: "safari",
      name: t("adBlockGuard.browsers.safari.name", "Safari"),
      icon: Globe,
      instruction: t("adBlockGuard.browsers.safari.instruction", "Go to Settings → Safari → Content Blockers → Disable for Integri AI."),
      detailedSteps: [
        { icon: Settings, text: t("adBlockGuard.browsers.safari.step1", "Open Safari Settings (Safari menu → Preferences)"), action: "click", color: "#3b82f6" },
        { icon: ShieldIcon, text: t("adBlockGuard.browsers.safari.step2", "Navigate to the 'Websites' tab → 'Content Blockers'"), action: "click", color: "#3b82f6" },
        { icon: Power, text: t("adBlockGuard.browsers.safari.step3", "Find 'Integri AI' and disable content blocking"), action: "disable", color: "#ef4444" },
        { icon: RefreshCw, text: t("adBlockGuard.browsers.safari.step4", "Refresh the page to continue"), action: "click", color: "#3b82f6" },
      ],
    },
    {
      id: "ublock",
      name: t("adBlockGuard.browsers.ublock.name", "uBlock Origin"),
      icon: ShieldIcon,
      instruction: t("adBlockGuard.browsers.ublock.instruction", "Click the uBlock icon → Click the large Power Button → Refresh."),
      detailedSteps: [
        { icon: ShieldIcon, text: t("adBlockGuard.browsers.ublock.step1", "Click the uBlock Origin icon in your toolbar"), action: "click", color: "#3b82f6" },
        { icon: Power, text: t("adBlockGuard.browsers.ublock.step2", "Click the large Power Button to disable uBlock for this site"), action: "disable", color: "#ef4444" },
        { icon: RefreshCw, text: t("adBlockGuard.browsers.ublock.step3", "Refresh the page to continue"), action: "click", color: "#3b82f6" },
      ],
    },
  ];

  return (
    <>
      {/* Custom Scrollbar Styles */}
      <style>{`
        /* Thin scrollbar for AdBlockGuard */
        .adblock-guard-scrollbar::-webkit-scrollbar {
          width: 3px;
          height: 3px;
        }
        .adblock-guard-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .adblock-guard-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 1.5px;
        }
        .adblock-guard-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>
      {/* Root Container - "True Tease" Backdrop */}
      <div
        ref={containerRef}
        tabIndex={-1}
        className="fixed inset-0 z-[999999] flex items-center justify-center bg-zinc-800 backdrop-blur-[20px] p-4"
      >
        {/* Zinc Dashboard Modal - 16:10 Wide Format */}
        <div
          ref={modalRef}
          className={cn(
            "max-w-5xl w-full bg-zinc-900/90 border border-white/10 rounded-[2.5rem] shadow-2xl flex overflow-hidden adblock-guard-scrollbar relative",
            isMobile ? "flex-col max-h-[90vh] overflow-y-auto" : "flex-row",
            !isMobile && "aspect-[16/10]"
          )}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
          } as React.CSSProperties}
        >
          {/* Language Selector Dropdown */}
          <div className={cn(
            "absolute z-[9999]",
            isMobile ? "top-3" : "top-4 md:top-6",
            i18n.dir() === 'rtl' 
              ? (isMobile ? "left-3" : "left-4 md:left-6") 
              : (isMobile ? "right-3" : "right-4 md:right-6")
          )}>
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className={cn(
                "bg-zinc-800/80 border border-white/10 text-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3b82f6] hover:bg-zinc-700/80 cursor-pointer appearance-none transition-colors",
                isMobile ? "text-[10px] py-1" : "text-xs py-1.5"
              )}
              style={{
                paddingRight: i18n.dir() === 'rtl' ? (isMobile ? "8px" : "12px") : (isMobile ? "22px" : "28px"),
                paddingLeft: i18n.dir() === 'rtl' ? (isMobile ? "22px" : "28px") : (isMobile ? "8px" : "12px"),
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${isMobile ? 12 : 14}' height='${isMobile ? 12 : 14}' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: i18n.dir() === 'rtl' ? `left ${isMobile ? 4 : 8}px center` : `right ${isMobile ? 4 : 8}px center`,
              }}
            >
              {supportedLngs.map((code) => {
                const meta = languageMetadata[code];
                return (
                  <option key={code} value={code} className="bg-zinc-900 text-white">
                    {meta.flag} {meta.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Desktop: Sidebar (40%) */}
          {!isMobile && (
            <div
              ref={leftPaneRef}
              className="w-[40%] bg-zinc-950 p-10 border-r border-white/5 overflow-y-auto adblock-guard-scrollbar"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
              }}
            >
              <h3 className="text-zinc-400 text-sm uppercase tracking-wider font-semibold mb-6">
                {t("adBlockGuard.systemRecoveryGuide", "SYSTEM RECOVERY GUIDE")}
              </h3>

              {/* Browser Instructions List */}
              <div className="space-y-4">
                {browserInstructions.map((browser, index) => {
                  const Icon = browser.icon;
                  const isActive = activeGuide === browser.id;
                  return (
                    <div
                      key={browser.id}
                      ref={(el) => {
                        sidebarItemsRef.current[index] = el;
                      }}
                      onClick={() => setActiveGuide(isActive ? null : browser.id)}
                      className={cn(
                        "flex items-start gap-3 cursor-pointer hover:cursor-pointer group transition-all",
                        isActive 
                          ? "bg-zinc-800/50 rounded-lg py-4 px-3 my-2" 
                          : "py-1"
                      )}
                    >
                      <Icon 
                        className={cn(
                          "mt-1 shrink-0 transition-colors",
                          isActive ? "text-[#3b82f6]" : "text-zinc-400 group-hover:text-[#3b82f6]"
                        )} 
                        size={20} 
                      />
                      <div>
                        <p className={cn(
                          "text-sm font-medium mb-1 transition-colors",
                          isActive ? "text-[#3b82f6]" : "text-zinc-300 group-hover:text-[#3b82f6]"
                        )}>
                          {browser.name}
                        </p>
                        <p className="text-zinc-500 text-xs leading-relaxed">
                          {browser.instruction}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mobile: Top Section - Shield & Locked Message (40% height) */}
          {isMobile && (
            <div
              ref={rightPaneRef}
              className="w-full flex flex-col items-center justify-center p-6 text-center flex-shrink-0"
              style={{ minHeight: "40%" }}
            >
              {/* Shield Icon with Electric Blue Glow */}
              <div className="relative mb-4 flex items-center justify-center">
                {/* Electric Blue Glow Effect */}
                <div
                  ref={shieldGlowRef}
                  className="absolute rounded-full blur-3xl w-32 h-32"
                  style={{ backgroundColor: "rgba(59, 130, 246, 0.4)" }}
                />

                {/* Shield SVG */}
                <svg
                  ref={shieldRef}
                  width="80"
                  height="80"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-zinc-100 relative z-10"
                >
                  <path
                    d="M32 8L12 16V32C12 42.5 18 51.5 32 56C46 51.5 52 42.5 52 32V16L32 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="rgba(244, 244, 245, 0.1)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M24 32L28 36L40 24"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Header with Signal Red LOCKED */}
              <h2 className="text-zinc-100 text-xl font-bold tracking-[0.15em] uppercase">
                {t("adBlockGuard.systemIntegrity", "SYSTEM INTEGRITY:")} <span className="text-[#ef4444]" style={{ textShadow: "0 0 20px rgba(239, 68, 68, 0.5)" }}>{t("adBlockGuard.locked", "LOCKED")}</span>
              </h2>
            </div>
          )}

          {/* Mobile: Middle Section - Buttons */}
          {isMobile && (
            <div className="w-full px-6 pb-4 flex flex-col gap-3 flex-shrink-0">
              {/* Pro Button with Constant Shimmer */}
              <button
                onClick={handleUpgrade}
                className="relative overflow-hidden bg-zinc-100 text-zinc-950 rounded-2xl py-4 px-6 font-bold hover:bg-white hover:cursor-pointer transition-all"
              >
                {/* Constant Slow Shimmer Ray */}
                <div
                  ref={shimmerPrimaryRef}
                  className="absolute inset-0 opacity-50"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
                    width: "40%",
                  }}
                />
                <span className="relative z-10">{t("adBlockGuard.upgradeToPro", "Upgrade to Pro")}</span>
              </button>

              {/* Secondary Ghost Button with Red/Blue Border Glow */}
              <button
                ref={buttonRef}
                onClick={handleRefresh}
                className="relative overflow-hidden border-2 rounded-2xl py-4 px-6 font-medium hover:cursor-pointer transition-all flex items-center justify-center gap-2"
                style={{
                  borderColor: "#3b82f6",
                  color: "#3b82f6",
                  boxShadow: "0 0 15px rgba(59, 130, 246, 0.3), 0 0 15px rgba(239, 68, 68, 0.2)",
                }}
              >
                <RefreshCw size={18} className="relative z-10" />
                <span className="relative z-10">{t("adBlockGuard.iveDisabledIt", "I've Disabled It")}</span>
              </button>
            </div>
          )}

          {/* Mobile: Bottom Section - Recovery Guide Accordion */}
          {isMobile && (
            <div className="w-full border-t border-white/5 flex-shrink-0">
              <button
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                className="w-full flex items-center justify-between p-4 text-zinc-400 hover:text-zinc-300 hover:cursor-pointer transition-colors"
              >
                <span className="text-sm pl-6 uppercase tracking-wider font-semibold">{t("adBlockGuard.howToFix", "How to Fix")}</span>
                <ChevronDown 
                  size={18} 
                  className={cn(
                    "transition-transform duration-300",
                    isAccordionOpen && "rotate-180"
                  )}
                />
              </button>
              
              {isAccordionOpen && (
                <div className="px-4 pb-4 space-y-3">
                  {browserInstructions.map((browser) => {
                    const Icon = browser.icon;
                    return (
                      <div key={browser.name} className="flex items-start gap-3">
                        <Icon className="text-zinc-400 mt-1 shrink-0" size={18} />
                        <div>
                          <p className="text-zinc-300 text-xs font-medium mb-1">{browser.name}</p>
                          <p className="text-zinc-500 text-xs leading-relaxed">{browser.instruction}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Desktop: Main Pane (60%) */}
          {!isMobile && (
            <div
              ref={rightPaneRef}
              className="w-[60%] relative overflow-hidden"
            >
              <div
                ref={rightPaneContentRef}
                className="absolute inset-0 flex flex-col p-8"
              >
                {!activeGuide ? (
                  /* Default View: Shield/Locked */
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    {/* Shield Icon with Electric Blue Glow */}
                    <div className="relative mb-8 flex items-center justify-center">
                      {/* Electric Blue Glow Effect */}
                      <div
                        ref={shieldGlowRef}
                        className="absolute rounded-full blur-3xl w-48 h-48"
                        style={{ backgroundColor: "rgba(59, 130, 246, 0.4)" }}
                      />

                      {/* Shield SVG */}
                      <svg
                        ref={shieldRef}
                        width="120"
                        height="120"
                        viewBox="0 0 64 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-zinc-100 relative z-10"
                      >
                        <path
                          d="M32 8L12 16V32C12 42.5 18 51.5 32 56C46 51.5 52 42.5 52 32V16L32 8Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="rgba(244, 244, 245, 0.1)"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M24 32L28 36L40 24"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {/* Header with Signal Red LOCKED */}
                    <h2 className="text-zinc-100 text-3xl font-bold mb-4 tracking-[0.2em] uppercase">
                      {t("adBlockGuard.systemIntegrity", "SYSTEM INTEGRITY:")} <span className="text-[#ef4444]" style={{ textShadow: "0 0 20px rgba(239, 68, 68, 0.5)" }}>{t("adBlockGuard.locked", "LOCKED")}</span>
                    </h2>

                    {/* Subtext */}
                    <p className="text-zinc-400 text-base mb-8 leading-relaxed max-w-md">
                      {t("adBlockGuard.description", "To protect Integri's high-performance AI models, please disable your blocker to continue.")}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 w-full max-w-sm">
                      {/* Pro Button - Pure Zinc-100 Metallic with Constant Shimmer */}
                      <button
                        onClick={handleUpgrade}
                        className="relative overflow-hidden bg-zinc-100 text-zinc-950 rounded-2xl py-4 px-8 font-bold hover:bg-white hover:cursor-pointer transition-all"
                      >
                        {/* Constant Slow Shimmer Ray */}
                        <div
                          ref={shimmerPrimaryRef}
                          className="absolute inset-0 opacity-50"
                          style={{
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
                            width: "40%",
                          }}
                        />
                        <span className="relative z-10">{t("adBlockGuard.upgradeToPro", "Upgrade to Pro")}</span>
                      </button>

                      {/* Secondary Ghost Button with Red/Blue Border Glow */}
                      <button
                        ref={buttonRef}
                        onClick={handleRefresh}
                        className="relative overflow-hidden border-2 rounded-2xl py-4 px-8 font-medium hover:cursor-pointer transition-all flex items-center justify-center gap-2"
                        style={{
                          borderColor: "#3b82f6",
                          color: "#3b82f6",
                          boxShadow: "0 0 15px rgba(59, 130, 246, 0.3), 0 0 15px rgba(239, 68, 68, 0.2)",
                        }}
                      >
                        <RefreshCw size={18} className="relative z-10" />
                        <span className="relative z-10">{t("adBlockGuard.iveDisabledIt", "I've Disabled It")}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Detailed Guide View */
                  <div ref={guideContentRef} className="flex flex-col h-full">
                    {/* Back Button */}
                    <button
                      onClick={() => setActiveGuide(null)}
                      className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 hover:cursor-pointer transition-colors mb-3 self-start"
                    >
                      <ArrowLeft size={18} />
                      <span className="text-sm">{t("adBlockGuard.back", "Back")}</span>
                    </button>

                    {/* Guide Content */}
                    {(() => {
                      const guide = browserInstructions.find((b) => b.id === activeGuide);
                      if (!guide) return null;

                      const GuideIcon = guide.icon;

                      return (
                        <div 
                          className="flex flex-col flex-1 overflow-y-auto adblock-guard-scrollbar"
                          style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
                          }}
                        >
                          {/* Large Browser Icon */}
                          <div className="flex justify-center mb-4">
                            <div className="relative">
                              <div
                                className="absolute rounded-full blur-2xl w-20 h-20"
                                style={{ backgroundColor: "rgba(59, 130, 246, 0.3)" }}
                              />
                              <GuideIcon
                                className="relative z-10"
                                size={50}
                                style={{ color: "#3b82f6" }}
                              />
                            </div>
                          </div>

                          {/* Guide Title */}
                          <h3 className="text-zinc-100 text-xl font-bold mb-3 text-center">
                            {guide.name} {t("adBlockGuard.guide", "Guide")}
                          </h3>

                          {/* Step-by-Step Instructions */}
                          <div className="space-y-2 mt-3">
                            {guide.detailedSteps.map((step, index) => {
                              const StepIcon = step.icon;
                              const isClickAction = step.action === "click";
                              const isDisableAction = step.action === "disable";

                              return (
                                <div
                                  key={index}
                                  className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30 border border-white/5"
                                >
                                  {/* Step Number */}
                                  <div
                                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                    style={{
                                      backgroundColor: step.color + "20",
                                      color: step.color,
                                    }}
                                  >
                                    {index + 1}
                                  </div>

                                  {/* Step Content */}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <StepIcon
                                        size={16}
                                        style={{
                                          color: step.color,
                                        }}
                                      />
                                      <span
                                        className="text-zinc-100 text-xs font-medium leading-relaxed"
                                        style={{
                                          color: isClickAction ? "#3b82f6" : isDisableAction ? "#ef4444" : "#e4e4e7",
                                        }}
                                      >
                                        {step.text}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Action Button */}
                          <div className="mt-4 pt-4 border-t border-white/5">
                            <button
                              ref={buttonRef}
                              onClick={handleRefresh}
                              className="w-full relative overflow-hidden border-2 rounded-2xl py-4 px-8 font-medium hover:cursor-pointer transition-all flex items-center justify-center gap-2"
                              style={{
                                borderColor: "#3b82f6",
                                color: "#3b82f6",
                                boxShadow: "0 0 15px rgba(59, 130, 246, 0.3), 0 0 15px rgba(239, 68, 68, 0.2)",
                              }}
                            >
                              <RefreshCw size={18} className="relative z-10" />
                              <span className="relative z-10">{t("adBlockGuard.iveDisabledIt", "I've Disabled It")}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdBlockGuard;
