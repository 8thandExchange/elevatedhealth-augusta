import { useEffect, useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { patientNameEmailOrFilter } from "@/lib/patientSearch";
import {
  buildStaffPaymentProducts,
  groupStaffPaymentProducts,
  type StaffPaymentDelivery,
  type StaffPaymentPatient,
} from "@/lib/staffPaymentCatalog";
import { sendStaffPaymentLink } from "@/lib/sendStaffPaymentLink";
import { Loader2, Search, CreditCard, Mail, MessageSquare, Copy } from "lucide-react";

interface QuickPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  /** Pre-select patient when opened from patient list / chart. */
  initialPatient?: StaffPaymentPatient | null;
}

const QuickPaymentModal = ({
  open,
  onOpenChange,
  onSuccess,
  initialPatient = null,
}: QuickPaymentModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<StaffPaymentPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<StaffPaymentPatient | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendMethod, setSendMethod] = useState<StaffPaymentDelivery>("email");

  const catalog = useMemo(
    () => buildStaffPaymentProducts(selectedPatient?.gender),
    [selectedPatient?.gender],
  );
  const groupedProducts = useMemo(() => groupStaffPaymentProducts(catalog), [catalog]);

  useEffect(() => {
    if (open && initialPatient) {
      setSelectedPatient(initialPatient);
      setSearchQuery(initialPatient.full_name);
    }
  }, [open, initialPatient]);

  useEffect(() => {
    if (open && searchQuery.length >= 2 && !initialPatient) {
      void searchPatients();
    }
  }, [searchQuery, open, initialPatient]);

  const searchPatients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, full_name, email, phone, gender")
        .or(patientNameEmailOrFilter(searchQuery))
        .limit(10);

      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setPatients([]);
    setSelectedPatient(null);
    setSelectedProduct("");
    setSendMethod("email");
  };

  const handleSendPaymentLink = async () => {
    if (!selectedPatient || !selectedProduct) {
      toast.error("Please select a patient and product");
      return;
    }

    if (sendMethod === "email" && !selectedPatient.email) {
      toast.error("Patient email is required to send a payment link by email");
      return;
    }
    if (sendMethod === "sms" && !selectedPatient.phone) {
      toast.error("Patient phone is required to send a payment link by text");
      return;
    }
    if (!selectedPatient.email?.trim()) {
      toast.error("Patient email is required on file to create a Stripe payment link");
      return;
    }

    setIsSending(true);
    try {
      const result = await sendStaffPaymentLink({
        product: selectedProduct,
        patient: selectedPatient,
        method: sendMethod,
        catalog,
      });

      if (sendMethod === "copy") {
        toast.success("Payment link copied — paste into a text or show on your phone.");
      } else if (result.smsManualFallback) {
        toast.warning(result.deliveryNote ?? "Payment link copied — paste into Messages for the patient.");
      } else if (result.deliveryNote) {
        toast.warning(result.deliveryNote);
      } else {
        toast.success(
          sendMethod === "email"
            ? `Payment link emailed to ${selectedPatient.email}`
            : "Payment link texted to patient",
        );
      }

      onOpenChange(false);
      onSuccess?.();
      resetForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send payment link");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) resetForm();
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Send Payment Link
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Search Patient</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (initialPatient && e.target.value !== initialPatient.full_name) {
                    setSelectedPatient(null);
                  }
                }}
                className="pl-10"
              />
            </div>

            {isLoading && <p className="text-sm text-muted-foreground">Searching...</p>}

            {patients.length > 0 && !selectedPatient && (
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setSearchQuery(patient.full_name);
                      setPatients([]);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-muted/50 border-b last:border-b-0"
                  >
                    <p className="font-medium">{patient.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {patient.email || patient.phone || "No contact info"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

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
                onClick={() => {
                  setSelectedPatient(null);
                  setSearchQuery("");
                }}
                className="mt-2"
              >
                Change Patient
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label>Product / Service</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Select product..." />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {groupedProducts.map((group) => (
                  <SelectGroup key={group.category}>
                    <SelectLabel>{group.category}</SelectLabel>
                    {group.items.map((product) => (
                      <SelectItem key={product.value} value={product.value}>
                        <span>{product.label}</span>
                        <span className="text-muted-foreground ml-2">{product.price}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Deliver Link</Label>
            <RadioGroup
              value={sendMethod}
              onValueChange={(v) => setSendMethod(v as StaffPaymentDelivery)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="pay-email" />
                <Label htmlFor="pay-email" className="font-normal flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email patient
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="pay-sms" />
                <Label htmlFor="pay-sms" className="font-normal flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Text patient
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="copy" id="pay-copy" />
                <Label htmlFor="pay-copy" className="font-normal flex items-center gap-2">
                  <Copy className="w-4 h-4" /> Copy link (show on phone / AirDrop)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handleSendPaymentLink}
            disabled={!selectedPatient || !selectedProduct || isSending}
            className="w-full"
          >
            {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Send Payment Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickPaymentModal;
