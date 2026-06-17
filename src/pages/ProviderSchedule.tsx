import { Navigate } from "react-router-dom";

/** Legacy URL — personal hours tab in the calendar portal */
const ProviderSchedule = () => (
  <Navigate to="/calendar?tab=hours" replace />
);

export default ProviderSchedule;
