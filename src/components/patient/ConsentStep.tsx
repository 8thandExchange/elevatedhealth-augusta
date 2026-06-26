import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, FileCheck, ChevronLeft, CheckCircle, Loader2 } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

interface ConsentStepProps {
  treatmentType: "hormone" | "weight_loss" | "peptides";
  patientName: string;
  onBack: () => void;
  onSubmit: (signature: string) => Promise<void>;
  isSubmitting: boolean;
}

const ConsentStep = ({ treatmentType, patientName, onBack, onSubmit, isSubmitting }: ConsentStepProps) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [acknowledgeConsent, setAcknowledgeConsent] = useState(false);
  const [acknowledgeTreatment, setAcknowledgeTreatment] = useState(false);
  const [acknowledgeHipaa, setAcknowledgeHipaa] = useState(false);
  const [signature, setSignature] = useState("");

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const canSubmit = 
    hasScrolledToBottom && 
    acknowledgeConsent && 
    acknowledgeTreatment && 
    acknowledgeHipaa && 
    signature.trim().length >= 2 &&
    signature.trim().toLowerCase() === patientName.trim().toLowerCase();

  const treatmentLabels: Record<string, string> = {
    hormone: "Hormone Replacement Therapy",
    weight_loss: "GLP-1 Weight Loss Program",
    peptides: "Peptide Therapy",
  };

  const handleSubmitConsent = async () => {
    if (!canSubmit) return;
    await onSubmit(signature.trim());
  };

  return (
    <>
      <Card className="border-border/50 mb-8">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-playfair text-xl text-foreground">
              Informed Consent & Agreement
            </h2>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Please read the following consent agreement carefully. Scroll to the bottom to continue.
          </p>

          {/* Scrollable Consent Content */}
          <div className="relative mb-6">
            <ScrollArea 
              className="h-80 rounded-lg border border-border bg-muted/20 p-4"
              onScrollCapture={handleScroll}
            >
              <div className="prose prose-sm max-w-none text-foreground/80 pr-4">
                <h3 className="font-semibold text-foreground text-base mb-3">
                  INFORMED CONSENT FOR {treatmentLabels[treatmentType]?.toUpperCase() || "TREATMENT"}
                </h3>
                
                <p className="mb-4 text-sm">
                  I, the patient, hereby consent to receive medical treatment and services from {SITE_CONFIG.clinicName} 
                  located at {SITE_CONFIG.address.full}. I understand that the treatment I am seeking includes, 
                  but may not be limited to, {treatmentLabels[treatmentType] || "medical therapy"}.
                </p>

                <h4 className="font-semibold text-foreground text-sm mb-2">NATURE OF TREATMENT</h4>
                <p className="mb-4 text-sm">
                  I understand that {treatmentLabels[treatmentType]} involves the administration of prescription 
                  medications and/or therapeutic interventions under the supervision of a licensed healthcare provider. 
                  The specific treatment protocol will be determined based on my individual health assessment, 
                  laboratory results, and ongoing evaluation by my care team.
                </p>

                <h4 className="font-semibold text-foreground text-sm mb-2">RISKS AND BENEFITS</h4>
                <p className="mb-4 text-sm">
                  I acknowledge that all medical treatments carry potential risks and benefits. The potential benefits 
                  of treatment have been explained to me, including symptom relief and improved quality of life. 
                  Potential risks may include, but are not limited to: medication side effects, allergic reactions, 
                  and the possibility that treatment may not achieve desired results. I have had the opportunity 
                  to ask questions about these risks and benefits.
                </p>

                <h4 className="font-semibold text-foreground text-sm mb-2">ALTERNATIVES</h4>
                <p className="mb-4 text-sm">
                  I understand that alternatives to the proposed treatment exist, including no treatment at all, 
                  and that I may discontinue treatment at any time. The potential consequences of not receiving 
                  treatment have been explained to me.
                </p>

                <h4 className="font-semibold text-foreground text-sm mb-2">PATIENT RESPONSIBILITIES</h4>
                <p className="mb-4 text-sm">
                  I agree to provide accurate and complete information about my health history, current medications, 
                  and any changes in my condition. I understand that I must follow the treatment protocol as prescribed 
                  and attend scheduled appointments. I agree to notify the clinic immediately if I experience any 
                  adverse effects or concerning symptoms.
                </p>

                <h4 className="font-semibold text-foreground text-sm mb-2">TELEMEDICINE CONSENT</h4>
                <p className="mb-4 text-sm">
                  I consent to receive telemedicine services as part of my care when appropriate. I understand that 
                  telemedicine involves the use of electronic communications to deliver healthcare services remotely. 
                  I understand the limitations of telemedicine and that in-person evaluation may be required in 
                  certain circumstances.
                </p>

                <h4 className="font-semibold text-foreground text-sm mb-2">FINANCIAL RESPONSIBILITY</h4>
                <p className="mb-4 text-sm">
                  I understand that I am financially responsible for all charges not covered by insurance. 
                  I authorize {SITE_CONFIG.clinicName} to bill my insurance and/or credit card on file for 
                  services rendered.
                </p>

                <h4 className="font-semibold text-foreground text-sm mb-2">HIPAA AUTHORIZATION</h4>
                <p className="mb-4 text-sm">
                  I acknowledge that I have been provided with the Notice of Privacy Practices and understand 
                  how my Protected Health Information (PHI) may be used and disclosed. I authorize the release 
                  of my medical information to pharmacies, laboratories, and referring providers as necessary 
                  for my treatment. I understand my rights under HIPAA, including the right to access, amend, 
                  and restrict the use of my health information.
                </p>

                <h4 className="font-semibold text-foreground text-sm mb-2">RELEASE OF LIABILITY</h4>
                <p className="mb-4 text-sm">
                  I understand that medicine is not an exact science and that no guarantees have been made 
                  regarding the outcome of my treatment. I release {SITE_CONFIG.clinicName} and its providers 
                  from liability for any adverse outcomes that may occur despite proper medical care, except 
                  in cases of gross negligence or willful misconduct.
                </p>

                <h4 className="font-semibold text-foreground text-sm mb-2">ACKNOWLEDGMENT</h4>
                <p className="mb-4 text-sm">
                  By signing below, I acknowledge that I have read and understood this Informed Consent form, 
                  have had the opportunity to ask questions, and voluntarily consent to treatment. I understand 
                  that I may revoke this consent at any time by providing written notice to the clinic.
                </p>

                <div className="border-t border-border pt-4 mt-6">
                  <p className="text-xs text-muted-foreground">
                    {SITE_CONFIG.clinicName} • {SITE_CONFIG.address.full} • {SITE_CONFIG.phone}
                  </p>
                </div>
              </div>
            </ScrollArea>
            
            {!hasScrolledToBottom && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none flex items-end justify-center pb-2">
                <span className="text-xs text-muted-foreground animate-pulse">↓ Scroll to continue ↓</span>
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-4 mb-6">
            <div 
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                acknowledgeConsent ? "border-primary bg-primary/5" : "border-border",
                !hasScrolledToBottom && "opacity-50"
              )}
            >
              <Checkbox
                id="acknowledge-consent"
                checked={acknowledgeConsent}
                onCheckedChange={(c) => setAcknowledgeConsent(c === true)}
                disabled={!hasScrolledToBottom}
              />
              <Label htmlFor="acknowledge-consent" className="cursor-pointer text-sm">
                I have read and understand the Informed Consent agreement above.
              </Label>
            </div>

            <div 
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                acknowledgeTreatment ? "border-primary bg-primary/5" : "border-border",
                !hasScrolledToBottom && "opacity-50"
              )}
            >
              <Checkbox
                id="acknowledge-treatment"
                checked={acknowledgeTreatment}
                onCheckedChange={(c) => setAcknowledgeTreatment(c === true)}
                disabled={!hasScrolledToBottom}
              />
              <Label htmlFor="acknowledge-treatment" className="cursor-pointer text-sm">
                I consent to receive {treatmentLabels[treatmentType]} and understand the associated risks and benefits.
              </Label>
            </div>

            <div 
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                acknowledgeHipaa ? "border-primary bg-primary/5" : "border-border",
                !hasScrolledToBottom && "opacity-50"
              )}
            >
              <Checkbox
                id="acknowledge-hipaa"
                checked={acknowledgeHipaa}
                onCheckedChange={(c) => setAcknowledgeHipaa(c === true)}
                disabled={!hasScrolledToBottom}
              />
              <Label htmlFor="acknowledge-hipaa" className="cursor-pointer text-sm">
                I acknowledge receipt of the{" "}
                <a href="/hipaa-notice" target="_blank" className="text-accent hover:underline">
                  HIPAA Notice of Privacy Practices
                </a>.
              </Label>
            </div>
          </div>

          {/* E-Signature */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="w-4 h-4 text-primary" />
              <Label className="text-sm font-medium">Electronic Signature</Label>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Type your full legal name exactly as it appears above to sign this agreement.
            </p>
            <Input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder={patientName || "Type your full legal name"}
              className={cn(
                "font-serif text-lg",
                signature.trim().toLowerCase() === patientName.trim().toLowerCase() && signature.length > 0
                  ? "border-green-500 focus:ring-green-500"
                  : ""
              )}
              disabled={!hasScrolledToBottom}
            />
            {signature.length > 0 && signature.trim().toLowerCase() !== patientName.trim().toLowerCase() && (
              <p className="text-xs text-red-500 mt-2">
                Signature must match your name: "{patientName}"
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={isSubmitting}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleSubmitConsent} 
          disabled={!canSubmit || isSubmitting} 
          className="flex-1"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Sign & Submit
        </Button>
      </div>
    </>
  );
};

export default ConsentStep;
