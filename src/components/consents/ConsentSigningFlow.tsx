import { useCallback, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ConsentDocument, ConsentRecord, SectionAttestations } from "@/data/consents/types";
import { supabase } from "@/integrations/supabase/client";
import { addMonths, hashConsentBody } from "@/lib/consents/consent-helpers";
import { captureSigningMetadata } from "@/lib/consents/capture-metadata";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConsentDocumentDisplay } from "./ConsentDocumentDisplay";
import { ConsentSectionAttestation } from "./ConsentSectionAttestation";
import { TypedNameSignature } from "./TypedNameSignature";
import { toast } from "sonner";

export interface ConsentSigningFlowProps {
  consentDocument: ConsentDocument;
  consentVersionId: string;
  patientId: string;
  patientName: string;
  onSigningComplete: (consentRecord: ConsentRecord) => void;
  onCancel?: () => void;
  signingSessionId?: string;
  /** When true, tags records for dev preview (still real DB rows). */
  isDevPreview?: boolean;
  signingMethod?: "patient_typed_name" | "patient_typed_name_in_clinic" | "staff_verbal_documented";
  staffWitnessUserId?: string;
}

function defaultAttestationText(sectionTitle: string): string {
  return `I attest that I have read and understood: ${sectionTitle}`;
}

export function ConsentSigningFlow({
  consentDocument,
  consentVersionId,
  patientId,
  patientName,
  onSigningComplete,
  onCancel,
  signingSessionId: signingSessionIdProp,
  isDevPreview = false,
  signingMethod = "patient_typed_name",
  staffWitnessUserId,
}: ConsentSigningFlowProps) {
  const requiredSections = useMemo(
    () => consentDocument.sections.filter((s) => s.requires_attestation),
    [consentDocument.sections],
  );

  const initialAttestations = useMemo(() => {
    const map: SectionAttestations = {};
    for (const s of requiredSections) {
      map[s.id] = false;
    }
    return map;
  }, [requiredSections]);

  const [attestations, setAttestations] = useState<SectionAttestations>(initialAttestations);
  const [typedName, setTypedName] = useState("");
  const [typedNameValid, setTypedNameValid] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const enforceScroll = consentDocument.tier === 2;

  const allAttestationsChecked = requiredSections.every((s) => attestations[s.id] === true);

  const canSubmit =
    typedNameValid &&
    allAttestationsChecked &&
    (!enforceScroll || hasScrolledToBottom) &&
    !isSubmitting;

  const handleAttestationChange = useCallback((sectionId: string, checked: boolean) => {
    setAttestations((prev) => ({ ...prev, [sectionId]: checked }));
  }, []);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const metadata = await captureSigningMetadata();
      const documentTextHash = await hashConsentBody(consentDocument.body_markdown);
      const signedAt = new Date(metadata.timestamp);
      const expiresAt = addMonths(signedAt, consentDocument.expiration_months);
      const sessionId =
        signingSessionIdProp ??
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `session-${Date.now()}`);

      const sectionPayload: SectionAttestations | null =
        requiredSections.length > 0 ? attestations : null;

      const { data: inserted, error: insertError } = await supabase
        .from("consent_records")
        .insert({
          patient_id: patientId,
          consent_version_id: consentVersionId,
          consent_type: consentDocument.type,
          document_text_hash: documentTextHash,
          signed_at: metadata.timestamp,
          signed_typed_name: typedName.trim(),
          signed_ip: metadata.ip,
          signed_user_agent: metadata.userAgent,
          signed_session_id: isDevPreview ? `dev-preview:${sessionId}` : sessionId,
          section_attestations: sectionPayload,
          expires_at: expiresAt.toISOString(),
          signing_method: signingMethod,
          staff_witness_user_id: staffWitnessUserId ?? null,
        })
        .select()
        .single();

      if (insertError || !inserted) {
        throw new Error(insertError?.message ?? "Failed to save consent record");
      }

      let record: ConsentRecord = inserted;

      try {
        const { data: pdfData, error: pdfError } = await supabase.functions.invoke(
          "generate-consent-pdf",
          { body: { consent_record_id: inserted.id } },
        );

        if (pdfError) {
          console.warn("[ConsentSigningFlow] PDF generation invoke error:", pdfError);
          toast.warning(
            "Consent signed successfully. PDF generation is pending — we will retry shortly.",
          );
        } else if (pdfData?.code === "PDF_GENERATION_NOT_CONFIGURED") {
          toast.warning(
            "Consent signed. PDF service is not configured yet; your signature is on file.",
          );
        } else if (pdfData?.storage_path) {
          const { data: refreshed } = await supabase
            .from("consent_records")
            .select("*")
            .eq("id", inserted.id)
            .single();
          if (refreshed) record = refreshed;
        }
      } catch (pdfErr) {
        console.warn("[ConsentSigningFlow] PDF generation failed (non-blocking):", pdfErr);
        toast.warning("Consent signed. PDF could not be generated at this time.");
      }

      toast.success("Consent signed successfully");
      onSigningComplete(record);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong while signing. Please try again.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-playfair text-2xl font-light text-foreground">{consentDocument.title}</h2>
        <Badge variant="outline">Tier {consentDocument.tier}</Badge>
      </div>

      {isDevPreview && (
        <Alert>
          <AlertDescription>
            Dev preview mode — this creates a real consent_records row tagged with a dev session id.
          </AlertDescription>
        </Alert>
      )}

      {enforceScroll && !hasScrolledToBottom && (
        <p className="text-sm text-muted-foreground">
          Please scroll through the entire document to continue.
        </p>
      )}

      <ConsentDocumentDisplay
        bodyMarkdown={consentDocument.body_markdown}
        enforceScroll={enforceScroll}
        onScrollComplete={() => setHasScrolledToBottom(true)}
      />

      {requiredSections.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Required attestations</h3>
          {requiredSections.map((section) => (
            <ConsentSectionAttestation
              key={section.id}
              sectionId={section.id}
              sectionTitle={section.title}
              attestationText={defaultAttestationText(section.title)}
              checked={attestations[section.id] ?? false}
              onChange={handleAttestationChange}
              disabled={isSubmitting}
            />
          ))}
        </div>
      )}

      <TypedNameSignature
        expectedName={patientName}
        value={typedName}
        onChange={setTypedName}
        onValidationStateChange={(state) => setTypedNameValid(state.isValid)}
        disabled={isSubmitting}
      />

      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing…
            </>
          ) : (
            "Sign consent"
          )}
        </Button>
      </div>
    </div>
  );
}
