import React from "react";
import { cn } from "../../../lib/utils";
import { useAppSelector } from "../../../hooks/useRedux";

interface PricingHeaderProps {
  isYearly: boolean;
  onToggle: (val: boolean) => void;
}

const PricingHeader: React.FC<PricingHeaderProps> = ({
  isYearly,
  onToggle,
}) => {
  const { isDark } = useAppSelector((state: any) => state.theme);

  return (
    <div className="text-center max-w-4xl mx-auto mb-16 space-y-4">
      <h2 className="text-sm font-semibold tracking-wide text-[#ffffff] uppercase">
        Pricing Plans
      </h2>

      {/* Main Title */}
      <h1
        className={cn(
          "text-4xl md:text-5xl font-extrabold tracking-tight transition-colors duration-200",
          isDark ? "text-white" : "text-gray-900"
        )}
      >
        Choose the perfect plan
      </h1>

      {/* Subtitle */}
      <p
        className={cn(
          "text-xl max-w-2xl mx-auto transition-colors duration-200",
          isDark ? "text-gray-300" : "text-gray-600"
        )}
      >
        Unlock the full potential of AI with our flexible pricing options.
      </p>

      {/* Toggle Switch */}
      <div className="flex items-center justify-center gap-4 pt-8">
        <span
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            // Label Color Logic
            !isYearly
              ? isDark
                ? "text-white"
                : "text-gray-900"
              : isDark
              ? "text-gray-400"
              : "text-gray-500"
          )}
        >
          Monthly
        </span>

        <button
          title="Toggle Yearly Billing"
          role="switch"
          type="button"
          aria-checked={isYearly}
          onClick={() => onToggle(!isYearly)}
          className={cn(
            "relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A9A4] focus:ring-offset-2",
            // Button Background Logic
            isDark ? "focus:ring-offset-black" : "focus:ring-offset-white",
            isYearly ? "bg-[#00A9A4]" : isDark ? "bg-gray-700" : "bg-gray-300"
          )}
        >
          <span
            className={cn(
              "inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out",
              isYearly ? "translate-x-7" : "translate-x-1"
            )}
          />
        </button>

        <span
          className={cn(
            "text-sm font-medium transition-colors duration-200 flex items-center gap-2",
            // Label Color Logic
            isYearly
              ? isDark
                ? "text-white"
                : "text-gray-900"
              : isDark
              ? "text-gray-400"
              : "text-gray-500"
          )}
        >
          Yearly
          <span
            className={cn(
              "hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-bold border",
              isDark
                ? "bg-green-900/40 text-green-300 border-green-800"
                : "bg-green-100 text-green-700 border-green-200"
            )}
          >
            Save 20%
          </span>
        </span>
      </div>
    </div>
  );
};

export default PricingHeader;
