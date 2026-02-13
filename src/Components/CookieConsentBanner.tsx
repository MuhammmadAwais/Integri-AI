import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useCookieConsent } from "../hooks/useCookieConsent";

const CookieConsentBanner: React.FC = () => {
  const { showBanner, acceptCookies, rejectCookies } = useCookieConsent();
  const bannerRef = useRef<HTMLDivElement>(null);
  const cookieRef = useRef<HTMLImageElement>(null);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);
  const rejectButtonRef = useRef<HTMLButtonElement>(null);

  // Entrance animation and cookie wiggle
  useEffect(() => {
    if (!showBanner || !bannerRef.current) return;

    const ctx = gsap.context(() => {
      // Entrance animation - slide up from bottom-right
      gsap.fromTo(
        bannerRef.current,
        {
          x: 100,
          y: 100,
          opacity: 0,
          scale: 0.8,
        },
        {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.2)",
        }
      );

      // Cookie wiggle animation - continuous subtle rotation
      if (cookieRef.current) {
        gsap.to(cookieRef.current, {
          rotation: 8,
          duration: 2.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      // Button hover animations with shimmer
      if (acceptButtonRef.current) {
        const acceptBtn = acceptButtonRef.current;
        const shimmer = acceptBtn.querySelector(".shimmer-effect");
        
        acceptBtn.addEventListener("mouseenter", () => {
          gsap.to(acceptBtn, {
            scale: 1.05,
            duration: 0.2,
            ease: "power2.out",
          });
          if (shimmer) {
            gsap.to(shimmer, {
              x: "100%",
              duration: 0.6,
              ease: "power2.inOut",
            });
          }
        });
        acceptBtn.addEventListener("mouseleave", () => {
          gsap.to(acceptBtn, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
          });
          if (shimmer) {
            gsap.set(shimmer, { x: "-100%" });
          }
        });
      }

      if (rejectButtonRef.current) {
        const rejectBtn = rejectButtonRef.current;
        rejectBtn.addEventListener("mouseenter", () => {
          gsap.to(rejectBtn, {
            scale: 1.05,
            duration: 0.2,
            ease: "power2.out",
          });
        });
        rejectBtn.addEventListener("mouseleave", () => {
          gsap.to(rejectBtn, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
          });
        });
      }
    }, bannerRef);

    return () => {
      ctx.revert();
    };
  }, [showBanner]);

  const handleAccept = () => {
    if (bannerRef.current) {
      gsap.to(bannerRef.current, {
        x: 100,
        y: 100,
        opacity: 0,
        scale: 0.8,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          acceptCookies();
        },
      });
    } else {
      acceptCookies();
    }
  };

  const handleReject = () => {
    if (bannerRef.current) {
      gsap.to(bannerRef.current, {
        x: 100,
        y: 100,
        opacity: 0,
        scale: 0.8,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          rejectCookies();
        },
      });
    } else {
      rejectCookies();
    }
  };

  if (!showBanner) return null;

  return (
    <div
      ref={bannerRef}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] backdrop-blur-[16px] bg-zinc-950/80 border border-white/10 rounded-2xl p-4 md:p-5 shadow-2xl w-[calc(100%-2rem)] sm:w-auto sm:max-w-[520px]"
      style={{
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 0 40px rgba(59, 130, 246, 0.25)",
      }}
    >
      <div className="flex flex-row gap-3 md:gap-4 items-center">
        {/* Left - Cookie Icon */}
        <div className="flex-shrink-0">
          <img
            ref={cookieRef}
            src="/cookie-illustration.png"
            alt="Cookie"
            className="w-12 h-12 md:w-16 md:h-16 object-contain"
          />
        </div>

        {/* Right - Content */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Headline */}
          <h3 className="text-zinc-100 font-bold text-base md:text-lg mb-1 md:mb-2">
            We use cookies!
          </h3>

          {/* Body */}
          <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-3 md:mb-4">
            We use essential cookies to run Integri AI and optional cookies to enhance your experience. Pick your preference below.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            {/* Primary Button - Accept All */}
            <button
              ref={acceptButtonRef}
              onClick={handleAccept}
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 text-white font-semibold rounded-xl py-2.5 px-5 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all hover:cursor-pointer relative overflow-hidden group flex-1"
            >
              {/* Shimmer effect */}
              <span className="shimmer-effect absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2" style={{ transform: "translateX(-100%)" }}></span>
              <span className="relative z-10">Accept All</span>
            </button>

            {/* Secondary Button - Essential Only (Transparent with border) */}
            <button
              ref={rejectButtonRef}
              onClick={handleReject}
              className="border-2 border-blue-500 text-blue-500 bg-transparent hover:bg-blue-500/10 hover:text-blue-400 font-semibold rounded-xl py-2.5 px-5 transition-all hover:cursor-pointer flex-1"
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
