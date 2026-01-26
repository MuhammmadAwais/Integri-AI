import React from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useAppSelector } from "../../../hooks/useRedux";
import { motion } from "framer-motion";

interface PricingCardProps {
  plan: {
    id: string;
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number; // Not strictly used for display if we pass pre-calculated price, but good to have
    features: string[];
    isPopular?: boolean;
    buttonText: string;
    tier?: string;
  };
  billingInterval: "Monthly" | "Annual";
  currentPlanId?: string;
  onSubscribe: (planId: string) => void;
  isLoading?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  billingInterval,
  currentPlanId,
  onSubscribe,
  isLoading,
}) => {
  const { isDark } = useAppSelector((state: any) => state.theme);

  // Determine if this specific card is the user's current plan
  const isCurrent = currentPlanId === plan.id;

  // Format price based on the plan object.
  // We assume the parent component passes the correct specific plan object (e.g. Pro Monthly)
  // So we just display plan.priceMonthly (which effectively acts as the price for this specific package)
  // OR if your constant structure has different fields, we adapt.
  // Based on Phase 1 constants: priceMonthly and priceYearly were stored.
  // Ideally, for a specific package card, we just show the relevant price.

  const displayPrice =
    billingInterval === "Monthly" ? plan.priceMonthly : plan.priceYearly;
  const periodLabel = billingInterval === "Monthly" ? "/ month" : "/ year";

  return (
    <motion.div
      whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
      className={cn(
        "relative flex flex-col p-6 rounded-2xl border transition-all duration-300",
        isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200",
        plan.isPopular &&
          (isDark
            ? "border-[#00A9A4]/50 shadow-[0_0_30px_rgba(0,169,164,0.1)]"
            : "border-[#00A9A4] shadow-lg"),
      )}
    >
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="bg-[#00A9A4] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
            Most Popular
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3
          className={cn(
            "text-xl font-bold mb-2",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          {plan.name}
        </h3>
        <p
          className={cn(
            "text-sm min-h-[40px]",
            isDark ? "text-gray-400" : "text-gray-500",
          )}
        >
          {plan.description}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              "text-4xl font-bold",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            ${displayPrice}
          </span>
          <span
            className={cn(
              "text-sm",
              isDark ? "text-gray-400" : "text-gray-500",
            )}
          >
            {periodLabel}
          </span>
        </div>
      </div>

      <ul className="flex-1 space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            <div
              className={cn(
                "mt-0.5 min-w-[20px] h-5 rounded-full flex items-center justify-center",
                plan.isPopular
                  ? "bg-[#00A9A4]/10"
                  : isDark
                    ? "bg-white/10"
                    : "bg-gray-100",
              )}
            >
              <Check
                className={cn(
                  "w-3 h-3",
                  plan.isPopular
                    ? "text-[#00A9A4]"
                    : isDark
                      ? "text-gray-300"
                      : "text-gray-600",
                )}
              />
            </div>
            <span
              className={cn(
                "leading-tight",
                isDark ? "text-gray-300" : "text-gray-700",
              )}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onSubscribe(plan.id)}
        disabled={isLoading || isCurrent}
        className={cn(
          "w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm hover:cursor-pointer",
          isCurrent
            ? isDark
              ? "bg-white/10 text-gray-400 cursor-default"
              : "bg-gray-100 text-gray-400 cursor-default"
            : plan.isPopular
              ? "bg-[#00A9A4] text-white hover:bg-[#008f8b] shadow-[0_0_15px_rgba(0,169,164,0.3)]"
              : isDark
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-black text-white hover:bg-gray-800",
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isCurrent ? (
          "Current Plan"
        ) : (
          plan.buttonText
        )}
      </motion.button>
    </motion.div>
  );
};

export default PricingCard;
