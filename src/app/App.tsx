import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { HelmetProvider } from "react-v19-helmet-async";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";

// --- IMPORT ACTIONS AND API ---
import { setAuthUser } from "../features/auth/slices/authSlice";
import { getBackendToken } from "../api/backendApi";
import { AuthService } from "../features/auth/services/authService";

// --- SEO ---
import PageSEO from "../Components/seo/PageSEO";

// --- Components & Pages ---
import Home from "../pages/Home";
import Login from "../pages/LoginPage";
import Signup from "../pages/SignupPage";
import SignupQRPage from "../pages/SignupQRPage";
import Welcome from "../pages/WelcomePage";
import ChatInterface from "../features/chat/components/ChatInterface";
import GettingStarted from "../pages/GettingStarted";
import HistoryPage from "../pages/HistoryPage";
import Playground from "../pages/Playground";
import Voice from "../pages/Voice";
import PdfChatPage from "../pages/PdfChat";
import NewsPage from "../pages/NewsPage";
import NewsDetailPage from "../pages/NewsDetailPage";
import ArticleDetailPage from "../pages/ArticleDetailPage";
import SettingsPage from "../pages/SettingsPage";
import SendFeedbackPage from "../pages/SendFeedbackPage";
import HelpPage from "../pages/HelpPage";
import Agents from "../pages/Agents";
import AgentDetailsPage from "../features/agents/components/AgentDetailsPage";
import SubscriptionPage from "../pages/SubscriptionPage";
import ImageGenPage from "../pages/ImageGenPage";
import ContactUs from "../pages/ContactUs";
import MobileVoiceWrapper from "../pages/MobileVoiceWrapper"; // <--- IMPORT ADDED
import PrivacyPolicy from "../pages/PrivacyPolicy";
import PersonalizationPage from "../pages/PersonalizationPage";
import { fetchAgents } from "../features/agents/agentsSlice";
import AppDownloadSheet from "../Components/ui/AppDownloadSheet";
import AdBlockGuard from "../features/subscriptions/components/AdBlockGuard";
import CookieConsentBanner from "../Components/CookieConsentBanner";

// --- 1. GUARD COMPONENTS ---

/**
 * Modified for "Guest-First" access.
 * - Previous behavior: Redirected to /signup if !user.
 * - New behavior: Allows access to Outlet (Home) even if !user (Guest).
 * - Still protects against incomplete profiles (isNewUser).
 */
const ProtectedRoute = () => {
  const { user, isNewUser } = useAppSelector((state: any) => state.auth);

  // --- CHANGED: REMOVED FORCED REDIRECT ---
  // If no user, we simply allow them to pass through as a Guest.
  // The specific features inside Home will now handle triggering the LoginModal.

  /* if (!user) {
    return <Navigate to="/signup" replace />;
  } 
  */

  // Logged in but profile incomplete -> Go to Onboarding
  if (user && isNewUser) {
    return <Navigate to="/getting-started" replace />;
  }

  // Render content (Authenticated OR Guest)
  return <Outlet />;
};

/**
 * Protects public routes (Login/Signup).
 * - If logged in: Redirects to Dashboard (prevents double login).
 */
const PublicRoute = () => {
  const { user, isNewUser } = useAppSelector((state: any) => state.auth);

  // If logged in and setup is complete, send to Home
  if (user && !isNewUser) {
    return <Navigate to="/" replace />;
  }

  // Otherwise allow access to Login/Signup
  return <Outlet />;
};

// --- SEO root layout: PageSEO + Outlet for all routes ---
const SEOLayout = () => (
  <AdBlockGuard>
    <PageSEO />
    <Outlet />
  </AdBlockGuard>
);

// --- 2. ROUTER CONFIGURATION ---
const router = createBrowserRouter([
  {
    element: (
      <HelmetProvider>
        <SEOLayout />
      </HelmetProvider>
    ),
    children: [
      // Public Routes (Redirect to Home if already logged in)
      {
        element: <PublicRoute />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/signup", element: <Signup /> },
          { path: "/signup-qr", element: <SignupQRPage /> },
        ],
      },
      { path: "/getting-started", element: <GettingStarted /> },
      {
        path: "/voice/mobile-popup/:token",
        element: <MobileVoiceWrapper />,
      },
      // Main App Routes (Guest Accessible)
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
              { path: "news", element: <NewsPage /> },
              { path: "news/:id", element: <NewsDetailPage /> },
              { path: "articles/:id", element: <ArticleDetailPage /> },
              { path: "settings", element: <SettingsPage /> },
              { path: "settings/personalization", element: <PersonalizationPage /> },
              { path: "feedback", element: <SendFeedbackPage /> },
              { path: "help", element: <HelpPage /> },
              { path: "agents", element: <Agents /> },
              { path: "agents/:id", element: <AgentDetailsPage /> },
              { path: "subscriptions", element: <SubscriptionPage /> },
              { path: "imageGen", element: <ImageGenPage /> },
              { path: "contactUs", element: <ContactUs /> },
              { path: "privacy-policy", element: <PrivacyPolicy /> },
              { path: "*", element: <Navigate to="/" replace /> },
            ],
          },
        ],
      },
      { path: "*", element: <Navigate to="/signup" replace /> },
    ],
  },
]);

// --- 3. MAIN COMPONENT ---
const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.accessToken);

  // Fetch agents whenever we have a valid token
  useEffect(() => {
    if (token) {
      dispatch(fetchAgents(token));
    }
  });

  useEffect(() => {
    // This listener handles the "Auto Login" logic by detecting the existing session
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await AuthService.fetchUserProfile(firebaseUser);

          // Get Backend Token
          let accessToken = null;
          try {
            // UPDATED: Pass user.subscriptionTier instead of user.isPremium
            const tokenData = await getBackendToken(
              user.id,
              user.email,
              user.subscriptionTier
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
        // User is logged out -> Redux state cleared, UI stays on Home (Guest Mode)
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
      <AppDownloadSheet />
      <CookieConsentBanner />
    </>
  );
}

export default App;