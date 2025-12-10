import React, { useState, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useAppDispatch } from "../hooks/useRedux";
import { setAuthUser } from "../features/auth/slices/authSlice";

// --- Components & Pages ---
import IntroPortal from "../components/ui/IntroPortal"; // Your Animation
import Home from "../pages/Home";
import Login from "../pages/LoginPage";
import Signup from "../pages/SignupPage";
import Welcome from "../pages/WelcomePage";
import ChatInterface from "../features/chat/components/ChatInterface";
import GettingStarted from "../pages/GettingStarted";
import HistoryPage from "../pages/HistoryPage";

// --- Router Setup ---
const router = createBrowserRouter([
  // 1. Auth Pages (Standalone - No Sidebar)
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/getting-started", element: <GettingStarted /> },

  // 2. Main App (Sidebar + Navbar)
  {
    path: "/",
    element: <Home />, // This Layout serves both Guests & Users
    children: [
      { index: true, element: <Welcome /> }, // Default Home Screen
      { path: "chat/:id", element: <ChatInterface /> },
      { path: "history", element: <HistoryPage /> },
    ],
  },
  // 3. Catch-all (Redirect unknown URLs to Home)
  { path: "*", element: <Navigate to="/" replace /> },
]);

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [introFinished, setIntroFinished] = useState(false);

  // --- Auth Listener (Runs in background) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User Found -> Save to Redux
        dispatch(
          setAuthUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            avatar: firebaseUser.photoURL,
          })
        );
      } else {
        // No User -> Set Guest Mode
        dispatch(setAuthUser(null));
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <>
      {/* 1. Show Intro Animation First */}
      {!introFinished && (
        <IntroPortal onComplete={() => setIntroFinished(true)} />
      )}

      {/* 2. Show App (Fade in) */}
      <div
        className={`transition-opacity duration-1000 ease-in ${
          introFinished ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* THIS WAS MISSING -> The Engine! */}
        <RouterProvider router={router} />
      </div>
    </>
  );
};

export default App;
