import { useCallback, useEffect, useState } from "react";
import { ALL_CONSENTS, TIER_1_CONSENTS } from "@/data/consents";
import type { ConsentType, ConsentVersion } from "@/data/consents/types";
import { ConsentSigningFlow } from "./ConsentSigningFlow";
import { DobVerification } from "./DobVerification";
import { StaffOverrideModal } from "./StaffOverrideModal";
import { supabase } from "@/integrations/supabase/client";
import {
  getTier1ResumeStepIndex,
  resolveIntakeSessionId,
} from "@/lib/consents/intake-status";
import { SERVABLE_LEGAL_REVIEW_STATUS } from "@/lib/consents/consent-catalog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";

export interface Tier1IntakeBundleProps {
  patientId: string;
  patientName: string;
  patientDateOfBirth: string;
  mode: "authenticated" | "kiosk";
  staffWitnessUserId?: string;
  staffDisplayName?: string;
  staffTitle?: string;
  onAllConsentsComplete: (sessionId: string, recordIds: string[]) => void;
  onAbort?: () => void;
}

type Phase = "loading" | "dob" | "consent" | "complete" | "dob_locked";

export function Tier1IntakeBundle({
  patientId,
  patientName,
  patientDateOfBirth,
  mode,
  staffWitnessUserId,
  staffDisplayName = "Staff",
  staffTitle = "RN",
  onAllConsentsComplete,
  onAbort,
}: Tier1IntakeBundleProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [sessionId, setSessionId] = useState<string>("");
  const [consentStepIndex, setConsentStepIndex] = useState(0);
  const [signedRecordIds, setSignedRecordIds] = useState<string[]>([]);
  const [versions, setVersions] = useState<Partial<Record<ConsentType, ConsentVersion>>>({});
  const [overrideOpen, setOverrideOpen] = useState(false);
  const kioskMode = mode === "kiosk";

  const currentConsentType = TIER_1_CONSENTS[consentStepIndex];
  const currentDoc = currentConsentType ? ALL_CONSENTS[currentConsentType] : null;
  const currentVersion = currentConsentType ? versions[currentConsentType] : null;

  const initBundle = useCallback(async () => {
    const [resumeIdx, sid] = await Promise.all([
      getTier1ResumeStepIndex(patientId),
      resolveIntakeSessionId(patientId),
    ]);

    setSessionId(sid);

    const versionMap: Partial<Record<ConsentType, ConsentVersion>> = {};
    for (const type of TIER_1_CONSENTS) {
      const { data } = await supabase
        .from("consent_versions")
        .select("*")
        .eq("consent_type", type)
        .eq("is_active", true)
        .eq("legal_review_status", SERVABLE_LEGAL_REVIEW_STATUS)
        .order("effective_from", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) versionMap[type] = data;
    }
    setVersions(versionMap);

    if (resumeIdx >= TIER_1_CONSENTS.length) {
      setPhase("complete");
      return;
    }

    setConsentStepIndex(resumeIdx);
    // Portal patients are already authenticated — skip redundant DOB re-entry.
    setPhase(mode === "authenticated" ? "consent" : "dob");
  }, [patientId, mode, onAllConsentsComplete]);

  useEffect(() => {
    initBundle();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once per patient
  }, [patientId]);

  const handleConsentSigned = (recordId: string) => {
    const nextIds = [...signedRecordIds, recordId];
    setSignedRecordIds(nextIds);

    const nextIndex = consentStepIndex + 1;
    if (nextIndex >= TIER_1_CONSENTS.length) {
      setPhase("complete");
      onAllConsentsComplete(sessionId, nextIds);
    } else {
      setConsentStepIndex(nextIndex);
    }
  };

  const progressPercent = ((consentStepIndex + (phase === "consent" ? 1 : 0)) / TIER_1_CONSENTS.length) * 100;
  const stepLabel = currentDoc?.title ?? "Consent";

  if (phase === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-12 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
        <h2 className={`font-playfair font-light ${kioskMode ? "text-3xl" : "text-2xl"}`}>
          All required consents signed. Thank you.
        </h2>
        {kioskMode && (
          <p className="text-lg text-muted-foreground">
            Please hand the iPad back to staff when you are finished.
          </p>
        )}
      </div>
    );
  }

  if (phase === "dob_locked") {
    return (
      <div className="mx-auto max-w-md space-y-4 py-8 text-center">
        <Alert variant="destructive">
          <AlertDescription>
            Too many incorrect date-of-birth attempts. Please request staff assistance.
          </AlertDescription>
        </Alert>
        {onAbort && (
          <Button variant="outline" onClick={onAbort}>
            Return
          </Button>
        )}
      </div>
    );
  }

  if (phase === "dob") {
    return (
      <div className="space-y-8">
        {kioskMode && (
          <p className="text-center text-lg font-medium text-foreground">
            Signing for: <span className="font-semibold">{patientName}</span>
          </p>
        )}
        <DobVerification
          expectedDob={patientDateOfBirth}
          kioskMode={kioskMode}
          onVerified={() => setPhase("consent")}
          onLocked={() => setPhase("dob_locked")}
        />
      </div>
    );
  }

  if (!currentDoc || !currentVersion || !currentConsentType) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Unable to load consent document. Please contact staff.</AlertDescription>
      </Alert>
    );
  }

  const signingMethod =
    mode === "kiosk" ? "patient_typed_name_in_clinic" : "patient_typed_name";

  return (
    <div className={`space-y-6 ${kioskMode ? "px-2 pb-8" : ""}`}>
      {kioskMode && (
        <p className="rounded-lg border border-accent/30 bg-muted/50 px-4 py-3 text-center text-lg font-medium">
          Signing for: <span className="font-semibold">{patientName}</span>
        </p>
      )}

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Step {consentStepIndex + 1} of {TIER_1_CONSENTS.length}: {stepLabel}
        </p>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {consentStepIndex > 0 && (
        <p className="text-sm text-muted-foreground">
          Resuming your intake — {consentStepIndex} consent
          {consentStepIndex === 1 ? "" : "s"} already on file from this session.
        </p>
      )}

      {(mode === "kiosk" || staffWitnessUserId) && (
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
        key={currentConsentType}
        consentDocument={currentDoc}
        consentVersionId={currentVersion.id}
        patientId={patientId}
        patientName={patientName}
        signingSessionId={sessionId}
        signingMethod={signingMethod}
        staffWitnessUserId={staffWitnessUserId}
        onSigningComplete={(record) => handleConsentSigned(record.id)}
        onCancel={onAbort}
      />

      {staffWitnessUserId && (
        <StaffOverrideModal
          open={overrideOpen}
          consentDocument={currentDoc}
          consentVersionId={currentVersion.id}
          patientId={patientId}
          patientName={patientName}
          staffUserId={staffWitnessUserId}
          staffDisplayName={staffDisplayName}
          staffTitle={staffTitle}
          signingSessionId={sessionId}
          onOverrideComplete={(recordId) => {
            setOverrideOpen(false);
            handleConsentSigned(recordId);
          }}
          onCancel={() => setOverrideOpen(false)}
        />
      )}
    </div>
  );
}
