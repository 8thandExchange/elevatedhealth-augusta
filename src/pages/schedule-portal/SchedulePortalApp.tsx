import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import SchedulePortalShell from "@/components/schedule-portal/SchedulePortalShell";
import OfficeSchedule from "@/pages/OfficeSchedule";
import { getSchedulePortalLogin } from "@/lib/schedulePortalHost";

const SchedulePortalApp = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const prev = link?.getAttribute("href");
    if (link) link.setAttribute("href", "/calendar-manifest.json");
    document.documentElement.classList.add("schedule-portal");
    return () => {
      document.documentElement.classList.remove("schedule-portal");
      if (link && prev) link.setAttribute("href", prev);
    };
  }, []);

  if (isLoading || !user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>EHA Calendar</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="EHA Calendar" />
        <link rel="manifest" href="/calendar-manifest.json" />
      </Helmet>
      <SchedulePortalShell userEmail={user.email}>
        <OfficeSchedule portalMode loginPath={getSchedulePortalLogin()} />
      </SchedulePortalShell>
    </>
  );
};

export default SchedulePortalApp;
