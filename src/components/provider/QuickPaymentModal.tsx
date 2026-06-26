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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CORE_SERVICES, MEDICATION_FILLS } from "@/lib/stripeConfig";
import { patientNameEmailOrFilter } from "@/lib/patientSearch";
import { Loader2, Search, CreditCard, Mail, MessageSquare, Copy } from "lucide-react";

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
}

interface QuickPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Current taxonomy. Aligned with stripeConfig.ts:
//   - ELEVATED program memberships: IV ($199), TRT ($249), HRT ($229). The
//     program is passed to create-membership-checkout, which charges the
//     SELECTED patient (not the staff caller). GLP-1 enrolls via the dedicated
//     semaglutide/tirzepatide checkouts.
//   - $79 Wellness Assessment (consultation)
//   - À la carte: testosterone / biEst / progesterone / follow-up / lab panel
//
// Removed: legacy single-tier "$199 Elevated Membership", hormone tiers
// (access/vitality/concierge), Vitality, hormone add-on, IV ketamine, retired
// $149 discovery-style consult SKU. All Réveil-era.
const PRODUCTS = [
  { value: "elevated_iv", label: "ELEVATED IV Membership", price: "$199/mo", category: "Membership" },
  { value: "elevated_trt", label: "ELEVATED TRT Membership", price: "$249/mo", category: "Membership" },
  { value: "elevated_hrt", label: "ELEVATED HRT Membership", price: "$229/mo", category: "Membership" },
  { value: "consultation", label: "Wellness Assessment", price: "$79", category: "Consultation" },
  { value: "semaglutide", label: "ELEVATED GLP-1 (semaglutide path)", price: "$349/mo", category: "Weight Loss" },
  { value: "tirzepatide", label: "ELEVATED GLP-1 (tirzepatide path)", price: "$449/mo", category: "Weight Loss" },
  { value: "alacarte_testosterone", label: "Testosterone Cream", price: MEDICATION_FILLS.testosterone.displayPrice, category: "À la carte HRT" },
  { value: "alacarte_biEst", label: "Bi-Est Cream", price: MEDICATION_FILLS.biEst.displayPrice, category: "À la carte HRT" },
  { value: "alacarte_progesterone", label: "Progesterone", price: MEDICATION_FILLS.progesterone.displayPrice, category: "À la carte HRT" },
  { value: "alacarte_followUp", label: "Physician Phone Follow-Up", price: CORE_SERVICES.phoneFollowUp.displayPrice, category: "À la carte" },
  { value: "alacarte_labPanel", label: "Comprehensive Wellness Panel", price: CORE_SERVICES.comprehensivePanel.displayPrice, category: "À la carte" },
];

const getProductDisplayName = (product: string): string => {
  const found = PRODUCTS.find((p) => p.value === product);
  return found?.label || product;
};

const getProductDisplayPrice = (product: string): string => {
  const found = PRODUCTS.find((p) => p.value === product);
  return found?.price || "";
};

const QuickPaymentModal = ({ open, onOpenChange, onSuccess }: QuickPaymentModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");

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

  // ELEVATED program memberships → the umbrella membership checkout, with the
  // program passed through so it charges the right tier for the SELECTED patient.
  const MEMBERSHIP_PROGRAM: Record<string, "wellness" | "trt" | "hrt"> = {
    elevated_iv: "wellness",
    elevated_trt: "trt",
    elevated_hrt: "hrt",
  };

  const getEdgeFunction = (product: string) => {
    if (product in MEMBERSHIP_PROGRAM) return "create-membership-checkout";
    switch (product) {
      case "consultation":
        return "create-consultation-checkout";
      case "semaglutide":
        return "create-semaglutide-checkout";
      case "tirzepatide":
        return "create-tirzepatide-checkout";
      default:
        // alacarte_* keys
        return "create-alacarte-checkout";
    }
  };

  const getCheckoutBody = (product: string, patient: Patient) => {
    if (product in MEMBERSHIP_PROGRAM) {
      return {
        program: MEMBERSHIP_PROGRAM[product],
        email: patient.email,
        name: patient.full_name,
        patientId: patient.id,
      };
    }
    if (product.startsWith("alacarte_")) {
      return {
        product_key: product.replace("alacarte_", ""),
        patient_email: patient.email,
        patient_name: patient.full_name,
        patient_id: patient.id,
      };
    }
    if (product === "consultation") {
      return {
        serviceType: "hormone",
      };
    }
    return {
      email: patient.email,
      name: patient.full_name,
      patientId: patient.id,
    };
  };

  const handleSend = async () => {
    if (!selectedPatient || !selectedProduct) {
      toast.error("Please select a patient and product");
      return;
    }

    const contactInfo = sendMethod === "email" ? selectedPatient.email : selectedPatient.phone;
    if (!contactInfo) {
      toast.error(`Patient does not have a ${sendMethod === "email" ? "email" : "phone number"} on file`);
      return;
    }

    setIsSending(true);
    try {
      // Step 1: Generate the Stripe checkout URL
      const checkoutFunction = getEdgeFunction(selectedProduct);
      const checkoutBody = getCheckoutBody(selectedProduct, selectedPatient);
      
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(checkoutFunction, {
        body: checkoutBody,
      });

      if (checkoutError || !checkoutData?.url) {
        throw new Error(checkoutError?.message || "Failed to generate payment link");
      }

      // Step 2: Send the URL via email or SMS
      const sendFunction = sendMethod === "email" 
        ? "send-alacarte-payment-link" 
        : "send-alacarte-payment-sms";
      
      const { error: sendError } = await supabase.functions.invoke(sendFunction, {
        body: {
          patient_email: selectedPatient.email,
          patient_phone: selectedPatient.phone,
          patient_name: selectedPatient.full_name,
          payment_url: checkoutData.url,
          product_name: getProductDisplayName(selectedProduct),
          amount: getProductDisplayPrice(selectedProduct),
        },
      });

      if (sendError) throw sendError;

      toast.success(`Payment link sent via ${sendMethod}!`);
      onOpenChange(false);
      onSuccess?.();
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to send payment link");
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = async () => {
    if (!selectedPatient?.email || !selectedProduct) {
      toast.error("Patient email and product required");
      return;
    }

    setIsSending(true);
    try {
      const edgeFunction = getEdgeFunction(selectedProduct);
      const checkoutBody = getCheckoutBody(selectedProduct, selectedPatient);
      
      const { data, error } = await supabase.functions.invoke(edgeFunction, {
        body: checkoutBody,
      });

      if (error) throw error;
      
      if (data?.url) {
        await navigator.clipboard.writeText(data.url);
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
    setSelectedProduct("");
    setSendMethod("email");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Send Payment Link
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

          {/* Product Selection */}
          <div className="space-y-2">
            <Label>Product / Service</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Select product..." />
              </SelectTrigger>
              <SelectContent>
                {PRODUCTS.map((product) => (
                  <SelectItem key={product.value} value={product.value}>
                    <div className="flex justify-between w-full">
                      <span>{product.label}</span>
                      <span className="text-muted-foreground ml-2">{product.price}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Send Method */}
          <div className="space-y-2">
            <Label>Send Via</Label>
            <RadioGroup value={sendMethod} onValueChange={(v: "email" | "sms") => setSendMethod(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="pay-email" />
                <Label htmlFor="pay-email" className="font-normal flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="pay-sms" />
                <Label htmlFor="pay-sms" className="font-normal flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> SMS
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSend}
              disabled={!selectedPatient || !selectedProduct || isSending}
              className="flex-1"
            >
              {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Send Link
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              disabled={!selectedPatient || !selectedProduct || isSending}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickPaymentModal;