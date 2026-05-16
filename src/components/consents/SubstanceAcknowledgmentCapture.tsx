import { useState } from "react";
import { hashConsentBody } from "@/lib/consents/consent-helpers";
import { captureSigningMetadata } from "@/lib/consents/capture-metadata";
import { getSubstanceAdditionTemplate } from "@/data/consents/substance-addition-templates";
import { supabase } from "@/integrations/supabase/client";
import { ConsentDocumentDisplay } from "@/components/consents/ConsentDocumentDisplay";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

export interface SubstanceAcknowledgmentCaptureProps {
  substanceId: string;
  patientId: string;
  patientName: string;
  parentConsentRecordId: string;
  variant?: "patient_remote" | "staff_witnessed";
  staffWitnessUserId?: string | null;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function SubstanceAcknowledgmentCapture({
  substanceId,
  patientId,
  patientName,
  parentConsentRecordId,
  variant = "patient_remote",
  staffWitnessUserId,
  onComplete,
  onCancel,
}: SubstanceAcknowledgmentCaptureProps) {
  const template = getSubstanceAdditionTemplate(substanceId);
  const [checked, setChecked] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!template) {
    return (
      <Alert variant="destructive">
        <AlertDescription>No acknowledgment template is configured for this substance.</AlertDescription>
      </Alert>
    );
  }

  const signingMethod =
    variant === "staff_witnessed" ? "patient_typed_name_in_clinic" : "patient_typed_name";

  const handleSubmit = async () => {
    const tn = typedName.trim();
    if (!checked || !tn) return;
    setSubmitting(true);
    setError(null);
    try {
      const metadata = await captureSigningMetadata();
      const hash = await hashConsentBody(template.body_markdown);
      const { error: insErr } = await supabase.from("substance_addition_acknowledgments").insert({
        patient_id: patientId,
        parent_consent_record_id: parentConsentRecordId,
        substance_id: template.substance_id,
        substance_display_name: template.display_name,
        substance_added_date: template.added_to_formulary_date,
        acknowledgment_body_markdown: template.body_markdown,
        acknowledgment_body_hash: hash,
        acknowledged_at: metadata.timestamp,
        signed_typed_name: tn,
        signing_method: signingMethod,
        staff_witness_user_id: variant === "staff_witnessed" ? staffWitnessUserId ?? null : null,
        capture_metadata: metadata as Json,
      });
      if (insErr) throw new Error(insErr.message);
      onComplete?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not save acknowledgment");
    } finally {
      setSubmitting(false);
    }
  };

  const typedOk = typedName.trim().length > 2 && typedName.trim().toLowerCase() === patientName.trim().toLowerCase();

  return (
    <div className="space-y-6">
      <ConsentDocumentDisplay bodyMarkdown={template.body_markdown} enforceScroll={false} />

      <div className="flex items-start gap-3 rounded-lg border border-border/60 p-4">
        <Checkbox id="substance-ack-check" checked={checked} onCheckedChange={(v) => setChecked(v === true)} />
        <Label htmlFor="substance-ack-check" className="text-sm leading-relaxed cursor-pointer">
          I acknowledge that {template.display_name} has been added to my treatment plan and that I understand the risks
          of research peptides as previously consented.
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="substance-typed-name">Type your full legal name</Label>
        <Input
          id="substance-typed-name"
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          placeholder={patientName}
          autoComplete="name"
        />
        {!typedOk && typedName.length > 0 && (
          <p className="text-xs text-destructive">Name must match our chart ({patientName}).</p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="button" onClick={() => void handleSubmit()} disabled={!checked || !typedOk || submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Sign acknowledgment"
          )}
        </Button>
      </div>
    </div>
  );
}
