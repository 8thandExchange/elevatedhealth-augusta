import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Copy, Check, CheckCircle, Loader2, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  PharmacyFaxOverride,
  resolveOutboundFaxNumber,
} from "./PharmacyFaxOverride";
import { formatFaxDisplay } from "@/lib/faxNumber";
import {
  CustomPharmacyPreparationPicker,
  type CustomPharmacyRxSelection,
} from "./CustomPharmacyPreparationPicker";
import type { CustomPharmacyCategory } from "@/lib/customPharmacyFormulary";
import { CUSTOM_PHARMACY_VENDOR } from "@/lib/pharmacyOrderFormulary";
import { buildCustomPharmacySelection } from "@/lib/creamPrescriptionAlgorithm";
import type { RxConsentResolutionInput } from "@/data/consents/medication-consent-mapping";
import { checkConsentGateForRxContexts, type ConsentGateResult } from "@/lib/consents/consent-gate";
import { ConsentGatePanel } from "@/components/consents/ConsentGatePanel";

const CUSTOM_PHARMACY_SLUG = "custom-pharmacy-evans";

/** Minimal pharmacy row for fax-only Custom Pharmacy orders */
interface CustomPharmacyRecord {
  id: string;
  slug: string;
  display_name: string;
  fulfillment_method: "fax";
  fax_number: string | null;
  phone_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
}

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

export interface PrescriptionPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientData;
  medication?: MedicationData;
  rxString: string;
  quantity: number;
  refills: number;
  supplyDays?: number;
  /** Routing key for diagnosis defaults (male_hormone / female_hormone). */
  category: string;
  /** Pre-select cream preparation from PharmacyOrderCard formulary line */
  customPreparationId?: string | null;
  /** Lab algorithm overrides for strength/sig/refills when auto-selecting cream */
  algorithmCreamSelection?: {
    strength: string;
    sig: string;
    refills?: number;
  };
  onOrderCreated?: () => void;
}

type FaxStatus = "idle" | "transmitting" | "sent" | "failed";

interface RxClipboardData {
  patient: PatientData;
  provider: ProviderData;
  patientName: string;
  dob: string;
  address: string;
  allergies: string;
  medicationName: string;
  medicationStrength: string;
  sig: string;
  quantityLabel: string;
  refills: number;
  sku?: string;
  diagnosisCode: string;
  diagnosisDescription: string;
}

function formatPrescriptionForClipboard(data: RxClipboardData): string {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [
    "PATIENT",
    "───────",
    `Name: ${data.patientName}`,
    `DOB: ${data.dob}`,
    `Address: ${data.address}`,
    `Allergies: ${data.allergies}`,
    "",
    "PROVIDER",
    "────────",
    `Name: ${data.provider.name}, ${data.provider.credentials}`,
    `NPI: ${data.provider.npi}`,
    `Date: ${today}`,
    "",
    "PRESCRIPTION",
    "────────────",
  ];
  if (data.sku) lines.push(`SKU: ${data.sku}`);
  lines.push(
    `Medication: ${data.medicationName}`,
    `Strength: ${data.medicationStrength}`,
    `Quantity: ${data.quantityLabel}`,
    `Sig: ${data.sig}`,
    `Refills: ${data.refills}`,
    `Diagnosis: ${data.diagnosisCode} — ${data.diagnosisDescription}`,
  );
  return lines.join("\n");
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
    } catch {
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
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
      </Button>
    </div>
  );
};

