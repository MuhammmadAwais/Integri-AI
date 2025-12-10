import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../../app/firebase";

// Define the shape of our User data to keep things consistent
export interface UserData {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
}

export const AuthService = {
  // --- SIGN UP ---
  register: async (
    email: string,
    password: string,
    name: string
  ): Promise<UserData> => {
    // 1. Create account on Firebase
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // 2. Update their "Display Name" immediately so it shows up in the app
    await updateProfile(user, { displayName: name });

    // 3. Return formatted data
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

  // --- LOGOUT ---
  logout: async () => {
    await signOut(auth);
  },
};
