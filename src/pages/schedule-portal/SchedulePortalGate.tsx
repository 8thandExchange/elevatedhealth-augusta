import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SchedulePortalApp from "./SchedulePortalApp";
import { getSchedulePortalHome, getSchedulePortalLogin } from "@/lib/schedulePortalHost";

/**
 * Auth gate for calendar portal — redirects unauthenticated staff to login.
 */
const SchedulePortalGate = () => {
  const { user, isProvider, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const portalHome = getSchedulePortalHome();
  const portalLogin = getSchedulePortalLogin();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      const next = encodeURIComponent(`${portalHome}${window.location.search}`);
      navigate(`${portalLogin}?next=${next}`, { replace: true });
      return;
    }
    if (!isProvider) {
      navigate("/patient/dashboard", { replace: true });
    }
  }, [user, isProvider, isLoading, navigate, searchParams, portalHome, portalLogin]);

  if (isLoading || !user || !isProvider) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <SchedulePortalApp />;
};

export default SchedulePortalGate;
