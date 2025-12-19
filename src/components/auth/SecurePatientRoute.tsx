import { ReactNode } from "react";
import { SessionSecurityProvider } from "@/providers/SessionSecurityProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface SecurePatientRouteProps {
  children: ReactNode;
}

const SecurePatientRoute = ({ children }: SecurePatientRouteProps) => {
  return (
    <ProtectedRoute>
      <SessionSecurityProvider>
        {children}
      </SessionSecurityProvider>
    </ProtectedRoute>
  );
};

export default SecurePatientRoute;
