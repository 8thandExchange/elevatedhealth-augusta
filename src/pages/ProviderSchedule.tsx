import { Navigate } from "react-router-dom";

/** Legacy URL — unified office calendar lives at /office/schedule */
const ProviderSchedule = () => (
  <Navigate to="/office/schedule?tab=hours" replace />
);

export default ProviderSchedule;
