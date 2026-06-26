import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Clock, Shield, CheckCircle } from "lucide-react";

interface WelcomeIntakeProps {
  patientName: string;
  intakeCompleted?: boolean;
}

const WelcomeIntake = ({ patientName, intakeCompleted = false }: WelcomeIntakeProps) => {
  const navigate = useNavigate();

  if (intakeCompleted) {
    return (
      <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-playfair text-xl text-foreground mb-2">
                Intake Complete
              </h3>
              <p className="text-muted-foreground">
                Thank you for completing your medical intake. A provider is reviewing your 
                protocol based on your results. You will be notified when your personalized 
                treatment plan is ready.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Clock className="w-4 h-4" />
                <span>Typically 24-48 hours</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="pt-8 pb-8">
        <div className="text-center max-w-md mx-auto">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>

          {/* Welcome Text */}
          <h2 className="font-playfair text-2xl text-foreground mb-2">
            Welcome, {patientName}!
          </h2>
          <p className="text-muted-foreground mb-6">
            To begin your hormone optimization journey, please complete your medical intake 
            questionnaire. This helps us understand your symptoms and create a personalized 
            treatment plan.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">HIPAA-compliant & secure</span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">Takes about 5 minutes</span>
            </div>
          </div>

          {/* CTA */}
          <Button size="lg" onClick={() => navigate("/patient/intake")} className="w-full sm:w-auto">
            <ClipboardList className="w-4 h-4 mr-2" />
            Begin Medical Intake
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeIntake;