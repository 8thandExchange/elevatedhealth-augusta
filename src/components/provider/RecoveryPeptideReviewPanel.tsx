/**
 * Staff / provider Recovery Peptide Review workflow panel.
 * Shows gates, catalog status, economics, and provider algorithms — never patient-facing dosing on public routes.
 */
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ShieldAlert } from "lucide-react";
import {
  catalogBySlug,
  type ClinicalCatalogStatus,
  type PublicCatalogStatus,
} from "@/lib/clinicalOptimizationCatalog";
import {
  evaluateRecoveryPeptideReview,
  recoveryCompoundItems,
  RECOVERY_PEPTIDE_STAFF_HANDOFF,
  type RecoveryPeptideSlug,
} from "@/lib/recoveryPeptideCareLane";
import { algorithmBySlug } from "@/lib/providerProtocolAlgorithms";
import { recoveryPeptideSupplyProfile } from "@/lib/supplyReadiness";

interface RecoveryPeptideReviewPanelProps {
  patientName?: string;
  /** Read-only hint from intake / chart */
  patientInterestNote?: string;
  compact?: boolean;
}

function statusBadge(publicStatus: PublicCatalogStatus, clinicalStatus: ClinicalCatalogStatus) {
  if (clinicalStatus === "inactive") return <Badge variant="destructive">Inactive</Badge>;
  if (clinicalStatus === "policy_review") return <Badge variant="secondary">Policy review</Badge>;
  if (publicStatus === "provider_only") return <Badge variant="outline">Provider-only</Badge>;
  if (publicStatus === "public") return <Badge className="bg-accent/20 text-accent-foreground">Active / public</Badge>;
  return <Badge variant="secondary">{publicStatus}</Badge>;
}

const RecoveryPeptideReviewPanel = ({
  patientName,
  patientInterestNote,
  compact = false,
}: RecoveryPeptideReviewPanelProps) => {
  const [gateState, setGateState] = useState({
    injuryRecoveryGoalDocumented: false,
    malignancyHistoryScreened: false,
    malignancyHistoryClear: true,
    pregnancyBreastfeedingScreened: false,
    pregnancyBreastfeedingClear: true,
    medicationHistoryReviewed: false,
    allergyReviewed: false,
    autoimmuneInflammatoryReviewed: false,
    anticoagulantBleedingRiskReviewed: false,
    researchPeptideConsentOnFile: false,
    providerSignedOff: false,
  });
  const [selectedCompound, setSelectedCompound] = useState<RecoveryPeptideSlug | "">("");

  const review = useMemo(
    () =>
      evaluateRecoveryPeptideReview({
        ...gateState,
        selectedCompound: selectedCompound || undefined,
      }),
    [gateState, selectedCompound],
  );

  const compounds = recoveryCompoundItems();
  const supply = recoveryPeptideSupplyProfile("Recovery peptide kit");

  return (
    <Card className="border-accent/30">
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className="font-jost text-base flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-accent" />
          Recovery Peptide Review
        </CardTitle>
        {patientName && (
          <p className="font-jost text-sm text-muted-foreground">
            Patient: {patientName}
            {patientInterestNote ? ` — ${patientInterestNote}` : ""}
          </p>
        )}
        <p className="font-jost text-xs text-muted-foreground">{RECOVERY_PEPTIDE_STAFF_HANDOFF}</p>
      </CardHeader>
      <CardContent className="space-y-4 font-jost text-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant={review.canProceedToQuote ? "default" : "secondary"}>
            Quote: {review.canProceedToQuote ? "Ready" : "Blocked"}
          </Badge>
          <Badge variant={review.canProceedToOrder ? "default" : "outline"}>
            Order: {review.canProceedToOrder ? "Ready" : "Needs sign-off / supply"}
          </Badge>
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          {(
            [
              ["injuryRecoveryGoalDocumented", "Recovery goal documented"],
              ["medicationHistoryReviewed", "Medication review"],
              ["allergyReviewed", "Allergy review"],
              ["malignancyHistoryScreened", "Malignancy screen done"],
              ["pregnancyBreastfeedingScreened", "Pregnancy/BF screen"],
              ["autoimmuneInflammatoryReviewed", "Autoimmune history (if relevant)"],
              ["anticoagulantBleedingRiskReviewed", "Bleeding risk (if relevant)"],
              ["researchPeptideConsentOnFile", "Research Peptide Consent"],
              ["providerSignedOff", "Provider signed protocol"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={key}
                checked={gateState[key]}
                onCheckedChange={(v) => setGateState((s) => ({ ...s, [key]: v === true }))}
              />
              <Label htmlFor={key} className="text-xs font-normal cursor-pointer">
                {label}
              </Label>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Compound under review (provider selection)</Label>
          <Select
            value={selectedCompound}
            onValueChange={(v) => setSelectedCompound(v as RecoveryPeptideSlug)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select after clinical review…" />
            </SelectTrigger>
            <SelectContent>
              {compounds.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-sm border border-border/60 divide-y divide-border/60">
          {compounds.map((c) => (
            <div key={c.slug} className="flex flex-wrap items-center justify-between gap-2 p-2 text-xs">
              <span>{c.display_name}</span>
              {statusBadge(c.public_status, c.clinical_status)}
            </div>
          ))}
        </div>

        {review.economics && (
          <div className="rounded-sm bg-muted/40 p-3 text-xs space-y-1">
            <p className="font-medium">Margin view (staff only)</p>
            <p>
              Patient ${((review.economics.patientPriceCents ?? 0) / 100).toFixed(0)} · Member $
              {((review.economics.memberPriceCents ?? 0) / 100).toFixed(0)} · COGS $
              {((review.economics.clinicCostCents ?? 0) / 100).toFixed(2)}
            </p>
            {review.economics.marginPercent != null && (
              <p>Margin {review.economics.marginPercent}%</p>
            )}
            {review.economics.warnings.map((w) => (
              <p key={w} className="text-amber-700">
                {w}
              </p>
            ))}
          </div>
        )}

        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between font-jost">
              Provider algorithms (internal)
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2 text-xs text-muted-foreground">
            {compounds.map((c) => {
              const slug = c.provider_algorithm?.protocolSlug;
              const algo = slug ? algorithmBySlug(slug) : undefined;
              if (!algo) return null;
              return (
                <div key={c.slug} className="border border-border/50 rounded-sm p-3 space-y-1">
                  <p className="font-medium text-foreground">{algo.displayName}</p>
                  {algo.candidateGoals?.length ? (
                    <p>Goals: {algo.candidateGoals.join("; ")}</p>
                  ) : null}
                  <p>Start: {algo.startDose}</p>
                  <p>Cycle: {algo.cycleLength ?? "Per protocol"}</p>
                  <p>Follow-up: {algo.followUpInterval}</p>
                  {algo.contraindications?.length ? (
                    <p>Contraindications: {algo.contraindications.join("; ")}</p>
                  ) : null}
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        <div className="rounded-sm border border-border/60 p-3 text-xs">
          <p className="font-medium mb-1">Patient handoff (safe to share)</p>
          <p className="text-muted-foreground">{review.patientHandoff}</p>
        </div>

        {!compact && (
          <p className="text-xs text-muted-foreground">
            Supply checklist ({supply.checklist.length} items):{" "}
            {supply.checklist
              .filter((i) => i.required)
              .map((i) => i.label)
              .join(" · ")}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecoveryPeptideReviewPanel;
