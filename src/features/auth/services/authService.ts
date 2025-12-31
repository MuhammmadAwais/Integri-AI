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
}

const fetchUserProfile = async (firebaseUser: User): Promise<UserData> => {
  // 1. Sync with RevenueCat FIRST to see if they bought a sub on mobile
  const isPremium = await SubscriptionService.syncStatusWithRevenueCat(
    firebaseUser.uid
  );

  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  let planId = "starter";

  if (userSnap.exists()) {
    const data = userSnap.data();
    planId = data.planId || "starter";
  } else {
    await setDoc(
      userRef,
      {
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        createdAt: serverTimestamp(),
        isPremium: isPremium,
        planId: "starter",
      },
      { merge: true }
    );
  }

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName,
    avatar: firebaseUser.photoURL,
    isPremium,
    planId,
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

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: name,
      createdAt: serverTimestamp(),
      isPremium: false,
      planId: "starter",
    });

    return {
      id: user.uid,
      email: user.email,
      name: name,
      avatar: user.photoURL,
      isPremium: false,
      planId: "starter",
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
