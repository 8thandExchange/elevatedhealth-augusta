import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ConsentGateResult } from "@/lib/consents/consent-gate";
import { consentTypeDisplayName } from "@/data/consents/medication-consent-mapping";
import type { ConsentType } from "@/data/consents/types";
import { Tier2TreatmentBundle } from "./Tier2TreatmentBundle";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface ConsentGatePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gateResult: ConsentGateResult;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string | null;
  staffWitnessUserId: string | null;
  staffDisplayName?: string;
  onGateRecheck: () => Promise<ConsentGateResult>;
  onGateResultUpdated: (next: ConsentGateResult) => void;
  /** Allowed path — run the prescription action */
  onGateCleared: () => void;
  onConsentRequestSent: () => void;
  onCancel: () => void;
}

function consentTypesToSign(result: ConsentGateResult): ConsentType[] {
  const set = new Set<ConsentType>();
  for (const t of result.missingConsents) set.add(t);
  for (const t of result.expiredConsents) set.add(t);
  return Array.from(set);
}

export function ConsentGatePanel({
  open,
  onOpenChange,
  gateResult,
  patientId,
  patientName,
  patientEmail,
  patientPhone,
  staffWitnessUserId,
  staffDisplayName = "Clinical staff",
  onGateRecheck,
  onGateResultUpdated,
  onGateCleared,
  onConsentRequestSent,
  onCancel,
}: ConsentGatePanelProps) {
  const [signingOpen, setSigningOpen] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);

  const blockedTypes = consentTypesToSign(gateResult);
  const warnOnly =
    gateResult.allowed && gateResult.expiringSoonConsents.length > 0 && blockedTypes.length === 0;

  const handleSendConsentRequest = async () => {
    if (blockedTypes.length === 0) return;

    const channels: ("email" | "sms")[] = [];
    if (patientEmail) channels.push("email");
    if (patientPhone) channels.push("sms");
    if (channels.length === 0) {
      toast.error("Patient needs an email or phone on file to receive the consent link.");
      return;
    }

    setSendingLink(true);
    try {
      const { data: created, error: createError } = await supabase.functions.invoke(
        "create-intake-magic-link",
        {
          body: {
            patient_id: patientId,
            pending_consent_types: blockedTypes,
          },
        },
      );

      if (createError || !created?.token) {
        throw new Error(createError?.message ?? created?.error ?? "Failed to create consent link");
      }

      const { data: sendData, error: sendError } = await supabase.functions.invoke("send-intake-magic-link", {
        body: {
          patient_id: patientId,
          magic_link_token: created.token,
          context: "tier2_consent_request",
          consent_types: blockedTypes,
          channels,
        },
      });

      if (sendError) throw sendError;

      if (!sendData?.success) {
        const skipped = (sendData?.skipped_channels as { channel: string; reason: string }[]) ?? [];
        const reasons = skipped.map((s) => `${s.channel}: ${s.reason}`).join("; ");
        throw new Error(reasons || "No messages were delivered");
      }

      toast.success(
        `Consent link sent via ${(sendData.delivered_channels as string[]).join(" and ")}. Complete the prescription after the patient signs.`,
      );
      onConsentRequestSent();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send consent link");
    } finally {
      setSendingLink(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl font-light">
              {warnOnly ? "Consent renewal reminder" : "Consent required before prescribing"}
            </DialogTitle>
          </DialogHeader>

          {warnOnly && (
            <Alert className="border-amber-500/40 bg-amber-500/5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle>Renew soon</AlertTitle>
              <AlertDescription>
                Prescribing is allowed during the renewal window, but the patient should re-sign before these
                dates:
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {gateResult.expiringSoonConsents.map((e) => (
                    <li key={`${e.consent_type}-${e.expires_at}`}>
                      {consentTypeDisplayName(e.consent_type)} — {e.days_remaining} day
                      {e.days_remaining === 1 ? "" : "s"} remaining
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {!gateResult.allowed && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The following Tier 2 consent(s) are missing or are past the renewal grace period:
              </p>
              <ul className="space-y-2 text-sm">
                {gateResult.blockedConsentDetails.map((d) => (
                  <li
                    key={`${d.consent_type}-${d.status}`}
                    className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2"
                  >
                    <span className="font-medium text-foreground">{consentTypeDisplayName(d.consent_type)}</span>
                    {" — "}
                    {d.status === "missing" ? (
                      <span>Never signed</span>
                    ) : (
                      <span>
                        Expired{d.days_ago != null ? ` ${d.days_ago} day${d.days_ago === 1 ? "" : "s"} ago` : ""}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!gateResult.allowed && gateResult.inGraceConsents.length > 0 && (
            <Alert>
              <AlertTitle className="text-sm">Grace coverage active</AlertTitle>
              <AlertDescription className="text-xs">
                Some required consents are expired but still within the 30-day prescribing grace window:
                {" "}
                {gateResult.inGraceConsents.map((t) => consentTypeDisplayName(t)).join(", ")}.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            {warnOnly && (
              <>
                <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="button" className="w-full" onClick={onGateCleared}>
                  Proceed with prescription
                </Button>
              </>
            )}

            {!gateResult.allowed && (
              <>
                <Button
                  type="button"
                  variant="default"
                  className="w-full"
                  disabled={!staffWitnessUserId || blockedTypes.length === 0}
                  onClick={() => setSigningOpen(true)}
                >
                  Have patient sign now
                </Button>
                {!staffWitnessUserId && (
                  <p className="text-xs text-muted-foreground">
                    Sign-in session missing staff context — use Send consent request instead.
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={sendingLink || blockedTypes.length === 0}
                  onClick={() => void handleSendConsentRequest()}
                >
                  {sendingLink ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send consent request"
                  )}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>
                  Cancel
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={signingOpen} onOpenChange={setSigningOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl font-light">Treatment consent signing</DialogTitle>
          </DialogHeader>
          {signingOpen && blockedTypes.length > 0 && staffWitnessUserId && (
            <Tier2TreatmentBundle
              patientId={patientId}
              patientName={patientName}
              consentTypes={blockedTypes}
              variant="staff_witnessed"
              staffWitnessUserId={staffWitnessUserId}
              staffDisplayName={staffDisplayName}
              onComplete={async () => {
                try {
                  const fresh = await onGateRecheck();
                  onGateResultUpdated(fresh);
                  setSigningOpen(false);
                  if (fresh.allowed) {
                    onOpenChange(false);
                    onGateCleared();
                  } else {
                    toast.error("Consent still incomplete — finish remaining signatures or send a request link.");
                  }
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not verify consent status");
                }
              }}
              onCancel={() => setSigningOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
