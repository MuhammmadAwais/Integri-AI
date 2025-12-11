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
import IntroPortal from "../Components/ui/IntroPortal"; // Ensure path is correct
import Home from "../pages/Home";
import Login from "../pages/LoginPage";
import Signup from "../pages/SignupPage";
import Welcome from "../pages/WelcomePage";
import ChatInterface from "../features/chat/components/ChatInterface";
import GettingStarted from "../pages/GettingStarted";
import HistoryPage from "../pages/HistoryPage";

// --- Router Setup ---
const router = createBrowserRouter([
  // 1. Auth Pages
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/getting-started", element: <GettingStarted /> },

  // 2. Main App
  {
    path: "/",
    element: <Home />,
    children: [
      { index: true, element: <Welcome /> },
      { path: "chat/:id", element: <ChatInterface /> },
      { path: "history", element: <HistoryPage /> },
    ],
  },
  // 3. Catch-all
  { path: "*", element: <Navigate to="/" replace /> },
]);

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [introFinished, setIntroFinished] = useState(false);
  // Optional: Add a loading state for initial firebase check if needed
  // const [isAuthChecked, setIsAuthChecked] = useState(false);

  // --- Auth Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch(
          setAuthUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            avatar: firebaseUser.photoURL,
          })
        );
      } else {
        dispatch(setAuthUser(null));
      }
      // setIsAuthChecked(true); // If you want to wait for auth before showing app
    });
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <>
      {/* 1. Intro Animation (Fixed Z-Index ensures it's on top) */}
      {!introFinished && (
        <IntroPortal onComplete={() => setIntroFinished(true)} />
      )}

      {/* 2. Main App */}
      {/* We use opacity transition. 'pointer-events-auto' ensures clicks work after intro */}
      <div
        className={`transition-opacity duration-1000 ease-in min-h-screen bg-[#18181B] ${
          introFinished
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <RouterProvider router={router} />
      </div>
    </>
  );
};

export default App;
