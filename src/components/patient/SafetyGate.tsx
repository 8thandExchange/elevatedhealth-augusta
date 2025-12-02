import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Phone, Clock, CheckCircle, Mail, Loader2, CalendarClock } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SafetyGateProps {
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  safetyFlags?: string[];
  onContinue?: () => void;
}

const SafetyGate = ({ patientName, patientEmail, patientPhone, safetyFlags, onContinue }: SafetyGateProps) => {
  const [isRequestingCallback, setIsRequestingCallback] = useState(false);
  const [callbackRequested, setCallbackRequested] = useState(false);
  const [phone, setPhone] = useState(patientPhone || "");
  const [preferredTime, setPreferredTime] = useState("");

  const handleRequestCallback = async () => {
    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }

    setIsRequestingCallback(true);
    try {
      const { error } = await supabase.functions.invoke("send-safety-callback-request", {
        body: {
          patient_name: patientName,
          patient_email: patientEmail,
          patient_phone: phone,
          safety_flags: safetyFlags,
          preferred_time: preferredTime,
        },
      });

      if (error) throw error;

      setCallbackRequested(true);
      toast.success("Callback request submitted! We'll reach out within 24-48 hours.");
    } catch (err: any) {
      console.error("Callback request error:", err);
      toast.error("Failed to submit request. Please call us directly.");
    } finally {
      setIsRequestingCallback(false);
    }
  };

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

            {/* Request Callback Form */}
            {!callbackRequested ? (
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-4 border border-border">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-primary" />
                  Request a Callback
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Phone Number *</label>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Preferred Time (optional)</label>
                    <Input
                      type="text"
                      placeholder="e.g., Mornings, After 2pm, Weekdays only"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleRequestCallback}
                    disabled={isRequestingCallback || !phone}
                    className="w-full"
                  >
                    {isRequestingCallback ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    {isRequestingCallback ? "Submitting..." : "Request Callback"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">Callback Request Received!</p>
                    <p className="text-sm text-green-600 dark:text-green-300">We'll reach out within 24-48 hours.</p>
                  </div>
                </div>
              </div>
            )}

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