const PrescriptionPortalModal = ({
  isOpen,
  onClose,
  patient,
  medication,
  rxString,
  quantity,
  refills,
  supplyDays = 30,
  category,
  customPreparationId = null,
  algorithmCreamSelection,
  onOrderCreated,
}: PrescriptionPortalModalProps) => {
  const [isMarking, setIsMarking] = useState(false);
  const [faxStatus, setFaxStatus] = useState<FaxStatus>("idle");
  const [faxId, setFaxId] = useState<string | null>(null);
  const [faxOrderId, setFaxOrderId] = useState<string | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const [faxTimestamp, setFaxTimestamp] = useState<string | null>(null);
  const [faxError, setFaxError] = useState<string | null>(null);
  const [providerEmail, setProviderEmail] = useState<string>("");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>("");
  const [matchedProvider, setMatchedProvider] = useState<ProviderData | null>(null);
  const [availableProviders, setAvailableProviders] = useState<ProviderData[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [pharmacy, setPharmacy] = useState<CustomPharmacyRecord | null>(null);
  const [useFaxOverride, setUseFaxOverride] = useState(false);
  const [faxOverrideValue, setFaxOverrideValue] = useState("");
  const [customSelection, setCustomSelection] = useState<CustomPharmacyRxSelection | null>(null);
  const [consentGateOpen, setConsentGateOpen] = useState(false);
  const [consentGateResult, setConsentGateResult] = useState<ConsentGateResult | null>(null);
  const [staffUserId, setStaffUserId] = useState<string | null>(null);
  const pendingRxActionRef = useRef<(() => Promise<void>) | null>(null);

  const hormoneCustomCategory: CustomPharmacyCategory | null =
    category === "male_hormone" || category === "female_hormone" ? category : null;

  const diagnosisOptions = useMemo(() => {
    const medCat = medication?.category;
    if (medCat && DIAGNOSIS_MAP[medCat]?.length) return DIAGNOSIS_MAP[medCat];
    if (DIAGNOSIS_MAP[category]?.length) return DIAGNOSIS_MAP[category];
    return Object.values(DIAGNOSIS_MAP).flat();
  }, [medication?.category, category]);

  useEffect(() => {
    const key = medication?.category || category;
    if (key && DIAGNOSIS_MAP[key]?.[0]) {
      const first = DIAGNOSIS_MAP[key][0];
      setSelectedDiagnosis(`${first.code}|${first.description}`);
    }
  }, [medication?.category, category]);

  useEffect(() => {
    const loadProvidersAndMatchUser = async () => {
      setIsLoadingProviders(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userEmail = user?.email || "";
        setProviderEmail(userEmail);

        let isPrescriber = false;
        if (user?.id) {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);
          isPrescriber = (roles ?? []).some(
            (r) => r.role === "provider" || r.role === "admin",
          );
        }

        const { data: settings, error } = await supabase
          .from("clinic_settings")
          .select("key, value")
          .like("key", "provider_%");

        if (error) throw error;

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

        const providersList = Object.values(providersData).filter((p) => p.name && p.npi) as ProviderData[];

        setAvailableProviders(providersList);

        const primary = providersList.find((p) => p.isPrimary) ?? providersList[0] ?? null;

        if (isPrescriber) {
          const matched = providersList.find(
            (p) => p.email && userEmail.toLowerCase() === p.email.toLowerCase(),
          );
          setMatchedProvider(matched ?? primary);
        } else {
          // RN/staff: default to clinic prescriber (Caroline selects Elevated Health MD)
          setMatchedProvider(primary);
        }
      } catch (err) {
        console.error("Error loading providers:", err);
      } finally {
        setIsLoadingProviders(false);
      }
    };

    loadProvidersAndMatchUser();
  }, []);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setStaffUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setFaxStatus("idle");
    setFaxTimestamp(null);
    setFaxError(null);
    setFaxId(null);
    setFaxOrderId(null);
    setDeliveryStatus(null);
    setCustomSelection(null);

    if (customPreparationId && medication?.id) {
      const built = buildCustomPharmacySelection({
        formularyId: medication.id,
        strength: algorithmCreamSelection?.strength,
        sig: algorithmCreamSelection?.sig,
        refills: algorithmCreamSelection?.refills ?? refills,
      });
      if (built) setCustomSelection(built);
    }

    void (async () => {
      const { data, error } = await supabase
        .from("pharmacies")
        .select("id, slug, display_name, fulfillment_method, fax_number, phone_number, address, city, state, zip")
        .eq("slug", CUSTOM_PHARMACY_SLUG)
        .eq("is_active", true)
        .maybeSingle();
      if (error) {
        console.error("Custom Pharmacy load failed:", error);
        return;
      }
      if (data) setPharmacy(data as CustomPharmacyRecord);
    })();
  }, [isOpen, customPreparationId, medication?.id, algorithmCreamSelection, refills]);

  useEffect(() => {
    if (!faxOrderId || faxStatus !== "sent") return;
    let cancelled = false;
    const poll = async () => {
      const { data } = await supabase
        .from("orders")
        .select("fax_status")
        .eq("id", faxOrderId)
        .maybeSingle();
      if (cancelled || !data?.fax_status) return;
      setDeliveryStatus(data.fax_status);
    };
    void poll();
    const interval = window.setInterval(poll, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [faxOrderId, faxStatus]);

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

  const getAllergies = () => {
    if (patient.allergies) return patient.allergies;
    const history = patient.medical_history;
    if (history?.allergies) return history.allergies;
    if (history?.drugAllergies) return history.drugAllergies;
    return "NKDA";
  };

  const getAddress = () => {
    if (patient.street_address) {
      const parts = [patient.street_address, patient.city, patient.state, patient.zip_code].filter(Boolean);
      return parts.join(", ") || "Not on file";
    }
    const history = patient.medical_history;
    if (history?.address) return history.address;
    if (history?.streetAddress) {
      const parts = [history.streetAddress, history.city, history.state, history.zipCode].filter(Boolean);
      return parts.join(", ") || "Not on file";
    }
    return "Not on file";
  };

  const effectiveMedication = useMemo((): MedicationData | undefined => {
    if (customSelection) {
      return {
        id: customSelection.preparation.id,
        name: customSelection.preparation.name,
        strength: customSelection.strength,
        sig: customSelection.sig,
        category: medication?.category ?? category,
      };
    }
    return medication;
  }, [customSelection, medication, category]);

  const rxConsentContexts = useMemo((): RxConsentResolutionInput[] => [
    {
      medicationLineId: effectiveMedication?.id ?? null,
      routingCategory: category,
    },
  ], [effectiveMedication?.id, category]);

  const runPrescriptionActionWithConsentGate = async (action: () => Promise<void>) => {
    try {
      const gate = await checkConsentGateForRxContexts(patient.id, rxConsentContexts);
      if (!gate.allowed || gate.expiringSoonConsents.length > 0) {
        setConsentGateResult(gate);
        setConsentGateOpen(true);
        pendingRxActionRef.current = action;
        return;
      }
      await action();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Consent verification failed");
    }
  };

  const effectiveRefills = customSelection ? customSelection.refills : refills;

  const copyFieldValue = async (value: string, toastLabel: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`Copied ${toastLabel}`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const buildRxClipboardData = (): RxClipboardData | null => {
    if (!matchedProvider) return null;
    const [diagnosisCode, diagnosisDescription] = selectedDiagnosis.split("|");
    const [firstName, ...lastParts] = patient.full_name.split(" ");
    const lastName = lastParts.join(" ") || "";
    const formattedName = `${firstName} ${lastName}`.trim();
    const medName = effectiveMedication?.name ?? "";
    const medStrength = effectiveMedication?.strength ?? "";
    const sigText = effectiveMedication?.sig ?? rxString;
    const quantityLabel = customSelection?.quantity ?? `${supplyDays}-day supply (${quantity} units)`;
    return {
      patient,
      provider: matchedProvider,
      patientName: formattedName,
      dob: formatDOB(patient.dob),
      address: getAddress(),
      allergies: getAllergies(),
      medicationName: medName,
      medicationStrength: medStrength,
      sig: sigText,
      quantityLabel,
      refills: effectiveRefills,
      diagnosisCode: diagnosisCode || "",
      diagnosisDescription: diagnosisDescription || "",
    };
  };

  const handleFaxToPharmacy = async () => {
    const med = effectiveMedication;
    if (!med) {
      toast.error("Medication details are required before faxing");
      return;
    }
    if (!matchedProvider) {
      toast.error("Please select a prescribing provider");
      return;
    }
    if (!customSelection && hormoneCustomCategory) {
      toast.error("Select the compounded cream preparation before faxing");
      return;
    }

    if (!pharmacy) {
      toast.error("Custom Pharmacy is not configured");
      return;
    }

    const { e164: faxDestination, error: faxError } = resolveOutboundFaxNumber(
      pharmacy as Parameters<typeof resolveOutboundFaxNumber>[0],
      useFaxOverride,
      faxOverrideValue,
    );
    if (!faxDestination) {
      toast.error(faxError ?? "Invalid fax number");
      return;
    }

    const [diagnosisCode, diagnosisDescription] = selectedDiagnosis.split("|");

    await runPrescriptionActionWithConsentGate(async () => {
      setFaxStatus("transmitting");
      setFaxError(null);

      try {
        const { data, error } = await supabase.functions.invoke("send-rx-fax", {
          body: {
            patient_id: patient.id,
            medication_name: med.name,
            medication_strength: med.strength,
            medication_sig: med.sig,
            quantity,
            refills: effectiveRefills,
            supply_days: supplyDays,
            provider_name: matchedProvider.name,
            provider_credentials: matchedProvider.credentials,
            provider_npi: matchedProvider.npi,
            diagnosis_code: diagnosisCode,
            diagnosis_description: diagnosisDescription,
            provider_signature_url: matchedProvider.signatureUrl,
            pharmacy_id: pharmacy.id,
            fax_to: faxDestination,
          },
        });

        if (error) throw error;

        if (!data?.success) {
          throw new Error(data?.error || "Fax transmission failed");
        }

        setFaxStatus("sent");
        setFaxId(data.fax_id ?? null);
        setFaxOrderId(data.order_id ?? null);
        setDeliveryStatus(data.status ?? "queued");
        setFaxTimestamp(
          new Date().toLocaleString("en-US", {
            dateStyle: "short",
            timeStyle: "short",
          }),
        );
        toast.success("Prescription faxed to pharmacy!");
        onOrderCreated?.();
      } catch (error: unknown) {
        console.error("Fax error:", error);
        setFaxStatus("failed");
        setFaxError(error instanceof Error ? error.message : "Failed to send fax");
        toast.error("Fax failed - use manual fallback");
      }
    });
  };

  const handleMarkAsOrdered = async () => {
    await runPrescriptionActionWithConsentGate(async () => {
      setIsMarking(true);
      try {
        const { error } = await supabase.from("orders").insert({
          patient_id: patient.id,
          pharmacy_id: pharmacy?.id ?? null,
          status: "sent_to_pharmacy",
          submission_method: "fax",
          protocol_snapshot: {
            medication: effectiveMedication?.name ?? medication?.name,
            medication_id: effectiveMedication?.id ?? medication?.id,
            strength: effectiveMedication?.strength ?? medication?.strength,
            sig: effectiveMedication?.sig ?? medication?.sig,
            rx_string: rxString,
            quantity,
            refills: effectiveRefills,
            ordered_via: `${CUSTOM_PHARMACY_VENDOR} (manual)`,
            ordered_at: new Date().toISOString(),
          },
        });

        if (error) throw error;

        toast.success("Order marked as sent to Custom Pharmacy");
        onOrderCreated?.();
        onClose();
      } catch (error: unknown) {
        console.error("Error marking order:", error);
        toast.error(error instanceof Error ? error.message : "Failed to mark order");
      } finally {
        setIsMarking(false);
      }
    });
  };

  const handleCustomSelectionChange = useCallback((sel: CustomPharmacyRxSelection | null) => {
    setCustomSelection(sel);
  }, []);

  const [firstName, ...lastParts] = patient.full_name.split(" ");
  const lastName = lastParts.join(" ") || "";
  const formattedName = `${firstName} ${lastName}`.trim();

  const resolvedFax = pharmacy
    ? resolveOutboundFaxNumber(pharmacy, useFaxOverride, faxOverrideValue)
    : null;

  const submitLabel =
    pharmacy && resolvedFax?.e164
      ? useFaxOverride
        ? `Fax to ${formatFaxDisplay(resolvedFax.e164)}`
        : `Fax to ${pharmacy.display_name}`
      : pharmacy
        ? `Fax to ${pharmacy.display_name}`
        : "Send Prescription";

  const showCustomPicker = hormoneCustomCategory !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border border-gold/30 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-cormorant text-foreground flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                <path d="M9 12h6M9 16h6" />
              </svg>
            </span>
            Send cream prescription
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1 mt-4">
          <CopyField label="Patient Name" value={formattedName} />
          <CopyField label="Date of Birth" value={formatDOB(patient.dob)} />
          <CopyField label="Address" value={getAddress()} />
          <CopyField label="Allergies" value={getAllergies()} />
        </div>

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
              <span>No prescribing providers configured. Add Dr. Akers in Clinic Settings → Provider NPI.</span>
            </div>
          ) : (
            <Select
              value={matchedProvider?.id || ""}
              onValueChange={(id) => {
                const provider = availableProviders.find((p) => p.id === id);
                setMatchedProvider(provider || null);
              }}
            >
              <SelectTrigger className="bg-background border-gold/30">
                <SelectValue placeholder="Select Elevated Health prescriber..." />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                {availableProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                    {provider.credentials ? `, ${provider.credentials}` : ""}
                    {provider.isPrimary ? " (Clinic default)" : ""}
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

        <div className="space-y-2 mt-4">
          <Label className="text-sm font-medium text-foreground">Pharmacy</Label>
          {pharmacy ? (
            <div className="rounded-lg border border-gold/30 bg-muted/30 p-3 text-sm">
              <p className="font-medium text-foreground">{pharmacy.display_name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {CUSTOM_PHARMACY_VENDOR} · Fax {pharmacy.fax_number ? formatFaxDisplay(pharmacy.fax_number) : "(706) 993-3772"}
                {pharmacy.phone_number ? ` · ${pharmacy.phone_number}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {[pharmacy.address, pharmacy.city, pharmacy.state, pharmacy.zip].filter(Boolean).join(", ")}
              </p>
            </div>
          ) : (
            <p className="text-sm text-destructive">Custom Pharmacy not configured — contact admin.</p>
          )}
          {pharmacy && (
            <PharmacyFaxOverride
              pharmacy={pharmacy}
              useOverride={useFaxOverride}
              onUseOverrideChange={setUseFaxOverride}
              overrideValue={faxOverrideValue}
              onOverrideValueChange={setFaxOverrideValue}
              disabled={faxStatus === "transmitting"}
            />
          )}
        </div>

        {showCustomPicker && hormoneCustomCategory && (
          <div className="mt-4 space-y-2">
            <Label className="text-sm font-medium text-foreground">Compounded cream</Label>
            <CustomPharmacyPreparationPicker
              category={hormoneCustomCategory}
              selection={customSelection}
              onChange={handleCustomSelectionChange}
              creamsOnly
              initialPreparationId={customPreparationId}
            />
          </div>
        )}

        <div className="bg-gold/5 border border-gold/30 rounded-lg p-4 mt-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gold uppercase tracking-wider mb-2">Complete Rx</p>
              <p className="text-sm text-foreground font-medium leading-relaxed">{rxString}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Qty: {quantity} | Refills: {effectiveRefills} | {supplyDays}-day supply
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const fullRx = `${rxString}\nQty: ${quantity} | Refills: ${effectiveRefills}`;
                await navigator.clipboard.writeText(fullRx);
                toast.success("Full Rx copied!");
              }}
              className="flex-shrink-0 h-8 w-8 p-0 hover:bg-gold/10"
            >
              <Copy className="w-4 h-4 text-gold" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label className="text-sm font-medium text-foreground">Clinical Indication (ICD-10)</Label>
          <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
            <SelectTrigger className="bg-background border-gold/30">
              <SelectValue placeholder="Select diagnosis..." />
            </SelectTrigger>
            <SelectContent className="bg-background border max-h-[200px]">
              {diagnosisOptions.map((diag) => (
                <SelectItem key={`${diag.code}-${diag.description}`} value={`${diag.code}|${diag.description}`}>
                  {diag.code} - {diag.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Required for pharmacist verification</p>
        </div>

        {faxStatus === "sent" && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-3 mt-4">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Fax transmitted to Custom Pharmacy
              </p>
              <p className="text-xs text-green-600 dark:text-green-500">{faxTimestamp}</p>
              {faxId && (
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                  Fax ID: {faxId}
                  {deliveryStatus && deliveryStatus !== "queued"
                    ? ` · Status: ${deliveryStatus}`
                    : " · Queued — awaiting pharmacy delivery confirmation"}
                </p>
              )}
              {deliveryStatus === "delivered" && (
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mt-1">
                  Delivery confirmed — order marked complete.
                </p>
              )}
            </div>
          </div>
        )}

        {faxStatus === "failed" && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mt-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">Fax Failed</p>
                <p className="text-xs text-destructive/80">{faxError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-6">
          {faxStatus !== "sent" && (
            <>
              {!selectedDiagnosis && (
                <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Please select a diagnosis code before sending</span>
                </div>
              )}

              <Button
                type="button"
                onClick={handleFaxToPharmacy}
                disabled={
                  faxStatus === "transmitting" ||
                  !effectiveMedication ||
                  !customSelection ||
                  !selectedDiagnosis ||
                  !pharmacy ||
                  !matchedProvider
                }
                className="w-full bg-gold hover:bg-gold-dark text-white disabled:opacity-50"
              >
                {faxStatus === "transmitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transmitting...
                  </>
                ) : faxStatus === "failed" ? (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Try Fax Again
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {submitLabel}
                  </>
                )}
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMarkAsOrdered}
            disabled={isMarking}
            className="w-full border-foreground/20 hover:bg-secondary"
          >
            {isMarking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Mark manual fax placed
          </Button>
        </div>

        {consentGateResult && (
          <ConsentGatePanel
            open={consentGateOpen}
            onOpenChange={(v) => {
              setConsentGateOpen(v);
              if (!v) pendingRxActionRef.current = null;
            }}
            gateResult={consentGateResult}
            patientId={patient.id}
            patientName={formattedName}
            patientEmail={patient.email ?? ""}
            patientPhone={patient.phone}
            staffWitnessUserId={staffUserId}
            staffDisplayName={matchedProvider?.name}
            onGateRecheck={() => checkConsentGateForRxContexts(patient.id, rxConsentContexts)}
            onGateResultUpdated={(next) => setConsentGateResult(next)}
            onGateCleared={() => {
              const run = pendingRxActionRef.current;
              pendingRxActionRef.current = null;
              setConsentGateOpen(false);
              void run?.();
            }}
            onConsentRequestSent={() => {
              pendingRxActionRef.current = null;
            }}
            onCancel={() => {
              pendingRxActionRef.current = null;
              setConsentGateOpen(false);
            }}
          />
        )}

      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionPortalModal;
