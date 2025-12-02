import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./Components/Pages/Root";
import Home from "./Components/Pages/Home";
import Login from "./Components/Pages/Login";
import Signup from "./Components/Pages/Signup";


const Router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },

    ],
  },
]);

const App: React.FC = () => {
  return <RouterProvider router={Router} />;
};

export default App;
