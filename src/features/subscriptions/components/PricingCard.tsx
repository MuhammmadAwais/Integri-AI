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
    priceYearly: number;
    features: string[];
    isPopular?: boolean;
    buttonText: string;
  };
  currentPlanId?: string;
  onSubscribe: (planId: string) => void;
  isLoading?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  currentPlanId,
  onSubscribe,
  isLoading,
}) => {
  const { isDark } = useAppSelector((state: any) => state.theme);
  const isCurrent = currentPlanId === plan.id;

  let periodLabel = "/ total";
  if (plan.id === "monthly") periodLabel = "/ month";
  else if (plan.id === "annual") periodLabel = "/ year";
  else if (plan.id === "semi_annual") periodLabel = "/ 6 months";

  return (
    <motion.div
      whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
      className={cn(
        "relative flex flex-col p-6 rounded-3xl border transition-all duration-300 h-full",
        isDark
          ? "bg-[#1a1a1a] border-white/10"
          : "bg-white border-gray-200 shadow-sm",
        plan.isPopular &&
          (isDark ? "ring-2 ring-zinc-600" : "ring-2 ring-zinc-900")
      )}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-zinc-800 text-white text-xs font-bold rounded-full shadow-lg">
           POPULAR
        </div>
      )}

      <div className="mb-6">
        <h3
          className={cn(
            "text-xl font-bold",
            isDark ? "text-white" : "text-gray-900"
          )}
        >
          {plan.name}
        </h3>
        <p
          className={cn(
            "text-sm mt-2 min-h-10",
            isDark ? "text-gray-400" : "text-gray-500"
          )}
        >
          {plan.description}
        </p>
      </div>

      <div className="mb-6">
        <span
          className={cn(
            "text-4xl font-extrabold",
            isDark ? "text-white" : "text-gray-900"
          )}
        >
          ${plan.priceMonthly}
        </span>
        <span
          className={cn(
            "text-sm ml-2 font-medium",
            isDark ? "text-gray-500" : "text-gray-400"
          )}
        >
          {periodLabel}
        </span>
      </div>

      <hr
        className={cn(
          "mb-6 border-t",
          isDark ? "border-white/10" : "border-gray-100"
        )}
      />

      <ul className="flex-1 space-y-4 mb-8">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm">
            <div
              className={cn(
                "shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                plan.isPopular
                  ? "bg-[#00A9A4]/10"
                  : isDark
                  ? "bg-white/10"
                  : "bg-gray-100"
              )}
            >
              <Check
                className={cn(
                  "w-3 h-3",
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
                "leading-tight",
                isDark ? "text-gray-300" : "text-gray-700"
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
            : isDark
            ? "bg-white text-black hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            : "bg-black text-white hover:bg-gray-800 shadow-lg"
        )}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {isCurrent ? "Current Plan" : plan.buttonText}
      </motion.button>
    </motion.div>
  );
};

export default PricingCard;
