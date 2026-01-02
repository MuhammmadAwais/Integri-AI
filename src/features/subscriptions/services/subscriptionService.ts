import { Purchases, type Package } from "@revenuecat/purchases-js";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../app/firebase";

export const SubscriptionService = {
  /**
   * Initializes RevenueCat, checks status, and syncs to Firebase.
   */

  syncStatusWithRevenueCat: async (userId: string): Promise<boolean> => {
    try {
      // 1. Get the RevenueCat Instance
      const purchases = Purchases.configure(
        import.meta.env.VITE_REVENUECAT_WEB_API_KEY,
        userId
      );
      
      // 2. Check Customer Info
      const customerInfo = await purchases.getCustomerInfo();
      // 3. Check Entitlement (ensure "premium" matches your Dashboard entitlement ID)
      const isPremium = customerInfo.entitlements.all.integri.isActive;
      // 4. Sync to Firestore
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          isPremium: isPremium,
          status: isPremium ? "active" : "free",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return isPremium;
    } catch (error) {
      console.error("RevenueCat Sync Error:", error);
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
    try {
      const REVENUECAT_ID = import.meta.env.VITE_REVENUECAT_ID;
      // 1. Get Shared Instance
      const purchases = Purchases.getSharedInstance();

      // 2. Fetch Offerings
      const offerings = await purchases.getOfferings();

      // --- ROBUST OFFERING LOOKUP LOGIC ---
      // Priority 1: The 'Current' offering set in Dashboard
      let currentOffering = offerings.current;

      // Priority 2: The specific ID  provided REVENUECAT_ID
      if (!currentOffering && offerings.all[REVENUECAT_ID]) {
        console.log(`Found offering by ID: ${REVENUECAT_ID}`);
        currentOffering = offerings.all[REVENUECAT_ID];
      }

      // Priority 3: Fallback to 'default' (standard naming convention)
      if (!currentOffering && offerings.all["default"]) {
        console.log("Found offering by name: default");
        currentOffering = offerings.all["default"];
      }

      // Priority 4: Just take the first available offering we can find
      if (!currentOffering) {
        const firstKey = Object.keys(offerings.all)[0];
        if (firstKey) {
          console.log(`Falling back to first available offering: ${firstKey}`);
          currentOffering = offerings.all[firstKey];
        }
      }

      // DEBUGGING: If still missing, log everything to help you
      if (!currentOffering) {
        console.error("Available Offerings found:", Object.keys(offerings.all));
        throw new Error(
          "No offerings found. Please check RevenueCat Dashboard > Product Catalog."
        );
      }

      // 3. Find the package matching the planId (monthly/semi_annual/annual)
      const pkg = currentOffering.availablePackages.find(
        (p: Package) => p.identifier === planId
      );

      if (!pkg) {
        const availableIds = currentOffering.availablePackages
          .map((p) => p.identifier)
          .join(", ");
        throw new Error(
          `Plan '${planId}' not found in offering. Available IDs: ${availableIds}`
        );
      }

      // 4. Purchase
      const { customerInfo } = await purchases.purchase({ rcPackage: pkg });

      // 5. Verify transaction success
      const isPremium =
        typeof customerInfo.entitlements.active["premium"] !== "undefined";
      if (!isPremium) {
        throw new Error(
          "Purchase completed but premium entitlement not granted."
        );
      }

      // 6. Force sync
      await SubscriptionService.syncStatusWithRevenueCat(userId);

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
