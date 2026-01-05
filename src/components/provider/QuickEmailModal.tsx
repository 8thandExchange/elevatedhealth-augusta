import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Mail, Send } from "lucide-react";

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
}

interface QuickEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EMAIL_TYPES = [
  { value: "welcome", label: "Welcome Email", description: "Welcome to Elevated Health + portal access" },
  { value: "kit_payment", label: "Kit Payment Request", description: "Request payment for hormone mapping kit" },
  { value: "labs_reviewed", label: "Labs Reviewed", description: "Notify patient their labs are ready" },
  { value: "activation", label: "Membership Activation", description: "Send membership payment link" },
];

const QuickEmailModal = ({ open, onOpenChange, onSuccess }: QuickEmailModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [emailType, setEmailType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (open && searchQuery.length >= 2) {
      searchPatients();
    }
  }, [searchQuery, open]);

  const searchPatients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, full_name, email, phone")
        .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getEdgeFunction = (type: string) => {
    switch (type) {
      case "welcome": return "send-welcome-email";
      case "kit_payment": return "send-kit-payment-link";
      case "labs_reviewed": return "send-labs-reviewed-notification";
      case "activation": return "send-activation-sms";
      default: return "send-welcome-email";
    }
  };

  const handleSend = async () => {
    if (!selectedPatient || !emailType) {
      toast.error("Please select a patient and email type");
      return;
    }

    if (!selectedPatient.email) {
      toast.error("Patient does not have an email on file");
      return;
    }

    setIsSending(true);
    try {
      const edgeFunction = getEdgeFunction(emailType);
      
      const { data, error } = await supabase.functions.invoke(edgeFunction, {
        body: {
          patient_id: selectedPatient.id,
          patient_name: selectedPatient.full_name,
          patient_email: selectedPatient.email,
          first_name: selectedPatient.full_name.split(" ")[0],
          send_email: true,
        },
      });

      if (error) throw error;

      toast.success(`Email sent to ${selectedPatient.email}!`);
      onOpenChange(false);
      onSuccess?.();
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setPatients([]);
    setSelectedPatient(null);
    setEmailType("");
  };

  const selectedEmailInfo = EMAIL_TYPES.find(e => e.value === emailType);

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Send Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Search */}
          <div className="space-y-2">
            <Label>Search Patient</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {isLoading && <p className="text-sm text-muted-foreground">Searching...</p>}
            
            {patients.length > 0 && !selectedPatient && (
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className="w-full text-left px-3 py-2 hover:bg-muted/50 border-b last:border-b-0"
                  >
                    <p className="font-medium">{patient.full_name}</p>
                    <p className="text-xs text-muted-foreground">{patient.email || "No email"}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Patient */}
          {selectedPatient && (
            <div className="bg-primary/5 rounded-lg p-3">
              <p className="font-medium">{selectedPatient.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedPatient.email || "No email on file"}
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedPatient(null)}
                className="mt-1"
              >
                Change Patient
              </Button>
            </div>
          )}

          {/* Email Type */}
          <div className="space-y-2">
            <Label>Email Type</Label>
            <Select value={emailType} onValueChange={setEmailType}>
              <SelectTrigger>
                <SelectValue placeholder="Select email type..." />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEmailInfo && (
              <p className="text-xs text-muted-foreground">{selectedEmailInfo.description}</p>
            )}
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!selectedPatient || !emailType || !selectedPatient?.email || isSending}
            className="w-full"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Email
          </Button>

          {selectedPatient && !selectedPatient.email && (
            <p className="text-xs text-center text-amber-600">
              Cannot send email - no email address on file
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickEmailModal;