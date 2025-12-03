import React, { useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Home from "./Components/Pages/Home";
import Login from "./Components/Pages/Login";
import Signup from "./Components/Pages/Signup";
import Welcome from "./Components/Pages/Welcome";
import ChatInterface from "./Components/Pages/ChatInterface";
import IntroPortal from "./Components/ui/IntroPortal"; // Import the portal
import HistoryPage from "./Components/Pages/History";

// -- Placeholder Components for Missing Pages --
const UserProfile = () => (
  <div className="p-10 text-center text-2xl font-bold opacity-60">
    User Profile Settings
  </div>
);
const UpgradePlan = () => (
  <div className="p-10 text-center text-2xl font-bold opacity-60">
    Upgrade to Pro
  </div>
);
const Library = () => (
  <div className="p-10 text-center text-2xl font-bold opacity-60">
    Prompt Library
  </div>
);

const Router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  {
    path: "/",
    element: <Home />,
    children: [
      { index: true, element: <Welcome /> },
      { path: "chat/:id", element: <ChatInterface /> },
      { path: "library", element: <Library /> },
      { path: "profile", element: <UserProfile /> }, // Fixed Route
      { path: "upgrade", element: <UpgradePlan /> }, // Fixed Route
      { path: "history", element: <HistoryPage /> },
      { path: "settings", element: <UserProfile /> }, // Map settings to profile for now
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

const App: React.FC = () => {
  const [introFinished, setIntroFinished] = useState(false);

  return (
    <>
      {!introFinished && (
        <IntroPortal onComplete={() => setIntroFinished(true)} />
      )}
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
