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
  const leftSectionRef = useRef<HTMLDivElement>(null);
  const circleRef1 = useRef<HTMLDivElement>(null);
  const circleRef2 = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Background float animation
      gsap.to(circleRef1.current, {
        x: 50,
        y: -50,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(circleRef2.current, {
        x: -30,
        y: 30,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Entrance animation for content
      gsap.from(".auth-content-item", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2,
      });
    }, leftSectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-[#1a1a1a]">
      {/* --- LEFT SIDE: Visuals (Hidden on Mobile) --- */}
      <div
        ref={leftSectionRef}
        className="hidden lg:flex w-1/2 h-full relative items-center justify-center bg-[#0F0F12] overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[url('https://assets.codepen.io/1462889/stars.png')] opacity-30 animate-pulse" />

        {/* Floating Orbs */}
        <div
          ref={circleRef1}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px]"
        />
        <div
          ref={circleRef2}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-[80px]"
        />

        {/* Content Overlay */}
        <div className="relative z-10 p-12 text-center max-w-lg">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl mx-auto mb-8 shadow-2xl shadow-indigo-500/40 flex items-center justify-center">
            <span className="text-4xl">🤖</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Integri AI
            </span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Experience the next generation of AI conversation. Secure,
            intelligent, and designed for the future.
          </p>
        </div>

        {/* Glass Effect Overlay */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
      </div>

      {/* --- RIGHT SIDE: Form Area --- */}
      <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        {/* Mobile Background Elements */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-50 to-white dark:from-[#2A2B32] dark:to-[#1a1a1a] -z-10" />

        <div className="w-full max-w-md space-y-8 auth-content-item">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
