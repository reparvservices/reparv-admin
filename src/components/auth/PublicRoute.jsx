import { Navigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import AuthLoadingScreen from "./AuthLoadingScreen";

/** Login page — redirect to dashboard when already authenticated. */
export default function PublicRoute({ children }) {
  const { authStatus } = useAuth();

  if (authStatus === "loading") {
    return <AuthLoadingScreen />;
  }

  if (authStatus === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
