import React, { Suspense, lazy, useEffect } from "react";
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
import RouteLoading from "../Components/ui/RouteLoading";

// --- Components & Pages ---
// Only the homepage shell (Home layout + Welcome) is in the main bundle; every
// other page is loaded when it is first visited, so the homepage no longer
// downloads the whole app (PDF tools, Markdown/maths, blog, news, …) to paint.
import Home from "../pages/Home";
const Login = lazy(() => import("../pages/LoginPage"));
const Signup = lazy(() => import("../pages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const SignupQRPage = lazy(() => import("../pages/SignupQRPage"));
import Welcome from "../pages/WelcomePage";
const ChatInterface = lazy(() => import("../features/chat/components/ChatInterface"));
const GettingStarted = lazy(() => import("../pages/GettingStarted"));
const HistoryPage = lazy(() => import("../pages/HistoryPage"));
const Playground = lazy(() => import("../pages/Playground"));
const Voice = lazy(() => import("../pages/Voice"));
const PdfChatPage = lazy(() => import("../pages/PdfChat"));
const NewsPage = lazy(() => import("../pages/NewsPage"));
const NewsDetailPage = lazy(() => import("../pages/NewsDetailPage"));
const ArticleDetailPage = lazy(() => import("../pages/ArticleDetailPage"));
const BlogPage = lazy(() => import("../pages/BlogPage"));
const BlogDetailPage = lazy(() => import("../pages/BlogDetailPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const SendFeedbackPage = lazy(() => import("../pages/SendFeedbackPage"));
const HelpPage = lazy(() => import("../pages/HelpPage"));
const Agents = lazy(() => import("../pages/Agents"));
const AgentDetailsPage = lazy(() => import("../features/agents/components/AgentDetailsPage"));
const EmailCrafterWorkspace = lazy(() => import("../features/systemTools/components/EmailCrafterWorkspace"));
const DocumentExplainerWorkspace = lazy(() => import("../features/systemTools/components/DocumentExplainerWorkspace"));
const CostOfLivingWorkspace = lazy(() => import("../features/systemTools/components/CostOfLivingWorkspace"));
const SubscriptionPage = lazy(() => import("../pages/SubscriptionPage"));
const ImageGenPage = lazy(() => import("../pages/ImageGenPage"));
const ContactUs = lazy(() => import("../pages/ContactUs"));
const MobileVoiceWrapper = lazy(() => import("../pages/MobileVoiceWrapper"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("../pages/TermsOfUse"));
const MobileTopUpPage = lazy(() => import("../pages/MobileTopUpPage"));
const MobileTopUpIndexPage = lazy(() => import("../pages/MobileTopUpIndexPage"));
const PersonalizationPage = lazy(() => import("../pages/PersonalizationPage"));
import { fetchAgents, fetchPublicAgents } from "../features/agents/agentsSlice";
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
    <Suspense fallback={<RouteLoading />}>
      <Outlet />
    </Suspense>
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
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
        ],
      },
      { path: "/getting-started", element: <GettingStarted /> },
      // Standalone (no sidebar) so the mobile app can show it in a web view.
      { path: "/terms", element: <TermsOfUse /> },
      // Mobile top-up shop: /shopping/mobile-top-up/{country}/{lang} (standalone, no sidebar)
      { path: "/shopping/mobile-top-up", element: <MobileTopUpIndexPage /> },
      { path: "/shopping/mobile-top-up/:country", element: <MobileTopUpPage /> },
      { path: "/shopping/mobile-top-up/:country/:lang", element: <MobileTopUpPage /> },
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
              { path: "news/:country/:id", element: <NewsDetailPage /> },
              { path: "articles/:id", element: <ArticleDetailPage /> },
              { path: "blog", element: <BlogPage /> },
              { path: "blog/:slug", element: <BlogDetailPage /> },
              { path: "settings", element: <SettingsPage /> },
              { path: "settings/personalization", element: <PersonalizationPage /> },
              { path: "feedback", element: <SendFeedbackPage /> },
              { path: "help", element: <HelpPage /> },
              { path: "agents", element: <Agents /> },
              { path: "agents/system/email", element: <EmailCrafterWorkspace /> },
              { path: "agents/system/document-explainer", element: <DocumentExplainerWorkspace /> },
              { path: "agents/system/cost-of-living", element: <CostOfLivingWorkspace /> },
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
  const isDark = useAppSelector((state) => state.theme.isDark);
  const embedded = new URLSearchParams(window.location.search).get("embed") === "1";

  // `.dark` on <html> switches the brand palette in index.css for every
  // route, including the ones outside the Home layout (login, signup, …).
  // ?theme=light|dark (pages shown inside the mobile app) wins over the site setting.
  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get("theme");
    document.documentElement.classList.toggle("dark", forced === "dark" || (forced !== "light" && isDark));
  }, [isDark]);

  // Fetch agents and public agents whenever we have a valid token
  useEffect(() => {
    if (token) {
      dispatch(fetchAgents(token));
      dispatch(fetchPublicAgents(token));
    }
  }, [token, dispatch]);

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
      {/* ?embed=1: page shown inside the mobile app, no site popups */}
      {!embedded && (
        <>
          <AppDownloadSheet />
          <CookieConsentBanner />
        </>
      )}
    </>
  );
}

export default App;