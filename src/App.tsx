import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

// Pages
import Home from "./Components/Pages/Home";
import Login from "./Components/Pages/Login";
import Signup from "./Components/Pages/Signup";
import Welcome from "./Components/Pages/Welcome";
import ChatInterface from "./Components/Pages/ChatInterface";

const Router = createBrowserRouter([
  // 1. Auth Routes (Standalone, no Sidebar)
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },

  // 2. Main App Routes (Wrapped in Home Layout)
  {
    path: "/",
    element: <Home />, // This contains Sidebar & Navbar
    children: [
      {
        index: true,
        element: <Welcome />, // The "How can I help you" screen
      },
      {
        path: "chat/:id",
        element: <ChatInterface />, // The actual chat messages view
      },
    ],
  },

  // 3. Fallback (Optional)
  { path: "*", element: <Navigate to="/" replace /> },
]);

const App: React.FC = () => {
  return <RouterProvider router={Router} />;
};

export default App;
