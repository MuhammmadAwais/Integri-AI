import React from "react";
import { Check, Sparkles } from "lucide-react";
import Button from "../../../Components/ui/Button";
import { cn } from "../../../lib/utils";
import { useAppSelector } from "../../../hooks/useRedux";

interface PricingCardProps {
  plan: {
    id: string;
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    features: string[];
    isPopular?: boolean;
    buttonText: string;
  };
  isYearly: boolean;
  currentPlanId?: string;
  onSubscribe: (planId: string) => void;
  isLoading?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isYearly,
  currentPlanId,
  onSubscribe,
  isLoading,
}) => {
  const { isDark } = useAppSelector((state: any) => state.theme);

  const isCurrent = currentPlanId === plan.id;
  const price = isYearly ? plan.priceYearly : plan.priceMonthly;
  const period = isYearly ? "/year" : "/month";

  return (
    <div
      className={cn(
        "relative flex flex-col p-8 rounded-3xl transition-all duration-300 h-full",

        // --- LIGHT MODE (Clean Card) ---
        !isDark &&
          "bg-white border border-gray-200 shadow-xl hover:shadow-2xl hover:border-gray-300",

        // --- DARK MODE (Glassmorphism) ---
        isDark &&
          "bg-black/40 border border-white/10 backdrop-blur-md hover:border-white/20 hover:bg-black/60",

        // --- POPULAR PLAN HIGHLIGHT ---
        plan.isPopular && isDark
          ? "border-[#00A9A4] shadow-lg shadow-[#00A9A4]/10"
          : "",
        plan.isPopular && !isDark
          ? "border-[#00A9A4] ring-1 ring-[#00A9A4] shadow-xl"
          : "",

        // Scale effect for popular plan
        plan.isPopular ? "scale-100 lg:scale-105 z-10" : "hover:-translate-y-1"
      )}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <div className="bg-[#00A9A4] text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Most Popular
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3
          className={cn(
            "text-xl font-bold transition-colors",
            isDark ? "text-white" : "text-gray-900"
          )}
        >
          {plan.name}
        </h3>
        <p
          className={cn(
            "text-sm mt-2 leading-relaxed h-10 transition-colors",
            isDark ? "text-gray-300" : "text-gray-500"
          )}
        >
          {plan.description}
        </p>
      </div>

      {/* Price */}
      <div className="flex items-baseline mb-8">
        <span
          className={cn(
            "text-5xl font-extrabold tracking-tight transition-colors",
            isDark ? "text-white" : "text-gray-900"
          )}
        >
          ${price}
        </span>
        <span
          className={cn(
            "ml-2 text-lg font-medium transition-colors",
            isDark ? "text-gray-400" : "text-gray-500"
          )}
        >
          {period}
        </span>
      </div>

      {/* Action Button */}
      <Button
        variant={plan.isPopular ? "primary" : "outline"}
        fullWidth
        disabled={isCurrent || isLoading}
        onClick={() => onSubscribe(plan.id)}
        className={cn(
          "h-12 text-base font-semibold transition-all duration-200",

          // Customizing Glow for Popular button
          plan.isPopular &&
            "shadow-[0_0_20px_-5px_rgba(0,169,164,0.4)] border-transparent",

          // Active Plan State
          isCurrent &&
            "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 cursor-default"
        )}
      >
        {isLoading && plan.isPopular
          ? "Processing..."
          : isCurrent
          ? "Active Plan"
          : plan.buttonText}
      </Button>

      {/* Divider */}
      <div
        className={cn(
          "my-8 h-px w-full",
          isDark ? "bg-white/10" : "bg-gray-100"
        )}
      />

      {/* Features */}
      <div className="grow">
        <p
          className={cn(
            "text-xs font-bold uppercase tracking-wider mb-4 transition-colors",
            isDark ? "text-white" : "text-gray-900"
          )}
        >
          What's included
        </p>
        <ul className="space-y-4">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div
                className={cn(
                  "shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 transition-colors",
                  // Checkmark Circle Background
                  plan.isPopular
                    ? "bg-[#00A9A4]/10"
                    : isDark
                    ? "bg-white/10"
                    : "bg-gray-100"
                )}
              >
                <Check
                  className={cn(
                    "w-3 h-3 transition-colors",
                    // Checkmark Icon Color
                    plan.isPopular
                      ? "text-[#00A9A4]"
                      : isDark
                      ? "text-gray-300"
                      : "text-gray-600"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-sm leading-tight transition-colors",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PricingCard;
