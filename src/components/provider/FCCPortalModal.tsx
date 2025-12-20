import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Copy, Check, ExternalLink, CheckCircle, Loader2, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Diagnosis suggestions by medication category
const DIAGNOSIS_MAP: Record<string, { code: string; description: string }[]> = {
  male_hormone: [
    { code: "E29.1", description: "Testicular Hypofunction" },
    { code: "E89.5", description: "Post-procedural Hypopituitarism" },
    { code: "R53.83", description: "Other Fatigue" },
  ],
  female_hormone: [
    { code: "E28.310", description: "Premature Menopause" },
    { code: "E28.39", description: "Primary Ovarian Failure, Other" },
    { code: "N95.1", description: "Menopausal and Female Climacteric States" },
    { code: "E34.9", description: "Endocrine Disorder, Unspecified" },
    { code: "E28.2", description: "Polycystic Ovarian Syndrome" },
    { code: "E28.9", description: "Ovarian Dysfunction, Unspecified" },
  ],
  sleep_support: [
    { code: "G47.00", description: "Insomnia, Unspecified" },
    { code: "F51.01", description: "Primary Insomnia" },
    { code: "N95.1", description: "Menopausal and Female Climacteric States" },
    { code: "F41.9", description: "Anxiety Disorder, Unspecified" },
  ],
  weight_loss: [
    { code: "E66.9", description: "Obesity, Unspecified" },
    { code: "E66.01", description: "Morbid (Severe) Obesity due to Excess Calories" },
    { code: "E11.9", description: "Type 2 Diabetes Mellitus without Complications" },
    { code: "R63.5", description: "Abnormal Weight Gain" },
  ],
  peptide: [
    { code: "E34.9", description: "Endocrine Disorder, Unspecified" },
    { code: "R53.83", description: "Other Fatigue" },
    { code: "F52.0", description: "Hypoactive Sexual Desire Disorder" },
  ],
  hair_restoration: [
    { code: "L63.9", description: "Alopecia Areata, Unspecified" },
    { code: "L64.9", description: "Androgenic Alopecia, Unspecified" },
    { code: "L65.9", description: "Nonscarring Hair Loss, Unspecified" },
  ],
  sexual_wellness: [
    { code: "F52.21", description: "Male Erectile Disorder" },
    { code: "N52.9", description: "Male Erectile Dysfunction, Unspecified" },
    { code: "F52.0", description: "Hypoactive Sexual Desire Disorder" },
    { code: "F52.22", description: "Female Sexual Arousal Disorder" },
  ],
};

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
  category?: string;
}

interface ProviderData {
  id: string;
  name: string;
  credentials: string;
  npi: string;
  email: string;
  isPrimary: boolean;
  signatureUrl?: string;
}

interface FCCPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientData;
  medication?: MedicationData;
  rxString: string;
  quantity: number;
  refills: number;
  supplyDays?: number;
  onOrderCreated?: () => void;
}

