import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { closeAssistantChat } from "@/lib/openAssistantChat";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    closeAssistantChat();
    // Widget may load after route change — retry dismiss so back/forward isn't blocked
    const retry = window.setTimeout(closeAssistantChat, 300);
    return () => window.clearTimeout(retry);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
