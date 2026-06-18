import { Navigate } from "react-router-dom";

/** Legacy URL — advanced recomposition is consult-gated; funnel lives on /weight-loss. */
export default function MetabolicRecomposition() {
  return <Navigate to="/weight-loss#body-recomposition" replace />;
}
