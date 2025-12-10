import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useAppDispatch } from "../hooks/useRedux";
import { completeOnboarding } from "../features/auth/slices/authSlice";

const GettingStarted: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(imageRef.current, {
        scale: 1.2,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
      }).from(
        contentRef.current,
        { y: 50, opacity: 0, duration: 1, ease: "power3.out" },
        "-=1"
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleGetStarted = () => {
    dispatch(completeOnboarding()); // Mark as "Old User"
    navigate("/"); // Go to Home
  };

  return (
    // FIX: 'md:flex-row-reverse' splits screen on desktop
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-black relative overflow-hidden flex flex-col md:flex-row-reverse"
    >
      {/* 1. IMAGE SECTION */}
      <div className="relative w-full h-[55vh] md:h-screen md:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black md:bg-gradient-to-l z-10" />
        <img
          ref={imageRef}
          src="/gettingStarted.png"
          alt="Future VR"
          className="w-full h-full object-cover object-center"
          // Fallback if your image is missing
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1622979135225-d2ba269fb1ac?q=80&w=2070";
          }}
        />
      </div>

      {/* 2. TEXT SECTION */}
      <div
        ref={contentRef}
        className="relative z-20 flex-1 flex flex-col justify-center items-center md:items-start px-6 pb-12 pt-8 md:p-20 md:w-1/2 bg-black text-center md:text-left"
      >
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          The Future of Chat <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">
            With AI Technology
          </span>
        </h1>
        <p className="text-gray-400 mb-10 text-sm md:text-lg max-w-lg leading-relaxed">
          Unlock the potential of next-gen conversational AI. Integrated
          seamlessly into your workflow.
        </p>

        <button
          onClick={handleGetStarted}
          className="w-full md:w-auto px-10 py-4 rounded-full bg-[#D32F2F] text-white font-bold text-lg shadow-lg shadow-red-900/40 hover:scale-105 hover:bg-[#B71C1C] transition-all duration-300"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default GettingStarted;
