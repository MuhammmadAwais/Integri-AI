import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/useRedux";
import { purchaseSubscription } from "../features/subscriptions/slices/subscriptionSlice";
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_FAQS } from "../../Constants";
import PricingCard from "../features/subscriptions/components/PricingCard";
import PricingHeader from "../features/subscriptions/components/PricingHeader";
import ParticleBackground from "../Components/ui/ParticleBackground";
import { cn } from "../lib/utils";
import { ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

const SubscriptionPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);

  // 1. Get Theme State
  const { isDark } = useAppSelector((state: any) => state.theme);

  const [isYearly, setIsYearly] = useState<boolean>(false);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const currentPlanId = user?.isPremium ? "pro" : "starter";

  const handleSubscribe = async (planId: string) => {
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

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    // 2. THEME WRAPPER
    <div className={cn("w-full h-full min-h-screen", isDark ? "dark" : "")}>
      <div
        className={cn(
          "relative h-full w-full overflow-y-auto transition-colors duration-500",
          // BACKGROUND: Light Gray vs Deep Black
          isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900",
          "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
        )}
      >
        {/* --- PARTICLE LAYER --- */}
        <ParticleBackground />

        {/* --- CONTENT LAYER --- */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Header Component */}
          <PricingHeader isYearly={isYearly} onToggle={setIsYearly} />

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-stretch mt-12">
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

          {/* Trust/Security Badge */}
          <div className="mt-16 flex flex-col items-center justify-center text-center opacity-90">
            <div
              className={cn(
                "flex items-center gap-2 text-sm mb-2 px-4 py-1.5 rounded-full backdrop-blur-sm border transition-colors duration-300",
                // Light Mode vs Dark Mode styles
                isDark
                  ? "bg-white/10 border-white/10 text-gray-300"
                  : "bg-white border-gray-200 text-gray-600 shadow-sm"
              )}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Secure payment processing via Stripe</span>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h3
              className={cn(
                "text-2xl font-bold text-center mb-8 transition-colors",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Frequently Asked Questions
            </h3>

            <div className="space-y-4">
              {SUBSCRIPTION_FAQS.map((faq, index) => (
                <div
                  key={index}
                  className={cn(
                    "border rounded-xl overflow-hidden transition-all duration-300",
                    // FAQ Card Styling
                    isDark
                      ? "bg-white/5 border-white/10 hover:bg-white/10"
                      : "bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
                  )}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                  >
                    <span
                      className={cn(
                        "text-base font-medium",
                        isDark ? "text-gray-100" : "text-gray-900"
                      )}
                    >
                      {faq.question}
                    </span>
                    {openFaqIndex === index ? (
                      <ChevronUp
                        className={cn(
                          "w-5 h-5",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}
                      />
                    ) : (
                      <ChevronDown
                        className={cn(
                          "w-5 h-5",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}
                      />
                    )}
                  </button>
                  <div
                    className={cn(
                      "px-5 text-sm leading-relaxed overflow-hidden transition-all duration-300 ease-in-out",
                      isDark ? "text-gray-300" : "text-gray-600",
                      openFaqIndex === index
                        ? "max-h-40 pb-5 opacity-100"
                        : "max-h-0 opacity-0"
                    )}
                  >
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-20" />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
