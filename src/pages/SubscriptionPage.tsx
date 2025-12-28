// src/pages/SubscriptionPage.tsx
import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/useRedux";
import { purchaseSubscription } from "../features/subscriptions/slices/subscriptionSlice";
import { SUBSCRIPTION_PLANS } from "../../Constants";
import PricingCard from "../features/subscriptions/components/PricingCard";
import PricingHeader from "../features/subscriptions/components/PricingHeader";

import { cn } from "../lib/utils";

const SubscriptionPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);
  const { isDark } = useAppSelector((state: any) => state.theme);

  const [isYearly, setIsYearly] = useState<boolean>(false);
  const [localLoading, setLocalLoading] = useState<boolean>(false);

  const currentPlanId = user?.isPremium ? "pro" : "starter";

  const handleSubscribe = async (planId: string) => {
    // 1. Validation
    if (!user) {
      alert("Please login to subscribe.");
      return;
    }
    if (planId === "starter") return;
    if (planId === "enterprise") {
      window.location.href = "mailto:sales@integri-ai.com";
      return;
    }

    setLocalLoading(true);

    try {
      // 2. Dispatch Thunk (updates DB + Autoupdates Auth Slice)
      await dispatch(
        purchaseSubscription({ userId: user.id, planId })
      ).unwrap();

      alert(`Success! You have been upgraded to the ${planId} plan.`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong processing your upgrade. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
   
      <div
        className={cn(
          "min-h-full w-full overflow-y-auto px-4 py-16 sm:px-6 lg:px-8 transition-colors duration-300",
          isDark ? "bg-[#000000]" : "bg-white"
        )}
      >
        <PricingHeader isYearly={isYearly} onToggle={setIsYearly} />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isYearly={isYearly}
                currentPlanId={currentPlanId}
                onSubscribe={handleSubscribe}
                isLoading={localLoading && plan.id === "pro"}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Secure payment processing. You can cancel at any time.
          </p>
        </div>
      </div>
   
  );
};

export default SubscriptionPage;
