import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { Loader2 } from "lucide-react";

//  IMPORT ACTIONS AND API
import { setAuthUser } from "../features/auth/slices/authSlice";
import { getBackendToken } from "../api/backendApi";
import { AuthService } from "../features/auth/services/authService";

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

// --- 1. GUARD COMPONENTS ---

/**
 * Protects routes that require authentication.
 * - If loading: Shows spinner.
 * - If not logged in: Redirects to /signup (as requested).
 * - If new user (incomplete profile): Redirects to /getting-started.
 */
const ProtectedRoute = () => {
  const { user, isLoading, isNewUser } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#18181B] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
      </div>
    );
  }

  // Not logged in -> Go to Signup
  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  // Logged in but profile incomplete -> Go to Onboarding
  if (isNewUser) {
    return <Navigate to="/getting-started" replace />;
  }

  // Authorized -> Render content
  return <Outlet />;
};

/**
 * Protects public routes (Login/Signup).
 * - If logged in: Redirects to Dashboard (prevents double login).
 */
const PublicRoute = () => {
  const { user, isLoading, isNewUser } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#18181B] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
      </div>
    );
  }

  // If logged in and setup is complete, send to Home
  if (user && !isNewUser) {
    return <Navigate to="/" replace />;
  }

  // Otherwise allow access to Login/Signup
  return <Outlet />;
};

// --- 2. ROUTER CONFIGURATION ---
const router = createBrowserRouter([
  // Public Routes (Redirect to Home if already logged in)
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
    ],
  },

  // Onboarding (Accessible to auth users who are 'new')
  { path: "/getting-started", element: <GettingStarted /> },

  // Protected Routes (Redirect to Signup if not logged in)
  {
    element: <ProtectedRoute />,
    children: [
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
          // Catch-all inside protected area
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },

  // Global Fallback
  { path: "*", element: <Navigate to="/signup" replace /> },
]);

// --- 3. MAIN COMPONENT ---
const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // This listener handles the "Auto Login" logic by detecting the existing session
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await AuthService.fetchUserProfile(firebaseUser);

          // Get Backend Token
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
        // User is logged out -> ProtectedRoute will handle the redirect to /signup
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
