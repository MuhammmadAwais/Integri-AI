// src/features/subscription/components/PricingHeader.tsx
import React from "react";
import { cn } from "../../../lib/utils";

interface PricingHeaderProps {
  isYearly: boolean;
  onToggle: (val: boolean) => void;
}

const PricingHeader: React.FC<PricingHeaderProps> = ({
  isYearly,
  onToggle,
}) => {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
      <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
        Simple, transparent pricing
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Choose the plan that fits your workflow.
        <br className="hidden md:block" />
        Upgrade anytime to unlock the full power of Integri AI.
      </p>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            !isYearly ? "text-gray-900 dark:text-white" : "text-gray-500"
          )}
        >
          Monthly
        </span>
        <button
          title="Toggle billing period"
          onClick={() => onToggle(!isYearly)}
          className="relative w-14 h-7 bg-gray-200 dark:bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A9A4] focus:ring-offset-2 dark:focus:ring-offset-black"
        >
          <div
            className={cn(
              "absolute top-1 left-1 bg-white dark:bg-[#00A9A4] w-5 h-5 rounded-full shadow-sm transition-transform duration-300",
              isYearly ? "translate-x-7" : "translate-x-0"
            )}
          />
        </button>
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            isYearly ? "text-gray-900 dark:text-white" : "text-gray-500"
          )}
        >
          Yearly{" "}
          <span className="text-[#00A9A4] text-xs font-bold ml-1">
            (Save 20%)
          </span>
        </span>
      </div>
    </div>
  );
};

export default PricingHeader;
