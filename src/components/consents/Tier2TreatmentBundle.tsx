import { useEffect, useMemo, useState } from "react";
import { ALL_CONSENTS } from "@/data/consents";
import type { ConsentType, ConsentVersion } from "@/data/consents/types";
import { ConsentSigningFlow } from "./ConsentSigningFlow";
import { StaffOverrideModal } from "./StaffOverrideModal";
import { supabase } from "@/integrations/supabase/client";
import { resolveIntakeSessionId } from "@/lib/consents/intake-status";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";

export interface Tier2TreatmentBundleProps {
  patientId: string;
  patientName: string;
  /** Tier 2 consent types to capture (deduped order preserved). */
  consentTypes: ConsentType[];
  signingSessionId?: string;
  variant: "patient_remote" | "staff_witnessed";
  staffWitnessUserId?: string | null;
  staffDisplayName?: string;
  staffTitle?: string;
  onComplete: () => void | Promise<void>;
  onCancel?: () => void;
}

type Phase = "loading" | "consent" | "complete";

export function Tier2TreatmentBundle({
  patientId,
  patientName,
  consentTypes,
  signingSessionId: signingSessionIdProp,
  variant,
  staffWitnessUserId,
  staffDisplayName = "Staff",
  staffTitle = "Clinical staff",
  onComplete,
  onCancel,
}: Tier2TreatmentBundleProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [sessionId, setSessionId] = useState<string>("");
  const [stepIndex, setStepIndex] = useState(0);
  const [versions, setVersions] = useState<Partial<Record<ConsentType, ConsentVersion>>>({});
  const [overrideOpen, setOverrideOpen] = useState(false);

  const orderedTypes = useMemo(() => {
    const seen = new Set<ConsentType>();
    const out: ConsentType[] = [];
    for (const t of consentTypes) {
      if (!seen.has(t) && ALL_CONSENTS[t]) {
        seen.add(t);
        out.push(t);
      }
    }
    return out;
  }, [consentTypes]);

  const currentType = orderedTypes[stepIndex];
  const currentDoc = currentType ? ALL_CONSENTS[currentType] : null;
  const currentVersion = currentType ? versions[currentType] : null;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (orderedTypes.length === 0) {
        setPhase("consent");
        setVersions({});
        return;
      }

      setPhase("loading");
      const sid = signingSessionIdProp ?? (await resolveIntakeSessionId(patientId));
      if (cancelled) return;
      setSessionId(sid);

      const versionMap: Partial<Record<ConsentType, ConsentVersion>> = {};
      for (const type of orderedTypes) {
        const { data } = await supabase
          .from("consent_versions")
          .select("*")
          .eq("consent_type", type)
          .eq("is_active", true)
          .eq("legal_review_status", "approved")
          .order("effective_from", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) versionMap[type] = data;
      }
      if (cancelled) return;
      setVersions(versionMap);
      setStepIndex(0);
      setPhase("consent");
    })();

    return () => {
      cancelled = true;
    };
  }, [patientId, signingSessionIdProp, orderedTypes]);

  const handleConsentSigned = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex >= orderedTypes.length) {
      setPhase("complete");
      void Promise.resolve(onComplete());
    } else {
      setStepIndex(nextIndex);
    }
  };

  const progressPercent = ((stepIndex + (phase === "consent" ? 1 : 0)) / orderedTypes.length) * 100;
  const stepLabel = currentDoc?.title ?? "Consent";

  const signingMethod =
    variant === "staff_witnessed" ? "patient_typed_name_in_clinic" : "patient_typed_name";
  const witnessId = variant === "staff_witnessed" ? staffWitnessUserId ?? undefined : undefined;

  if (phase === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
        <h2 className="font-playfair text-2xl font-light text-foreground">Treatment consents saved</h2>
        {variant === "staff_witnessed" && (
          <p className="text-muted-foreground">You can close this window and continue prescribing.</p>
        )}
      </div>
    );
  }

  if (orderedTypes.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertDescription>No treatment consents were requested. You can close this window.</AlertDescription>
      </Alert>
    );
  }

  if (!currentDoc || !currentVersion || !currentType) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Unable to load consent documents. Please contact support.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {variant === "staff_witnessed" && (
        <p className="rounded-lg border border-accent/30 bg-muted/50 px-4 py-3 text-center text-sm font-medium">
          In-clinic signing for <span className="font-semibold">{patientName}</span>
        </p>
      )}

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Step {stepIndex + 1} of {orderedTypes.length}: {stepLabel}
        </p>
        <Progress value={Number.isFinite(progressPercent) ? progressPercent : 0} className="h-2" />
      </div>

      {witnessId && (
        <Button
          type="button"
          variant="outline"
          className="border-amber-500/50 text-amber-900 dark:text-amber-100"
          onClick={() => setOverrideOpen(true)}
        >
          Patient cannot self-sign — log verbal consent
        </Button>
      )}

      <ConsentSigningFlow
        key={currentType}
        consentDocument={currentDoc}
        consentVersionId={currentVersion.id}
        patientId={patientId}
        patientName={patientName}
        signingSessionId={sessionId}
        signingMethod={signingMethod}
        staffWitnessUserId={witnessId}
        onSigningComplete={() => handleConsentSigned()}
        onCancel={onCancel}
      />

      {witnessId && (
        <StaffOverrideModal
          open={overrideOpen}
          consentDocument={currentDoc}
          consentVersionId={currentVersion.id}
          patientId={patientId}
          patientName={patientName}
          staffUserId={witnessId}
          staffDisplayName={staffDisplayName}
          staffTitle={staffTitle}
          signingSessionId={sessionId}
          onOverrideComplete={() => {
            setOverrideOpen(false);
            handleConsentSigned();
          }}
          onCancel={() => setOverrideOpen(false)}
        />
      )}
    </div>
  );
}
