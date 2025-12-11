import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
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
      className="flex min-h-screen items-center w-full bg-[#18181B] overflow-hidden" 
    >
      {/* --- LEFT SIDE: Form --- */}
      <div className="w-full lg:w-1/2 h-screen md:h-auto flex items-center justify-center p-8 sm:p-12 relative z-10">
        {/* Decorative Background Blob */}
        <div className="absolute  top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md mx-auto">
          <div className="mb-6 auth-content">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-3">
              <img src="/dark-theme-logo.png" alt="Logo" className="w-12 h-12" />
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                {title}
              </h2>
              <p className="text-gray-400 text-base leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="auth-content w-full">{children}</div>
        </div>
      </div>

      {/* --- RIGHT SIDE: Image --- */}
      <div className="hidden lg:block w-1/2 relative p-4 h-screen top-0">
        <div className="relative w-full h-full rounded-3xl overflow-hidden sticky  shadow-2xl bg-black border border-[#27272A]">
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
