/**
 * SafetyGate
 *
 * Shown when a patient's intake answers trip a clinical-safety flag
 * (pregnancy, recent cardiac event, uncontrolled BP, etc.). The gate
 * intentionally does NOT let the patient self-schedule a visit. A
 * clinician must look at the intake first to decide whether the right
 * next step is a consult, a referral out, or a polite decline.
 *
 * What this component does today:
 *   - Tells the patient (in plain English) that we received the flag
 *     and that a clinician will review their intake within 1 business
 *     day.
 *   - Collects callback contact info + preferred window.
 *   - On submit, calls send-safety-callback-request which inserts a row
 *     into eligibility_review_requests so the clinical team has a real
 *     queue, and emails the clinical staff.
 *   - Surfaces (706) 760-3470 as the urgent escape hatch.
 *
 * Replaces the prior version that embedded a Google Calendar iframe
 * for "Clinical Eligibility Review" — auto-scheduling flagged patients
 * is the wrong default for a regulated clinic.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ShieldAlert,
  Phone,
  CheckCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type CallbackWindow = "morning" | "afternoon" | "evening" | "no_preference";

interface SafetyGateProps {
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  safetyFlags?: string[];
  treatmentType?: string;
  onContinue?: () => void;
}

const SafetyGate = ({
  patientName,
  patientEmail,
  patientPhone,
  safetyFlags,
  treatmentType = "hormone therapy",
  onContinue,
}: SafetyGateProps) => {
  const [phone, setPhone] = useState(patientPhone || "");
  const [callbackWindow, setCallbackWindow] = useState<CallbackWindow>("no_preference");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!phone.trim()) {
      toast.error("Please enter a phone number where we can reach you.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-safety-callback-request", {
        body: {
          patient_name: patientName,
          patient_email: patientEmail || null,
          patient_phone: phone.trim(),
          preferred_callback_window: callbackWindow,
          safety_flags: safetyFlags || [],
          treatment_type: treatmentType,
        },
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (e: unknown) {
      console.error("send-safety-callback-request error", e);
      toast.error("We couldn't submit that. Please call us at (706) 760-3470.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-amber-700" />
          </div>
          <p className="font-jost text-xs uppercase tracking-[2.5px] text-muted-foreground mb-3">
            Clinical review
          </p>
          <h1 className="font-playfair text-3xl text-foreground mb-3">
            One quick step before we book.
          </h1>
          <p className="font-jost font-light text-base text-muted-foreground">
            Hi {patientName.split(" ")[0]} &mdash; your intake answers raised something
            our physician needs to look at before we set up a visit.
          </p>
        </div>

        <Card className="border-2 border-amber-200/70 bg-amber-50/40">
          <CardContent className="p-6 space-y-6">
            {!submitted ? (
              <>
                <div className="space-y-3">
                  <p className="font-jost text-foreground leading-relaxed">
                    A clinician will review your intake and reach out
                    <strong> within 1 business day</strong>. They&rsquo;ll talk through what
                    triggered the flag and what your options are &mdash; including, if
                    appropriate, scheduling the consult you came here for.
                  </p>
                  <p className="font-jost text-sm text-muted-foreground italic">
                    We don&rsquo;t auto-book this kind of visit. The right next step depends on
                    what your physician sees in your answers, and we&rsquo;d rather get it right
                    than get it fast.
                  </p>
                </div>

                <div className="space-y-3 bg-background rounded-md p-4 border border-border">
                  <div>
                    <Label htmlFor="callback-phone" className="font-jost text-sm text-foreground">
                      Best number to reach you<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="callback-phone"
                      type="tel"
                      placeholder="(706) 555-0142"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label className="font-jost text-sm text-foreground">When&rsquo;s best to call?</Label>
                    <RadioGroup
                      value={callbackWindow}
                      onValueChange={(v) => setCallbackWindow(v as CallbackWindow)}
                      className="mt-2 grid grid-cols-2 gap-2"
                    >
                      {[
                        { v: "morning", l: "Mornings" },
                        { v: "afternoon", l: "Afternoons" },
                        { v: "evening", l: "Evenings" },
                        { v: "no_preference", l: "Anytime" },
                      ].map((opt) => (
                        <Label
                          key={opt.v}
                          htmlFor={`window-${opt.v}`}
                          className="flex items-center gap-2 border border-border rounded-md px-3 py-2 cursor-pointer hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent/5 transition"
                        >
                          <RadioGroupItem id={`window-${opt.v}`} value={opt.v} />
                          <span className="font-jost text-sm">{opt.l}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Request a callback
                  {!isSubmitting && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>

                <p className="font-jost text-xs text-muted-foreground text-center">
                  Need us sooner? Call{" "}
                  <a
                    href={`tel:${SITE_CONFIG.phoneRaw}`}
                    className="text-accent underline underline-offset-2"
                  >
                    {SITE_CONFIG.phone}
                  </a>{" "}
                  &mdash; we answer the phone in person during clinic hours.
                </p>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-700" />
                </div>
                <h2 className="font-playfair text-2xl text-foreground">We&rsquo;ve got you.</h2>
                <p className="font-jost text-foreground">
                  A clinician will reach out within 1 business day at{" "}
                  <span className="font-medium">{phone}</span>.
                </p>
                <p className="font-jost text-sm text-muted-foreground">
                  If anything changes or you need us sooner, call{" "}
                  <a
                    href={`tel:${SITE_CONFIG.phoneRaw}`}
                    className="text-accent underline underline-offset-2"
                  >
                    {SITE_CONFIG.phone}
                  </a>
                  .
                </p>
                {onContinue && (
                  <Button variant="outline" className="mt-2" onClick={onContinue}>
                    Continue to dashboard
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-2 font-jost text-sm text-muted-foreground">
          <Phone className="w-4 h-4 text-accent" />
          <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="hover:text-accent">
            Urgent? {SITE_CONFIG.phone}
          </a>
        </div>

        <p className="text-center font-jost text-xs text-muted-foreground mt-6 max-w-sm mx-auto">
          We follow standard clinical-safety guidelines for patients with complex
          medical histories. The wait is short and the call is honest.
        </p>
      </div>
    </div>
  );
};

export default SafetyGate;
