import React, { useEffect, useState, useRef } from "react";
import { Share2 } from "lucide-react";
import gsap from "gsap";
import ParticleBackground from "../../../Components/ui/ParticleBackground";
import AdUnit from "../../../Components/ads/AdUnit";
import { AD_SLOTS } from "../../../config/ads";
// import { useSubscription } from "../../../features/subscriptions/hooks/useSubscription";

interface Props {
  isDark: boolean;
  generatedImage: { url: string; prompt: string; id?: string } | null;
  isGenerating: boolean;
  onUsePrompt?: (prompt: string) => void;
}

const PROMPT_GALLERY = [
  {
    id: "p2",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=900&fit=crop&q=80",
    prompt: "Generate a picture of a majestic mountain landscape at sunset with dramatic clouds, snow-capped peaks, golden hour lighting, photorealistic, ultra detailed",
  },
  {
    id: "p3",
    url: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600&h=900&fit=crop&q=80",
    prompt: "Generate a picture of an abstract cosmic nebula with vibrant colors, swirling galaxies, stars, space art, ethereal atmosphere, 4k resolution",
  },
  {
    id: "p4",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=900&fit=crop&q=80",
    prompt: "Generate a picture of a portrait of a beautiful woman with flowing hair, soft natural lighting, professional photography, bokeh background, high quality",
  },
  {
    id: "p5",
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=900&fit=crop&q=80",
    prompt: "Generate a picture of a cozy modern minimalist living room with plants, natural light, Scandinavian design, warm atmosphere, interior photography",
  },
  {
    id: "p6",
    url: "https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=600&h=900&fit=crop&q=80",
    prompt: "Generate a picture of a fantasy dragon flying over a medieval castle, epic fantasy art, dramatic sky, highly detailed, digital painting style",
  },
  {
    id: "p7",
    url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=900&fit=crop&q=80",
    prompt: "Generate a picture of a serene Japanese garden with cherry blossoms, koi pond, traditional architecture, peaceful atmosphere, soft focus",
  },
  {
    id: "p8",
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=900&fit=crop&q=80",
    prompt: "Generate a picture of a sci-fi robot in a post-apocalyptic wasteland, cinematic composition, moody lighting, concept art style, detailed textures",
  },
  {
    id: "p9",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=900&fit=crop&q=80",
    prompt: "Generate a picture of a tropical beach paradise with crystal clear water, palm trees, golden sand, sunset colors, travel photography, vibrant",
  },
  {
    id: "p10",
    url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&h=900&fit=crop&q=80",
    prompt: "Generate a picture of abstract geometric patterns with vibrant gradients, modern art, minimalist design, colorful, high contrast, digital art",
  },
];

