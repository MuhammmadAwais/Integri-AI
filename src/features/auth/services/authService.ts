import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../app/firebase";
import { SubscriptionService } from "../../subscriptions/services/subscriptionService";

export interface UserData {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  isPremium: boolean;
  planId?: string;
  country?: string; // Added Country field
}

const fetchUserProfile = async (firebaseUser: User): Promise<UserData> => {
  // 1. Sync with RevenueCat FIRST (Preserved)
  const isPremium = await SubscriptionService.syncStatusWithRevenueCat(
    firebaseUser.uid
  );

  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  let planId = "starter";
  let country = "";
  // Default to Google/Auth photo, but allow Firestore to override it
  let avatar = firebaseUser.photoURL;

  if (userSnap.exists()) {
    const data = userSnap.data();
    planId = data.planId || "starter";
    country = data.country || "";
    // If user uploaded a custom photo, use it. Otherwise keep Google's.
    if (data.photoURL) {
      avatar = data.photoURL;
    }
  } else {
    // If no document, create one (Preserved existing fields + added new ones)
    await setDoc(
      userRef,
      {
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        createdAt: serverTimestamp(),
        isPremium: isPremium,
        planId: "starter",
        country: "",
        photoURL: firebaseUser.photoURL, // Save Google photo as initial
      },
      { merge: true }
    );
  }

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName,
    avatar: avatar,
    isPremium,
    planId,
    country,
  };
};

export const AuthService = {
  register: async (
    email: string,
    password: string,
    name: string
  ): Promise<UserData> => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });

    // Save default values to Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: name,
      createdAt: serverTimestamp(),
      isPremium: false,
      planId: "starter",
      country: "",
      photoURL: null,
    });

    return {
      id: user.uid,
      email: user.email,
      name: name,
      avatar: user.photoURL,
      isPremium: false,
      planId: "starter",
      country: "",
    };
  },

  login: async (email: string, password: string): Promise<UserData> => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return await fetchUserProfile(userCredential.user);
  },

  loginWithGoogle: async (): Promise<UserData> => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return await fetchUserProfile(userCredential.user);
  },

  logout: async () => {
    await signOut(auth);
  },
};
