import React, { useState, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useAppDispatch } from "../hooks/useRedux";

//  IMPORT  ACTIONS AND API
import { setAuthUser } from "../features/auth/slices/authSlice";
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
import  Voice from "../pages/Voice";

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
      { path: "playground", element: <Playground /> },
      { path: "voice", element: <Voice /> },
    ],
  },
  // 3. Catch-all
  { path: "*", element: <Navigate to="/" replace /> },
]);

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const [introFinished, setIntroFinished] = useState(false);

  // AUTH LISTENER 
  useEffect(() => {
    //  listener fires whenever Firebase detects a user (login or refresh)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // A. User is logged in with Firebase.
          // B. fetch the  (Token) from  Backend again.
          const tokenData = await getBackendToken(
            firebaseUser.uid,
            firebaseUser.email
          );

          // C. Dispatch BOTH to Redux
          dispatch(
            setAuthUser({
              user: {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                avatar: firebaseUser.photoURL,
              },
              accessToken: tokenData.access_token, // <--- save the token here!
            })
          );
        } catch (error) {
          console.error("Error restoring backend session:", error);
          // If backend is down, we must log the user out to prevent bugs
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
