import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { FileText, Loader2, Check, ChevronsUpDown, Printer, X, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientData {
  id: string;
  full_name: string;
  email?: string | null;
  dob?: string;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  treatment_request?: string;
}

interface CPTCode {
  id: string;
  code: string;
  description: string;
  panel_group: string;
  default_charge: number;
  quantity: number;
}

interface ICD10Code {
  id: string;
  code: string;
  description: string;
  category: string;
}

interface ClinicSettings {
  clinic_legal_name: string;
  clinic_tax_id: string;
  provider_npi: string;
  clinic_address: string;
  clinic_phone: string;
}

interface SuperbillGeneratorProps {
  patient: PatientData;
  serviceType?: string; // "saliva_profile_iii" | "weight_management" | "consult" | "neurotransmitter"
  chargeAmount?: number;
  onGenerated?: () => void;
}

const SuperbillGenerator = ({
  patient,
  serviceType = "saliva_profile_iii",
  chargeAmount = 299,
  onGenerated,
}: SuperbillGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [dateOfService, setDateOfService] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [cptCodes, setCptCodes] = useState<CPTCode[]>([]);
  const [icd10Codes, setIcd10Codes] = useState<ICD10Code[]>([]);
  const [selectedCptCodes, setSelectedCptCodes] = useState<Set<string>>(new Set());
  const [selectedIcd10Codes, setSelectedIcd10Codes] = useState<string[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [icd10Open, setIcd10Open] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, serviceType]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load CPT codes for the service type, always include labcorp panel
      const panelGroups = serviceType === "weight_management" 
        ? ["saliva_profile_iii", "weight_management", "labcorp"]
        : [serviceType, "labcorp"];
      
      const { data: cptData } = await supabase
        .from("cpt_codes")
        .select("*")
        .in("panel_group", panelGroups);

      if (cptData) {
        setCptCodes(cptData);
        // Pre-select only non-labcorp CPT codes (labcorp codes are optional add-ons)
        setSelectedCptCodes(new Set(cptData.filter(c => c.panel_group !== "labcorp").map((c) => c.id)));
      }

      // Load ICD-10 codes
      const { data: icdData } = await supabase
        .from("icd10_codes")
        .select("*")
        .order("code");

      if (icdData) {
        setIcd10Codes(icdData);
      }

      // Load clinic settings
      const { data: settingsData } = await supabase
        .from("clinic_settings")
        .select("key, value");

      if (settingsData) {
        const settings: ClinicSettings = {
          clinic_legal_name: settingsData.find(s => s.key === "clinic_legal_name")?.value || "Elevated Health Augusta",
          clinic_tax_id: settingsData.find(s => s.key === "clinic_tax_id")?.value || "",
          provider_npi: settingsData.find(s => s.key === "provider_npi")?.value || "",
          clinic_address: settingsData.find(s => s.key === "clinic_address")?.value || "",
          clinic_phone: settingsData.find(s => s.key === "clinic_phone")?.value || "",
        };
        setClinicSettings(settings);
      }
    } catch (err) {
      console.error("Error loading superbill data:", err);
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

  const addIcd10Code = (code: string) => {
    if (!selectedIcd10Codes.includes(code)) {
      setSelectedIcd10Codes([...selectedIcd10Codes, code]);
    }
    setIcd10Open(false);
  };

  const removeIcd10Code = (code: string) => {
    setSelectedIcd10Codes(selectedIcd10Codes.filter((c) => c !== code));
  };

  const formatAddress = () => {
    const parts = [
      patient.street_address,
      patient.city,
      patient.state,
      patient.zip_code,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  const generatePDF = async () => {
    if (selectedIcd10Codes.length === 0) {
      toast.error("Please select at least one diagnosis code");
      return;
    }

    setIsLoading(true);
    try {
      // Save superbill to database
      const selectedCpts = cptCodes.filter((c) => selectedCptCodes.has(c.id));
      const cptSnapshot = selectedCpts.map((c) => ({
        code: c.code,
        description: c.description,
        quantity: c.quantity,
        charge: c.default_charge || (chargeAmount / selectedCpts.length),
      }));

      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("superbills").insert({
        patient_id: patient.id,
        date_of_service: dateOfService,
        diagnosis_codes: selectedIcd10Codes,
        cpt_codes: cptSnapshot,
        total_charge: chargeAmount,
        created_by: user?.id,
      });

      // Generate printable HTML
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Please allow popups to generate the superbill");
        return;
      }

      const selectedDiagnoses = icd10Codes.filter((c) =>
        selectedIcd10Codes.includes(c.code)
      );

      printWindow.document.write(generatePrintableHTML(selectedCpts, selectedDiagnoses));
      printWindow.document.close();
      printWindow.print();

      toast.success("Superbill generated successfully!");
      setIsOpen(false);
      onGenerated?.();
    } catch (err) {
      console.error("Error generating superbill:", err);
      toast.error("Failed to generate superbill");
    } finally {
      setIsLoading(false);
    }
  };

  const emailSuperbillToPatient = async () => {
    if (!patient.email) {
      toast.error("Patient does not have an email address on file");
      return;
    }

    if (selectedIcd10Codes.length === 0) {
      toast.error("Please select at least one diagnosis code");
      return;
    }

    setIsEmailing(true);
    try {
      const selectedCpts = cptCodes.filter((c) => selectedCptCodes.has(c.id));
      const selectedDiagnoses = icd10Codes.filter((c) =>
        selectedIcd10Codes.includes(c.code)
      );

      const { error } = await supabase.functions.invoke("send-superbill-email", {
        body: {
          patientEmail: patient.email,
          patientName: patient.full_name,
          dateOfService: new Date(dateOfService).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          patientDob: patient.dob || "Not provided",
          patientAddress: formatAddress(),
          diagnoses: selectedDiagnoses.map((d) => ({
            code: d.code,
            description: d.description,
          })),
          cptCodes: selectedCpts.map((c) => ({
            code: c.code,
            description: c.description,
            quantity: c.quantity,
            charge: c.default_charge || chargeAmount / selectedCpts.length,
          })),
          totalCharge: chargeAmount,
          clinicSettings: {
            legalName: clinicSettings?.clinic_legal_name || "Elevated Health Augusta",
            taxId: clinicSettings?.clinic_tax_id || "",
            npi: clinicSettings?.provider_npi || "",
            address: clinicSettings?.clinic_address || "",
            phone: clinicSettings?.clinic_phone || "",
          },
        },
      });

      if (error) throw error;

      // Also save to database
      const cptSnapshot = selectedCpts.map((c) => ({
        code: c.code,
        description: c.description,
        quantity: c.quantity,
        charge: c.default_charge || chargeAmount / selectedCpts.length,
      }));

      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("superbills").insert({
        patient_id: patient.id,
        date_of_service: dateOfService,
        diagnosis_codes: selectedIcd10Codes,
        cpt_codes: cptSnapshot,
        total_charge: chargeAmount,
        created_by: user?.id,
      });

      toast.success(`Superbill emailed to ${patient.email}`);
      setIsOpen(false);
      onGenerated?.();
    } catch (err) {
      console.error("Error emailing superbill:", err);
      toast.error("Failed to email superbill");
    } finally {
      setIsEmailing(false);
    }
  };

  const generatePrintableHTML = (selectedCpts: CPTCode[], selectedDiagnoses: ICD10Code[]) => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Superbill - ${patient.full_name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; font-size: 12px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2C3E50; padding-bottom: 20px; margin-bottom: 25px; }
        .logo { font-size: 22px; font-weight: bold; color: #2C3E50; }
        .logo-sub { font-size: 11px; color: #666; margin-top: 4px; }
        .credentials { text-align: right; font-size: 11px; color: #444; }
        .credentials p { margin: 2px 0; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: bold; font-size: 13px; color: #2C3E50; background: #f5f5f5; padding: 8px 12px; margin-bottom: 12px; border-left: 4px solid #2C3E50; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .field { margin-bottom: 8px; }
        .field-label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .field-value { font-size: 12px; font-weight: 500; padding: 4px 0; border-bottom: 1px solid #ddd; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f9f9f9; font-weight: 600; font-size: 11px; }
        td { font-size: 11px; }
        .total-row { background: #f5f5f5; font-weight: bold; }
        .diagnosis-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .diagnosis-badge { background: #e3f2fd; color: #1565c0; padding: 6px 12px; border-radius: 4px; font-size: 11px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; }
        .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 30px; }
        .signature-line { border-bottom: 1px solid #000; padding-top: 40px; }
        .signature-label { font-size: 10px; color: #666; margin-top: 4px; }
        .watermark { text-align: center; color: #999; font-size: 10px; margin-top: 30px; font-style: italic; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">ELEVATED HEALTH</div>
          <div class="logo-sub">Medical Wellness & Optimization</div>
          <div class="logo-sub" style="margin-top: 8px;">${clinicSettings?.clinic_address || ""}</div>
          <div class="logo-sub">${clinicSettings?.clinic_phone || ""}</div>
        </div>
        <div class="credentials">
          <p><strong>SUPERBILL</strong></p>
          <p>Tax ID (EIN): ${clinicSettings?.clinic_tax_id || "_______________"}</p>
          <p>NPI: ${clinicSettings?.provider_npi || "_______________"}</p>
          <p>Legal Entity: ${clinicSettings?.clinic_legal_name || "_______________"}</p>
        </div>
      </div>

      <div class="section">
        <div class="section-title">PATIENT INFORMATION</div>
        <div class="grid-2">
          <div>
            <div class="field">
              <div class="field-label">Patient Name</div>
              <div class="field-value">${patient.full_name}</div>
            </div>
            <div class="field">
              <div class="field-label">Date of Birth</div>
              <div class="field-value">${patient.dob || "_______________"}</div>
            </div>
          </div>
          <div>
            <div class="field">
              <div class="field-label">Address</div>
              <div class="field-value">${formatAddress()}</div>
            </div>
            <div class="field">
              <div class="field-label">Date of Service</div>
              <div class="field-value">${new Date(dateOfService).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">DIAGNOSIS CODES (ICD-10)</div>
        <div class="diagnosis-list">
          ${selectedDiagnoses.map(d => `<span class="diagnosis-badge"><strong>${d.code}</strong> - ${d.description}</span>`).join("")}
        </div>
      </div>

      <div class="section">
        <div class="section-title">SERVICES RENDERED (CPT CODES)</div>
        <table>
          <thead>
            <tr>
              <th style="width: 100px;">CPT Code</th>
              <th>Description</th>
              <th style="width: 60px;">Qty</th>
              <th style="width: 100px;">Charge</th>
            </tr>
          </thead>
          <tbody>
            ${selectedCpts.map(c => `
              <tr>
                <td><strong>${c.code}</strong></td>
                <td>${c.description}</td>
                <td>${c.quantity}</td>
                <td>$${(c.default_charge || (chargeAmount / selectedCpts.length)).toFixed(2)}</td>
              </tr>
            `).join("")}
            <tr class="total-row">
              <td colspan="3" style="text-align: right;"><strong>TOTAL CHARGE:</strong></td>
              <td><strong>$${chargeAmount.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="footer">
        <div class="section-title">PROVIDER CERTIFICATION</div>
        <p style="font-size: 11px; color: #444; line-height: 1.6;">
          I certify that the services listed above were medically necessary and were personally furnished by me or were furnished incident to my professional service.
        </p>
        <div class="signature-section">
          <div>
            <div class="signature-line"></div>
            <div class="signature-label">Provider Signature</div>
            <div style="margin-top: 8px; font-size: 11px;">
              <strong>Lauren Bursey, NP-C</strong><br/>
              NPI: ${clinicSettings?.provider_npi || ""}
            </div>
          </div>
          <div>
            <div class="signature-line"></div>
            <div class="signature-label">Date</div>
          </div>
        </div>
      </div>

      <div class="watermark">
        This document is a Superbill for insurance reimbursement purposes. Provider signature on file.<br/>
        Generated by Elevated Health Augusta | HIPAA Compliant
      </div>
    </body>
    </html>
  `;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          Generate Superbill
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Superbill Generator
          </DialogTitle>
        </DialogHeader>

        {isLoading && cptCodes.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Patient Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Patient</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{patient.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  DOB: {patient.dob || "Not provided"} | {formatAddress()}
                </p>
              </CardContent>
            </Card>

            {/* Date of Service */}
            <div>
              <Label htmlFor="dateOfService" className="text-sm font-medium">
                Date of Service
              </Label>
              <Input
                id="dateOfService"
                type="date"
                value={dateOfService}
                onChange={(e) => setDateOfService(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Diagnosis Codes */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Diagnosis Codes (ICD-10) <span className="text-red-500">*</span>
              </Label>
              
              {selectedIcd10Codes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedIcd10Codes.map((code) => {
                    const icd = icd10Codes.find((c) => c.code === code);
                    return (
                      <Badge key={code} variant="secondary" className="gap-1 pr-1">
                        <strong>{code}</strong> - {icd?.description || "Unknown"}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                          onClick={() => removeIcd10Code(code)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              <Popover open={icd10Open} onOpenChange={setIcd10Open}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    Add diagnosis code...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search ICD-10 codes..." />
                    <CommandList>
                      <CommandEmpty>No code found.</CommandEmpty>
                      <CommandGroup>
                        {icd10Codes.map((icd) => (
                          <CommandItem
                            key={icd.code}
                            value={`${icd.code} ${icd.description}`}
                            onSelect={() => addIcd10Code(icd.code)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedIcd10Codes.includes(icd.code)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span className="font-mono font-medium mr-2">{icd.code}</span>
                            <span className="text-muted-foreground">{icd.description}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* CPT Codes */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Services (CPT Codes)
              </Label>
              <Card>
                <CardContent className="pt-4 space-y-4">
                  {/* Main Service Codes */}
                  {cptCodes.filter(c => c.panel_group !== "labcorp").length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Main Services</p>
                      {cptCodes.filter(c => c.panel_group !== "labcorp").map((cpt) => (
                        <div
                          key={cpt.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50"
                        >
                          <Checkbox
                            id={cpt.id}
                            checked={selectedCptCodes.has(cpt.id)}
                            onCheckedChange={() => toggleCptCode(cpt.id)}
                          />
                          <Label
                            htmlFor={cpt.id}
                            className="flex-1 cursor-pointer flex items-center justify-between"
                          >
                            <span>
                              <span className="font-mono font-medium">{cpt.code}</span>
                              <span className="text-muted-foreground ml-2">
                                {cpt.description}
                              </span>
                              {cpt.quantity > 1 && (
                                <Badge variant="outline" className="ml-2">
                                  x{cpt.quantity}
                                </Badge>
                              )}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Labcorp Panel Codes */}
                  {cptCodes.filter(c => c.panel_group === "labcorp").length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <p className="text-xs font-medium text-amber-600 uppercase tracking-wider flex items-center gap-1">
                        Labcorp Panels (Optional)
                      </p>
                      {cptCodes.filter(c => c.panel_group === "labcorp").map((cpt) => (
                        <div
                          key={cpt.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-amber-50 dark:hover:bg-amber-950/20"
                        >
                          <Checkbox
                            id={cpt.id}
                            checked={selectedCptCodes.has(cpt.id)}
                            onCheckedChange={() => toggleCptCode(cpt.id)}
                          />
                          <Label
                            htmlFor={cpt.id}
                            className="flex-1 cursor-pointer flex items-center justify-between"
                          >
                            <span>
                              <span className="font-mono font-medium">{cpt.code}</span>
                              <span className="text-muted-foreground ml-2">
                                {cpt.description}
                              </span>
                            </span>
                            <span className="text-sm font-medium text-amber-700">${cpt.default_charge?.toFixed(2)}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Total */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Charge</span>
                  <span className="text-2xl font-bold">${chargeAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Generate Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={generatePDF}
                disabled={isLoading || isEmailing || selectedIcd10Codes.length === 0}
                className="flex-1"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Generating..." : "Print Superbill"}
              </Button>
              <Button
                onClick={emailSuperbillToPatient}
                disabled={isLoading || isEmailing || selectedIcd10Codes.length === 0 || !patient.email}
                variant="secondary"
                size="lg"
                className="flex-1"
                title={!patient.email ? "Patient has no email on file" : `Email to ${patient.email}`}
              >
                {isEmailing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {isEmailing ? "Sending..." : "Email to Patient"}
              </Button>
            </div>
            {patient.email && (
              <p className="text-xs text-muted-foreground text-center">
                Will be sent to: {patient.email}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SuperbillGenerator;
