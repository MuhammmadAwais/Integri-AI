import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  logoTitleHorizontal?: boolean; // If true, logo and title are in same row; if false, stacked vertically
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  logoTitleHorizontal = false, // Default to vertical stacking (for login page)
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance Animation
      gsap.from(".auth-content", {
        y: 20, // Move from bottom slightly
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2,
      });

      gsap.from(imageRef.current, {
        scale: 1.1,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex min-h-screen max-h-screen items-center w-full bg-[#07060A] overflow-hidden" 
    >
      {/* --- LEFT SIDE: Form --- */}
      <div className="w-full lg:w-1/2 h-screen md:h-auto flex items-center justify-center p-6 sm:p-8 md:p-12 relative z-10 overflow-hidden">
        {/* Decorative Background Blob */}
        <div className="absolute  top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#5EEAD4]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md mx-auto">
          <div className="mb-6 auth-content">
            {logoTitleHorizontal ? (
              // Horizontal Layout: Logo and Title in Same Row (for Signup)
              <>
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <img 
                    src="/dark-theme-logo.png" 
                    alt="Logo" 
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 shrink-0" 
                  />
                  <h2 className="text-3xl sm:text-4xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                    {title}
                  </h2>
                </div>
                {/* Subtitle - Below Title, Left-Aligned */}
                {subtitle && (
                  <p className="text-gray-400 text-base sm:text-base leading-relaxed pl-[48px] sm:pl-[60px] md:pl-[68px]">
                    {subtitle}
                  </p>
                )}
              </>
            ) : (
              // Vertical Layout: Logo, Title, Subtitle Stacked (for Login)
              <>
                {/* Logo - Top */}
                <div className="mb-3 sm:mb-4">
                  <img 
                    src="/dark-theme-logo.png" 
                    alt="Logo" 
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14" 
                  />
                </div>
                {/* Title - Below Logo, Left-Aligned */}
                <h2 className="text-3xl sm:text-4xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-2 sm:mb-3">
                  {title}
                </h2>
                {/* Subtitle - Below Title, Left-Aligned */}
                {subtitle && (
                  <p className="text-gray-400 text-base sm:text-base leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="auth-content w-full">{children}</div>
        </div>
      </div>

      {/* --- RIGHT SIDE: Image --- */}
      <div className="hidden lg:block w-1/2 relative p-4 h-screen top-0 overflow-hidden">
        <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-black border border-[#2A2830]">
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent z-10" />
          <img
            ref={imageRef}
            src="/VR_Image.png"
            alt="VR Future"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1622979135225-d2ba269fb1ac?q=80&w=2070";
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
