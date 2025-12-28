// src/features/auth/services/authService.ts
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

export interface UserData {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  isPremium: boolean;
  planId?: string;
}

// Helper to fetch extended profile from Firestore
const fetchUserProfile = async (firebaseUser: User): Promise<UserData> => {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  let isPremium = false;
  let planId = "starter";

  if (userSnap.exists()) {
    const data = userSnap.data();
    isPremium = data.isPremium || false;
    planId = data.planId || "starter";
  } else {
    // If user exists in Auth but not Firestore (rare edge case), create basic doc
    await setDoc(
      userRef,
      {
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        createdAt: serverTimestamp(),
        isPremium: false,
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
  // --- REGISTER ---
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

    // Create user document in Firestore
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

  // --- LOGIN ---
  login: async (email: string, password: string): Promise<UserData> => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return await fetchUserProfile(userCredential.user);
  },

  // --- GOOGLE LOGIN ---
  loginWithGoogle: async (): Promise<UserData> => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);

    // Check if doc exists, if not create it inside fetchUserProfile logic
    return await fetchUserProfile(userCredential.user);
  },

  // --- LOGOUT ---
  logout: async () => {
    await signOut(auth);
  },
};
