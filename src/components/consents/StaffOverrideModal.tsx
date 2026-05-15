import { useEffect, useMemo, useState } from "react";
import type { ConsentDocument } from "@/data/consents/types";
import { supabase } from "@/integrations/supabase/client";
import { addMonths, hashConsentBody } from "@/lib/consents/consent-helpers";
import { captureSigningMetadata } from "@/lib/consents/capture-metadata";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const OVERRIDE_CATEGORIES = [
  { value: "visual_impairment", label: "Visual impairment" },
  { value: "motor_impairment", label: "Motor impairment" },
  { value: "cognitive_impairment", label: "Cognitive impairment" },
  { value: "language_barrier", label: "Language barrier" },
  { value: "technical_failure", label: "Technical failure" },
  { value: "other", label: "Other" },
] as const;

const IDENTITY_METHODS = [
  { value: "photo_id", label: "Photo ID checked" },
  { value: "dob_verbal_match", label: "DOB verbal match" },
  { value: "family_member_attestation", label: "Family member attestation" },
  { value: "other", label: "Other (specify)" },
] as const;

export interface StaffOverrideModalProps {
  open: boolean;
  consentDocument: ConsentDocument;
  consentVersionId: string;
  patientId: string;
  patientName: string;
  staffUserId: string;
  staffDisplayName: string;
  staffTitle?: string;
  signingSessionId: string;
  onOverrideComplete: (consentRecordId: string) => void;
  onCancel: () => void;
}

export function StaffOverrideModal({
  open,
  consentDocument,
  consentVersionId,
  patientId,
  patientName,
  staffUserId,
  staffDisplayName,
  staffTitle = "Clinical staff",
  signingSessionId,
  onOverrideComplete,
  onCancel,
}: StaffOverrideModalProps) {
  const [category, setCategory] = useState<string>("");
  const [reason, setReason] = useState("");
  const [identityMethod, setIdentityMethod] = useState("");
  const [identityOther, setIdentityOther] = useState("");
  const [witnessUserId, setWitnessUserId] = useState<string>("");
  const [attestation, setAttestation] = useState("");
  const [confirmStep, setConfirmStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verificationLabel = useMemo(() => {
    if (identityMethod === "other") return identityOther.trim() || "Other";
    return IDENTITY_METHODS.find((m) => m.value === identityMethod)?.label ?? "";
  }, [identityMethod, identityOther]);

  const defaultAttestation = useMemo(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const method = verificationLabel || "[verification method]";
    return `I, ${staffDisplayName}, ${staffTitle}, read this consent document aloud to the patient, ${patientName}, on ${dateStr} at ${timeStr}. The patient acknowledged understanding and verbally consented to the terms. The patient's identity was verified via ${method}.`;
  }, [staffDisplayName, staffTitle, patientName, verificationLabel]);

  useEffect(() => {
    if (open && !attestation) {
      setAttestation(defaultAttestation);
    }
  }, [open, defaultAttestation, attestation]);

  const reasonValid = reason.trim().length >= 20;
  const attestationValid = attestation.trim().length >= 50;
  const identityValid =
    identityMethod !== "" && (identityMethod !== "other" || identityOther.trim().length >= 3);
  const canProceed =
    category !== "" && reasonValid && identityValid && attestationValid && !submitting;

  const handleSubmit = async () => {
    if (!canProceed) return;
    if (!confirmStep) {
      setConfirmStep(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const metadata = await captureSigningMetadata();
      const documentTextHash = await hashConsentBody(consentDocument.body_markdown);
      const signedAt = new Date(metadata.timestamp);
      const expiresAt = addMonths(signedAt, consentDocument.expiration_months);
      const witnessLabel = staffTitle ? `${staffDisplayName} (${staffTitle})` : staffDisplayName;
      const signedTypedName = `${witnessLabel} as witness for ${patientName}`;

      const { data: inserted, error: insertError } = await supabase
        .from("consent_records")
        .insert({
          patient_id: patientId,
          consent_version_id: consentVersionId,
          consent_type: consentDocument.type,
          document_text_hash: documentTextHash,
          signed_at: metadata.timestamp,
          signed_typed_name: signedTypedName,
          signed_ip: metadata.ip,
          signed_user_agent: metadata.userAgent,
          signed_session_id: signingSessionId,
          section_attestations: null,
          expires_at: expiresAt.toISOString(),
          signing_method: "staff_verbal_documented",
          staff_witness_user_id: staffUserId,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        throw new Error(insertError?.message ?? "Failed to save consent record");
      }

      const { error: overrideError } = await (supabase as any).from("consent_overrides").insert({
        consent_record_id: inserted.id,
        patient_id: patientId,
        override_reason: reason.trim(),
        override_reason_category: category,
        staff_member_user_id: staffUserId,
        witness_staff_user_id: witnessUserId || null,
        patient_identity_verification_method:
          identityMethod === "other" ? `other:${identityOther.trim()}` : identityMethod,
        staff_attestation: attestation.trim(),
      });

      if (overrideError) {
        throw new Error(overrideError.message);
      }

      try {
        await supabase.functions.invoke("generate-consent-pdf", {
          body: { consent_record_id: inserted.id },
        });
      } catch {
        toast.warning("Verbal consent logged. PDF generation may be pending.");
      }

      toast.success("Staff-witnessed verbal consent recorded");
      onOverrideComplete(inserted.id);
      setConfirmStep(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not record verbal consent. Please try again.";
      setError(message);
      setConfirmStep(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-2 border-amber-500/60 bg-amber-50/30 dark:bg-amber-950/20">
        <DialogHeader>
          <DialogTitle className="text-amber-900 dark:text-amber-100">
            Staff-witnessed verbal consent
          </DialogTitle>
          <DialogDescription>
            Position 2 override — fully audited. Use only when the patient cannot self-sign on the
            device.
          </DialogDescription>
        </DialogHeader>

        {confirmStep ? (
          <Alert className="border-amber-500">
            <AlertDescription>
              You are about to log a staff-witnessed verbal consent for <strong>{patientName}</strong>
              . This action will be audited. Confirm?
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Override reason category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {OVERRIDE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Override reason (min 20 characters)</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Patient identity verification</Label>
              <Select value={identityMethod} onValueChange={setIdentityMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="How was identity verified?" />
                </SelectTrigger>
                <SelectContent>
                  {IDENTITY_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {identityMethod === "other" && (
                <Input
                  placeholder="Specify verification method"
                  value={identityOther}
                  onChange={(e) => setIdentityOther(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Witness staff user ID (optional)</Label>
              <Input
                placeholder="UUID of witness, if different from you"
                value={witnessUserId}
                onChange={(e) => setWitnessUserId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Staff attestation (min 50 characters)</Label>
              <Textarea value={attestation} onChange={(e) => setAttestation(e.target.value)} rows={5} />
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmStep ? "destructive" : "default"}
            onClick={handleSubmit}
            disabled={!canProceed}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : confirmStep ? (
              "Confirm & log consent"
            ) : (
              "Review & confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
