import { useState } from "react";
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
  additionalNotes: z.string().trim().max(500).optional(),
});

export const ReferralRequestModal = ({ isOpen, onClose }: ReferralRequestModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    benefitType: "tricare",
    providerName: "",
    providerEmail: "",
    additionalNotes: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      referralSchema.parse(formData);
      
      // TODO: Backend logic will be implemented in Part 2
      toast({
        title: "Request received",
        description: "We'll process your referral request shortly. (Backend to be implemented)",
      });
      
      // Reset form
      setFormData({
        patientName: "",
        patientEmail: "",
        patientPhone: "",
        benefitType: "tricare",
        providerName: "",
        providerEmail: "",
        additionalNotes: "",
      });
      
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Send Referral Request</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Fill out this form and we'll help send your referral request to your provider.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
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
                <Label>Benefit Type *</Label>
                <RadioGroup
                  value={formData.benefitType}
                  onValueChange={(value) => handleChange("benefitType", value)}
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

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => handleChange("additionalNotes", e.target.value)}
                placeholder="Any additional information you'd like to include..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.additionalNotes.length}/500 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
