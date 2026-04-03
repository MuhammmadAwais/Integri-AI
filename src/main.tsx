import React from "react";
import ReactDOM from "react-dom/client";
import "./i18n";
import App from "./app/App";
import "./index.css"; 
import "katex/dist/katex.min.css";
import { Provider } from "react-redux";
import { store } from "./app/store"; 

import { ToastProvider } from "./Components/ui/ToastProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </Provider>
  </React.StrictMode>
);
