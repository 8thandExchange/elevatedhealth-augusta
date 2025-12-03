import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PatientData {
  id: string;
  full_name: string;
  dob?: string | null;
  email?: string | null;
  phone?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  allergies?: string | null;
  medical_history?: Record<string, any> | null;
}

interface MedicationData {
  id: string;
  name: string;
  strength: string;
  sig: string;
}

interface FCCPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientData;
  medication?: MedicationData;
  rxString: string;
  quantity: number;
  refills: number;
  onOrderCreated?: () => void;
}

const CopyField = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-sm text-foreground break-words">{value || "—"}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="flex-shrink-0 h-8 w-8 p-0"
        disabled={!value}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
};

const FCCPortalModal = ({
  isOpen,
  onClose,
  patient,
  medication,
  rxString,
  quantity,
  refills,
  onOrderCreated,
}: FCCPortalModalProps) => {
  const [isMarking, setIsMarking] = useState(false);

  // Format DOB
  const formatDOB = (dob?: string | null) => {
    if (!dob) return "Not on file";
    try {
      const date = new Date(dob);
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return dob;
    }
  };

  // Get allergies from patient record
  const getAllergies = () => {
    if (patient.allergies) return patient.allergies;
    // Fallback to medical history for older records
    const history = patient.medical_history;
    if (history?.allergies) return history.allergies;
    if (history?.drugAllergies) return history.drugAllergies;
    return "NKDA";
  };

  // Get address from patient record
  const getAddress = () => {
    // Use dedicated columns first
    if (patient.street_address) {
      const parts = [
        patient.street_address,
        patient.city,
        patient.state,
        patient.zip_code,
      ].filter(Boolean);
      return parts.join(", ") || "Not on file";
    }
    // Fallback to medical history for older records
    const history = patient.medical_history;
    if (history?.address) return history.address;
    if (history?.streetAddress) {
      const parts = [
        history.streetAddress,
        history.city,
        history.state,
        history.zipCode,
      ].filter(Boolean);
      return parts.join(", ") || "Not on file";
    }
    return "Not on file";
  };

  const handleLaunchPortal = () => {
    window.open("https://fccrxportal.com/login", "_blank");
  };

  const handleMarkAsOrdered = async () => {
    setIsMarking(true);
    try {
      const { error } = await supabase.from("orders").insert({
        patient_id: patient.id,
        status: "sent_to_pharmacy",
        protocol_snapshot: {
          medication: medication?.name,
          medication_id: medication?.id,
          strength: medication?.strength,
          sig: medication?.sig,
          rx_string: rxString,
          quantity,
          refills,
          ordered_via: "FCC Portal",
          ordered_at: new Date().toISOString(),
        },
      });

      if (error) throw error;

      toast.success("Order marked as sent to pharmacy");
      onOrderCreated?.();
      onClose();
    } catch (error: any) {
      console.error("Error marking order:", error);
      toast.error(error.message || "Failed to mark order");
    } finally {
      setIsMarking(false);
    }
  };

  // Parse name
  const [firstName, ...lastParts] = patient.full_name.split(" ");
  const lastName = lastParts.join(" ") || "";
  const formattedName = `${firstName} ${lastName}`.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border border-gold/30 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-cormorant text-foreground flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                <path d="M9 12h6M9 16h6" />
              </svg>
            </span>
            FCC Portal Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1 mt-4">
          <CopyField label="Patient Name" value={formattedName} />
          <CopyField label="Date of Birth" value={formatDOB(patient.dob)} />
          <CopyField label="Address" value={getAddress()} />
          <CopyField label="Allergies" value={getAllergies()} />
          
          {/* Rx String - highlighted */}
          <div className="bg-gold/5 border border-gold/30 rounded-lg p-4 mt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gold uppercase tracking-wider mb-2">
                  Complete Rx
                </p>
                <p className="text-sm text-foreground font-medium leading-relaxed">
                  {rxString}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Qty: {quantity} | Refills: {refills}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  const fullRx = `${rxString}\nQty: ${quantity} | Refills: ${refills}`;
                  await navigator.clipboard.writeText(fullRx);
                  toast.success("Full Rx copied!");
                }}
                className="flex-shrink-0 h-8 w-8 p-0 hover:bg-gold/10"
              >
                <Copy className="w-4 h-4 text-gold" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleLaunchPortal}
            className="flex-1 border-foreground/20 hover:bg-secondary"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Launch FCC Portal
          </Button>
          <Button
            onClick={handleMarkAsOrdered}
            disabled={isMarking}
            className="flex-1 bg-gold hover:bg-gold-dark text-white"
          >
            {isMarking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Ordered
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FCCPortalModal;
