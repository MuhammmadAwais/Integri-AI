import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/useRedux";
import { purchaseSubscription } from "../features/subscriptions/slices/subscriptionSlice";
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_FAQS } from "../../Constants";
import PricingCard from "../features/subscriptions/components/PricingCard";
import PricingHeader from "../features/subscriptions/components/PricingHeader";
import SubscriptionSuccessModal from "../features/subscriptions/components/SubscriptionSuccessModal"; 
import ParticleBackground from "../Components/ui/ParticleBackground";
import { cn } from "../lib/utils";
import { ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

// Stagger Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SubscriptionPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);
  const { isDark } = useAppSelector((state: any) => state.theme);

  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const currentPlanId = user?.isPremium ? user.planId || "monthly" : "starter";

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      alert("Please login to subscribe.");
      return;
    }

    if (planId === "starter") return;

    setLoadingPlanId(planId);

    try {
      await dispatch(
        purchaseSubscription({ userId: user.id, planId: planId })
      ).unwrap();
      // Success is handled by the Modal automatically via Redux state
    } catch (error: any) {
      console.error(error);
      alert(error || "Purchase failed. Please try again.");
    } finally {
      setLoadingPlanId(null);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className={cn("w-full h-full min-h-screen", isDark ? "dark" : "")}>
      {/* Render the Success Modal - it handles its own visibility */}
      <SubscriptionSuccessModal />

      <div
        className={cn(
          "relative h-full w-full overflow-y-auto transition-colors duration-500",
          isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900",
          "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
        )}
      >
        <ParticleBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PricingHeader />
          </motion.div>

          {/* Cards Grid with Staggered Animation */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8 items-stretch mt-12 mb-20"
          >
            {SUBSCRIPTION_PLANS.map((plan) => (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                className="h-full"
              >
                <PricingCard
                  plan={plan}
                  currentPlanId={currentPlanId}
                  onSubscribe={handleSubscribe}
                  isLoading={loadingPlanId === plan.id}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 mb-20 flex flex-col items-center justify-center text-center opacity-90"
          >
            <div
              className={cn(
                "flex items-center gap-2 text-sm mb-2 px-4 py-1.5 rounded-full backdrop-blur-sm border transition-colors duration-300",
                isDark
                  ? "bg-white/10 border-white/10 text-gray-300"
                  : "bg-white border-gray-200 text-gray-600 shadow-sm"
              )}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Secure payment via RevenueCat </span>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto pb-20">
            <h3
              className={cn(
                "text-2xl font-bold text-center mb-8",
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
                    "border rounded-xl overflow-hidden transition-all duration-300 hover:cursor-pointer",
                    isDark
                      ? "bg-white/5 border-white/10 hover:bg-white/10"
                      : "bg-white border-gray-200 shadow-sm"
                  )}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none hover:cursor-pointer"
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
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <div
                    onClick={() => toggleFaq(index)}
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
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
