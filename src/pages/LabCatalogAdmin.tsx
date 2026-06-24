import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, ArrowLeft, Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { formatCentsUsd } from "@/lib/labCatalogEconomics";
import { LAB_PANEL_DISPLAY_NAMES, type LabPanelSlug } from "@/lib/labPanelRecommendations";
import { labPanelNonMemberCents } from "@/lib/labPanelCheckout";
import { labMemberCents } from "@/lib/pricing";
import type { LabPanelRow, LabTestRow } from "@/lib/labCatalogTypes";

type DefaultRule = "standing" | "reflex" | "optional" | "one_time";

const RULE_LABELS: Record<DefaultRule, string> = {
  standing: "Standing",
  reflex: "Reflex",
  optional: "Optional",
  one_time: "One-time",
};

const RULE_HELP: Record<DefaultRule, string> = {
  standing: "Drawn every time — part of the standard panel cost.",
  reflex: "Ordered only on indication / abnormal anchor (e.g. Free T4 if TSH abnormal).",
  optional: "Advanced add-on — not in the standard panel.",
  one_time: "Genetic / once-in-a-lifetime — counted once at baseline.",
};

/** Tests whose cost counts toward the standard (default-draw) panel. */
const COUNTS_TOWARD_STANDARD: DefaultRule[] = ["standing", "one_time"];

interface JoinRow {
  panel_id: string;
  test_id: string;
  display_order: number;
  default_rule: DefaultRule;
}

function parseDollarsToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed.replace(/[$,]/g, ""));
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

function centsToInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}

function marginBand(pct: number | null): "green" | "yellow" | "red" | "unknown" {
  if (pct == null) return "unknown";
  if (pct >= 40) return "green";
  if (pct >= 20) return "yellow";
  return "red";
}