const GenRightPanel: React.FC<Props> = ({
  isDark,
  generatedImage,
  isGenerating,
  onUsePrompt,
}) => {
  // const { isFree } = useSubscription();
  const [gallery, setGallery] = useState(PROMPT_GALLERY);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // When a new image is generated, prepend it to the gallery with GSAP animation
  useEffect(() => {
    if (generatedImage) {
      setGallery((prev) => [generatedImage as any, ...prev]);
    }
  }, [generatedImage]);

  // GSAP animations for gallery items on mount and when new items are added
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const items = scrollContainerRef.current.querySelectorAll('.gallery-item');
    if (items.length === 0) return;

    const ctx = gsap.context(() => {
      // Animate only new items that haven't been animated yet
      items.forEach((item, index) => {
        const element = item as HTMLElement;
        if (!element.dataset.animated) {
          gsap.fromTo(
            element,
            { opacity: 0, y: 30, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              delay: index * 0.08,
              ease: "power2.out",
              onComplete: () => {
                element.dataset.animated = "true";
              }
            }
          );
        }
      });
    }, scrollContainerRef);

    return () => ctx.revert();
  }, [gallery.length]);

  // Enhanced mouse drag functionality - optimized for performance
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let rafId: number | null = null;

    const handleMouseDown = (e: MouseEvent) => {
      // Don't start dragging if clicking on a button or interactive element
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a")) {
        return;
      }
      
      // Cancel any ongoing momentum scroll
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      isDraggingRef.current = true;
      startXRef.current = e.pageX;
      lastXRef.current = e.pageX;
      scrollLeftRef.current = container.scrollLeft;
      velocityRef.current = 0;
      
      container.style.cursor = "grabbing";
      container.style.userSelect = "none";
      container.style.scrollBehavior = "auto"; // Disable smooth scroll during drag
      
      // Prevent default to avoid text selection
      e.preventDefault();
    };

    const handleMouseLeave = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        if (container) {
          container.style.cursor = "grab";
          container.style.userSelect = "auto";
          container.style.scrollBehavior = "auto";
        }
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        
        // Apply momentum scrolling with optimized performance
        if (Math.abs(velocityRef.current) > 1) {
          const momentum = () => {
            if (Math.abs(velocityRef.current) < 0.5) {
              velocityRef.current = 0;
              if (container) {
                container.style.scrollBehavior = "auto";
              }
              animationFrameRef.current = null;
              return;
            }
            
            container.scrollLeft -= velocityRef.current;
            velocityRef.current *= 0.95; // Friction factor
            
            animationFrameRef.current = requestAnimationFrame(momentum);
          };
          
          animationFrameRef.current = requestAnimationFrame(momentum);
        } else {
          if (container) {
            container.style.scrollBehavior = "auto";
          }
        }
        
        if (container) {
          container.style.cursor = "grab";
          container.style.userSelect = "auto";
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      e.preventDefault();
      
      const currentX = e.pageX;
      const deltaX = currentX - lastXRef.current;
      
      // Calculate velocity for momentum scrolling
      velocityRef.current = deltaX;
      lastXRef.current = currentX;
      
      // Cancel any pending RAF
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      // Direct scroll manipulation - 1:1 ratio for natural feel
      const walk = (currentX - startXRef.current);
      container.scrollLeft = scrollLeftRef.current - walk;
    };

    // Optimized wheel scrolling - match vertical scroll speed
    const handleWheel = (e: WheelEvent) => {
      if (isDraggingRef.current) return;
      
      e.preventDefault();
      
      // Cancel any pending GSAP animations
      gsap.killTweensOf(container);
      
      // Match vertical scroll speed - use deltaY directly
      container.scrollLeft += e.deltaY;
    };

    // Use capture phase for better event handling
    container.addEventListener("mousedown", handleMouseDown, { passive: false });
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove, { passive: false });

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("wheel", handleWheel);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
      
      // Cleanup animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleUsePrompt = (prompt: string) => {
    if (onUsePrompt) {
      onUsePrompt(prompt);
    }
  };

  return (
    <div
      className={`hidden md:flex h-full w-full flex-col items-center justify-center relative overflow-hidden ${
        isDark ? "bg-zinc-950" : "bg-zinc-50"
      }`}
    >
      <ParticleBackground />
      <div
        className={`absolute inset-0 opacity-[0.03] pointer-events-none ${
          isDark
            ? "bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-size-[24px_24px]"
            : "bg-[radial-gradient(circle_at_center,black_1px,transparent_1px)] bg-size-[24px_24px]"
        }`}
      />

      <div className="absolute top-0 left-0 right-0 p-8 z-10 pointer-events-none flex justify-between items-start">
        <h1
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-zinc-900"
          }`}
        >
          Prompt Gallery
        </h1>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .prompt-gallery-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .prompt-gallery-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .prompt-gallery-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.2)'};
          border-radius: 2px;
        }
        .prompt-gallery-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.3)'};
        }
        .prompt-gallery-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.2)'} transparent;
        }
      `}</style>
      <div
        ref={scrollContainerRef}
        className="prompt-gallery-scrollbar w-full h-full flex items-center overflow-x-auto overflow-y-hidden px-10 gap-2 snap-x snap-mandatory pt-10 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollBehavior: "auto" }}
        onMouseDown={(e) => {
          // Prevent text selection during drag
          const target = e.target as HTMLElement;
          if (!target.closest("button") && !target.closest("a")) {
            e.preventDefault();
          }
        }}
      >
        {/* Loading State Skeleton */}
        {isGenerating && (
          <div className="snap-center shrink-0 pt-2 h-[90%] w-[45vh] lg:w-[50vh] flex flex-col relative animate-pulse">
            <div
              className={`w-full h-full rounded-2xl ${
                isDark ? "bg-zinc-800" : "bg-zinc-200"
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`font-bold ${
                    isDark ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  Creating Masterpiece...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Items with Ad as Second Item - Shows for unauthenticated users and free tier users */}
        {gallery.map((item, index) => {
          // Show ad only as the second item (index 1) - replace the second image with ad
          // Shows for unauthenticated users and free tier users
          if (index === 1) {
            if (false /* temporarily disabled: isFree */) {
              // Show ad instead of image for free users
              return (
                <div
                  key={`ad-${index}`}
                  className="gallery-item snap-center shrink-0 pt-2 h-[90%] w-[45vh] lg:w-[50vh] flex flex-col relative"
                >
                  <div
                    className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl ${
                      isDark
                        ? "bg-zinc-900 shadow-black/50 border border-zinc-800"
                        : "bg-white shadow-zinc-200 border border-zinc-100"
                    }`}
                  >
                    <AdUnit
                      slot={AD_SLOTS.IMAGE_GEN_GALLERY}
                      format="rectangle"
                      responsive
                      isDark={isDark}
                      testId="ad-imagegen-gallery"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              );
            } else {
              // For Pro/Premium users, show the image normally
              // Continue to render image below
            }
          }
          
          // All other images (index 0, 2, 3, 4, etc.)
          return (
            <div
              key={`item-${index}`}
              className="gallery-item snap-center shrink-0 pt-2 h-[90%] w-[45vh] lg:w-[50vh] flex flex-col relative group perspective-1000"
            >
              <div
                className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                  isDark
                    ? "bg-zinc-900 shadow-black/50 border border-zinc-800"
                    : "bg-white shadow-zinc-200 border border-zinc-100"
                }`}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1.02,
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out",
                  });
                }}
              >
                <img
                  src={item.url}
                  alt={item.prompt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/600x900/1a1a1a/ffffff?text=Image";
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-linear-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white/90 font-medium text-sm leading-relaxed line-clamp-3">
                    {item.prompt}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUsePrompt(item.prompt);
                      }}
                      className="hover:cursor-pointer flex-1 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-2"
                    >
                      Use Prompt
                    </button>
                    <button
                      title="share"
                      onClick={(e) => e.stopPropagation()}
                      className="hover:cursor-pointer p-3 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition border border-white/10"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div className="w-10 shrink-0"></div>
      </div>
    </div>
  );
};

export default GenRightPanel;
