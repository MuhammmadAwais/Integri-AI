import React, { useState, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAppDispatch } from "../hooks/useRedux";

//  IMPORT ACTIONS AND API
import { setAuthUser } from "../features/auth/slices/authSlice";
import { setTheme } from "../features/theme/themeSlice";
import { getBackendToken } from "../api/backendApi";

// --- Components & Pages ---
import IntroPortal from "../Components/ui/IntroPortal";
import Home from "../pages/Home";
import Login from "../pages/LoginPage";
import Signup from "../pages/SignupPage";
import Welcome from "../pages/WelcomePage";
import ChatInterface from "../features/chat/components/ChatInterface";
import GettingStarted from "../pages/GettingStarted";
import HistoryPage from "../pages/HistoryPage";
import Playground from "../pages/Playground";
import Voice from "../pages/Voice";
import PdfChatPage from "../pages/PdfChat";
import SettingsPage from "../pages/SettingsPage";
import SendFeedbackPage from "../pages/SendFeedbackPage";
import HelpPage from "../pages/HelpPage";
import Agents from "../pages/Agents";
import AgentDetailsPage from "../features/agents/components/AgentDetailsPage";
import SubscriptionPage from "../pages/SubscriptionPage";

// --- Router Setup (KEPT EXACTLY AS PROVIDED) ---
const router = createBrowserRouter([
  // 1. Auth Pages
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/getting-started", element: <GettingStarted /> },

  // 2. Main App
  {
    path: "/",
    element: <Home />, // Wraps everything in Layout
    children: [
      { index: true, element: <Welcome /> }, // Default: Welcome Screen
      { path: "chat/:id", element: <ChatInterface /> }, // Chat
      { path: "c/:id", element: <ChatInterface /> }, // Shared/Short Link
      { path: "history", element: <HistoryPage /> },
      { path: "playground", element: <Playground /> },
      { path: "voice", element: <Voice /> },
      { path: "pdf", element: <PdfChatPage /> },
      { path: "pdf/:id", element: <PdfChatPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "feedback", element: <SendFeedbackPage /> },
      { path: "help", element: <HelpPage /> },
      { path: "agents", element: <Agents /> },
      { path: "agents/:id", element: <AgentDetailsPage /> },
      { path: "subscriptions", element: <SubscriptionPage /> },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },

  // 3. Fallback
  { path: "*", element: <Navigate to="/" replace /> },
]);

const App: React.FC = () => {
  const [introFinished, setIntroFinished] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Initialize defaults
          let isPremium = false;
          let planId = "starter";

          // 1. Fetch User Profile & Settings from Firestore
          try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();

              // Apply theme if set
              if (userData.defaultTheme) {
                const isDarkTheme = userData.defaultTheme === "dark";
                dispatch(setTheme(isDarkTheme));
              }

              // Extract subscription status
              isPremium = userData.isPremium || false;
              planId = userData.planId || "starter";
            }
          } catch (firestoreError) {
            console.error("Failed to load user profile:", firestoreError);
          }

          // 2. Fetch Backend Token
          let accessToken = null;
          try {
            const tokenData = await getBackendToken(
              firebaseUser.uid,
              firebaseUser.email
            );
            accessToken = tokenData.access_token;
          } catch (tokenError) {
            console.error("Backend token error", tokenError);
          }

          // 3. Dispatch Auth State with Subscription Data
          dispatch(
            setAuthUser({
              user: {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                avatar: firebaseUser.photoURL,
                isPremium: isPremium, // Injected here
                planId: planId, // Injected here
              },
              accessToken: accessToken,
            })
          );
        } catch (error) {
          console.error("Error restoring session:", error);
          dispatch(setAuthUser({ user: null, accessToken: null }));
        }
      } else {
        // User is logged out
        dispatch(setAuthUser({ user: null, accessToken: null }));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <>
      {!introFinished && (
        <IntroPortal onComplete={() => setIntroFinished(true)} />
      )}
      {/* 2. Main App */}
      <div
        className={`transition-opacity duration-1000 ${
          introFinished ? "opacity-100" : "opacity-0"
        }`}
      >
        <RouterProvider router={router} />
      </div>
    </>
  );
};

export default App;
