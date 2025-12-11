import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const IntroPortal = ({ onComplete }: { onComplete: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [remove, setRemove] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setRemove(true);
          onComplete();
        },
      });
      // 1. Text Fade In
      tl.to(textRef.current, { opacity: 1, duration: 1, ease: "power2.out" })
        // 2. Text Scale Up (Warp effect)
        .to(
          textRef.current,
          { scale: 20, opacity: 0, duration: 0.8, ease: "expo.in" },
          "+=0.5"
        )
        // 3. Container Fade Out (Reveal App)
        .to(containerRef.current, { opacity: 0, duration: 0.5 });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  if (remove) return null;
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-100 bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Stars Background Effect */}
      <div className="absolute inset-0 bg-[url('https://assets.codepen.io/1462889/stars.png')] animate-pulse opacity-80" />

      <div className="relative z-10 flex flex-col items-center">
        <h1
          ref={textRef}
          className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 tracking-tighter"
        >
          INTEGRI AI
        </h1>
      </div>
    </div>
  );
};

export default IntroPortal;
