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
import type { SubscriptionTier } from "../../../../Constants";

// --- Types ---
interface FirestoreUserModel {
  userName: string;
  email: string;
  phoneNumber: string;
  referralCode: string;
  invitationCode: string;
  myCode: number;
  password: string;
  confirmPassword: string;
  deviceToken: string;
  profile: string;
  id: string;
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
  subscribedNotificationCategoriesIds: string[] | null;
  notificationPreference: boolean;
  dateOfBirth: Date | null;
}

export interface UserData {
  id: string;
  email: string | null;
  name: string | null;
  profile: string | null;
  subscriptionTier: SubscriptionTier; // UPDATED: Changed from isPremium boolean
  planId: string;
  country: string | null;
  myCode: number;
  isNewUser?: boolean;
}

// --- Helpers ---
const generateMyCode = async (): Promise<number> => {
  try {
    const coll = collection(db, "Users");
    const snapshot = await getCountFromServer(coll);
    return 10000 + snapshot.data().count;
  } catch (error) {
    return 10000 + Math.floor(Math.random() * 1000);
  }
};

const getInitialFeatureUsed = () => ({});

export const AuthService = {
  fetchUserProfile: async (user: User): Promise<UserData> => {
    const userDoc = await getDoc(doc(db, "Users", user.uid));

    // UPDATED: Sync real status from RevenueCat immediately
    const tier = await SubscriptionService.syncStatusWithRevenueCat(user.uid);

    if (userDoc.exists()) {
      const data = userDoc.data() as FirestoreUserModel;
      return {
        id: user.uid,
        email: user.email,
        name: data.userName,
        profile: user.photoURL,
        subscriptionTier: tier, // Set the fetched tier
        planId: tier === "free" ? "freemium" : tier,
        country: data.country,
        myCode: data.myCode,
      };
    }

    // New User / Fallback Logic
    const myCode = Math.floor(100000 + Math.random() * 900000);
    return {
      id: user.uid,
      email: user.email,
      name: user.displayName || "User",
      profile: user.photoURL,
      subscriptionTier: tier, // Set the fetched tier
      planId: "freemium",
      country: null,
      myCode,
      isNewUser: true, // Force redirect to GettingStarted
    };
  },

  register: async (
    email: string,
    password: string,
    name: string,
    phoneNumber?: string,
  ): Promise<UserData> => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });

    const myCode = await generateMyCode();

    const newUser: FirestoreUserModel = {
      id: user.uid,
      userName: name,
      email: user.email || "",
      phoneNumber: phoneNumber || "",
      referralCode: "",
      invitationCode: "",
      myCode: myCode,
      password: "", // Handled by Firebase Auth
      confirmPassword: "",
      deviceToken: "",
      profile: user.photoURL || "",
      savedWordsCount: 0,
      tokens: 0,
      remainingQuestions: 0,
      isQuizDefaultLanguageGerman: true,
      selectedLanguageCode: "", // Empty to force selection in GettingStarted
      setIntegriAsDefault: true,
      country: null, // Null to force selection in GettingStarted
      created: serverTimestamp(),
      featureUsed: getInitialFeatureUsed(),
      freeDays: null,
      freeDayStartDateTime: null,
      subscribedNotificationCategoriesIds: null,
      notificationPreference: true,
      dateOfBirth: null, // To be set during onboarding ( Getting Started )
    };

    await setDoc(doc(db, "Users", user.uid), newUser);

    return {
      id: user.uid,
      email: user.email,
      name: name,
      profile: user.photoURL,
      subscriptionTier: "free", // New users start with free tier
      planId: "freemium",
      country: null,
      myCode,
      isNewUser: true, // Force redirect to GettingStarted
    };
  },

  login: async (email: string, password: string): Promise<UserData> => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return await AuthService.fetchUserProfile(userCredential.user);
  },

  loginWithGoogle: async (): Promise<UserData> => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return await AuthService.fetchUserProfile(userCredential.user);
  },

  logout: async () => {
    await signOut(auth);
  },

  completeOnboarding: async (
    uid: string,
    data: {
      country: string;
      language: string;
      name?: string;
      email?: string;
      dateOfBirth: Date;
    },
  ): Promise<void> => {
    // Only update the necessary fields
    await setDoc(
      doc(db, "Users", uid),
      {
        country: data.country,
        selectedLanguageCode: data.language,
        dateOfBirth: data.dateOfBirth, // To be set during onboarding ( Getting Started )
        // Ensure name/email are synced if they were missing (e.g. Google Auth edge cases)
        ...(data.name && { userName: data.name }),
        ...(data.email && { email: data.email }),
      },
      { merge: true },
    );
  },
};
