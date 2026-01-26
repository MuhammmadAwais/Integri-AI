import { useAppSelector } from "../../../hooks/useRedux";
import type { SubscriptionTier } from "../../../../Constants";

export const useSubscription = () => {
  const user = useAppSelector((state) => state.auth.user);
  const tier: SubscriptionTier = user?.subscriptionTier || "free";

  const features = {
    // Pro Features (Pro + Premium)
    advancedModels: tier === "pro" || tier === "premium", // GPT-4o, Claude 3.5 Sonnet
    unlimitedHistory: tier === "pro" || tier === "premium",
    standardVoice: tier === "pro" || tier === "premium",
    standardImageGen: tier === "pro" || tier === "premium",
    prioritySupport: tier === "pro" || tier === "premium",

    // Premium Features (Premium Only)
    nextGenModels: tier === "premium", // GPT-5, o1
    realTimeVoice: tier === "premium", // Ultra-low latency streaming
    hdImageGen: tier === "premium",
    highLimits: tier === "premium", // 10x higher limits for knowledge base/files
    betaAccess: tier === "premium", // Early access to experimental features
  };

  return {
    tier,
    isFree: tier === "free",
    isPro: tier === "pro",
    isPremium: tier === "premium",
    isAtLeastPro: tier === "pro" || tier === "premium",
    canAccess: (feature: keyof typeof features) => features[feature],
  };
};
