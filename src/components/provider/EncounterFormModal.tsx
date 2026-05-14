import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Loader2, Send, Printer, DollarSign, Calendar } from "lucide-react";

interface PatientData {
  id: string;
  full_name: string;
  email?: string | null;
  dob?: string;
  phone?: string | null;
}

interface CPTCode {
  id: string;
  code: string;
  description: string;
  panel_group: string;
  default_charge: number;
  quantity: number;
}

interface EncounterFormModalProps {
  patient?: PatientData | null;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const SERVICE_TYPES = [
  { value: "hormones", label: "Hormone Therapy" },
  { value: "weight_loss", label: "Weight Loss" },
];

const INSURANCE_TYPES = [
  { value: "commercial", label: "Commercial" },
  { value: "medicare", label: "Medicare" },
  { value: "private_pay", label: "Private Pay" },
  { value: "va", label: "VA/TRICARE" },
  { value: "tricare", label: "TRICARE" },
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "amex", label: "Amex" },
  { value: "discover", label: "Discover" },
];

const EncounterFormModal = ({
  patient,
  onSuccess,
  trigger,
}: EncounterFormModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Form state
  const [serviceType, setServiceType] = useState<string>("");
  const [insuranceType, setInsuranceType] = useState<string>("");
  const [dateOfService, setDateOfService] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedCptCodes, setSelectedCptCodes] = useState<Set<string>>(new Set());
  const [cptCodes, setCptCodes] = useState<CPTCode[]>([]);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [checkNumber, setCheckNumber] = useState<string>("");
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Load CPT codes when service type changes
  useEffect(() => {
    if (serviceType && isOpen) {
      loadCptCodes();
    }
  }, [serviceType, isOpen]);

  const loadCptCodes = async () => {
    setIsLoading(true);
    try {
      // Map service type to panel groups
      let panelGroups: string[] = [];
      switch (serviceType) {
        case "hormones":
          panelGroups = ["saliva_profile_iii", "labcorp"];
          break;
        case "weight_loss":
          panelGroups = ["weight_management", "labcorp", "drug_screen"];
          break;
        default:
          panelGroups = [];
      }

      const { data, error } = await supabase
        .from("cpt_codes")
        .select("*")
        .in("panel_group", panelGroups);

      if (error) throw error;
      
      setCptCodes(data || []);
      // Pre-select all codes by default
      setSelectedCptCodes(new Set((data || []).map(c => c.id)));
    } catch (err) {
      console.error("Error loading CPT codes:", err);
      toast.error("Failed to load billing codes");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCptCode = (id: string) => {
    const newSet = new Set(selectedCptCodes);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedCptCodes(newSet);
  };

  const calculateTotalCharges = () => {
    return cptCodes
      .filter(c => selectedCptCodes.has(c.id))
      .reduce((sum, c) => sum + (c.default_charge || 0) * (c.quantity || 1), 0);
  };

  const handlePrint = () => {
    const selectedCpts = cptCodes.filter(c => selectedCptCodes.has(c.id));
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print the form");
      return;
    }

    printWindow.document.write(generatePrintableHTML(selectedCpts));
    printWindow.document.close();
    printWindow.print();
  };

  const handleSendToOfficeManager = async () => {
    if (!serviceType) {
      toast.error("Please select a service type");
      return;
    }

    if (selectedCptCodes.size === 0) {
      toast.error("Please select at least one CPT code");
      return;
    }

    setIsSending(true);
    try {
      const selectedCpts = cptCodes.filter(c => selectedCptCodes.has(c.id));
      const { data: { user } } = await supabase.auth.getUser();

      // Save encounter form to database
      const { error: dbError } = await supabase.from("encounter_forms").insert({
        patient_id: patient?.id || null,
        service_type: serviceType,
        insurance_type: insuranceType || null,
        cpt_codes: selectedCpts.map(c => ({
          code: c.code,
          description: c.description,
          quantity: c.quantity,
          charge: c.default_charge,
        })),
        total_charges: calculateTotalCharges(),
        payment_amount: paymentAmount ? parseFloat(paymentAmount) : null,
        payment_method: paymentMethod || null,
        check_number: checkNumber || null,
        follow_up_date: followUpDate || null,
        date_of_service: dateOfService,
        notes: notes || null,
        provider_id: user?.id || null,
        provider_name: user?.email?.split("@")[0] || "Provider",
        sent_to_office_manager_at: new Date().toISOString(),
      });

      if (dbError) throw dbError;

      // Send email to office manager
      const { error: emailError } = await supabase.functions.invoke("send-encounter-form", {
        body: {
          patientName: patient?.full_name || "Walk-in Patient",
          patientDob: patient?.dob || null,
          patientPhone: patient?.phone || null,
          dateOfService: new Date(dateOfService).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          serviceType: SERVICE_TYPES.find(s => s.value === serviceType)?.label || serviceType,
          insuranceType: INSURANCE_TYPES.find(i => i.value === insuranceType)?.label || insuranceType || "Not specified",
          cptCodes: selectedCpts.map(c => ({
            code: c.code,
            description: c.description,
            quantity: c.quantity,
            charge: c.default_charge,
          })),
          totalCharges: calculateTotalCharges(),
          paymentAmount: paymentAmount ? parseFloat(paymentAmount) : null,
          paymentMethod: PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label || paymentMethod || null,
          checkNumber: checkNumber || null,
          followUpDate: followUpDate ? new Date(followUpDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }) : null,
          notes: notes || null,
          providerEmail: user?.email || null,
        },
      });

      if (emailError) throw emailError;

      toast.success("Encounter form sent to Office Manager!");
      setIsOpen(false);
      resetForm();
      onSuccess?.();
    } catch (err: any) {
      console.error("Error sending encounter form:", err);
      toast.error(err.message || "Failed to send encounter form");
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setServiceType("");
    setInsuranceType("");
    setSelectedCptCodes(new Set());
    setCptCodes([]);
    setPaymentAmount("");
    setPaymentMethod("");
    setCheckNumber("");
    setFollowUpDate("");
    setNotes("");
    setDateOfService(new Date().toISOString().split("T")[0]);
  };

  const generatePrintableHTML = (selectedCpts: CPTCode[]) => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Encounter Form - ${patient?.full_name || "Patient"}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: bold; font-size: 14px; background: #f0f0f0; padding: 8px; margin-bottom: 10px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .field { margin-bottom: 10px; }
        .field-label { font-size: 10px; color: #666; text-transform: uppercase; }
        .field-value { border-bottom: 1px solid #ccc; padding: 5px 0; min-height: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        .checkbox-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
        .checkbox-item { display: flex; align-items: center; gap: 5px; }
        .checkbox { width: 14px; height: 14px; border: 1px solid #333; }
        .checked { background: #333; }
        .total { font-weight: bold; text-align: right; margin-top: 10px; }
        @media print { body { padding: 15px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">ELEVATED HEALTH ENCOUNTER FORM</div>
        <div>3654 Wheeler Road, Suite 103 | Augusta, GA 30909 | (706) 250-9855</div>
      </div>

      <div class="section">
        <div class="section-title">PATIENT INFORMATION</div>
        <div class="grid">
          <div class="field">
            <div class="field-label">Patient Name</div>
            <div class="field-value">${patient?.full_name || "________________________"}</div>
          </div>
          <div class="field">
            <div class="field-label">Date of Birth</div>
            <div class="field-value">${patient?.dob || "________________________"}</div>
          </div>
          <div class="field">
            <div class="field-label">Phone</div>
            <div class="field-value">${patient?.phone || "________________________"}</div>
          </div>
          <div class="field">
            <div class="field-label">Date of Service</div>
            <div class="field-value">${new Date(dateOfService).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">SERVICE TYPE: ${SERVICE_TYPES.find(s => s.value === serviceType)?.label || serviceType}</div>
      </div>

      <div class="section">
        <div class="section-title">INSURANCE TYPE</div>
        <div class="checkbox-grid">
          ${INSURANCE_TYPES.map(i => `
            <div class="checkbox-item">
              <div class="checkbox ${insuranceType === i.value ? 'checked' : ''}"></div>
              <span>${i.label}</span>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="section">
        <div class="section-title">CPT CODES</div>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Charge</th>
            </tr>
          </thead>
          <tbody>
            ${selectedCpts.map(c => `
              <tr>
                <td>${c.code}</td>
                <td>${c.description}</td>
                <td>${c.quantity}</td>
                <td>$${(c.default_charge || 0).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="total">TOTAL CHARGES: $${calculateTotalCharges().toFixed(2)}</div>
      </div>

      <div class="section">
        <div class="section-title">PAYMENT INFORMATION</div>
        <div class="grid">
          <div class="field">
            <div class="field-label">Amount Collected</div>
            <div class="field-value">${paymentAmount ? `$${paymentAmount}` : "________________________"}</div>
          </div>
          <div class="field">
            <div class="field-label">Payment Method</div>
            <div class="field-value">${PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label || "________________________"}</div>
          </div>
          ${checkNumber ? `
            <div class="field">
              <div class="field-label">Check Number</div>
              <div class="field-value">${checkNumber}</div>
            </div>
          ` : ""}
        </div>
      </div>

      ${followUpDate ? `
        <div class="section">
          <div class="section-title">FOLLOW-UP APPOINTMENT</div>
          <div class="field-value">${new Date(followUpDate).toLocaleDateString()}</div>
        </div>
      ` : ""}

      ${notes ? `
        <div class="section">
          <div class="section-title">NOTES</div>
          <div class="field-value">${notes}</div>
        </div>
      ` : ""}

      <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
        <div>
          <div style="border-bottom: 1px solid #333; margin-bottom: 5px; height: 30px;"></div>
          <div class="field-label">Provider Signature</div>
        </div>
        <div>
          <div style="border-bottom: 1px solid #333; margin-bottom: 5px; height: 30px;"></div>
          <div class="field-label">Date</div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Group CPT codes by panel
  const groupedCptCodes = cptCodes.reduce((acc, code) => {
    const group = code.panel_group || "other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(code);
    return acc;
  }, {} as Record<string, CPTCode[]>);

  const panelLabels: Record<string, string> = {
    supplies: "Supplies & Medications",
    drug_screen: "Drug Screens",
    saliva_profile_iii: "Saliva Profile III",
    labcorp: "LabCorp Panels",
    weight_management: "Weight Management",
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="w-4 h-4" />
            Encounter Form
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Clinical Encounter Form
            {patient && (
              <Badge variant="secondary" className="ml-2">
                {patient.full_name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Service Type & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Service Type *</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date of Service</Label>
              <Input
                type="date"
                value={dateOfService}
                onChange={(e) => setDateOfService(e.target.value)}
              />
            </div>
          </div>

          {/* Insurance Type */}
          <div className="space-y-2">
            <Label>Insurance Type</Label>
            <div className="flex flex-wrap gap-3">
              {INSURANCE_TYPES.map(i => (
                <div key={i.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`ins-${i.value}`}
                    checked={insuranceType === i.value}
                    onCheckedChange={(checked) => 
                      setInsuranceType(checked ? i.value : "")
                    }
                  />
                  <Label htmlFor={`ins-${i.value}`} className="text-sm cursor-pointer">
                    {i.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* CPT Codes */}
          {serviceType && (
            <div className="space-y-4">
              <Label>CPT Codes</Label>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedCptCodes).map(([group, codes]) => (
                    <Card key={group} className="border-border/50">
                      <CardContent className="pt-4">
                        <p className="text-sm font-medium mb-3 text-muted-foreground">
                          {panelLabels[group] || group}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {codes.map(code => (
                            <div
                              key={code.id}
                              className="flex items-start gap-2 p-2 rounded hover:bg-secondary/50"
                            >
                              <Checkbox
                                id={`cpt-${code.id}`}
                                checked={selectedCptCodes.has(code.id)}
                                onCheckedChange={() => toggleCptCode(code.id)}
                              />
                              <Label
                                htmlFor={`cpt-${code.id}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                <span className="font-mono font-medium">{code.code}</span>
                                <span className="text-muted-foreground ml-2">
                                  {code.description}
                                </span>
                                <span className="text-xs text-primary ml-2">
                                  ${(code.default_charge || 0).toFixed(0)}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="flex justify-end">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Total: ${calculateTotalCharges().toFixed(2)}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Information */}
          <div className="space-y-2">
            <Label>Payment Information</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Amount Collected</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {paymentMethod === "check" && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Check Number</Label>
                  <Input
                    type="text"
                    placeholder="Check #"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Follow-up Appointment */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Follow-Up Appointment
            </Label>
            <Input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Additional notes for the encounter..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={!serviceType || selectedCptCodes.size === 0}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Form
            </Button>
            <Button
              onClick={handleSendToOfficeManager}
              disabled={isSending || !serviceType || selectedCptCodes.size === 0}
              className="bg-primary"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isSending ? "Sending..." : "Send to Office Manager"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EncounterFormModal;
