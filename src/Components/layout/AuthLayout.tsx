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
        x: -50,
        opacity: 0,
        duration: 1,
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
      className="flex h-screen w-full overflow-hidden bg-[#18181B]"
    >
      {/* --- LEFT SIDE: Form --- */}
      {/* IMPROVEMENT: Changed px-8 to px-6 for better mobile fit. Kept lg:px-24 for desktop. */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-24 relative z-10">
        <div className="w-full max-w-lg mx-auto lg:mx-0">
          <div className="mb-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
                I
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Integri AI
              </span>
            </div>

            <div className="auth-content">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                {title}
              </h2>
              <p className="text-gray-400 text-base md:text-lg leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="auth-content w-full">{children}</div>
        </div>
      </div>

      {/* --- RIGHT SIDE: Image (VR Person) --- */}
      <div className="hidden lg:block w-1/2 h-full relative p-4">
        <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-black">
          {/* Overlay for better text contrast if you ever add text here */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/50 to-indigo-900/30 z-10 mix-blend-overlay" />
          <img
            ref={imageRef}
            src="/VR_Image.png"
            alt="VR Future"
            className="w-full h-full object-cover opacity-90"
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
