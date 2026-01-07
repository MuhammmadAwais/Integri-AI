import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getCountFromServer,
} from "firebase/firestore";
import { auth, db } from "../../../app/firebase";
import { SubscriptionService } from "../../subscriptions/services/subscriptionService";

// --- Types ---

// 1. Exact Match to Flutter 'UserModel' Schema
interface FirestoreUserModel {
  userName: string;
  email: string;
  phoneNumber: string;
  referralCode: string;
  invitationCode: string;
  myCode: number;
  password: string; // Stored empty usually, handled by Auth
  confirmPassword: string;
  deviceToken: string;
  profile: string; // Matches Flutter 'profile' (image URL)
  id: string;
  availSubscriptions: any[];
  savedWordsCount: number;
  tokens: number;
  remainingQuestions: number;
  isQuizDefaultLanguageGerman: boolean;
  selectedLanguageCode: string;
  setIntegriAsDefault: boolean;
  country: string | null;
  created: any;
  featureUsed: any;
  freeDays: number | null;
  freeDayStartDateTime: any | null;
  subscribedNotificationCategoriesIds: [];
  notificationPreference: boolean;
}

// 2. Frontend User Data (Maintains UI Compatibility)
export interface UserData {
  id: string;
  email: string | null;
  name: string | null; // Mapped from userName
  avatar: string | null; // Mapped from profile
  isPremium: boolean; // Computed from RevenueCat, not Firestore
  planId: string; // Derived/Local default
  country: string | null;
  myCode?: number;
  isNewUser?: boolean; // Flag to trigger onboarding redirect
}

// --- Helpers ---

const generateMyCode = async (): Promise<number> => {
  try {
    const coll = collection(db, "Users");
    const snapshot = await getCountFromServer(coll);
    const count = snapshot.data().count;
    return 10000 + count;
  } catch (error) {
    console.error("Error generating referral code:", error);
    return 10000 + Math.floor(Math.random() * 1000); // Fallback
  }
};

const getInitialFeatureUsed = () => ({
  // Initialize to match Flutter FeatureUsedCount.initialize()
  // Add specific keys if known, otherwise empty object
});


export const AuthService = {
  /**
   * Fetches user profile from Firestore and checks RevenueCat for Premium status.
   * Maps Firestore keys (userName, profile) to Frontend keys (name, avatar).
   */
  fetchUserProfile: async (
    firebaseUser: User,
    forceIsPremium?: boolean
  ): Promise<UserData> => {
    // 1. Get Premium Status (RevenueCat is Source of Truth)
    let isPremium = forceIsPremium;
    if (isPremium === undefined) {
      isPremium = await SubscriptionService.syncStatusWithRevenueCat(
        firebaseUser.uid
      );
    }

    // 2. Fetch Firestore Data
    const userRef = doc(db, "Users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data() as FirestoreUserModel;

      // Map Firestore Schema to Frontend Interface
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: data.userName || firebaseUser.displayName, // Map userName -> name
        avatar: data.profile || firebaseUser.photoURL, // Map profile -> avatar
        country: data.country || "",
        myCode: data.myCode,
        isPremium,
        planId: isPremium ? "premium" : "starter", // Simple derivation
        isNewUser: false,
      };
    } else {
      // 3. Document Missing (e.g., New Google User)
      // Return partial data to allow App to redirect to "Getting Started"
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatar: firebaseUser.photoURL,
        isPremium,
        planId: "starter",
        country: "",
        isNewUser: true, // Flags the UI to redirect
      };
    }
  },

  /**
   * Register with Email/Password.
   * Generates referral code and creates Firestore document IMMEDIATELY
   * with null/default values for country/language.
   */
  register: async (
    email: string,
    password: string,
    name: string
  ): Promise<UserData> => {
    // 1. Auth Create
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });

    // 2. Generate Referral Code
    const myCode = await generateMyCode();

    // 3. Create Firestore Document (Matching Flutter Schema)
    const newUser: FirestoreUserModel = {
      id: user.uid,
      userName: name,
      email: user.email || "",
      phoneNumber: "",
      referralCode: "",
      invitationCode: "",
      myCode: myCode,
      password: "",
      confirmPassword: "",
      deviceToken: "",
      profile: user.photoURL || "", // Empty if null
      availSubscriptions: [],
      savedWordsCount: 0,
      tokens: 0,
      remainingQuestions: 0,
      isQuizDefaultLanguageGerman: true,
      selectedLanguageCode: "en", // Default
      setIntegriAsDefault: true,
      country: null, // To be filled in Onboarding
      created: serverTimestamp(),
      featureUsed: getInitialFeatureUsed(),
      freeDays: null,
      freeDayStartDateTime: null,
      subscribedNotificationCategoriesIds: [],
      notificationPreference: true,
    };

    await setDoc(doc(db, "Users", user.uid), newUser);

    // 4. Return Frontend Data
    return {
      id: user.uid,
      email: user.email,
      name: name,
      avatar: user.photoURL,
      isPremium: false,
      planId: "starter",
      country: null,
      myCode,
      isNewUser: true, // Still marked new to force Onboarding (Country/Lang)
    };
  },

  /**
   * Login with Email/Password
   */
  login: async (email: string, password: string): Promise<UserData> => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return await AuthService.fetchUserProfile(userCredential.user);
  },

  /**
   * Login with Google.
   * Does NOT auto-create Firestore document.
   * Returns isNewUser: true if doc is missing.
   */
  loginWithGoogle: async (): Promise<UserData> => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return await AuthService.fetchUserProfile(userCredential.user);
  },

  logout: async () => {
    await signOut(auth);
  },

  /**
   * Called by "Getting Started" page to finalize Google/New users.
   * Creates the Firestore doc with generated code and provided details.
   */
  completeOnboarding: async (
    uid: string,
    data: { country: string; language: string; name?: string; email?: string }
  ): Promise<UserData> => {
    const myCode = await generateMyCode();

    // Default fallback values if Auth didn't provide them
    const defaults = {
      name: data.name || "",
      email: data.email || "",
    };

    const newUser: FirestoreUserModel = {
      id: uid,
      userName: defaults.name,
      email: defaults.email,
      phoneNumber: "",
      referralCode: "",
      invitationCode: "",
      myCode: myCode,
      password: "",
      confirmPassword: "",
      deviceToken: "",
      profile: auth.currentUser?.photoURL || "",
      availSubscriptions: [],
      savedWordsCount: 0,
      tokens: 0,
      remainingQuestions: 0,
      isQuizDefaultLanguageGerman: true,
      selectedLanguageCode: data.language || "en",
      setIntegriAsDefault: true,
      country: data.country,
      created: serverTimestamp(),
      featureUsed: getInitialFeatureUsed(),
      freeDays: null,
      freeDayStartDateTime: null,
      subscribedNotificationCategoriesIds:[],
      notificationPreference: true,
    };

    await setDoc(doc(db, "Users", uid), newUser, { merge: true });

    return {
      id: uid,
      email: defaults.email,
      name: defaults.name,
      avatar: auth.currentUser?.photoURL || null,
      country: data.country,
      isPremium: false, // Re-check usually handled by state
      planId: "starter",
      myCode,
      isNewUser: false,
    };
  },
};
