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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Package, Mail, MessageSquare, Copy } from "lucide-react";

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
}

interface QuickSendKitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const QuickSendKitModal = ({ open, onOpenChange, onSuccess }: QuickSendKitModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [applyCredit, setApplyCredit] = useState(true);

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

  const handleSend = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    const contactInfo = sendMethod === "email" ? selectedPatient.email : selectedPatient.phone;
    if (!contactInfo) {
      toast.error(`Patient does not have a ${sendMethod === "email" ? "email" : "phone number"} on file`);
      return;
    }

    setIsSending(true);
    try {
      const edgeFunction = sendMethod === "email" ? "send-kit-payment-link" : "send-kit-payment-sms";
      
      const { data, error } = await supabase.functions.invoke(edgeFunction, {
        body: {
          patient_id: selectedPatient.id,
          patient_name: selectedPatient.full_name,
          patient_email: selectedPatient.email,
          patient_phone: selectedPatient.phone,
          apply_credit: applyCredit,
        },
      });

      if (error) throw error;

      toast.success(`Kit payment link sent via ${sendMethod}!`);
      onOpenChange(false);
      onSuccess?.();
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to send kit link");
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = async () => {
    if (!selectedPatient?.email) {
      toast.error("Patient email required");
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-kit-payment-link", {
        body: {
          patient_id: selectedPatient.id,
          patient_name: selectedPatient.full_name,
          patient_email: selectedPatient.email,
          apply_credit: applyCredit,
          generate_only: true,
        },
      });

      if (error) throw error;
      
      if (data?.payment_link) {
        await navigator.clipboard.writeText(data.payment_link);
        toast.success("Payment link copied to clipboard!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate link");
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setPatients([]);
    setSelectedPatient(null);
    setSendMethod("email");
    setApplyCredit(true);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Send Hormone Kit Link
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
                    <p className="text-xs text-muted-foreground">{patient.email || patient.phone || "No contact info"}</p>
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
                {selectedPatient.email && `📧 ${selectedPatient.email}`}
                {selectedPatient.email && selectedPatient.phone && " • "}
                {selectedPatient.phone && `📱 ${selectedPatient.phone}`}
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedPatient(null)}
                className="mt-2"
              >
                Change Patient
              </Button>
            </div>
          )}

          {/* Kit Pricing */}
          <div className="space-y-2">
            <Label>Kit Price</Label>
            <RadioGroup value={applyCredit ? "credit" : "full"} onValueChange={(v) => setApplyCredit(v === "credit")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="credit" id="credit" />
                <Label htmlFor="credit" className="font-normal">$250 (with $149 credit)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="font-normal">$349 (full price)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Send Method */}
          <div className="space-y-2">
            <Label>Send Via</Label>
            <RadioGroup value={sendMethod} onValueChange={(v: "email" | "sms") => setSendMethod(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="font-normal flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="sms" />
                <Label htmlFor="sms" className="font-normal flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> SMS
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSend}
              disabled={!selectedPatient || isSending}
              className="flex-1"
            >
              {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Send Link
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              disabled={!selectedPatient || isSending}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickSendKitModal;