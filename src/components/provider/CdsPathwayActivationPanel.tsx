import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import {
  evaluateCandidate,
  type CdsCandidateInput,
  type GateState,
  type RegulatoryStatus,
} from "@/lib/cdsEngine";
import {
  GATE_STATE_LABELS,
  REGULATORY_STATUS_LABELS,
  gateBadgeClassName,
  regulatoryBadgeClassName,
} from "@/lib/cdsUiHelpers";

/** Policy / audit rows that must not be prescriber-activated. */
export const CDS_CANDIDATE_ACTIVATION_BLOCKLIST = new Set([
  "policy_ketamine",
  "policy_retatrutide_ala_carte",
]);

interface PathwayRow {
  id: string;
  slug: string;
  name: string;
  goal_key: string;
  active: boolean;
  signed_off_by: string | null;
  signed_off_at: string | null;
  is_sample: boolean;
}

interface CandidateRow {
  id: string;
  pathway_id: string | null;
  candidate_key: string;
  display_name: string;
  regulatory_status: RegulatoryStatus;
  requires_labs: boolean;
  required_lab_slugs: string[];
  required_consent_types: string[];
  rank_weight: number;
  clinical_rationale: string | null;
  active: boolean;
  signed_off_by: string | null;
  signed_off_at: string | null;
  is_sample: boolean;
  contraindication_tags?: string[];
}

function previewGateState(row: CandidateRow): GateState {
  const input: CdsCandidateInput = {
    id: row.id,
    pathway_id: row.pathway_id,
    candidate_key: row.candidate_key,
    display_name: row.display_name,
    regulatory_status: row.regulatory_status,
    requires_labs: row.requires_labs,
    required_lab_slugs: row.required_lab_slugs,
    required_consent_types: row.required_consent_types,
    rank_weight: row.rank_weight,
    is_sample: row.is_sample,
    active: row.active,
    contraindication_tags: row.contraindication_tags ?? [],
  };

  return evaluateCandidate(input, {
    hasResultedLabs: true,
    validConsentTypes: row.required_consent_types,
    substanceAcknowledgmentIds: [row.candidate_key],
  }).gate_state;
}

function activationBlockedReason(row: CandidateRow): string | null {
  if (CDS_CANDIDATE_ACTIVATION_BLOCKLIST.has(row.candidate_key)) {
    return "Policy / audit row — not activatable.";
  }
  if (row.regulatory_status === "RESEARCH_USE_ONLY") {
    return "Research-use-only — engine hard block; cannot ePrescribe even if activated.";
  }
  return null;
}

const CdsPathwayActivationPanel = () => {
  const [pathways, setPathways] = useState<PathwayRow[]>([]);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [isPrescriber, setIsPrescriber] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sign in required");
        return;
      }
      setUserId(user.id);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      setIsPrescriber(roles?.some((r) => r.role === "provider") ?? false);

      const { data: pathwayRows, error: pathwayError } = await supabase
        .from("cds_pathways" as "patients")
        .select("id, slug, name, goal_key, active, signed_off_by, signed_off_at, is_sample")
        .eq("is_sample", false)
        .order("name");

      if (pathwayError) throw pathwayError;

      const { data: candidateRows, error: candidateError } = await supabase
        .from("cds_candidates" as "patients")
        .select(
          "id, pathway_id, candidate_key, display_name, regulatory_status, requires_labs, required_lab_slugs, required_consent_types, rank_weight, clinical_rationale, active, signed_off_by, signed_off_at, is_sample, contraindication_tags",
        )
        .eq("is_sample", false)
        .order("candidate_key");

      if (candidateError) throw candidateError;

      setPathways((pathwayRows ?? []) as unknown as PathwayRow[]);
      setCandidates((candidateRows ?? []) as unknown as CandidateRow[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load CDS catalog";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const candidatesByPathway = useMemo(() => {
    const map = new Map<string, CandidateRow[]>();
    for (const c of candidates) {
      if (!c.pathway_id) continue;
      const list = map.get(c.pathway_id) ?? [];
      list.push(c);
      map.set(c.pathway_id, list);
    }
    return map;
  }, [candidates]);

  const activatablePathwaySlugs = useMemo(
    () =>
      pathways
        .filter((p) => !p.active)
        .map((p) => p.slug),
    [pathways],
  );

  const activatePathway = async (pathway: PathwayRow) => {
    if (!userId) return;
    setActivatingId(`pathway-${pathway.id}`);
    try {
      const { error } = await supabase
        .from("cds_pathways" as "patients")
        .update({
          active: true,
          signed_off_by: userId,
          signed_off_at: new Date().toISOString(),
        })
        .eq("id", pathway.id);

      if (error) throw error;
      toast.success(`Pathway activated: ${pathway.name}`);
      await loadCatalog();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Activation failed");
    } finally {
      setActivatingId(null);
    }
  };

  const activateCandidate = async (row: CandidateRow) => {
    if (!userId) return;
    const block = activationBlockedReason(row);
    if (block) {
      toast.error(block);
      return;
    }

    setActivatingId(`candidate-${row.id}`);
    try {
      const { error } = await supabase
        .from("cds_candidates" as "patients")
        .update({
          active: true,
          signed_off_by: userId,
          signed_off_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (error) throw error;
      toast.success(`Candidate activated: ${row.display_name}`);
      await loadCatalog();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Activation failed");
    } finally {
      setActivatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isPrescriber) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Prescriber access required
          </CardTitle>
          <CardDescription>
            CDS pathway activation requires a provider role. Contact your medical director if you need access.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CDS pathway &amp; candidate activation</CardTitle>
          <CardDescription>
            Review gate disposition, then sign off per row. Activation writes <code className="text-xs">signed_off_by</code>,{" "}
            <code className="text-xs">signed_off_at</code>, and <code className="text-xs">active=true</code> — nothing is bulk-enabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {pathways.map((pathway) => {
            const pathwayCandidates = candidatesByPathway.get(pathway.id) ?? [];
            return (
              <div key={pathway.id} className="rounded-lg border border-border/60 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/30 px-4 py-3">
                  <div>
                    <p className="font-jost font-medium">{pathway.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{pathway.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pathway.active ? (
                      <Badge variant="outline" className="border-emerald-600/50 text-emerald-800 bg-emerald-50">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Pathway active
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        disabled={activatingId === `pathway-${pathway.id}`}
                        onClick={() => void activatePathway(pathway)}
                      >
                        {activatingId === `pathway-${pathway.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Sign off & activate pathway"
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Regulatory</TableHead>
                      <TableHead>Consents</TableHead>
                      <TableHead>Engine gate (preview)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pathwayCandidates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-muted-foreground text-sm">
                          No candidates seeded for this pathway.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pathwayCandidates.map((row) => {
                        const gate = previewGateState(row);
                        const blockReason = activationBlockedReason(row);
                        return (
                          <TableRow key={row.id}>
                            <TableCell>
                              <p className="font-medium text-sm">{row.display_name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{row.candidate_key}</p>
                            </TableCell>
                            <TableCell>
                              <Badge className={regulatoryBadgeClassName(row.regulatory_status)}>
                                {REGULATORY_STATUS_LABELS[row.regulatory_status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs max-w-[140px]">
                              {row.required_consent_types.length > 0
                                ? row.required_consent_types.join(", ")
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={gateBadgeClassName(gate)}>
                                {GATE_STATE_LABELS[gate]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {row.active ? (
                                <Badge variant="outline" className="border-emerald-600/50 text-emerald-800">
                                  Active
                                </Badge>
                              ) : blockReason ? (
                                <span className="text-xs text-amber-800">{blockReason}</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Awaiting sign-off</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {!row.active && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={!!blockReason || activatingId === `candidate-${row.id}`}
                                  onClick={() => void activateCandidate(row)}
                                >
                                  {activatingId === `candidate-${row.id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Activate"
                                  )}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground font-jost">
        Inactive pathways pending activation: {activatablePathwaySlugs.join(", ") || "none"}.
      </p>
    </div>
  );
};

export default CdsPathwayActivationPanel;
