import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useMediaQuery } from "./Components/hooks/useMediaQuery";

import Home from "./Components/Pages/Home";
import Login from "./Components/Pages/Login";
import Signup from "./Components/Pages/Signup";
import Welcome from "./Components/Pages/Welcome";
import ChatInterface from "./Components/Pages/ChatInterface";
import HistoryPage from "./Components/Pages/History";
import GettingStarted from "./Components/Pages/GettingStarted";

// Guard: Redirect new mobile users to Getting Started
const MobileGuard = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const hasSeenIntro = localStorage.getItem("hasSeenGettingStarted");

  if (isMobile && !hasSeenIntro) {
    return <Navigate to="/getting-started" replace />;
  }
  return children;
};

const Router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/getting-started", element: <GettingStarted /> },

  // Main App
  {
    path: "/",
    element: (
      <MobileGuard>
        <Home />
      </MobileGuard>
    ),
    children: [
      { index: true, element: <Welcome /> },
      { path: "chat/:id", element: <ChatInterface /> },
      { path: "history", element: <HistoryPage /> },
      {
        path: "library",
        element: <div className="p-10 text-white">Library Page</div>,
      },
      {
        path: "settings",
        element: <div className="p-10 text-white">Settings Page</div>,
      },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);

const App: React.FC = () => {
  return <RouterProvider router={Router} />;
};

export default App;
