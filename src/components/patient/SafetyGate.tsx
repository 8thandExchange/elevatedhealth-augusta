import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Phone, Clock, CheckCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";

interface SafetyGateProps {
  patientName: string;
  onContinue?: () => void;
}

const SafetyGate = ({ patientName, onContinue }: SafetyGateProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="font-cormorant text-3xl text-foreground mb-2">
            Priority Medical Review
          </h1>
          <p className="text-muted-foreground">
            Your safety is our top priority
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-6 space-y-6">
            <p className="text-foreground">
              Hello <span className="font-semibold">{patientName}</span>,
            </p>
            
            <p className="text-foreground leading-relaxed">
              Based on your medical history, <span className="font-semibold">a provider</span> needs 
              to review your file manually to ensure your safety before we can proceed with hormone therapy recommendations.
            </p>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                What happens next?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Your account has been flagged for <strong>priority review</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>A provider will personally review your medical history within <strong>24-48 hours</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>You will receive a call to discuss safe treatment options tailored to your needs</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Why the extra care?</strong> Certain medical conditions require careful consideration 
                before starting hormone therapy. This review ensures we create a treatment plan that is 
                both effective and safe for your unique situation.
              </p>
            </div>

            {/* Contact Info */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <a 
                href={`tel:${SITE_CONFIG.phoneRaw}`}
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Phone className="w-4 h-4" />
                {SITE_CONFIG.phone}
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => window.location.href = `tel:${SITE_CONFIG.phoneRaw}`}
          >
            <Phone className="w-4 h-4 mr-2" />
            Call to Expedite Review
          </Button>
          
          {onContinue && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onContinue}
            >
              Continue to Dashboard
            </Button>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          This safety protocol is in accordance with NAMS guidelines and ensures 
          the highest standard of care for patients with complex medical histories.
        </p>
      </div>
    </div>
  );
};

export default SafetyGate;