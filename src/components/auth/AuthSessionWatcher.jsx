import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { AUTH_SESSION_EXPIRED } from "../../lib/apiClient";

/** Redirects to login when any API returns 401. */
export default function AuthSessionWatcher() {
  const navigate = useNavigate();
  const { clearAuth } = useAuth();

  useEffect(() => {
    const onExpired = () => {
      clearAuth();
      const path = window.location.pathname;
      if (path !== "/" && path !== "") {
        navigate("/", { replace: true });
      }
    };
    window.addEventListener(AUTH_SESSION_EXPIRED, onExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED, onExpired);
  }, [clearAuth, navigate]);

  return null;
}