export default function LabCatalogAdmin() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tests, setTests] = useState<LabTestRow[]>([]);
  const [panels, setPanels] = useState<LabPanelRow[]>([]);
  const [joins, setJoins] = useState<JoinRow[]>([]);
  const [search, setSearch] = useState("");
  const [editTest, setEditTest] = useState<LabTestRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingRuleKey, setSavingRuleKey] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    labcorp_test_code: "",
    cpt_or_order_code: "",
    eha_cost: "",
    alone_charge: "",
    labcorp_bundle_notes: "",
    internal_notes: "",
  });

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const [testsRes, panelsRes, joinsRes] = await Promise.all([
        supabase.from("lab_tests").select("*").order("display_order"),
        supabase.from("lab_panels").select("*").order("display_order"),
        supabase.from("panel_tests").select("panel_id, test_id, display_order, default_rule"),
      ]);
      if (testsRes.error) throw testsRes.error;
      if (panelsRes.error) throw panelsRes.error;
      if (joinsRes.error) throw joinsRes.error;
      setTests((testsRes.data ?? []) as LabTestRow[]);
      setPanels((panelsRes.data ?? []) as LabPanelRow[]);
      setJoins((joinsRes.data ?? []) as JoinRow[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load lab catalog");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const ruleByKey = useMemo(() => {
    const m = new Map<string, DefaultRule>();
    for (const j of joins) m.set(`${j.panel_id}:${j.test_id}`, j.default_rule);
    return m;
  }, [joins]);

  const panelsByTestId = useMemo(() => {
    const panelById = new Map(panels.map((p) => [p.id, p]));
    const map = new Map<string, LabPanelRow[]>();
    for (const j of joins) {
      const panel = panelById.get(j.panel_id);
      if (!panel) continue;
      const list = map.get(j.test_id) ?? [];
      list.push(panel);
      map.set(j.test_id, list);
    }
    return map;
  }, [joins, panels]);

  const testsByPanelId = useMemo(() => {
    const testById = new Map(tests.map((t) => [t.id, t]));
    const map = new Map<string, Array<LabTestRow & { rule: DefaultRule }>>();
    for (const j of joins) {
      const test = testById.get(j.test_id);
      if (!test) continue;
      const list = map.get(j.panel_id) ?? [];
      list.push({ ...test, rule: j.default_rule });
      map.set(j.panel_id, list);
    }
    for (const [pid, list] of map) {
      map.set(
        pid,
        [...list].sort((a, b) => a.display_order - b.display_order),
      );
    }
    return map;
  }, [joins, tests]);

  const panelEconomics = useMemo(() => {
    return panels
      .filter((p) => p.is_active)
      .map((panel) => {
        const panelTests = testsByPanelId.get(panel.id) ?? [];
        const charge = labPanelNonMemberCents(panel.slug);
        const memberCharge = labMemberCents(charge);
        const standardTests = panelTests.filter((t) => COUNTS_TOWARD_STANDARD.includes(t.rule));
        const missing = standardTests.filter((t) => !t.eha_cost_cents || t.eha_cost_cents <= 0).length;
        const standardCost = standardTests.reduce((s, t) => s + (t.eha_cost_cents ?? 0), 0);
        const fullCost = panelTests.reduce((s, t) => s + (t.eha_cost_cents ?? 0), 0);
        const nmProfit = charge - standardCost;
        const nmMargin = charge > 0 ? (nmProfit / charge) * 100 : null;
        const mbrProfit = memberCharge - standardCost;
        const mbrMargin = memberCharge > 0 ? (mbrProfit / memberCharge) * 100 : null;
        return {
          panel,
          panelTests,
          charge,
          memberCharge,
          standardCost,
          fullCost,
          standardCount: standardTests.length,
          missing,
          nmProfit,
          nmMargin,
          mbrProfit,
          mbrMargin,
        };
      });
  }, [panels, testsByPanelId]);

  const filteredTests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tests;
    return tests.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        (t.labcorp_test_code ?? "").includes(q),
    );
  }, [search, tests]);

  const missingEhaTotal = tests.filter((t) => !t.eha_cost_cents || t.eha_cost_cents <= 0).length;

  const updateRule = async (panelId: string, testId: string, rule: DefaultRule) => {
    const key = `${panelId}:${testId}`;
    setSavingRuleKey(key);
    // optimistic
    setJoins((prev) =>
      prev.map((j) => (j.panel_id === panelId && j.test_id === testId ? { ...j, default_rule: rule } : j)),
    );
    const { error } = await supabase
      .from("panel_tests")
      .update({ default_rule: rule } as Record<string, unknown>)
      .eq("panel_id", panelId)
      .eq("test_id", testId);
    setSavingRuleKey(null);
    if (error) {
      toast.error(error.message);
      void refresh();
    } else {
      toast.success(`Set ${RULE_LABELS[rule]}`);
    }
  };

  const openEdit = (test: LabTestRow) => {
    setEditTest(test);
    setDraft({
      labcorp_test_code: test.labcorp_test_code ?? "",
      cpt_or_order_code: test.cpt_or_order_code ?? "",
      eha_cost: centsToInput(test.eha_cost_cents),
      alone_charge: centsToInput(test.non_member_price_cents),
      labcorp_bundle_notes: test.labcorp_bundle_notes ?? "",
      internal_notes: test.internal_notes ?? "",
    });
  };

  const saveTest = async () => {
    if (!editTest) return;
    setSaving(true);
    try {
      const ehaCents = parseDollarsToCents(draft.eha_cost);
      const aloneCents = parseDollarsToCents(draft.alone_charge);
      const { error } = await supabase
        .from("lab_tests")
        .update({
          labcorp_test_code: draft.labcorp_test_code.trim() || null,
          cpt_or_order_code: draft.cpt_or_order_code.trim() || null,
          eha_cost_cents: ehaCents,
          non_member_price_cents: aloneCents ?? editTest.non_member_price_cents,
          labcorp_bundle_notes: draft.labcorp_bundle_notes.trim() || null,
          internal_notes: draft.internal_notes.trim() || null,
        } as Record<string, unknown>)
        .eq("id", editTest.id);
      if (error) throw error;
      toast.success(`Updated ${editTest.name}`);
      setEditTest(null);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Lab Catalog | Elevated Health Augusta</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button asChild variant="ghost" size="sm" className="font-jost gap-2">
              <Link to="/staff/clinical-pathway">
                <ArrowLeft className="h-4 w-4" />
                Clinical pathway
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div>
            <p className="section-label mb-2">Internal — lab economics &amp; panel composition</p>
            <h1 className="font-playfair text-3xl md:text-4xl text-foreground mb-2">Lab catalog</h1>
            <p className="font-jost text-sm text-muted-foreground max-w-3xl">
              Master lab list ({tests.length} tests) and program panels. Each test in a panel has a{" "}
              <strong>draw rule</strong> you can change live: <em>Standing</em> (every draw),{" "}
              <em>Reflex</em> (on indication), <em>Optional</em> (advanced add-on), or{" "}
              <em>One-time</em> (genetic). Only Standing + One-time count toward the standard panel cost.
              Patient checkout uses Stripe $199 / $299 tiers — never expose COGS or margins to patients.
            </p>
          </div>

          {missingEhaTotal > 0 && (
            <Card className="border-amber-500/40 bg-amber-500/5">
              <CardContent className="pt-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="font-jost text-sm font-medium">
                  {missingEhaTotal} lab(s) missing EHA cost — some standard-panel margins may be partial
                  until LabCorp client pricing is entered.
                </p>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="panels">
            <TabsList>
              <TabsTrigger value="panels">Program panels</TabsTrigger>
              <TabsTrigger value="master">Master lab list</TabsTrigger>
            </TabsList>

            <TabsContent value="panels" className="space-y-4 mt-4">
              {panelEconomics.map((econ) => {
                const displayName =
                  LAB_PANEL_DISPLAY_NAMES[econ.panel.slug as LabPanelSlug] ?? econ.panel.name;
                const band = marginBand(econ.mbrMargin);
                return (
                  <Card key={econ.panel.slug}>
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="font-playfair text-xl">{displayName}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="font-jost">
                            {econ.standardCount} standard / {econ.panelTests.length} total
                          </Badge>
                        </div>
                      </div>
                      <p className="font-jost text-xs text-muted-foreground">
                        slug: <code>{econ.panel.slug}</code>
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="font-jost text-xs text-muted-foreground">Charge (non-mbr / mbr)</p>
                          <p className="font-playfair text-xl">
                            {formatCentsUsd(econ.charge)}
                            <span className="text-sm text-muted-foreground">
                              {" "}/ {formatCentsUsd(econ.memberCharge)}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="font-jost text-xs text-muted-foreground">Standard cost (COGS)</p>
                          <p className="font-playfair text-xl">{formatCentsUsd(econ.standardCost)}</p>
                        </div>
                        <div>
                          <p className="font-jost text-xs text-muted-foreground">Standard profit (mbr)</p>
                          <p className="font-playfair text-xl">{formatCentsUsd(econ.mbrProfit)}</p>
                        </div>
                        <div>
                          <p className="font-jost text-xs text-muted-foreground">Margin (non-mbr / mbr)</p>
                          <p
                            className={`font-playfair text-xl ${
                              band === "green" ? "text-green-600" : band === "red" ? "text-destructive" : ""
                            }`}
                          >
                            {econ.nmMargin?.toFixed(0)}% / {econ.mbrMargin?.toFixed(0)}%
                          </p>
                        </div>
                        <div>
                          <p className="font-jost text-xs text-muted-foreground">Full cost (all ordered)</p>
                          <p className="font-playfair text-xl text-muted-foreground">
                            {formatCentsUsd(econ.fullCost)}
                          </p>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Test</TableHead>
                            <TableHead>LabCorp</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                            <TableHead className="w-[150px]">Draw rule</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {econ.panelTests.map((t) => {
                            const key = `${econ.panel.id}:${t.id}`;
                            return (
                              <TableRow key={t.id}>
                                <TableCell className="font-jost text-sm">
                                  <button
                                    className="hover:underline text-left"
                                    onClick={() => openEdit(t)}
                                  >
                                    {t.name}
                                  </button>
                                </TableCell>
                                <TableCell className="text-xs">{t.labcorp_test_code ?? "—"}</TableCell>
                                <TableCell className="text-right text-sm">
                                  {t.eha_cost_cents ? formatCentsUsd(t.eha_cost_cents) : "—"}
                                </TableCell>
                                <TableCell>
                                  <select
                                    className="w-full h-8 px-2 rounded border bg-background text-xs font-jost"
                                    value={t.rule}
                                    disabled={savingRuleKey === key}
                                    title={RULE_HELP[t.rule]}
                                    onChange={(e) =>
                                      void updateRule(econ.panel.id, t.id, e.target.value as DefaultRule)
                                    }
                                  >
                                    {(Object.keys(RULE_LABELS) as DefaultRule[]).map((r) => (
                                      <option key={r} value={r}>
                                        {RULE_LABELS[r]}
                                      </option>
                                    ))}
                                  </select>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="master" className="mt-4">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 font-jost"
                    placeholder="Search name, code, LabCorp #…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <Card>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lab</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>LabCorp</TableHead>
                        <TableHead>CPT</TableHead>
                        <TableHead className="text-right">EHA cost</TableHead>
                        <TableHead className="text-right">Alone charge</TableHead>
                        <TableHead>Programs</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTests.map((t) => {
                        const progPanels = panelsByTestId.get(t.id) ?? [];
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="font-jost text-sm">{t.name}</TableCell>
                            <TableCell>
                              <code className="text-xs">{t.code}</code>
                            </TableCell>
                            <TableCell className="text-xs">{t.labcorp_test_code ?? "—"}</TableCell>
                            <TableCell className="text-xs">{t.cpt_or_order_code ?? "—"}</TableCell>
                            <TableCell className="text-right text-sm">
                              {t.eha_cost_cents ? formatCentsUsd(t.eha_cost_cents) : "—"}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {formatCentsUsd(t.non_member_price_cents)}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {progPanels.map((p) => (
                                  <Badge key={p.id} variant="outline" className="text-[10px] font-jost">
                                    {p.slug.split("-")[0]}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Sheet open={!!editTest} onOpenChange={(o) => !o && setEditTest(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-playfair">{editTest?.name}</SheetTitle>
            <SheetDescription className="font-jost">
              Code: {editTest?.code}. Programs:{" "}
              {(editTest ? panelsByTestId.get(editTest.id) : [])?.map((p) => p.name).join(", ") || "—"}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6 font-jost text-sm">
            <div className="space-y-2">
              <Label>LabCorp test code</Label>
              <Input
                value={draft.labcorp_test_code}
                onChange={(e) => setDraft((d) => ({ ...d, labcorp_test_code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>CPT / order code</Label>
              <Input
                value={draft.cpt_or_order_code}
                onChange={(e) => setDraft((d) => ({ ...d, cpt_or_order_code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>EHA cost (USD)</Label>
              <Input
                inputMode="decimal"
                placeholder="0.00"
                value={draft.eha_cost}
                onChange={(e) => setDraft((d) => ({ ...d, eha_cost: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Patient charge if ordered alone (USD)</Label>
              <Input
                inputMode="decimal"
                value={draft.alone_charge}
                onChange={(e) => setDraft((d) => ({ ...d, alone_charge: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>LabCorp bundle notes</Label>
              <Textarea
                rows={2}
                value={draft.labcorp_bundle_notes}
                onChange={(e) => setDraft((d) => ({ ...d, labcorp_bundle_notes: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Internal notes</Label>
              <Textarea
                rows={3}
                value={draft.internal_notes}
                onChange={(e) => setDraft((d) => ({ ...d, internal_notes: e.target.value }))}
              />
            </div>
            <Button className="w-full" onClick={() => void saveTest()} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
