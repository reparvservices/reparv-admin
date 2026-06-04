import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../store/auth";
import AuthLoadingScreen from "./AuthLoadingScreen";

export default function ProtectedRoute({ children }) {
  const { authStatus } = useAuth();
  const location = useLocation();

  if (authStatus === "loading") {
    return <AuthLoadingScreen />;
  }

  if (authStatus !== "authenticated") {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
}
