import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./store/auth.jsx";
import { AppDialogProvider } from "./contexts/AppDialogContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { notifySessionExpired } from "./lib/apiClient.js";

axios.defaults.withCredentials = true;
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      notifySessionExpired();
    }
    return Promise.reject(error);
  },
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppDialogProvider>
          <App />
        </AppDialogProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
