import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ConsentGateResult } from "@/lib/consents/consent-gate";
import { consentTypeDisplayName } from "@/data/consents/medication-consent-mapping";
import type { ConsentType } from "@/data/consents/types";
import { Tier2TreatmentBundle } from "./Tier2TreatmentBundle";
import { SubstanceAcknowledgmentCapture } from "./SubstanceAcknowledgmentCapture";
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

function expiringSoonDescription(e: ConsentGateResult["expiringSoonConsents"][0]): string {
  const name = consentTypeDisplayName(e.consent_type);
  if (e.reason === "reconsent_deadline") {
    return `${name} requires re-signature in ${e.days_remaining} day${e.days_remaining === 1 ? "" : "s"} (updated version published)`;
  }
  if (e.reason === "calendar_grace") {
    return `${name} renewal grace ends in ${e.days_remaining} day${e.days_remaining === 1 ? "" : "s"}`;
  }
  return `${name} expires in ${e.days_remaining} day${e.days_remaining === 1 ? "" : "s"}`;
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
  const [substanceSigningOpen, setSubstanceSigningOpen] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [sendingSubstanceLink, setSendingSubstanceLink] = useState(false);
  const [sendingReconsentLink, setSendingReconsentLink] = useState(false);

  const blockedTypes = consentTypesToSign(gateResult);
  const substanceGate = gateResult.substanceAcknowledgmentRequired;

  const reconsentOverdueTypes = new Set(
    gateResult.blockedConsentDetails.filter((d) => d.status === "reconsent_overdue").map((d) => d.consent_type),
  );
  const tier2MagicLinkTypes = blockedTypes.filter((t) => !reconsentOverdueTypes.has(t));

  const tier2Block = !gateResult.allowed && blockedTypes.length > 0;
  const substanceOnlyBlock =
    !gateResult.allowed &&
    substanceGate &&
    !substanceGate.requires_full_reconsent &&
    blockedTypes.length === 0;

  const substanceAddon =
    !gateResult.allowed && substanceGate && !substanceGate.requires_full_reconsent && tier2Block;

  const warnOnly =
    gateResult.allowed &&
    gateResult.expiringSoonConsents.length > 0 &&
    blockedTypes.length === 0;

  const channelsForPatient = (): ("email" | "sms")[] => {
    const channels: ("email" | "sms")[] = [];
    if (patientEmail) channels.push("email");
    if (patientPhone) channels.push("sms");
    return channels;
  };

  const handleSendConsentRequest = async () => {
    if (tier2MagicLinkTypes.length === 0) return;

    const channels = channelsForPatient();
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
            pending_consent_types: tier2MagicLinkTypes,
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
          consent_types: tier2MagicLinkTypes,
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

  const handleSendReconsentLinks = async () => {
    if (reconsentOverdueTypes.size === 0) return;

    const channels = channelsForPatient();
    if (channels.length === 0) {
      toast.error("Patient needs an email or phone on file to receive the consent link.");
      return;
    }

    setSendingReconsentLink(true);
    try {
      let deliveredAny = false;
      for (const ct of reconsentOverdueTypes) {
        const { data: reqRow, error: reqErr } = await supabase
          .from("consent_reconsent_requests")
          .select("id")
          .eq("patient_id", patientId)
          .eq("consent_type", ct)
          .is("fulfilled_at", null)
          .order("triggered_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (reqErr) throw new Error(reqErr.message);
        if (!reqRow?.id) {
          toast.error(`No active re-consent request found for ${consentTypeDisplayName(ct)}.`);
          continue;
        }

        const { data: created, error: createError } = await supabase.functions.invoke(
          "create-intake-magic-link",
          {
            body: {
              patient_id: patientId,
              pending_consent_types: [ct],
              pending_reconsent_request_id: reqRow.id,
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
            context: "reconsent_request",
            consent_types: [ct],
            channels,
          },
        });

        if (sendError) throw sendError;
        if (!sendData?.success) {
          const skipped = (sendData?.skipped_channels as { channel: string; reason: string }[]) ?? [];
          const reasons = skipped.map((s) => `${s.channel}: ${s.reason}`).join("; ");
          throw new Error(reasons || "No messages were delivered");
        }
        deliveredAny = true;
      }

      if (deliveredAny) {
        toast.success("Updated consent link sent. The patient should open their email or text to re-sign.");
        onConsentRequestSent();
        onOpenChange(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send updated consent link");
    } finally {
      setSendingReconsentLink(false);
    }
  };

  const handleSendSubstanceAcknowledgmentRequest = async () => {
    if (!substanceGate || substanceGate.requires_full_reconsent) return;

    const channels = channelsForPatient();
    if (channels.length === 0) {
      toast.error("Patient needs an email or phone on file to receive the acknowledgment link.");
      return;
    }

    setSendingSubstanceLink(true);
    try {
      const { data: created, error: createError } = await supabase.functions.invoke(
        "create-intake-magic-link",
        {
          body: {
            patient_id: patientId,
            pending_substance_id: substanceGate.substance_id,
          },
        },
      );

      if (createError || !created?.token) {
        throw new Error(createError?.message ?? created?.error ?? "Failed to create acknowledgment link");
      }

      const { data: sendData, error: sendError } = await supabase.functions.invoke("send-intake-magic-link", {
        body: {
          patient_id: patientId,
          magic_link_token: created.token,
          context: "substance_acknowledgment_request",
          substance_label: substanceGate.display_name,
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
        `Acknowledgment link sent via ${(sendData.delivered_channels as string[]).join(" and ")}.`,
      );
      onConsentRequestSent();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send acknowledgment link");
    } finally {
      setSendingSubstanceLink(false);
    }
  };

  const blockedDetailLabel = (
    d: ConsentGateResult["blockedConsentDetails"][0],
  ): { title: string; detail: string } => {
    const title = consentTypeDisplayName(d.consent_type);
    if (d.status === "missing") return { title, detail: "Never signed" };
    if (d.status === "reconsent_overdue") return { title, detail: "Re-signature required (grace period ended)" };
    return {
      title,
      detail: `Expired${d.days_ago != null ? ` ${d.days_ago} day${d.days_ago === 1 ? "" : "s"} ago` : ""}`,
    };
  };

  const substancePrimary =
    substanceOnlyBlock || substanceAddon ? substanceGate && !substanceGate.requires_full_reconsent : false;

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
                Prescribing is allowed during the renewal window, but the patient should complete these items:
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {gateResult.expiringSoonConsents.map((e) => (
                    <li key={`${e.consent_type}-${e.expires_at}-${e.reason}`}>{expiringSoonDescription(e)}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {substancePrimary && substanceGate && (
            <Alert variant="destructive" className="border-destructive/40">
              <AlertTitle>Patient acknowledgment required</AlertTitle>
              <AlertDescription className="text-sm">
                Your patient has a current Research Peptide consent, but{" "}
                <span className="font-medium text-foreground">{substanceGate.display_name}</span> was added to our
                formulary after they signed. A brief acknowledgment is required before prescribing this substance.
              </AlertDescription>
            </Alert>
          )}

          {tier2Block && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The following Tier 2 consent(s) are missing, expired, or require re-signature after the updated-consent
                grace window:
              </p>
              <ul className="space-y-2 text-sm">
                {gateResult.blockedConsentDetails.map((d) => {
                  const { title, detail } = blockedDetailLabel(d);
                  return (
                    <li
                      key={`${d.consent_type}-${d.status}-${d.reconsent_request_id ?? ""}`}
                      className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2"
                    >
                      <span className="font-medium text-foreground">{title}</span>
                      {" — "}
                      <span>{detail}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {substanceGate?.requires_full_reconsent && (
            <Alert variant="destructive">
              <AlertTitle>Full Research Peptide consent required</AlertTitle>
              <AlertDescription className="text-xs">
                {substanceGate.display_name} requires a full Research Peptide re-consent before prescribing — standard
                acknowledgment is not sufficient for this formulary entry.
              </AlertDescription>
            </Alert>
          )}

          {!gateResult.allowed && gateResult.inGraceConsents.length > 0 && (
            <Alert>
              <AlertTitle className="text-sm">Grace coverage active</AlertTitle>
              <AlertDescription className="text-xs">
                Some required consents are expired but still within the 30-day prescribing grace window:{" "}
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

            {!gateResult.allowed && substancePrimary && substanceGate && (
              <>
                <Button
                  type="button"
                  variant="default"
                  className="w-full"
                  disabled={!staffWitnessUserId}
                  onClick={() => setSubstanceSigningOpen(true)}
                >
                  Have patient acknowledge now
                </Button>
                {!staffWitnessUserId && (
                  <p className="text-xs text-muted-foreground">
                    Sign-in session missing staff context — use Send acknowledgment request instead.
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={sendingSubstanceLink}
                  onClick={() => void handleSendSubstanceAcknowledgmentRequest()}
                >
                  {sendingSubstanceLink ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send acknowledgment request"
                  )}
                </Button>
                {!tier2Block && (
                  <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
              </>
            )}

            {tier2Block && (
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
                {reconsentOverdueTypes.size > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled={sendingReconsentLink}
                    onClick={() => void handleSendReconsentLinks()}
                  >
                    {sendingReconsentLink ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Send updated consent link"
                    )}
                  </Button>
                )}
                {tier2MagicLinkTypes.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={sendingLink}
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
                )}
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
                  } else if (
                    fresh.substanceAcknowledgmentRequired &&
                    !fresh.substanceAcknowledgmentRequired.requires_full_reconsent
                  ) {
                    toast.message("Treatment consents updated — complete the formulary acknowledgment to prescribe.");
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

      <Dialog open={substanceSigningOpen} onOpenChange={setSubstanceSigningOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl font-light">Substance acknowledgment</DialogTitle>
          </DialogHeader>
          {substanceSigningOpen && substanceGate && !substanceGate.requires_full_reconsent && staffWitnessUserId && substanceGate.parent_consent_record_id && (
            <SubstanceAcknowledgmentCapture
              substanceId={substanceGate.substance_id}
              patientId={patientId}
              patientName={patientName}
              parentConsentRecordId={substanceGate.parent_consent_record_id}
              variant="staff_witnessed"
              staffWitnessUserId={staffWitnessUserId}
              onComplete={async () => {
                try {
                  const fresh = await onGateRecheck();
                  onGateResultUpdated(fresh);
                  setSubstanceSigningOpen(false);
                  if (fresh.allowed) {
                    onOpenChange(false);
                    onGateCleared();
                  } else {
                    toast.error("Consent gate still blocking — check remaining items.");
                  }
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not verify acknowledgment");
                }
              }}
              onCancel={() => setSubstanceSigningOpen(false)}
            />
          )}
          {substanceSigningOpen && substanceGate && !substanceGate.parent_consent_record_id && (
            <p className="text-sm text-destructive">
              Missing parent consent record linkage — refresh the patient chart or send an acknowledgment link instead.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
