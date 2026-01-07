import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; 
import { useAppDispatch } from "../hooks/useRedux";

//  IMPORT ACTIONS AND API
import { setAuthUser } from "../features/auth/slices/authSlice";
import { getBackendToken } from "../api/backendApi";
import { AuthService } from "../features/auth/services/authService"; // Import AuthService

// --- Components & Pages ---
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
import ImageGenPage from "../pages/ImageGenPage";

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
      { path: "c/:id", element: <ChatInterface /> },
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
      { path: "imageGen", element: <ImageGenPage /> },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },

  // 3. Fallback
  { path: "*", element: <Navigate to="/" replace /> },
]);

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1. Use AuthService to get unified Profile + RC Status
          // This handles mapping Firestore fields and checking Premium status logic centrally
          const user = await AuthService.fetchUserProfile(firebaseUser);

          // 2. Apply theme if user has specific preference (Optional, depending on your logic)
          // Since new schema doesn't explicitly have 'defaultTheme', you might assume system default
          // or check a different field. I'll leave the original dispatch logic but removed manual Firestore fetch
          // 3. Fetch Backend Token (Pass derived premium status)
          let accessToken = null;
          try {
            const tokenData = await getBackendToken(
              user.id,
              user.email,
              user.isPremium
            );
            accessToken = tokenData.access_token;
          } catch (tokenError) {
            console.error("Backend token error", tokenError);
          }

          // 4. Dispatch Unified Auth State
          dispatch(
            setAuthUser({
              user: user,
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
      <div>
        <RouterProvider router={router} />
      </div>
    </>
  );
};

export default App;
