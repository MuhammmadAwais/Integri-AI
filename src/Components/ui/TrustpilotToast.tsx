import React, { useState, useRef, useLayoutEffect } from 'react';
import { X, Star } from 'lucide-react';
import gsap from 'gsap';
import { useAppSelector } from '../../hooks/useRedux';

const TrustpilotToast: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const toastRef = useRef<HTMLAnchorElement>(null);
  const isDark = useAppSelector((state: any) => state.theme?.isDark ?? true);

  useLayoutEffect(() => {
    if (!toastRef.current) return;

    const ctx = gsap.context(() => {
      // Entrance animation
      gsap.fromTo(
        toastRef.current,
        { 
          y: 100, 
          opacity: 0,
          scale: 0.9
        },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          duration: 0.8,
          delay: 2,
          ease: "back.out(1.7)"
        }
      );
    }, toastRef);

    return () => ctx.revert();
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent redirect
    e.preventDefault();
    
    // Dismissal animation
    gsap.to(toastRef.current, {
      y: 50,
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => setIsVisible(false)
    });
  };

  if (!isVisible) return null;

  return (
    <a
      ref={toastRef}
      href="https://www.trustpilot.com/review/integri.app?utm_medium=trustbox&utm_source=TrustBoxReviewCollector/"
      target="_blank"
      rel="noopener noreferrer"
      className={`
        fixed bottom-6 right-6 z-999 
        flex items-center gap-3 px-4 py-3 
        shadow-2xl hover:scale-105 hover:cursor-pointer
        transition-transform duration-200
        sm:bottom-8 sm:right-8 sm:scale-100 scale-90 origin-bottom-right
        ${isDark 
          ? 'bg-[#18181b]/80 backdrop-blur-md border border-[#27272a] text-white' 
          : 'bg-white/80 backdrop-blur-md border border-gray-200 text-gray-900'}
      `}
      style={{
        borderRadius: '12px',
      }}
    >
      {/* Icon */}
      <div className="flex items-center justify-center p-1.5 rounded-full bg-green-500/10 text-green-500">
        <Star size={18} fill="currentColor" strokeWidth={1.5} />
      </div>

      {/* Content */}
      <div className="flex flex-col pr-4">
        <span className="text-[13px] font-semibold tracking-wide whitespace-nowrap">
          Review us on <span className="text-green-500 font-bold tracking-normal">Trustpilot</span>
        </span>
      </div>

      {/* Close Button */}
      <button
        onClick={handleDismiss}
        title="Dismiss"
        className={`
          absolute top-1.5 right-1.5 p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity hover:cursor-pointer
          ${isDark ? 'hover:bg-[#27272a]' : 'hover:bg-gray-100'}
        `}
      >
        <X size={14} />
      </button>
    </a>
  );
};

export default TrustpilotToast;
