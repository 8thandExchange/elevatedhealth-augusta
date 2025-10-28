import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { trackModalOpen, trackFormSubmit } from "@/lib/analytics";

interface ReferralRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const referralSchema = z.object({
  patientName: z.string().trim().min(1, "Name is required").max(100),
  patientEmail: z.string().trim().email("Invalid email address").max(255),
  patientPhone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20),
  benefitType: z.enum(["tricare", "va", "other"]),
  providerName: z.string().trim().min(1, "Provider name is required").max(100),
  providerEmail: z.string().trim().email("Invalid provider email").max(255),
  diagnosis: z.string().trim().min(1, "Diagnosis is required").max(500),
  priorTreatments: z.string().trim().min(1, "Prior treatments information is required").max(1000),
  webhookUrl: z.string().trim().url("Invalid webhook URL").optional().or(z.literal("")),
});

export const ReferralRequestModal = ({ isOpen, onClose }: ReferralRequestModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    benefitType: "tricare",
    providerName: "",
    providerEmail: "",
    diagnosis: "",
    priorTreatments: "",
    webhookUrl: "",
  });

  // Track modal open
  useEffect(() => {
    if (isOpen) {
      trackModalOpen('referral_request_modal');
    }
  }, [isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validatedData = referralSchema.parse(formData);
      
      // Call edge function
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("send-referral", {
        body: validatedData,
      });

      if (error) throw error;

      if (data?.success) {
        trackFormSubmit('referral_request', true);
        setShowThankYou(true);
      } else {
        throw new Error("Failed to submit referral request");
      }
    } catch (error) {
      console.error("Referral submission error:", error);
      trackFormSubmit('referral_request', false);
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission failed",
          description: "There was an error submitting your referral request. Please try again or call us directly.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setShowThankYou(false);
      setFormData({
        patientName: "",
        patientEmail: "",
        patientPhone: "",
        benefitType: "tricare",
        providerName: "",
        providerEmail: "",
        diagnosis: "",
        priorTreatments: "",
        webhookUrl: "",
      });
      onClose();
    }
  };

  if (showThankYou) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md" role="alertdialog" aria-labelledby="thank-you-title">
          <DialogHeader>
            <DialogTitle id="thank-you-title" className="text-2xl text-center">Thank You!</DialogTitle>
            <DialogDescription className="text-base pt-4 text-center">
              Your referral request has been submitted successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center space-y-4" role="status" aria-live="polite">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center" aria-hidden="true">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-muted-foreground">
              We've sent your referral request to your provider and our team. You'll receive a
              confirmation email shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              Our team will contact you within 1-2 business days to verify benefits and coordinate
              your care.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleClose} className="w-full" aria-label="Close confirmation dialog">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-labelledby="referral-form-title"
        aria-describedby="referral-form-description"
      >
        <DialogHeader>
          <DialogTitle id="referral-form-title" className="text-2xl">Send Referral Request</DialogTitle>
          <DialogDescription id="referral-form-description" className="text-base pt-2">
            Fill out this form and we'll help send your referral request to your provider.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} aria-label="Referral request form">
          <div className="space-y-6 py-4">
            {/* Patient Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Your Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="patientName">Full Name *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => handleChange("patientName", e.target.value)}
                  placeholder="John Doe"
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientEmail">Email Address *</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) => handleChange("patientEmail", e.target.value)}
                  placeholder="john@example.com"
                  required
                  maxLength={255}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientPhone">Phone Number *</Label>
                <Input
                  id="patientPhone"
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => handleChange("patientPhone", e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label id="benefit-type-label">Benefit Type *</Label>
                <RadioGroup
                  value={formData.benefitType}
                  onValueChange={(value) => handleChange("benefitType", value)}
                  aria-labelledby="benefit-type-label"
                  aria-required="true"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tricare" id="tricare" />
                    <Label htmlFor="tricare" className="cursor-pointer font-normal">
                      TRICARE
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="va" id="va" />
                    <Label htmlFor="va" className="cursor-pointer font-normal">
                      VA / Community Care
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer font-normal">
                      Other / Not Sure
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Provider Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-lg">Your Provider's Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="providerName">Provider Name *</Label>
                <Input
                  id="providerName"
                  value={formData.providerName}
                  onChange={(e) => handleChange("providerName", e.target.value)}
                  placeholder="Dr. Smith"
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="providerEmail">Provider Email *</Label>
                <Input
                  id="providerEmail"
                  type="email"
                  value={formData.providerEmail}
                  onChange={(e) => handleChange("providerEmail", e.target.value)}
                  placeholder="provider@clinic.com"
                  required
                  maxLength={255}
                />
              </div>
            </div>

            {/* Clinical Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-lg">Clinical Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis *</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => handleChange("diagnosis", e.target.value)}
                  placeholder="e.g., Treatment-Resistant Depression, Major Depressive Disorder"
                  rows={2}
                  required
                  maxLength={500}
                  aria-describedby="diagnosis-help"
                />
                <p id="diagnosis-help" className="text-xs text-muted-foreground">
                  Please provide your current diagnosis
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priorTreatments">Prior Treatments Tried *</Label>
                <Textarea
                  id="priorTreatments"
                  value={formData.priorTreatments}
                  onChange={(e) => handleChange("priorTreatments", e.target.value)}
                  placeholder="e.g., SSRIs (Prozac, Zoloft), SNRIs (Effexor), therapy (CBT), etc."
                  rows={3}
                  required
                  maxLength={1000}
                  aria-describedby="treatments-help"
                />
                <p id="treatments-help" className="text-xs text-muted-foreground">
                  List medications and therapies you've tried previously ({formData.priorTreatments.length}/1000)
                </p>
              </div>
            </div>

            {/* CRM Webhook (Optional) */}
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="webhookUrl">CRM Webhook URL (Optional)</Label>
              <Input
                id="webhookUrl"
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => handleChange("webhookUrl", e.target.value)}
                placeholder="https://your-crm-webhook-url.com"
                maxLength={500}
                aria-describedby="webhook-help"
              />
              <p id="webhook-help" className="text-xs text-muted-foreground">
                For internal use only - leave blank if not applicable
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              disabled={isSubmitting}
              aria-label="Cancel referral request"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              aria-label={isSubmitting ? "Submitting referral request" : "Submit referral request"}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
