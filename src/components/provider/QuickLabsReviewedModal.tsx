import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, TestTube, User } from "lucide-react";

interface PendingLabPatient {
  id: string;
  full_name: string;
  email: string | null;
  onboarding_status: string | null;
  updated_at: string | null;
}

interface QuickLabsReviewedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const QuickLabsReviewedModal = ({ open, onOpenChange, onSuccess }: QuickLabsReviewedModalProps) => {
  const [patients, setPatients] = useState<PendingLabPatient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadPendingPatients();
    }
  }, [open]);

  const loadPendingPatients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, full_name, email, onboarding_status, updated_at")
        .in("onboarding_status", ["results_ready", "labs_in_progress"])
        .order("updated_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error("Load error:", err);
      toast.error("Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkReviewed = async (patient: PendingLabPatient) => {
    setMarkingId(patient.id);
    try {
      // Update onboarding status
      const { error: updateError } = await supabase
        .from("patients")
        .update({ onboarding_status: "protocol_review" })
        .eq("id", patient.id);

      if (updateError) throw updateError;

      // Send notification if email exists
      if (patient.email) {
        try {
          await supabase.functions.invoke("send-labs-reviewed-notification", {
            body: {
              patient_id: patient.id,
              patient_name: patient.full_name,
              patient_email: patient.email,
            },
          });
        } catch (notifyErr) {
          console.log("Notification not sent:", notifyErr);
        }
      }

      toast.success(`Labs marked as reviewed for ${patient.full_name}`);
      
      // Remove from list
      setPatients(prev => prev.filter(p => p.id !== patient.id));
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to mark labs reviewed");
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-primary" />
            Mark Labs Reviewed
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TestTube className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No patients with pending lab reviews</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{patient.full_name}</p>
                      <Badge 
                        variant="outline" 
                        className={patient.onboarding_status === "results_ready" 
                          ? "text-green-600 border-green-200" 
                          : "text-amber-600 border-amber-200"
                        }
                      >
                        {patient.onboarding_status === "results_ready" ? "Results Ready" : "Labs In Progress"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleMarkReviewed(patient)}
                    disabled={markingId === patient.id}
                  >
                    {markingId === patient.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={loadPendingPatients}
            disabled={isLoading}
          >
            Refresh List
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickLabsReviewedModal;