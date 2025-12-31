import React from "react";
import { cn } from "../../../lib/utils";
import { useAppSelector } from "../../../hooks/useRedux";

const PricingHeader: React.FC = () => {
  const { isDark } = useAppSelector((state: any) => state.theme);

  return (
    <div className="text-center max-w-4xl mx-auto mb-16 space-y-4">
      <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
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
        Unlock the full potential of AI with our Pro plans.
      </p>
    </div>
  );
};

export default PricingHeader;
