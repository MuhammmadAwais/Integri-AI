import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";

const GettingStarted: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Image Scale & Fade In
      tl.from(imageRef.current, {
        scale: 1.2,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      })
        // Content Slide Up
        .from(
          contentRef.current,
          {
            y: 100,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
          },
          "-=1"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleGetStarted = () => {
    // Navigate to Main App (Home)
    navigate("/");
  };

  return (
    <div
      ref={containerRef}
      className="h-screen w-full bg-black relative overflow-hidden flex flex-col"
    >
      {/* Background Image Area */}
      <div className="flex-1 relative w-full h-[65%]">
        {/* Futuristic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-10" />

        <img
          ref={imageRef}
          src="/public/gettingStarted.png" // Make sure this image exists
          alt="Future VR"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1622979135225-d2ba269fb1ac?q=80&w=2070";
          }}
        />
      </div>

      {/* Content Area */}
      <div
        ref={contentRef}
        className="relative z-20 px-8 pb-12 pt-4 flex flex-col items-center text-center space-y-6 bg-black"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
          The Future of Chat is Here <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">
            With AI Technology
          </span>
        </h1>

        <p className="text-gray-400 text-sm md:text-base max-w-md leading-relaxed">
          The future of chat is here with AI technology implies that the
          integration of AI into chat technology is already happening.
        </p>

        <button
          onClick={handleGetStarted}
          className="w-full max-w-md py-4 rounded-full bg-[#D32F2F] text-white font-bold text-lg shadow-lg shadow-red-900/40 hover:scale-105 hover:bg-[#B71C1C] transition-all duration-300 active:scale-95 cursor-pointer"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default GettingStarted;
