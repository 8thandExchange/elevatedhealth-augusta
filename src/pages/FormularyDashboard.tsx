import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  FORMULARY_CATEGORIES,
  FORMULARY_SUPPLIERS,
  categoryLabel,
  formatCents,
  parseDollarsToCents,
} from "@/lib/formularyCategories";
import { FCC_PORTAL_URL } from "@/lib/fccFormulary";
import { Loader2, Search, RefreshCw, Download, Upload, Boxes, History, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type FormularyRow = Tables<"clinic_formulary">;
type ChangeLogRow = Tables<"formulary_change_log">;
type InventorySku = Tables<"inventory_skus">;
type Lot = Tables<"inventory_lots">;

type StockSummary = {
  totalQty: number;
  reorderStatus: "ok" | "reorder_soon" | "reorder_now" | "out_of_stock" | "n/a";
};

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  const lines = [headers.join(","), ...rows.map((r) => r.map(csvEscape).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function marginPct(cost: number | null, price: number | null): string {
  if (cost == null || price == null || price <= 0) return "—";
  const m = ((price - cost) / price) * 100;
  return `${m.toFixed(0)}%`;
}

export default function FormularyDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState<FormularyRow[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [skus, setSkus] = useState<InventorySku[]>([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [showInactive, setShowInactive] = useState(false);

  const [editRow, setEditRow] = useState<FormularyRow | null>(null);
  const [changeLog, setChangeLog] = useState<ChangeLogRow[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState({
    display_name: "",
    category: "other",
    dose_strength: "",
    dose_notes: "",
    supplier: "fcc",
    supplier_sku: "",
    supplier_cost: "",
    supplier_cost_unit: "",
    client_price: "",
    client_price_member: "",
    billing_unit: "each",
    internal_notes: "",
    is_active: true,
    tracks_inventory: false,
  });

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      let q = supabase.from("clinic_formulary").select("*").order("sort_order").order("display_name");
      if (!showInactive) q = q.eq("is_active", true);
      const [{ data: formulary, error: fErr }, { data: skuRows }, { data: lotRows }] = await Promise.all([
        q,
        supabase.from("inventory_skus").select("*").eq("is_active", true),
        supabase.from("inventory_lots").select("*").in("status", ["active", "depleted"]),
      ]);
      if (fErr) throw fErr;
      setRows((formulary ?? []) as FormularyRow[]);
      setSkus((skuRows ?? []) as InventorySku[]);
      setLots((lotRows ?? []) as Lot[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load formulary");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const stockBySkuId = useMemo(() => {
    const skuMap = new Map(skus.map((s) => [s.id, s]));
    const totals = new Map<string, number>();
    for (const lot of lots) {
      if (lot.status !== "active") continue;
      const rem = Number(lot.quantity_remaining ?? 0);
      if (rem <= 0) continue;
      totals.set(lot.sku_id, (totals.get(lot.sku_id) ?? 0) + rem);
    }
    const out = new Map<string, StockSummary>();
    for (const [skuId, total] of totals) {
      const sku = skuMap.get(skuId);
      if (!sku) continue;
      let reorderStatus: StockSummary["reorderStatus"] = "ok";
      if (total <= 0) reorderStatus = "out_of_stock";
      else if (total <= sku.reorder_threshold) reorderStatus = "reorder_now";
      else if (total <= sku.reorder_threshold * 1.5) reorderStatus = "reorder_soon";
      out.set(skuId, { totalQty: total, reorderStatus });
    }
    for (const sku of skus) {
      if (!out.has(sku.id)) {
        out.set(sku.id, { totalQty: 0, reorderStatus: "out_of_stock" });
      }
    }
    return out;
  }, [lots, skus]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      if (supplierFilter !== "all" && r.supplier !== supplierFilter) return false;
      if (!q) return true;
      return (
        r.display_name.toLowerCase().includes(q) ||
        r.item_code.toLowerCase().includes(q) ||
        (r.supplier_sku ?? "").toLowerCase().includes(q) ||
        (r.dose_strength ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, categoryFilter, supplierFilter]);

  const openEdit = async (row: FormularyRow) => {
    setEditRow(row);
    setDraft({
      display_name: row.display_name,
      category: row.category,
      dose_strength: row.dose_strength ?? "",
      dose_notes: row.dose_notes ?? "",
      supplier: row.supplier,
      supplier_sku: row.supplier_sku ?? "",
      supplier_cost: row.supplier_cost_cents != null ? (row.supplier_cost_cents / 100).toFixed(2) : "",
      supplier_cost_unit: row.supplier_cost_unit ?? "",
      client_price: row.client_price_cents != null ? (row.client_price_cents / 100).toFixed(2) : "",
      client_price_member: row.client_price_member_cents != null ? (row.client_price_member_cents / 100).toFixed(2) : "",
      billing_unit: row.billing_unit,
      internal_notes: row.internal_notes ?? "",
      is_active: row.is_active,
      tracks_inventory: row.tracks_inventory,
    });
    setLogLoading(true);
    const { data, error } = await supabase
      .from("formulary_change_log")
      .select("*")
      .eq("formulary_id", row.id)
      .order("changed_at", { ascending: false })
      .limit(30);
    setLogLoading(false);
    if (error) toast.error(error.message);
    else setChangeLog((data ?? []) as ChangeLogRow[]);
  };

  const saveEdit = async () => {
    if (!editRow) return;
    setSaving(true);
    const payload: Tables<"clinic_formulary">["Update"] = {
      display_name: draft.display_name.trim(),
      category: draft.category,
      dose_strength: draft.dose_strength.trim() || null,
      dose_notes: draft.dose_notes.trim() || null,
      supplier: draft.supplier,
      supplier_sku: draft.supplier_sku.trim() || null,
      supplier_cost_cents: parseDollarsToCents(draft.supplier_cost),
      supplier_cost_unit: draft.supplier_cost_unit.trim() || null,
      client_price_cents: parseDollarsToCents(draft.client_price),
      client_price_member_cents: parseDollarsToCents(draft.client_price_member),
      billing_unit: draft.billing_unit.trim() || "each",
      internal_notes: draft.internal_notes.trim() || null,
      is_active: draft.is_active,
      tracks_inventory: draft.tracks_inventory,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("clinic_formulary").update(payload).eq("id", editRow.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Formulary updated");
    setEditRow(null);
    void refresh();
  };

  const exportCsv = () => {
    downloadCsv(
      `clinic-formulary-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "item_code",
        "display_name",
        "category",
        "dose_strength",
        "supplier",
        "supplier_sku",
        "supplier_cost_cents",
        "client_price_cents",
        "client_price_member_cents",
        "billing_unit",
        "tracks_inventory",
        "is_active",
        "internal_notes",
      ],
      filtered.map((r) => [
        r.item_code,
        r.display_name,
        r.category,
        r.dose_strength ?? "",
        r.supplier,
        r.supplier_sku ?? "",
        r.supplier_cost_cents ?? "",
        r.client_price_cents ?? "",
        r.client_price_member_cents ?? "",
        r.billing_unit,
        r.tracks_inventory ? "yes" : "no",
        r.is_active ? "yes" : "no",
        r.internal_notes ?? "",
      ]),
    );
  };

  const handleImportCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = String(reader.result ?? "");
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) {
          toast.error("CSV needs a header row and at least one data row");
          return;
        }
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const codeIdx = headers.indexOf("item_code");
        if (codeIdx < 0) {
          toast.error("CSV must include item_code column");
          return;
        }
        let updated = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].match(/("([^"]|"")*"|[^,]*)/g)?.map((c) => c.replace(/^"|"$/g, "").replace(/""/g, '"').trim()) ?? lines[i].split(",");
          const itemCode = cols[codeIdx];
          if (!itemCode) continue;
          const patch: Tables<"clinic_formulary">["Update"] = {};
          const setCents = (key: keyof Tables<"clinic_formulary">["Update"], col: string) => {
            const idx = headers.indexOf(col);
            if (idx < 0 || !cols[idx]) return;
            const v = parseDollarsToCents(cols[idx]) ?? parseInt(cols[idx], 10);
            if (!Number.isNaN(v)) (patch as Record<string, number | null>)[key as string] = v;
          };
          setCents("supplier_cost_cents", "supplier_cost_cents");
          setCents("client_price_cents", "client_price_cents");
          setCents("client_price_member_cents", "client_price_member_cents");
          const nameIdx = headers.indexOf("display_name");
          if (nameIdx >= 0 && cols[nameIdx]) patch.display_name = cols[nameIdx];
          if (Object.keys(patch).length === 0) continue;
          const { error } = await supabase.from("clinic_formulary").update(patch).eq("item_code", itemCode);
          if (!error) updated += 1;
        }
        toast.success(`Imported updates for ${updated} item(s)`);
        void refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Import failed");
      }
    };
    reader.readAsText(file);
  };

  const stockBadge = (skuId: string | null) => {
    if (!skuId) return null;
    const s = stockBySkuId.get(skuId);
    if (!s) return <Badge variant="secondary">No lots</Badge>;
    if (s.reorderStatus === "out_of_stock") return <Badge className="bg-destructive text-destructive-foreground">Out of stock</Badge>;
    if (s.reorderStatus === "reorder_now") return <Badge className="bg-orange-500 text-white">Reorder now</Badge>;
    if (s.reorderStatus === "reorder_soon") return <Badge className="bg-amber-500 text-white">Reorder soon</Badge>;
    return <Badge variant="secondary">In stock ({s.totalQty})</Badge>;
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6 font-jost print:max-w-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-playfair text-2xl text-foreground">Formulary &amp; pricing</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Master catalog for Kristen: supplier SKU, our cost, patient price, dose. Changes are logged automatically.
            Stock status links to{" "}
            <Link to="/inventory" className="text-accent underline-offset-2 hover:underline">
              inventory
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={FCC_PORTAL_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              FCC portal
            </a>
          </Button>
          <Button variant="outline" size="sm" type="button" onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer flex items-center gap-1 px-3 py-2">
              <Upload className="h-4 w-4" />
              Import CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleImportCsv(f);
                  e.target.value = "";
                }}
              />
            </label>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/inventory">
              <Boxes className="h-4 w-4 mr-1" />
              Inventory
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="h-4 w-4 absolute left-2.5 top-3 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, item code, FCC SKU, dose"
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMULARY_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMULARY_SUPPLIERS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
            <Label htmlFor="show-inactive">Show inactive items</Label>
            <span className="text-muted-foreground ml-auto">{filtered.length} of {rows.length} items</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Dose</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Our cost</TableHead>
                <TableHead className="text-right">Client</TableHead>
                <TableHead className="text-right">Member</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    No items match. Run the clinic_formulary migration if this list is empty.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id} className={!r.is_active ? "opacity-50" : undefined}>
                    <TableCell>
                      <div className="font-medium">{r.display_name}</div>
                      <div className="text-xs text-muted-foreground">{r.item_code}</div>
                    </TableCell>
                    <TableCell className="text-xs">{categoryLabel(r.category)}</TableCell>
                    <TableCell className="text-xs max-w-[140px]">{r.dose_strength ?? "—"}</TableCell>
                    <TableCell className="text-xs">
                      <div>{r.supplier.toUpperCase()}</div>
                      {r.supplier_sku && <div className="text-muted-foreground">SKU {r.supplier_sku}</div>}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCents(r.supplier_cost_cents)}
                      {r.supplier_cost_unit && (
                        <span className="text-xs text-muted-foreground block">/{r.supplier_cost_unit}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatCents(r.client_price_cents)}
                      {r.billing_unit !== "each" && (
                        <span className="text-xs text-muted-foreground block">/{r.billing_unit}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">{formatCents(r.client_price_member_cents)}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {marginPct(r.supplier_cost_cents, r.client_price_member_cents ?? r.client_price_cents)}
                    </TableCell>
                    <TableCell>{r.tracks_inventory ? stockBadge(r.inventory_sku_id) : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => void openEdit(r)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-playfair">{editRow?.display_name}</SheetTitle>
            <SheetDescription>{editRow?.item_code} — edits are logged for compliance review.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Display name</Label>
              <Input value={draft.display_name} onChange={(e) => setDraft((d) => ({ ...d, display_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={draft.category} onValueChange={(v) => setDraft((d) => ({ ...d, category: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMULARY_CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Dose / strength</Label>
                <Input value={draft.dose_strength} onChange={(e) => setDraft((d) => ({ ...d, dose_strength: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Billing unit</Label>
                <Input value={draft.billing_unit} onChange={(e) => setDraft((d) => ({ ...d, billing_unit: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dose / protocol notes</Label>
              <Textarea value={draft.dose_notes} onChange={(e) => setDraft((d) => ({ ...d, dose_notes: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select value={draft.supplier} onValueChange={(v) => setDraft((d) => ({ ...d, supplier: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMULARY_SUPPLIERS.filter((s) => s.value !== "all").map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Supplier SKU</Label>
                <Input value={draft.supplier_sku} onChange={(e) => setDraft((d) => ({ ...d, supplier_sku: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Our cost ($)</Label>
                <Input value={draft.supplier_cost} onChange={(e) => setDraft((d) => ({ ...d, supplier_cost: e.target.value }))} placeholder="FCC invoice" />
              </div>
              <div className="space-y-2">
                <Label>Cost unit</Label>
                <Input value={draft.supplier_cost_unit} onChange={(e) => setDraft((d) => ({ ...d, supplier_cost_unit: e.target.value }))} placeholder="vial, month…" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Client price ($)</Label>
                <Input value={draft.client_price} onChange={(e) => setDraft((d) => ({ ...d, client_price: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Member price ($)</Label>
                <Input value={draft.client_price_member} onChange={(e) => setDraft((d) => ({ ...d, client_price_member: e.target.value }))} placeholder="Optional" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Internal notes</Label>
              <Textarea value={draft.internal_notes} onChange={(e) => setDraft((d) => ({ ...d, internal_notes: e.target.value }))} rows={3} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={draft.is_active} onCheckedChange={(v) => setDraft((d) => ({ ...d, is_active: v }))} />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={draft.tracks_inventory} onCheckedChange={(v) => setDraft((d) => ({ ...d, tracks_inventory: v }))} />
                <Label>Tracks inventory</Label>
              </div>
            </div>
            <Button className="w-full" onClick={() => void saveEdit()} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save changes
            </Button>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <History className="h-4 w-4" />
                <span className="font-medium text-sm">Change history</span>
              </div>
              {logLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : changeLog.length === 0 ? (
                <p className="text-xs text-muted-foreground">No logged changes yet.</p>
              ) : (
                <ul className="text-xs space-y-2 max-h-48 overflow-y-auto">
                  {changeLog.map((c) => (
                    <li key={c.id} className="border-b border-border/40 pb-1">
                      <span className="text-muted-foreground">{new Date(c.changed_at).toLocaleString()}</span>
                      {" · "}
                      <span className="font-medium">{c.field_name}</span>: {c.old_value ?? "—"} → {c.new_value ?? "—"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
