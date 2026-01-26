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
import { motion, AnimatePresence } from "framer-motion";
import LoginModal from "../features/auth/components/LoginModal";

// Animation variants for the grid items
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const SubscriptionPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);
  const { isDark } = useAppSelector((state: any) => state.theme);
  const { isLoading, error, successMessage } = useAppSelector(
    (state: any) => state.subscription,
  );

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">(
    "monthly",
  );

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    await dispatch(purchaseSubscription({ userId: user.id, planId }));
  };

  // --- FIXED FILTERING LOGIC ---
  const displayedPlans = SUBSCRIPTION_PLANS.filter((plan) => {
    const id = plan.id.toLowerCase();
    if (billingInterval === "monthly") {
      // Matches "Monthly Pro Subscription"
      return id.includes("monthly");
    } else {
      // Matches "Anual Pro Subscription" (and handles standard spelling just in case)
      return id.includes("annual") || id.includes("anual");
    }
  });

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-x-hidden overflow-y-auto transition-colors duration-500",
        isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900",
        "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent",
      )}
    >
      <ParticleBackground />

      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        <PricingHeader />

        {/* Billing Toggle */}
        <div className="flex justify-center mt-8 mb-12">
          <div
            className={cn(
              "p-1 rounded-full flex items-center relative",
              isDark ? "bg-white/10" : "bg-gray-200",
            )}
          >
            <motion.div
              className={cn(
                "absolute top-1 bottom-1 rounded-full shadow-sm",
                isDark ? "bg-white/20" : "bg-white",
              )}
              initial={false}
              animate={{
                x: billingInterval === "monthly" ? 4 : "100%",
                left: billingInterval === "annual" ? -4 : 0,
                width: "50%",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            <button
              onClick={() => setBillingInterval("monthly")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium z-10 transition-colors relative w-32 hover:cursor-pointer",
                billingInterval === "monthly"
                  ? isDark
                    ? "text-white"
                    : "text-black"
                  : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-black",
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("annual")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium z-10 transition-colors relative w-32 flex justify-center items-center gap-2 hover:cursor-pointer",
                billingInterval === "annual"
                  ? isDark
                    ? "text-white"
                    : "text-black"
                  : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-500 hover:text-black",
              )}
            >
              Yearly
              <span className="text-[10px] bg-[#00A9A4] text-white px-1.5 py-0.5 rounded-full ml-1">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="max-w-5xl mx-auto min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={billingInterval} // Re-render grid when interval changes
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
            >
              {displayedPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  variants={itemVariants}
                  layout="position"
                >
                  <PricingCard
                    plan={plan}
                    billingInterval={billingInterval}
                    currentPlanId={user?.planId}
                    onSubscribe={handleSubscribe}
                    isLoading={isLoading}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 max-w-md mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex justify-center items-center gap-2 text-sm text-gray-500"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Secure payment processing by RevenueCat & Stripe</span>
        </motion.div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2
            className={cn(
              "text-3xl font-bold text-center mb-12",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {SUBSCRIPTION_FAQS.map((faq, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-2xl overflow-hidden border transition-all duration-300",
                  isDark
                    ? "bg-white/5 border-white/10 hover:border-white/20"
                    : "bg-white border-gray-200 hover:border-gray-300",
                )}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none hover:cursor-pointer"
                >
                  <span
                    className={cn(
                      "text-base font-medium",
                      isDark ? "text-gray-100" : "text-gray-900",
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
                      : "max-h-0 opacity-0",
                  )}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {successMessage && <SubscriptionSuccessModal />}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default SubscriptionPage;
