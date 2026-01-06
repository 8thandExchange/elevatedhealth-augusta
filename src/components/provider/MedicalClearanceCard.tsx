import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, Pill, Scale, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MedicalClearanceCardProps {
  patientId: string;
  patientName: string;
  patientEmail: string | null;
  onboardingStatus: string | null;
  onStatusUpdate?: () => void;
}

const MEDICATION_OPTIONS = [
  { value: "semaglutide", label: "Semaglutide", price: "$399/month" },
  { value: "tirzepatide", label: "Tirzepatide", price: "$499/month" },
];

export function MedicalClearanceCard({
  patientId,
  patientName,
  patientEmail,
  onboardingStatus,
  onStatusUpdate,
}: MedicalClearanceCardProps) {
  const [selectedMedication, setSelectedMedication] = useState<string>("semaglutide");
  const [includeHormoneAddon, setIncludeHormoneAddon] = useState(false);
  const [notes, setNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isSendingRx, setIsSendingRx] = useState(false);

  const isAwaitingClearance = onboardingStatus === "awaiting_medical_clearance" || 
                               onboardingStatus === "consultation_complete" ||
                               onboardingStatus === "intake_complete";
  const isApproved = onboardingStatus === "glp1_approved" || 
                     onboardingStatus === "medical_clearance_complete";
  const isRxSent = onboardingStatus === "glp1_rx_sent" || 
                   onboardingStatus === "rx_sent" ||
                   onboardingStatus === "treatment_active";

  const handleApproveClearance = async () => {
    setIsApproving(true);
    try {
      // Update patient status to approved
      const { error: updateError } = await supabase
        .from("patients")
        .update({ 
          onboarding_status: "glp1_approved",
          current_protocol: `GLP-1: ${selectedMedication}`,
        })
        .eq("id", patientId);

      if (updateError) throw updateError;

      // Send GLP-1 activation email if patient has email
      if (patientEmail) {
        const { error: emailError } = await supabase.functions.invoke("send-glp1-activation", {
          body: {
            patient_name: patientName,
            patient_email: patientEmail,
            medication_type: selectedMedication,
            include_hormone_addon: includeHormoneAddon,
            patient_id: patientId,
          },
        });

        if (emailError) {
          console.error("Email error:", emailError);
          toast.warning("Patient approved but activation email failed to send");
        } else {
          toast.success(`${patientName} approved for ${selectedMedication}. Activation email sent!`);
        }
      } else {
        toast.success(`${patientName} approved for ${selectedMedication}`);
      }

      onStatusUpdate?.();
    } catch (error: any) {
      console.error("Error approving clearance:", error);
      toast.error(error.message || "Failed to approve medical clearance");
    } finally {
      setIsApproving(false);
    }
  };

  const handleSendRx = async () => {
    if (!patientEmail) {
      toast.error("Patient email required to send Rx");
      return;
    }

    setIsSendingRx(true);
    try {
      // Update status to rx_sent
      const { error: updateError } = await supabase
        .from("patients")
        .update({ onboarding_status: "glp1_rx_sent" })
        .eq("id", patientId);

      if (updateError) throw updateError;

      // Send treatment authorized email
      const { error: emailError } = await supabase.functions.invoke("send-treatment-authorized", {
        body: {
          patient_name: patientName,
          patient_email: patientEmail,
          protocol_name: `${selectedMedication === "semaglutide" ? "Semaglutide" : "Tirzepatide"} Weight Loss Program`,
          patient_id: patientId,
        },
      });

      if (emailError) {
        console.error("Email error:", emailError);
        toast.warning("Rx marked as sent but notification email failed");
      } else {
        toast.success("Rx sent to pharmacy. Patient notified!");
      }

      onStatusUpdate?.();
    } catch (error: any) {
      console.error("Error sending Rx:", error);
      toast.error(error.message || "Failed to send Rx");
    } finally {
      setIsSendingRx(false);
    }
  };

  // Don't show card if already in treatment
  if (isRxSent) {
    return (
      <Card className="border-green-500/50 bg-green-50/30 dark:bg-green-950/10">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">GLP-1 Treatment Active</p>
              <p className="text-sm text-muted-foreground">Rx has been sent to pharmacy</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Scale className="w-4 h-4" />
          Medical Clearance – Weight Loss
          {isApproved && (
            <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-300">
              Approved
            </Badge>
          )}
          {isAwaitingClearance && (
            <Badge variant="outline" className="ml-auto bg-amber-50 text-amber-700 border-amber-300">
              Awaiting Review
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Medication Selection */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Select Medication</label>
          <Select value={selectedMedication} onValueChange={setSelectedMedication} disabled={isApproved}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEDICATION_OPTIONS.map((med) => (
                <SelectItem key={med.value} value={med.value}>
                  <div className="flex items-center justify-between gap-4">
                    <span>{med.label}</span>
                    <span className="text-muted-foreground text-xs">{med.price}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hormone Addon Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm font-medium">Add Hormone Therapy</p>
            <p className="text-xs text-muted-foreground">+$149/month for optimized results</p>
          </div>
          <Button
            variant={includeHormoneAddon ? "default" : "outline"}
            size="sm"
            onClick={() => setIncludeHormoneAddon(!includeHormoneAddon)}
            disabled={isApproved}
          >
            {includeHormoneAddon ? "Included" : "Add"}
          </Button>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Clinical Notes (optional)</label>
          <Textarea
            placeholder="Add any clinical notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[60px]"
            disabled={isApproved}
          />
        </div>

        {/* Action Buttons */}
        {isAwaitingClearance && (
          <Button
            onClick={handleApproveClearance}
            disabled={isApproving}
            className="w-full"
          >
            {isApproving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve for GLP-1 Therapy
              </>
            )}
          </Button>
        )}

        {isApproved && (
          <Button
            onClick={handleSendRx}
            disabled={isSendingRx || !patientEmail}
            className="w-full"
          >
            {isSendingRx ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Rx...
              </>
            ) : (
              <>
                <Pill className="w-4 h-4 mr-2" />
                Send Rx to Pharmacy
              </>
            )}
          </Button>
        )}

        {isApproved && !patientEmail && (
          <div className="flex items-center gap-2 text-amber-600 text-xs">
            <AlertTriangle className="w-3 h-3" />
            Patient email required to send Rx notification
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MedicalClearanceCard;
