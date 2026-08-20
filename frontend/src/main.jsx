import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Providers (ToastProvider, AuthProvider, ErrorBoundary) live inside
// App.jsx itself - don't duplicate them here.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
