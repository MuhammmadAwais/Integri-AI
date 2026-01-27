// src/features/subscriptions/services/subscriptionService.ts
import { Purchases, type Package } from "@revenuecat/purchases-js";
import type { SubscriptionTier } from "../../../../Constants";

export const SubscriptionService = {
  /**
   * Initializes RevenueCat and returns current tier status.
   */
  syncStatusWithRevenueCat: async (
    userId: string,
  ): Promise<SubscriptionTier> => {
    try {
      const purchases = Purchases.configure(
        import.meta.env.VITE_REVENUECAT_WEB_API_KEY ||
         "rcb_sb_mwZxSDDpQucNvPaTMjAumrkzb",
        userId,
      );

      const customerInfo = await purchases.getCustomerInfo();

      // Check for tiers in order of priority
      if (customerInfo.entitlements.active["premium"]?.isActive) {
        return "premium";
      }
      if (customerInfo.entitlements.active["pro"]?.isActive) {
        return "pro";
      }

      return "free";
    } catch (error) {
      console.error("RevenueCat Check Error:", error);
      return "free";
    }
  },

  /**
   * Purchases a specific package (pro/premium monthly/annual)
   */
  purchaseSubscription: async (
    userId: string,
    planId: string,
  ): Promise<SubscriptionTier> => {
    try {
      const REVENUECAT_ID = import.meta.env.VITE_REVENUECAT_ID;
      const purchases = Purchases.configure(
        import.meta.env.VITE_REVENUECAT_WEB_API_KEY ||
          "rcb_sb_mwZxSDDpQucNvPaTMjAumrkzb",
        userId,
      );
      const offerings = await purchases.getOfferings();
      console.log("Offerings:", offerings);
      let currentOffering = offerings.current;
      console.log("Current Offering:", currentOffering);
      if (!currentOffering && offerings.all[REVENUECAT_ID]) {
        currentOffering = offerings.all[REVENUECAT_ID];
      }
      if (!currentOffering && offerings.all["default"]) {
        currentOffering = offerings.all["default"];
      }

      if (!currentOffering) {
        throw new Error(
          "No offerings found. Please check RevenueCat Dashboard.",
        );
      }

      const pkg = currentOffering.availablePackages.find(
        (p: Package) => p.identifier === planId,
      );

      if (!pkg) {
        throw new Error(`Plan '${planId}' not found in offering.`);
      }

      const { customerInfo } = await purchases.purchase({ rcPackage: pkg });

      if (customerInfo.entitlements.active["premium"]?.isActive)
        return "premium";
      if (customerInfo.entitlements.active["pro"]?.isActive) return "pro";

      throw new Error("Purchase completed but entitlement not granted.");
    } catch (error: any) {
      if (error.code === "UserCancelledError") {
        throw new Error("Purchase was cancelled.");
      }
      console.error("Purchase Error:", error);
      throw new Error(error.message || "Purchase failed");
    }
  },
};
