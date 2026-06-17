import { Navigate, useLocation } from "react-router-dom";

/** Legacy /schedule URLs → dedicated calendar portal, preserving query string. */
const RedirectToCalendar = () => {
  const { search } = useLocation();
  return <Navigate to={`/calendar${search}`} replace />;
};

export default RedirectToCalendar;
