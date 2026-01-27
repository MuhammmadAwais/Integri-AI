import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Crown } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useAppSelector } from "../../../hooks/useRedux";
import { useSubscription } from "../../subscriptions/hooks/useSubscription";

const SubscriptionOfferingCard: React.FC = () => {
  const { isDark } = useAppSelector((state: any) => state.theme);

  // Use the hook for reliable tier checking
  const { isPremium, isPro } = useSubscription();

  // If user is already Premium (Top Tier), don't show the upsell card
  if (isPremium) return null;

  // Strategy:
  // If Free: Standard "Upgrade Now" message.
  // If Pro: "VIP Upgrade" message focusing on Next-Gen power (positive reinforcement).
  const content = isPro
    ? {
        label: "Pro Active",
        headline: "Unlock Ultimate Power",
        subtext: "Get O1 & Real-time Voice",
        highlightColor: "text-purple-400",
        hoverColor: "group-hover:text-purple-400",
        overlayColor: isDark ? "bg-purple-500/20" : "bg-purple-100/50",
        icon: (
          <Crown
            size={10}
            className="text-amber-400 mr-1 inline"
            fill="currentColor"
          />
        ),
      }
    : {
        label: "Free Plan",
        headline: "Upgrade Now",
        subtext: null,
        highlightColor: "text-[#00A9A4]",
        hoverColor: "group-hover:text-[#00A9A4]",
        overlayColor: isDark ? "bg-teal-500/10" : "bg-transparent",
        icon: null,
      };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
      className="absolute top-6 left-6 z-50 "
    >
      <Link to="/subscriptions">
        <div
          className={cn(
            "group flex items-center gap-3 p-1.5 pr-5 rounded-full border backdrop-blur-md transition-all duration-300 cursor-pointer",
            isDark
              ? "bg-black/20 border-zinc-800 hover:bg-black/60 hover:border-white/20 text-white"
              : "bg-white/40 border-zinc-200 hover:bg-white/80 hover:border-zinc-300 text-zinc-800",
            // Add a subtle glow for Pro users to make it feel special
            isPro &&
              (isDark
                ? "shadow-[0_0_15px_rgba(168,85,247,0.15)] border-purple-500/30"
                : "shadow-sm border-purple-200"),
          )}
        >
          {/* Animated Icon Container */}
          <div
            className={cn(
              "relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center",
              isDark ? "bg-zinc-900" : "bg-white",
            )}
          >
            {/* The Video / GIF Image */}
            <img
              src="/Flower_AfterEffects.gif"
              alt="Upgrade"
              className={cn(
                "w-full h-full object-cover scale-110 transition-all",
                !isDark &&
                  "invert hue-rotate-180 mix-blend-multiply opacity-90 contrast-125",
              )}
            />

            {/* Optional Overlay to colorize based on tier */}
            <div
              className={cn(
                "absolute inset-0 mix-blend-overlay",
                content.overlayColor,
              )}
            />
          </div>

          <div className="flex flex-col justify-center">
            {/* Top Label: "Free Plan" or "Pro Active" */}
            <span
              className={cn(
                "text-[10px] uppercase font-bold tracking-widest leading-none mb-0.5 flex items-center",
                isDark ? "text-zinc-500" : "text-zinc-400",
                isPro && (isDark ? "text-amber-400/80" : "text-amber-600/80"), // Gold tint for Pro label
              )}
            >
              {content.icon}
              {content.label}
            </span>

            {/* Main Action Text */}
            <div className="flex flex-col">
              <span className="text-xs font-bold flex items-center gap-3 leading-none">
                {content.headline}
                <ArrowRight
                  size={12}
                  className={cn(
                    "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300",
                    content.highlightColor,
                  )}
                />
              </span>

            
              
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default SubscriptionOfferingCard;
