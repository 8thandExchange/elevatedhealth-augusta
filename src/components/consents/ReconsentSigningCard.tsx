import { useCallback, useEffect, useMemo, useState } from "react";
import { ALL_CONSENTS } from "@/data/consents";
import type { ConsentDocument, ConsentType, ConsentVersion } from "@/data/consents/types";
import { supabase } from "@/integrations/supabase/client";
import { ConsentSigningFlow } from "@/components/consents/ConsentSigningFlow";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ReconsentSigningCardProps {
  requestId: string;
  patientId: string;
  patientName: string;
  /** Remote signing vs witnessed clinic signing */
  variant?: "patient_remote" | "staff_witnessed";
  staffWitnessUserId?: string | null;
  onComplete?: () => void;
  onCancel?: () => void;
}

export function ReconsentSigningCard({
  requestId,
  patientId,
  patientName,
  variant = "patient_remote",
  staffWitnessUserId,
  onComplete,
  onCancel,
}: ReconsentSigningCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doc, setDoc] = useState<ConsentDocument | null>(null);
  const [version, setVersion] = useState<ConsentVersion | null>(null);
  const [consentType, setConsentType] = useState<ConsentType | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: reqRow, error: reqErr } = await supabase
        .from("consent_reconsent_requests")
        .select("id, patient_id, consent_type, fulfilled_at, new_version_id")
        .eq("id", requestId)
        .maybeSingle();

      if (reqErr || !reqRow) throw new Error(reqErr?.message ?? "Re-consent request not found");
      if (reqRow.patient_id !== patientId) throw new Error("This request is not for the signed-in patient.");
      if (reqRow.fulfilled_at) throw new Error("This re-consent request is already complete.");

      const ct = reqRow.consent_type as ConsentType;
      const base = ALL_CONSENTS[ct];
      if (!base) throw new Error("Unknown consent type.");

      const { data: vRow, error: vErr } = await supabase
        .from("consent_versions")
        .select("*")
        .eq("id", reqRow.new_version_id as string)
        .maybeSingle();

      if (vErr || !vRow) throw new Error(vErr?.message ?? "Consent version not found.");

      const merged: ConsentDocument = {
        ...base,
        title: vRow.title,
        version_label: vRow.version_label,
        body_markdown: vRow.body_markdown,
        effective_from: vRow.effective_from,
      };

      setConsentType(ct);
      setDoc(merged);
      setVersion(vRow as ConsentVersion);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load re-consent");
      setDoc(null);
      setVersion(null);
    } finally {
      setLoading(false);
    }
  }, [requestId, patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  const signingMethod = useMemo(() => {
    return variant === "staff_witnessed" ? "patient_typed_name_in_clinic" : "patient_typed_name";
  }, [variant]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !doc || !version || !consentType) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error ?? "Unable to load consent."}</AlertDescription>
      </Alert>
    );
  }

  return (
    <ConsentSigningFlow
      consentDocument={doc}
      consentVersionId={version.id}
      patientId={patientId}
      patientName={patientName}
      signingMethod={signingMethod}
      staffWitnessUserId={variant === "staff_witnessed" ? staffWitnessUserId ?? undefined : undefined}
      onSigningComplete={async (record) => {
        const { error: upErr } = await supabase
          .from("consent_reconsent_requests")
          .update({
            fulfilled_at: new Date().toISOString(),
            fulfilled_consent_record_id: record.id,
          })
          .eq("id", requestId)
          .eq("patient_id", patientId);

        if (upErr) throw new Error(upErr.message);
        onComplete?.();
      }}
      onCancel={onCancel}
    />
  );
}
