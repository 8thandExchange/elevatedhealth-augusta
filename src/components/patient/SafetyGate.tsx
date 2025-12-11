import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Phone, Clock, CheckCircle, Mail, Loader2, CalendarClock, Calendar } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Clinical Eligibility Review Calendar URL - for ALL flagged patients
const CLINICAL_ELIGIBILITY_REVIEW_URL = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ26DhPKdGVdKetVQ6WQKaaGYWWrjCKd3c7P7E4dTNfiAbxcYX4Q2OO9lBS25v8X3yYT7KIPsZ9x?gv=true";

interface SafetyGateProps {
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  safetyFlags?: string[];
  treatmentType?: "hormone" | "ketamine";
  onContinue?: () => void;
}

const SafetyGate = ({ patientName, patientEmail, patientPhone, safetyFlags, treatmentType = "hormone", onContinue }: SafetyGateProps) => {
  const [isRequestingCallback, setIsRequestingCallback] = useState(false);
  const [callbackRequested, setCallbackRequested] = useState(false);
  const [phone, setPhone] = useState(patientPhone || "");
  const [preferredTime, setPreferredTime] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

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
            Safety First. Let's Clarify Your Options.
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
              Your medical intake flagged a potential contraindication for {treatmentType === "ketamine" ? "ketamine therapy" : "hormone therapy"}. 
              At Elevated Health, we prioritize your safety above all else.
            </p>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                This brief 15-minute triage call is designed to:
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Clarify:</strong> Review the specific answer that triggered the safety flag</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Re-Evaluate:</strong> Determine if the issue is a hard stop or can be managed with clearance from your primary care physician</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Redirect:</strong> If this therapy isn't safe, we'll explore other modalities (like Peptide Therapy or Nutritional Support) that may better serve your goals</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Please Note:</strong> This is a medical triage call, not a therapy session. Please be ready to discuss your medical history in detail.
              </p>
            </div>

            {/* Book Clinical Eligibility Review */}
            {!showCalendar ? (
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setShowCalendar(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Clinical Eligibility Review
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Select a time for your Clinical Eligibility Review:</p>
                <div className="rounded-lg overflow-hidden border border-border">
                  <iframe 
                    src={CLINICAL_ELIGIBILITY_REVIEW_URL}
                    style={{ border: 0 }} 
                    width="100%" 
                    height="400"
                    title="Clinical Eligibility Review"
                  />
                </div>
              </div>
            )}

            {/* Request Callback Alternative */}
            {!callbackRequested && !showCalendar ? (
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-4 border border-border">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-primary" />
                  Or Request a Callback
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
                    variant="outline"
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
            ) : callbackRequested ? (
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">Callback Request Received!</p>
                    <p className="text-sm text-green-600 dark:text-green-300">We'll reach out within 24-48 hours.</p>
                  </div>
                </div>
              </div>
            ) : null}

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
            variant="outline"
            onClick={() => window.location.href = `tel:${SITE_CONFIG.phoneRaw}`}
          >
            <Phone className="w-4 h-4 mr-2" />
            Call to Expedite Review
          </Button>
          
          {onContinue && (
            <Button 
              variant="ghost" 
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
