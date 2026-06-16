import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import {
  EHA_STATUS_LABELS,
  type ClinicalPolicyItem,
  type EhaPolicyStatus,
} from "@/lib/clinicalPolicy";

const STATUS_VARIANT: Record<EhaPolicyStatus, "default" | "secondary" | "destructive" | "outline"> = {
  offered: "default",
  program_only: "secondary",
  hidden: "outline",
  blocked: "destructive",
  excluded: "destructive",
};

export default function ClinicalPolicyAdmin() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState<ClinicalPolicyItem[]>([]);
  const [search, setSearch] = useState("");
  const [editRow, setEditRow] = useState<ClinicalPolicyItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ notes: "", policy_owner: "", next_review: "" });

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from("clinical_policy_items" as "patients")
        .select("*")
        .eq("is_sample", false)
        .order("category")
        .order("display_name");
      if (error) throw error;
      setRows((data ?? []) as unknown as ClinicalPolicyItem[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load policy catalog");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.display_name.toLowerCase().includes(q) ||
        r.item_key.toLowerCase().includes(q) ||
        (r.category ?? "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  const openEdit = (row: ClinicalPolicyItem) => {
    setEditRow(row);
    setDraft({
      notes: row.notes ?? "",
      policy_owner: row.policy_owner ?? "",
      next_review: row.next_review_at ?? "",
    });
  };

  const save = async () => {
    if (!editRow) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("clinical_policy_items" as "patients")
        .update({
          notes: draft.notes.trim() || null,
          policy_owner: draft.policy_owner.trim() || null,
          next_review_at: draft.next_review.trim() || null,
        })
        .eq("id", editRow.id);
      if (error) throw error;
      toast.success(`Updated ${editRow.display_name}`);
      setEditRow(null);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const inactiveCount = rows.filter((r) => !r.active).length;

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
        <title>Clinical Policy | Elevated Health Augusta</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button asChild variant="ghost" size="sm" className="font-jost gap-2">
              <Link to="/staff/system-guide">
                <ArrowLeft className="h-4 w-4" />
                System guide
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div>
            <p className="section-label mb-2">Internal — canonical policy</p>
            <h1 className="font-playfair text-3xl md:text-4xl text-foreground mb-2">Clinical policy</h1>
            <p className="font-jost text-sm text-muted-foreground max-w-3xl">
              Single source of truth for regulatory tier, EHA status, consents, labs, and vendors per therapy.
              Production rows ship <code className="text-xs">active=false</code> until prescriber sign-off.
              {inactiveCount > 0 && ` ${inactiveCount} item(s) awaiting activation.`}
            </p>
          </div>

          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 font-jost"
              placeholder="Search therapy, key, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Policy catalog</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Therapy</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Regulatory</TableHead>
                    <TableHead>EHA status</TableHead>
                    <TableHead>Consents</TableHead>
                    <TableHead>Labs</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <p className="font-jost text-sm font-medium">{row.display_name}</p>
                        <code className="text-xs text-muted-foreground">{row.item_key}</code>
                      </TableCell>
                      <TableCell className="font-jost text-xs">{row.category ?? "—"}</TableCell>
                      <TableCell className="font-jost text-xs">{row.regulatory_tier}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[row.eha_status]} className="font-jost text-xs">
                          {EHA_STATUS_LABELS[row.eha_status]}
                        </Badge>
                        {!row.active && (
                          <Badge variant="outline" className="font-jost text-[10px] ml-1">
                            unsigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-jost text-xs max-w-[120px]">
                        {row.required_consents.join(", ") || "—"}
                      </TableCell>
                      <TableCell className="font-jost text-xs max-w-[120px]">
                        {row.required_lab_slugs.join(", ") || "—"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-playfair">{editRow?.display_name}</SheetTitle>
            <SheetDescription className="font-jost">
              {EHA_STATUS_LABELS[editRow?.eha_status ?? "offered"]} · {editRow?.regulatory_tier}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6 font-jost text-sm">
            <p className="text-xs text-muted-foreground">
              Prescriber may update review metadata. Status tier changes require a new migration or
              prescriber DB update with sign-off.
            </p>
            <div className="space-y-2">
              <Label>Policy owner</Label>
              <Input
                value={draft.policy_owner}
                onChange={(e) => setDraft((d) => ({ ...d, policy_owner: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Next review date</Label>
              <Input
                type="date"
                value={draft.next_review}
                onChange={(e) => setDraft((d) => ({ ...d, next_review: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                rows={4}
                value={draft.notes}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              />
            </div>
            <Button className="w-full" onClick={() => void save()} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
