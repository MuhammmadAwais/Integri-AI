import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { useSubscription } from "../hooks/useSubscription";
import { useAdBlockDetector } from "../hooks/useAdBlockDetector";
import { cn } from "../../../lib/utils";
import { RefreshCw, Chrome, Globe, Shield as ShieldIcon, ChevronDown } from "lucide-react";

interface AdBlockGuardProps {
  children?: React.ReactNode;
}

const AdBlockGuard: React.FC<AdBlockGuardProps> = ({ children }) => {
  const { isPro, isPremium } = useSubscription();
  const { isBlocked } = useAdBlockDetector();

  const [isMobile, setIsMobile] = useState(false);

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
    if (isBlocked) {
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
  }, [isBlocked]);

  // GSAP Animations - Entrance with Elastic.out and shield pulse
  useLayoutEffect(() => {
    if (!isBlocked || !modalRef.current) return;

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

      // Stagger animation for panes
      if (leftPaneRef.current && rightPaneRef.current) {
        gsap.fromTo(
          [leftPaneRef.current, rightPaneRef.current],
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.4,
            stagger: 0.1,
            ease: "power2.out",
          },
        );
      }

      // Shield pulse animation (slow GSAP pulse)
      if (shieldRef.current) {
        gsap.to(shieldRef.current, {
          scale: 1.05,
          duration: 2.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      // Electric Blue glow breathing animation for shield
      if (shieldGlowRef.current) {
        gsap.to(shieldGlowRef.current, {
          scale: 1.15,
          opacity: 0.6,
          duration: 2.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      // Constant slow shimmer ray for Pro button (continuous loop)
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
  }, [isBlocked]);

  // Sidebar item hover effect - shift 5px to the right
  useEffect(() => {
    if (!isBlocked || isMobile) return;

    const items = sidebarItemsRef.current.filter(Boolean);
    
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

      return () => {
        item.removeEventListener("mouseenter", handleMouseEnter);
        item.removeEventListener("mouseleave", handleMouseLeave);
      };
    });
  }, [isBlocked, isMobile]);

  // Magnetic button effect
  useEffect(() => {
    if (!buttonRef.current || !isBlocked) return;

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
  }, [isBlocked]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleUpgrade = () => {
    window.location.href = "/subscriptions";
  };

  // Bypass for Pro/Premium users - return children immediately
  // Only show guard if subscription !== 'pro' (i.e., not pro and not premium)
  if (isPro || isPremium) {
    return <>{children}</>;
  }

  // Don't show guard if not blocked
  if (!isBlocked) {
    return <>{children}</>;
  }

  // Browser instructions data
  const browserInstructions = [
    {
      name: "Chrome",
      icon: Chrome,
      instruction: "Click the Puzzle/Shield icon in your toolbar → find your AdBlocker → Toggle 'OFF' for this site.",
    },
    {
      name: "Brave",
      icon: ShieldIcon,
      instruction: "Click the Lion icon next to the URL bar → Toggle Shields to 'Down'.",
    },
    {
      name: "Safari",
      icon: Globe,
      instruction: "Go to Settings → Safari → Content Blockers → Disable for Integri AI.",
    },
    {
      name: "uBlock Origin",
      icon: ShieldIcon,
      instruction: "Click the uBlock icon → Click the large Power Button → Refresh.",
    },
  ];

  return (
    <>
      {/* Root Container - "True Tease" Backdrop */}
      <div
        ref={containerRef}
        tabIndex={-1}
        className="fixed inset-0 z-[999999] flex items-center justify-center bg-zinc-950/40 backdrop-blur-[20px] p-4"
      >
        {/* Zinc Dashboard Modal - 16:10 Wide Format */}
        <div
          ref={modalRef}
          className={cn(
            "max-w-5xl w-full bg-zinc-900/90 border border-white/10 rounded-[2.5rem] shadow-2xl flex overflow-hidden",
            isMobile ? "flex-col max-h-[90vh] overflow-y-auto" : "flex-row",
            !isMobile && "aspect-[16/10]"
          )}
        >
          {/* Desktop: Sidebar (40%) */}
          {!isMobile && (
            <div
              ref={leftPaneRef}
              className="w-[40%] bg-zinc-950 p-10 border-r border-white/5 overflow-y-auto"
            >
              <h3 className="text-zinc-400 text-sm uppercase tracking-wider font-semibold mb-6">
                SYSTEM RECOVERY GUIDE
              </h3>

              {/* Browser Instructions List */}
              <div className="space-y-4">
                {browserInstructions.map((browser, index) => {
                  const Icon = browser.icon;
                  return (
                    <div
                      key={browser.name}
                      ref={(el) => {
                        sidebarItemsRef.current[index] = el;
                      }}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <Icon 
                        className="text-zinc-400 group-hover:text-[#3b82f6] mt-1 shrink-0 transition-colors" 
                        size={20} 
                      />
                      <div>
                        <p className="text-zinc-300 text-sm font-medium mb-1 group-hover:text-[#3b82f6] transition-colors">
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
                SYSTEM INTEGRITY: <span className="text-[#ef4444]" style={{ textShadow: "0 0 20px rgba(239, 68, 68, 0.5)" }}>LOCKED</span>
              </h2>
            </div>
          )}

          {/* Mobile: Middle Section - Buttons */}
          {isMobile && (
            <div className="w-full px-6 pb-4 flex flex-col gap-3 flex-shrink-0">
              {/* Pro Button with Constant Shimmer */}
              <button
                onClick={handleUpgrade}
                className="relative overflow-hidden bg-zinc-100 text-zinc-950 rounded-2xl py-4 px-6 font-bold hover:bg-white transition-all"
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
                <span className="relative z-10">Upgrade to Pro</span>
              </button>

              {/* Secondary Ghost Button with Red/Blue Border Glow */}
              <button
                ref={buttonRef}
                onClick={handleRefresh}
                className="relative overflow-hidden border-2 rounded-2xl py-4 px-6 font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  borderColor: "#3b82f6",
                  color: "#3b82f6",
                  boxShadow: "0 0 15px rgba(59, 130, 246, 0.3), 0 0 15px rgba(239, 68, 68, 0.2)",
                }}
              >
                <RefreshCw size={18} className="relative z-10" />
                <span className="relative z-10">I've Disabled It</span>
              </button>
            </div>
          )}

          {/* Mobile: Bottom Section - Recovery Guide Accordion */}
          {isMobile && (
            <div className="w-full border-t border-white/5 flex-shrink-0">
              <button
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                className="w-full flex items-center justify-between p-4 text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                <span className="text-sm uppercase tracking-wider font-semibold">How to Fix</span>
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
              className="w-[60%] flex flex-col items-center justify-center p-12 text-center"
            >
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
                SYSTEM INTEGRITY: <span className="text-[#ef4444]" style={{ textShadow: "0 0 20px rgba(239, 68, 68, 0.5)" }}>LOCKED</span>
              </h2>

              {/* Subtext */}
              <p className="text-zinc-400 text-base mb-8 leading-relaxed max-w-md">
                To protect Integri's high-performance AI models, please disable your blocker to continue.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full max-w-sm">
                {/* Pro Button - Pure Zinc-100 Metallic with Constant Shimmer */}
                <button
                  onClick={handleUpgrade}
                  className="relative overflow-hidden bg-zinc-100 text-zinc-950 rounded-2xl py-4 px-8 font-bold hover:bg-white transition-all"
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
                  <span className="relative z-10">Upgrade to Pro</span>
                </button>

                {/* Secondary Ghost Button with Red/Blue Border Glow */}
                <button
                  ref={buttonRef}
                  onClick={handleRefresh}
                  className="relative overflow-hidden border-2 rounded-2xl py-4 px-8 font-medium transition-all flex items-center justify-center gap-2"
                  style={{
                    borderColor: "#3b82f6",
                    color: "#3b82f6",
                    boxShadow: "0 0 15px rgba(59, 130, 246, 0.3), 0 0 15px rgba(239, 68, 68, 0.2)",
                  }}
                >
                  <RefreshCw size={18} className="relative z-10" />
                  <span className="relative z-10">I've Disabled It</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdBlockGuard;