type FaxStatus = 'idle' | 'transmitting' | 'sent' | 'failed';

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
  supplyDays = 30,
  onOrderCreated,
}: FCCPortalModalProps) => {
  const [isMarking, setIsMarking] = useState(false);
  const [faxStatus, setFaxStatus] = useState<FaxStatus>('idle');
  const [faxTimestamp, setFaxTimestamp] = useState<string | null>(null);
  const [faxError, setFaxError] = useState<string | null>(null);
  const [providerEmail, setProviderEmail] = useState<string>("");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>("");
  const [matchedProvider, setMatchedProvider] = useState<ProviderData | null>(null);
  const [availableProviders, setAvailableProviders] = useState<ProviderData[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

  // Get diagnosis options based on medication category
  const diagnosisOptions = medication?.category 
    ? DIAGNOSIS_MAP[medication.category] || []
    : Object.values(DIAGNOSIS_MAP).flat();

  // Auto-select first diagnosis when medication changes
  useEffect(() => {
    if (medication?.category && DIAGNOSIS_MAP[medication.category]?.[0]) {
      const firstDiagnosis = DIAGNOSIS_MAP[medication.category][0];
      setSelectedDiagnosis(`${firstDiagnosis.code}|${firstDiagnosis.description}`);
    }
  }, [medication]);

  // Get current user's email and load providers for auto-matching
  useEffect(() => {
    const loadProvidersAndMatchUser = async () => {
      setIsLoadingProviders(true);
      try {
        // Get current user email
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email || "";
        setProviderEmail(userEmail);

        // Fetch all provider settings
        const { data: settings, error } = await supabase
          .from("clinic_settings")
          .select("key, value")
          .like("key", "provider_%");

        if (error) throw error;

        // Parse provider data from settings
        const providersData: Record<string, Partial<ProviderData>> = {};
        
        settings?.forEach((setting) => {
          const match = setting.key.match(/^provider_([^_]+)_(.+)$/);
          if (match) {
            const [, id, field] = match;
            if (!providersData[id]) {
              providersData[id] = { id };
            }
            if (field === "name") providersData[id].name = setting.value;
            if (field === "credentials") providersData[id].credentials = setting.value;
            if (field === "npi") providersData[id].npi = setting.value;
            if (field === "email") providersData[id].email = setting.value;
            if (field === "is_primary") providersData[id].isPrimary = setting.value === "true";
            if (field === "signature_url") providersData[id].signatureUrl = setting.value;
          }
        });

        const providersList = Object.values(providersData).filter(
          (p) => p.name && p.npi
        ) as ProviderData[];

        setAvailableProviders(providersList);

        // Try to match provider by email
        const matched = providersList.find(
          (p) => p.email && userEmail.toLowerCase() === p.email.toLowerCase()
        );
        
        if (matched) {
          setMatchedProvider(matched);
        } else {
          // Fall back to primary provider
          const primary = providersList.find((p) => p.isPrimary);
          setMatchedProvider(primary || providersList[0] || null);
        }
      } catch (err) {
        console.error("Error loading providers:", err);
      } finally {
        setIsLoadingProviders(false);
      }
    };

    loadProvidersAndMatchUser();
  }, []);

  // Reset fax status when modal opens
  useEffect(() => {
    if (isOpen) {
      setFaxStatus('idle');
      setFaxTimestamp(null);
      setFaxError(null);
    }
  }, [isOpen]);

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
    const history = patient.medical_history;
    if (history?.allergies) return history.allergies;
    if (history?.drugAllergies) return history.drugAllergies;
    return "NKDA";
  };

  // Get address from patient record
  const getAddress = () => {
    if (patient.street_address) {
      const parts = [
        patient.street_address,
        patient.city,
        patient.state,
        patient.zip_code,
      ].filter(Boolean);
      return parts.join(", ") || "Not on file";
    }
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

  const handleFaxToHolgate = async () => {
    if (!medication) return;
    if (!matchedProvider) {
      toast.error("Please select a prescribing provider");
      return;
    }
    
    setFaxStatus('transmitting');
    setFaxError(null);

    // Parse selected diagnosis
    const [diagnosisCode, diagnosisDescription] = selectedDiagnosis.split('|');

    try {
      const { data, error } = await supabase.functions.invoke('send-rx-fax', {
        body: {
          patient_id: patient.id,
          medication_name: medication.name,
          medication_strength: medication.strength,
          medication_sig: medication.sig,
          quantity,
          refills,
          supply_days: supplyDays,
          provider_name: matchedProvider.name,
          provider_credentials: matchedProvider.credentials,
          provider_npi: matchedProvider.npi,
          diagnosis_code: diagnosisCode,
          diagnosis_description: diagnosisDescription,
          provider_signature_url: matchedProvider.signatureUrl,
        },
      });

      if (error) throw error;
      
      if (!data?.success) {
        throw new Error(data?.error || "Fax transmission failed");
      }

      setFaxStatus('sent');
      setFaxTimestamp(new Date().toLocaleString('en-US', {
        dateStyle: 'short',
        timeStyle: 'short',
      }));
      toast.success("Prescription faxed to Dr. Holgate!");
      onOrderCreated?.();
    } catch (error: any) {
      console.error("Fax error:", error);
      setFaxStatus('failed');
      setFaxError(error.message || "Failed to send fax");
      toast.error("Fax failed - use manual fallback");
    }
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
          ordered_via: "FCC Portal (Manual)",
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
            Pharmacy Order Assistant
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
                  Qty: {quantity} | Refills: {refills} | {supplyDays}-day supply
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

        {/* Provider Selector */}
        <div className="space-y-2 mt-4">
          <Label className="text-sm font-medium text-foreground">Prescribing Provider</Label>
          {isLoadingProviders ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading providers...
            </div>
          ) : availableProviders.length === 0 ? (
            <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>No providers configured. Add providers in Clinic Settings.</span>
            </div>
          ) : (
            <Select 
              value={matchedProvider?.id || ""} 
              onValueChange={(id) => {
                const provider = availableProviders.find(p => p.id === id);
                setMatchedProvider(provider || null);
              }}
            >
              <SelectTrigger className="bg-background border-gold/30">
                <SelectValue placeholder="Select provider..." />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                {availableProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}{provider.credentials ? `, ${provider.credentials}` : ""} 
                    {provider.isPrimary && " (Primary)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {matchedProvider && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                NPI: <code className="bg-muted px-1 rounded">{matchedProvider.npi}</code>
                {matchedProvider.email === providerEmail && (
                  <span className="ml-2 text-green-600">✓ Matched to your account</span>
                )}
              </p>
              {matchedProvider.signatureUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Signature:</span>
                  <img 
                    src={matchedProvider.signatureUrl} 
                    alt="Provider signature"
                    className="max-h-6 max-w-24 object-contain border border-border/50 rounded px-1"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Diagnosis Selector */}
        <div className="space-y-2 mt-4">
          <Label className="text-sm font-medium text-foreground">Clinical Indication (ICD-10)</Label>
          <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
            <SelectTrigger className="bg-background border-gold/30">
              <SelectValue placeholder="Select diagnosis..." />
            </SelectTrigger>
            <SelectContent className="bg-background border max-h-[200px]">
              {diagnosisOptions.map((diag) => (
                <SelectItem key={diag.code} value={`${diag.code}|${diag.description}`}>
                  {diag.code} - {diag.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Required for pharmacist verification</p>
        </div>

        {/* Fax Status Display */}
        {faxStatus === 'sent' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Fax Sent Successfully</p>
              <p className="text-xs text-green-600 dark:text-green-500">{faxTimestamp}</p>
            </div>
          </div>
        )}

        {faxStatus === 'failed' && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">Fax Failed</p>
                <p className="text-xs text-destructive/80">{faxError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-6">
          {/* Primary: Fax to Holgate */}
          {faxStatus !== 'sent' && (
            <>
              {!selectedDiagnosis && (
                <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Please select a diagnosis code before faxing</span>
                </div>
              )}
              <Button
                onClick={handleFaxToHolgate}
                disabled={faxStatus === 'transmitting' || !medication || !selectedDiagnosis}
                className="w-full bg-gold hover:bg-gold-dark text-white disabled:opacity-50"
              >
                {faxStatus === 'transmitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transmitting...
                  </>
                ) : faxStatus === 'failed' ? (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Try Fax Again
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    📠 Fax Rx to Holgate
                  </>
                )}
              </Button>
            </>
          )}

          {/* Secondary Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleLaunchPortal}
              className="flex-1 border-foreground/20 hover:bg-secondary"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              FCC Portal
            </Button>
            <Button
              variant="outline"
              onClick={handleMarkAsOrdered}
              disabled={isMarking}
              className="flex-1 border-foreground/20 hover:bg-secondary"
            >
              {isMarking ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Mark Manual
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FCCPortalModal;
