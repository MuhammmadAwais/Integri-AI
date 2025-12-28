// src/features/subscription/components/PricingCard.tsx
import React from "react";
import { Check } from "lucide-react";
import Button from "../../../Components/ui/Button";
import Badge from "../../../Components/ui/Badge";
import { cn } from "../../../lib/utils";

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
  const isCurrent = currentPlanId === plan.id;
  const price = isYearly ? plan.priceYearly : plan.priceMonthly;
  const period = isYearly ? "/year" : "/month";

  return (
    <div
      className={cn(
        "relative flex flex-col p-6 rounded-2xl border transition-all duration-300",
        plan.isPopular
          ? "border-[#00A9A4] bg-white dark:bg-[#0A0A0A] shadow-xl scale-100 md:scale-105 z-10"
          : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]"
      )}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center">
          <Badge
            variant="theme-pill"
            className="bg-[#00A9A4] text-white border-none shadow-lg"
          >
            Most Popular
          </Badge>
        </div>
      )}

      <div className="mb-5">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {plan.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 min-h-[40px]">
          {plan.description}
        </p>
      </div>

      <div className="flex items-baseline mb-6">
        <span className="text-4xl font-bold text-gray-900 dark:text-white">
          ${price}
        </span>
        <span className="text-gray-500 dark:text-gray-400 ml-1 font-medium">
          {period}
        </span>
      </div>

      <Button
        variant={plan.isPopular ? "primary" : "outline"}
        fullWidth
        disabled={isCurrent || isLoading}
        onClick={() => onSubscribe(plan.id)}
        className={cn(
          isCurrent &&
            "bg-green-600/10 text-green-600 border-green-600/20 hover:bg-green-600/20 cursor-default"
        )}
      >
        {isLoading && plan.isPopular
          ? "Processing..."
          : isCurrent
          ? "Active Plan"
          : plan.buttonText}
      </Button>

      <div className="mt-8 space-y-4">
        <p className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
          Features
        </p>
        <ul className="space-y-3">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[#00A9A4] mt-0.5 shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
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
