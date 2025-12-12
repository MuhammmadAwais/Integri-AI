import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../../app/firebase";

// Define what a User 
export interface UserData {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
}

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

    return {
      id: user.uid,
      email: user.email,
      name: name,
      avatar: user.photoURL,
    };
  },

  // --- LOGIN ---
  login: async (email: string, password: string): Promise<UserData> => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    return {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      avatar: user.photoURL,
    };
  },

  // --- GOOGLE LOGIN ---
  loginWithGoogle: async (): Promise<UserData> => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    return {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      avatar: user.photoURL,
    };
  },

  // --- LOGOUT ---
  logout: async () => {
    await signOut(auth);
  },
};
