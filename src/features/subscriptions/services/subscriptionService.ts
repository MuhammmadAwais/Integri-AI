import { Purchases, type Package } from "@revenuecat/purchases-js";
// REMOVED: Firestore imports (doc, setDoc) to decouple logic

export const SubscriptionService = {
  /**
   * Initializes RevenueCat and returns current premium status.
   * NO LONGER WRITES TO FIRESTORE.
   */
  syncStatusWithRevenueCat: async (userId: string): Promise<boolean> => {
    try {
      // 1. Configure RevenueCat
      const purchases = Purchases.configure(
        import.meta.env.VITE_REVENUECAT_WEB_API_KEY,
        userId
      );

      // 2. Check Customer Info for Active Entitlement
      const customerInfo = await purchases.getCustomerInfo();
      const isPremium =
        customerInfo.entitlements.all.integri?.isActive || false;

      // REMOVED: Firestore sync logic

      return isPremium;
    } catch (error) {
      console.error("RevenueCat Check Error:", error);
      return false;
    }
  },

  /**
   * Purchases a specific package (monthly/annual)
   */
  purchaseSubscription: async (
    userId: string,
    planId: string
  ): Promise<string> => {
    {userId} // Suppress unused variable warning FOR (VERCEL DEVELOPEMENT)
    try {
      const REVENUECAT_ID = import.meta.env.VITE_REVENUECAT_ID;
      const purchases = Purchases.getSharedInstance();
      const offerings = await purchases.getOfferings();

      // --- OFFERING LOOKUP LOGIC ---
      let currentOffering = offerings.current;

      if (!currentOffering && offerings.all[REVENUECAT_ID]) {
        currentOffering = offerings.all[REVENUECAT_ID];
      }
      if (!currentOffering && offerings.all["default"]) {
        currentOffering = offerings.all["default"];
      }
      if (!currentOffering) {
        const firstKey = Object.keys(offerings.all)[0];
        if (firstKey) currentOffering = offerings.all[firstKey];
      }

      if (!currentOffering) {
        throw new Error(
          "No offerings found. Please check RevenueCat Dashboard."
        );
      }

      const pkg = currentOffering.availablePackages.find(
        (p: Package) => p.identifier === planId
      );

      if (!pkg) {
        throw new Error(`Plan '${planId}' not found in offering.`);
      }

      const { customerInfo } = await purchases.purchase({ rcPackage: pkg });

      const isPremium =
        typeof customerInfo.entitlements.active["premium"] !== "undefined";

      if (!isPremium) {
        throw new Error(
          "Purchase completed but premium entitlement not granted."
        );
      }

      // No need to sync to Firestore anymore.
      // The frontend handles state update via Redux.

      return planId;
    } catch (error: any) {
      if (error.code === "UserCancelledError") {
        throw new Error("Purchase was cancelled.");
      }
      console.error("Purchase Error:", error);
      throw new Error(error.message || "Purchase failed");
    }
  },
};
