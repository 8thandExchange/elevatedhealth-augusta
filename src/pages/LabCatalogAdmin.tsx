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
import {
  computePanelEconomics,
  formatCentsUsd,
  formatMarginLabel,
} from "@/lib/labCatalogEconomics";
import { LAB_PANEL_DISPLAY_NAMES, type LabPanelSlug } from "@/lib/labPanelRecommendations";
import { labPanelNonMemberCents } from "@/lib/labPanelCheckout";
import type { LabPanelRow, LabTestRow } from "@/lib/labCatalogTypes";

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

export default function LabCatalogAdmin() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tests, setTests] = useState<LabTestRow[]>([]);
  const [panels, setPanels] = useState<LabPanelRow[]>([]);
  const [joins, setJoins] = useState<Array<{ panel_id: string; test_id: string; display_order: number }>>([]);
  const [search, setSearch] = useState("");
  const [editTest, setEditTest] = useState<LabTestRow | null>(null);
  const [saving, setSaving] = useState(false);
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
        supabase.from("panel_tests").select("panel_id, test_id, display_order"),
      ]);
      if (testsRes.error) throw testsRes.error;
      if (panelsRes.error) throw panelsRes.error;
      if (joinsRes.error) throw joinsRes.error;
      setTests((testsRes.data ?? []) as LabTestRow[]);
      setPanels((panelsRes.data ?? []) as LabPanelRow[]);
      setJoins(joinsRes.data ?? []);
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
    const map = new Map<string, LabTestRow[]>();
    for (const j of joins) {
      const test = testById.get(j.test_id);
      if (!test) continue;
      const list = map.get(j.panel_id) ?? [];
      list.push(test);
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
    return panels.map((panel) => {
      const panelTests = testsByPanelId.get(panel.id) ?? [];
      const chargeCents = labPanelNonMemberCents(panel.slug);
      return computePanelEconomics({
        panelSlug: panel.slug,
        panelName: panel.name,
        patientChargeCents: chargeCents,
        tests: panelTests.map((t) => ({
          id: t.id,
          code: t.code,
          name: t.name,
          eha_cost_cents: t.eha_cost_cents ?? null,
          non_member_price_cents: t.non_member_price_cents,
        })),
      });
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
            <p className="section-label mb-2">Internal — lab economics</p>
            <h1 className="font-playfair text-3xl md:text-4xl text-foreground mb-2">Lab catalog</h1>
            <p className="font-jost text-sm text-muted-foreground max-w-3xl">
              Master lab list ({tests.length} unique tests) and program panels via{" "}
              <code className="text-xs">panel_tests</code>. Patient-facing checkout uses Stripe
              comprehensive ($199) / expanded ($299) tiers — never expose COGS or margins to patients.
            </p>
          </div>

          {missingEhaTotal > 0 && (
            <Card className="border-amber-500/40 bg-amber-500/5">
              <CardContent className="pt-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-jost text-sm font-medium">
                    {missingEhaTotal} lab(s) missing EHA cost — panel margins are incomplete until LabCorp
                    client-bill pricing is entered.
                  </p>
                </div>
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
                const panel = panels.find((p) => p.slug === econ.panelSlug);
                const panelTests = panel ? (testsByPanelId.get(panel.id) ?? []) : [];
                const displayName =
                  LAB_PANEL_DISPLAY_NAMES[econ.panelSlug as LabPanelSlug] ?? econ.panelName;
                return (
                  <Card key={econ.panelSlug}>
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="font-playfair text-xl">{displayName}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="font-jost">
                            {panelTests.length} labs
                          </Badge>
                          {!panel?.is_active && (
                            <Badge variant="secondary" className="font-jost">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="font-jost text-xs text-muted-foreground">
                        slug: <code>{econ.panelSlug}</code>
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="font-jost text-xs text-muted-foreground">Patient charge</p>
                          <p className="font-playfair text-2xl">{formatCentsUsd(econ.patientChargeCents)}</p>
                        </div>
                        <div>
                          <p className="font-jost text-xs text-muted-foreground">Total EHA lab cost</p>
                          <p className="font-playfair text-2xl">
                            {econ.marginIsFinal
                              ? formatCentsUsd(econ.totalLabCostCents)
                              : formatCentsUsd(econ.totalLabCostCents) + " (partial)"}
                          </p>
                        </div>
                        <div>
                          <p className="font-jost text-xs text-muted-foreground">Gross profit</p>
                          <p className="font-playfair text-2xl">
                            {econ.marginIsFinal ? formatCentsUsd(econ.grossProfitCents) : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="font-jost text-xs text-muted-foreground">Margin</p>
                          <p
                            className={`font-playfair text-2xl ${
                              econ.marginBand === "green"
                                ? "text-green-600"
                                : econ.marginBand === "red"
                                  ? "text-destructive"
                                  : ""
                            }`}
                          >
                            {formatMarginLabel(econ)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {panelTests.map((t) => (
                          <Badge
                            key={t.id}
                            variant={!t.eha_cost_cents ? "destructive" : "secondary"}
                            className="font-jost text-xs cursor-pointer"
                            onClick={() => openEdit(t)}
                          >
                            {t.code}
                          </Badge>
                        ))}
                      </div>
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
              {(editTest ? panelsByTestId.get(editTest.id) : [])?.map((p) => p.name).join(", ") ||
                "—"}
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
