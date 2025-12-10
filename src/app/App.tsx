import React, { useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Home from "../pages/Home"; // Ensure Home.tsx is in src/pages
import Login from "../pages/LoginPage";
import Signup from "../pages/SignupPage";
import Welcome from "../pages/WelcomePage";
import ChatInterface from "../features/chat/components/ChatInterface";
import GettingStarted from "../pages/GettingStarted"; // Ensure this file exists in src/pages
import IntroPortal from "../components/ui/IntroPortal";
import HistoryPage from "../pages/HistoryPage";
const Router = createBrowserRouter([
  // Standalone Routes
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/getting-started", element: <GettingStarted /> },

  // Main App
  {
    path: "/",
    element: <Home />,
    children: [
      { index: true, element: <Welcome /> },
      { path: "chat/:id", element: <ChatInterface /> },
      { path: "history", element: <HistoryPage /> },
      {
        path: "library",
        element: <div className="p-10 text-white">Library</div>,
      },
      {
        path: "settings",
        element: <div className="p-10 text-white">Settings</div>,
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

const App: React.FC = () => {
  const [introFinished, setIntroFinished] = useState(false);

  return (
    <>
      {/* The Galaxy Portal plays first */}
      {!introFinished && (
        <IntroPortal onComplete={() => setIntroFinished(true)} />
      )}

      {/* App content fades in after intro */}
      <div
        className={
          introFinished
            ? "opacity-100 transition-opacity duration-1000"
            : "opacity-0"
        }
      >
        <RouterProvider router={Router} />
      </div>
    </>
  );
};

export default App;
