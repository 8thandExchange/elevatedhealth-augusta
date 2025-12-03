import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export const BackButton = ({ to, label, className }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleClick}
      className={className}
      aria-label={label || "Go back"}
    >
      <ArrowLeft className="w-5 h-5" />
    </Button>
  );
};

export const BackToDashboard = ({ userType = "patient" }: { userType?: "patient" | "provider" }) => {
  const navigate = useNavigate();
  const dashboardPath = userType === "provider" ? "/provider/dashboard" : "/patient/dashboard";

  return (
    <Button 
      variant="outline" 
      onClick={() => navigate(dashboardPath)}
      className="gap-2"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Dashboard
    </Button>
  );
};
