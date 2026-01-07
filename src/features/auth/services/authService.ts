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
  availSubscriptions: any[];
  subscription: any;
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
}

export interface UserData {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  isPremium: boolean;
  planId: string;
  country: string | null;
  myCode?: number;
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
const getInitialSubscription = () => ({
  id: "free",
  name: "Free",
  price: 0,
});

export const AuthService = {
  fetchUserProfile: async (
    firebaseUser: User,
    forceIsPremium?: boolean
  ): Promise<UserData> => {
    let isPremium = forceIsPremium;
    if (isPremium === undefined) {
      isPremium = await SubscriptionService.syncStatusWithRevenueCat(
        firebaseUser.uid
      );
    }

    const userRef = doc(db, "Users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data() as FirestoreUserModel;

      // If country is missing, treat as New User to force Onboarding
      const isIncomplete = !data.country || !data.selectedLanguageCode;

      return {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: data.userName || firebaseUser.displayName,
        avatar: data.profile || firebaseUser.photoURL,
        country: data.country || null,
        myCode: data.myCode,
        isPremium,
        planId: isPremium ? "premium" : "freemium",
        isNewUser: isIncomplete,
      };
    } else {
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatar: firebaseUser.photoURL,
        isPremium,
        planId: "freemium",
        country: null,
        isNewUser: true,
      };
    }
  },

  register: async (
    email: string,
    password: string,
    name: string,
    phoneNumber?: string
  ): Promise<UserData> => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
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
      availSubscriptions: [],
      subscription: getInitialSubscription(),
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
    };

    await setDoc(doc(db, "Users", user.uid), newUser);

    return {
      id: user.uid,
      email: user.email,
      name: name,
      avatar: user.photoURL,
      isPremium: false,
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
      password
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
    data: { country: string; language: string; name?: string; email?: string }
  ): Promise<void> => {
    // Only update the necessary fields
    await setDoc(
      doc(db, "Users", uid),
      {
        country: data.country,
        selectedLanguageCode: data.language,
        // Ensure name/email are synced if they were missing (e.g. Google Auth edge cases)
        ...(data.name && { userName: data.name }),
        ...(data.email && { email: data.email }),
      },
      { merge: true }
    );
  },
};
