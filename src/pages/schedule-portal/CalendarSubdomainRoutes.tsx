import { Routes, Route, Navigate } from "react-router-dom";
import SchedulePortalLogin from "./SchedulePortalLogin";
import SchedulePortalGate from "./SchedulePortalGate";

/** Routes served at calendar.elevatedhealthaugusta.com (root paths, not /calendar). */
const CalendarSubdomainRoutes = () => (
  <Routes>
    <Route path="/login" element={<SchedulePortalLogin kioskMode />} />
    <Route path="/" element={<SchedulePortalGate />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default CalendarSubdomainRoutes;
