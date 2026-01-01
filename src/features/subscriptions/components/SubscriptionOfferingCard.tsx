import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useAppSelector } from "../../../hooks/useRedux";

const SubscriptionOfferingCard: React.FC = () => {
  const { user } = useAppSelector((state: any) => state.auth);
  const { isDark } = useAppSelector((state: any) => state.theme);

  if (user?.isPremium) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
      className="absolute top-6 left-6 z-50"
    >
      <Link to="/subscriptions">
        <div
          className={cn(
            "group flex items-center gap-3 p-1.5 pr-5 rounded-full border backdrop-blur-md transition-all duration-300 cursor-pointer",
            isDark
              ? "bg-black/20 border-zinc-800 hover:bg-black/60 hover:border-white/20 text-white"
              : "bg-white/40 border-zinc-200 hover:bg-white/90 hover:border-black/10 text-black hover:shadow-xl shadow-sm"
          )}
        >
          {/* Animated Icon Container */}
          <div
            className={cn(
              "relative flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 overflow-hidden",
              isDark
                ? "bg-zinc-900 border-zinc-800 group-hover:border-teal-500/50"
                : // Light Mode: We keep the background clear to let the blend mode work
                  "bg-white border-zinc-100 group-hover:border-teal-500/50"
            )}
          >
            {/* The Video / GIF Image */}
            <img
              src="/public/Flower_AfterEffects.gif" 
              alt="Premium"
              className={cn(
                "w-full h-full object-cover scale-110 transition-all",

                !isDark &&
                  "invert hue-rotate-180 mix-blend-multiply opacity-90 contrast-125"
              )}
            />

            {/* Optional Overlay to smooth out any purple tint artifacts */}
            <div
              className={cn(
                "absolute inset-0 mix-blend-overlay",
                !isDark ? "bg-teal-500/10" : "bg-transparent"
              )}
            />
          </div>

          <div className="flex flex-col">
            <span
              className={cn(
                "text-[10px] uppercase font-bold tracking-widest leading-none mb-0.5",
                isDark ? "text-zinc-500" : "text-zinc-400"
              )}
            >
              Free Plan
            </span>
            <span className="text-xs font-bold flex items-center gap-1 leading-none">
              Upgrade Now
              <ArrowRight
                size={12}
                className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#00A9A4]"
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default SubscriptionOfferingCard;
