import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, PackagePlus, RefreshCw, Search, Syringe, Download, AlarmClock } from "lucide-react";
import { toast } from "sonner";
import DispenseFromInventoryModal from "@/components/provider/DispenseFromInventoryModal";

type Sku = Tables<"inventory_skus">;
type Lot = Tables<"inventory_lots">;
type Dispensation = Tables<"inventory_dispensations">;

type ReorderStatus = "ok" | "reorder_soon" | "reorder_now" | "out_of_stock";

type SkuStatusRow = {
  sku: Sku;
  totalQuantity: number;
  lotCount: number;
  earliestExpiration: string | null;
  reorderStatus: ReorderStatus;
  hasExpiringSoon: boolean;
};

const CATEGORIES = [
  { value: "all", label: "All categories" },
  { value: "compounded_medication", label: "Compounded medication" },
  { value: "peptide", label: "Peptide" },
  { value: "iv_supply", label: "IV supply" },
  { value: "medical_supply", label: "Medical supply" },
  { value: "consumable", label: "Consumable" },
];

const VENDORS = [
  { value: "all", label: "All vendors" },
  { value: "fcc", label: "FCC" },
  { value: "henry_schein", label: "Henry Schein" },
  { value: "empower", label: "Empower" },
  { value: "stericycle", label: "Stericycle" },
  { value: "other", label: "Other" },
];

const TRANSACTION_TYPES = [
  { value: "all", label: "All transaction types" },
  { value: "patient_dose", label: "Patient dose" },
  { value: "waste", label: "Waste" },
  { value: "correction", label: "Correction" },
  { value: "transfer", label: "Transfer" },
  { value: "expired_disposal", label: "Expired disposal" },
];

function reorderBadge(status: ReorderStatus) {
  switch (status) {
    case "out_of_stock":
      return <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive">Out of stock</Badge>;
    case "reorder_now":
      return <Badge className="bg-orange-500 hover:bg-orange-500 text-white">Reorder now</Badge>;
    case "reorder_soon":
      return <Badge className="bg-amber-500 hover:bg-amber-500 text-white">Reorder soon</Badge>;
    default:
      return <Badge variant="secondary">OK</Badge>;
  }
}

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

export default function InventoryDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [skus, setSkus] = useState<Sku[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [controlledFilter, setControlledFilter] = useState<"all" | "controlled" | "non_controlled">("all");
  const [sortBy, setSortBy] = useState<"expiration" | "name" | "quantity">("expiration");

  const [skuPanelId, setSkuPanelId] = useState<string | null>(null);
  const [dispenseOpen, setDispenseOpen] = useState(false);
  const [dispensePrefillSku, setDispensePrefillSku] = useState<string | null>(null);

  // Receive-shipment form state
  const [receiveSkuQuery, setReceiveSkuQuery] = useState("");
  const [receiveSkuHits, setReceiveSkuHits] = useState<Sku[]>([]);
  const [receiveSku, setReceiveSku] = useState<Sku | null>(null);
  const [receiveLotNumber, setReceiveLotNumber] = useState("");
  const [receiveExpiration, setReceiveExpiration] = useState("");
  const [receiveQty, setReceiveQty] = useState("");
  const [receiveInvoice, setReceiveInvoice] = useState("");
  const [receiveLocation, setReceiveLocation] = useState("");
  const [receiveCost, setReceiveCost] = useState("");
  const [receiving, setReceiving] = useState(false);

  // Dispensation log filters
  const [logFromDate, setLogFromDate] = useState("");
  const [logToDate, setLogToDate] = useState("");
  const [logTxType, setLogTxType] = useState("all");
  const [logRows, setLogRows] = useState<Array<Dispensation & { lot?: Lot | null; sku?: Sku | null; patientName?: string | null; dispenserEmail?: string | null }>>([]);
  const [logLoading, setLogLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const [{ data: skuRows, error: skuErr }, { data: lotRows, error: lotErr }] = await Promise.all([
        supabase.from("inventory_skus").select("*").eq("is_active", true).order("display_name"),
        supabase.from("inventory_lots").select("*").in("status", ["active", "depleted"]).order("expiration_date"),
      ]);
      if (skuErr) throw skuErr;
      if (lotErr) throw lotErr;
      setSkus((skuRows ?? []) as Sku[]);
      setLots((lotRows ?? []) as Lot[]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load inventory";
      toast.error(msg);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const skuStatusRows = useMemo<SkuStatusRow[]>(() => {
    const byActive = new Map<string, Lot[]>();
    for (const lot of lots) {
      if (lot.status !== "active" || Number(lot.quantity_remaining) <= 0) continue;
      const arr = byActive.get(lot.sku_id) ?? [];
      arr.push(lot);
      byActive.set(lot.sku_id, arr);
    }
    const todayMs = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    return skus
      .filter((sku) => {
        if (categoryFilter !== "all" && sku.category !== categoryFilter) return false;
        if (vendorFilter !== "all" && sku.vendor !== vendorFilter) return false;
        if (controlledFilter === "controlled" && !sku.is_controlled_substance) return false;
        if (controlledFilter === "non_controlled" && sku.is_controlled_substance) return false;
        if (search.trim().length > 0) {
          const q = search.toLowerCase();
          if (!sku.display_name.toLowerCase().includes(q) && !sku.sku_code.toLowerCase().includes(q)) {
            return false;
          }
        }
        return true;
      })
      .map((sku): SkuStatusRow => {
        const skuLots = byActive.get(sku.id) ?? [];
        const total = skuLots.reduce((sum, l) => sum + Number(l.quantity_remaining), 0);
        const earliest = skuLots
          .map((l) => l.expiration_date)
          .sort()[0] ?? null;
        let reorderStatus: ReorderStatus = "ok";
        if (total <= 0) reorderStatus = "out_of_stock";
        else if (total <= sku.reorder_threshold) reorderStatus = "reorder_now";
        else if (total <= sku.reorder_threshold * 1.3) reorderStatus = "reorder_soon";
        const hasExpiringSoon = skuLots.some(
          (l) => new Date(l.expiration_date).getTime() - todayMs <= thirtyDaysMs,
        );
        return {
          sku,
          totalQuantity: total,
          lotCount: skuLots.length,
          earliestExpiration: earliest,
          reorderStatus,
          hasExpiringSoon,
        };
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.sku.display_name.localeCompare(b.sku.display_name);
        if (sortBy === "quantity") return a.totalQuantity - b.totalQuantity;
        const aDate = a.earliestExpiration ?? "9999-12-31";
        const bDate = b.earliestExpiration ?? "9999-12-31";
        return aDate.localeCompare(bDate);
      });
  }, [skus, lots, search, categoryFilter, vendorFilter, controlledFilter, sortBy]);

  const lotsForPanel = useMemo(() => {
    if (!skuPanelId) return [];
    return lots
      .filter((l) => l.sku_id === skuPanelId)
      .sort((a, b) => a.expiration_date.localeCompare(b.expiration_date));
  }, [skuPanelId, lots]);

  const skuOnPanel = useMemo(
    () => (skuPanelId ? skus.find((s) => s.id === skuPanelId) ?? null : null),
    [skuPanelId, skus],
  );

  const exportStockCsv = () => {
    downloadCsv(
      `inventory-stock-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "sku_code",
        "display_name",
        "category",
        "vendor",
        "controlled",
        "total_quantity",
        "default_unit",
        "lot_count",
        "earliest_expiration",
        "reorder_status",
        "reorder_threshold",
        "reorder_target",
      ],
      skuStatusRows.map((r) => [
        r.sku.sku_code,
        r.sku.display_name,
        r.sku.category,
        r.sku.vendor,
        r.sku.is_controlled_substance ? r.sku.controlled_schedule ?? "yes" : "",
        r.totalQuantity,
        r.sku.default_unit,
        r.lotCount,
        r.earliestExpiration ?? "",
        r.reorderStatus,
        r.sku.reorder_threshold,
        r.sku.reorder_target,
      ]),
    );
  };

  const runExpirationSweep = async () => {
    const { data, error } = await supabase.rpc("expire_inventory_lots");
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${data ?? 0} lot(s) marked expired`);
    void refresh();
  };

  const searchReceiveSkus = async () => {
    const q = receiveSkuQuery.trim();
    if (q.length < 2) {
      setReceiveSkuHits([]);
      return;
    }
    const { data, error } = await supabase
      .from("inventory_skus")
      .select("*")
      .or(`display_name.ilike.%${q}%,sku_code.ilike.%${q}%`)
      .eq("is_active", true)
      .limit(10);
    if (error) {
      toast.error(error.message);
      return;
    }
    setReceiveSkuHits((data ?? []) as Sku[]);
  };

  const receiveLot = async () => {
    if (!receiveSku) {
      toast.error("Pick a SKU");
      return;
    }
    if (!receiveLotNumber.trim()) {
      toast.error("Lot number required");
      return;
    }
    if (!receiveExpiration) {
      toast.error("Expiration date required");
      return;
    }
    const qty = Number(receiveQty);
    if (!qty || qty <= 0) {
      toast.error("Positive quantity required");
      return;
    }
    setReceiving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const cents = receiveCost ? Math.round(Number(receiveCost) * 100) : null;
      const { error } = await supabase
        .from("inventory_lots")
        .insert({
          sku_id: receiveSku.id,
          lot_number: receiveLotNumber.trim(),
          expiration_date: receiveExpiration,
          quantity_received: qty,
          quantity_remaining: qty,
          unit: receiveSku.default_unit,
          vendor_invoice_number: receiveInvoice.trim() || null,
          storage_location: receiveLocation.trim() || null,
          cost_per_unit_cents: cents,
          received_by: user?.id ?? null,
          status: "active",
        });
      if (error) throw error;

      const { count } = await supabase
        .from("inventory_lots")
        .select("*", { head: true, count: "exact" })
        .eq("sku_id", receiveSku.id)
        .eq("status", "active");
      const lotCount = count ?? 1;
      toast.success(
        `Received ${qty} ${receiveSku.default_unit} of ${receiveSku.display_name}. New active lot expiring ${receiveExpiration}. This is now active lot #${lotCount} for this SKU.`,
      );
      setReceiveLotNumber("");
      setReceiveExpiration("");
      setReceiveQty("");
      setReceiveInvoice("");
      setReceiveLocation("");
      setReceiveCost("");
      setReceiveSku(null);
      setReceiveSkuQuery("");
      setReceiveSkuHits([]);
      void refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Receive failed";
      toast.error(msg);
    } finally {
      setReceiving(false);
    }
  };

  const loadDispensationLog = useCallback(async () => {
    setLogLoading(true);
    try {
      let query = supabase
        .from("inventory_dispensations")
        .select("*")
        .order("dispensed_at", { ascending: false })
        .limit(500);
      if (logFromDate) query = query.gte("dispensed_at", new Date(logFromDate).toISOString());
      if (logToDate) {
        const end = new Date(logToDate);
        end.setHours(23, 59, 59, 999);
        query = query.lte("dispensed_at", end.toISOString());
      }
      if (logTxType !== "all") query = query.eq("transaction_type", logTxType);
      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []) as Dispensation[];
      const lotIds = Array.from(new Set(rows.map((r) => r.lot_id)));
      const patientIds = Array.from(new Set(rows.map((r) => r.patient_id).filter(Boolean) as string[]));

      const lotData: Lot[] = lotIds.length
        ? (((await supabase.from("inventory_lots").select("*").in("id", lotIds)).data ?? []) as Lot[])
        : [];
      const patientData: Array<{ id: string; full_name: string }> = patientIds.length
        ? (((await supabase.from("patients").select("id, full_name").in("id", patientIds)).data ?? []) as Array<{
            id: string;
            full_name: string;
          }>)
        : [];

      const lotMap = new Map<string, Lot>(lotData.map((l) => [l.id, l]));
      const patientMap = new Map<string, string>(patientData.map((p) => [p.id, p.full_name]));

      const skuIds = Array.from(new Set(lotData.map((l) => l.sku_id)));
      const skuData: Sku[] = skuIds.length
        ? (((await supabase.from("inventory_skus").select("*").in("id", skuIds)).data ?? []) as Sku[])
        : [];
      const skuMap = new Map<string, Sku>(skuData.map((s) => [s.id, s]));

      setLogRows(
        rows.map((r) => {
          const lot = lotMap.get(r.lot_id) ?? null;
          const sku = lot ? skuMap.get(lot.sku_id) ?? null : null;
          return {
            ...r,
            lot,
            sku,
            patientName: r.patient_id ? patientMap.get(r.patient_id) ?? null : null,
          };
        }),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load dispensation log";
      toast.error(msg);
    } finally {
      setLogLoading(false);
    }
  }, [logFromDate, logToDate, logTxType]);

  useEffect(() => {
    void loadDispensationLog();
  }, [loadDispensationLog]);

  const exportLogCsv = (controlledOnly: boolean) => {
    const filtered = controlledOnly ? logRows.filter((r) => r.sku?.is_controlled_substance) : logRows;
    downloadCsv(
      `inventory-dispensation-log${controlledOnly ? "-controlled" : ""}-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "dispensed_at",
        "transaction_type",
        "sku_code",
        "display_name",
        "lot_number",
        "expiration_date",
        "quantity_dispensed",
        "unit",
        "patient_name",
        "controlled_schedule",
        "reason",
        "notes",
        "dispensed_by",
      ],
      filtered.map((r) => [
        r.dispensed_at,
        r.transaction_type,
        r.sku?.sku_code ?? "",
        r.sku?.display_name ?? "",
        r.lot?.lot_number ?? "",
        r.lot?.expiration_date ?? "",
        r.quantity_dispensed,
        r.unit,
        r.patientName ?? "",
        r.sku?.is_controlled_substance ? r.sku.controlled_schedule ?? "controlled" : "",
        r.reason ?? "",
        r.notes ?? "",
        r.dispensed_by,
      ]),
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6 font-jost">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-playfair text-2xl text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Lot-level traceability with FEFO. {skus.length} active SKUs · {lots.filter((l) => l.status === "active").length} active lots.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => void runExpirationSweep()}>
            <AlarmClock className="h-4 w-4 mr-1" />
            Run expiration sweep
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setDispensePrefillSku(null);
              setDispenseOpen(true);
            }}
          >
            <Syringe className="h-4 w-4 mr-1" />
            Dispense
          </Button>
        </div>
      </div>

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Stock Status</TabsTrigger>
          <TabsTrigger value="receive">Receive Shipment</TabsTrigger>
          <TabsTrigger value="log">Dispensation Log</TabsTrigger>
        </TabsList>

        {/* ─────────────── TAB 1 — STOCK STATUS ─────────────── */}
        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-2 relative">
                  <Search className="h-4 w-4 absolute left-2.5 top-3 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or SKU code"
                    className="pl-8"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={vendorFilter} onValueChange={setVendorFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VENDORS.map((v) => (
                      <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={controlledFilter} onValueChange={(v) => setControlledFilter(v as typeof controlledFilter)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Controlled & non-controlled</SelectItem>
                    <SelectItem value="controlled">Controlled substance only</SelectItem>
                    <SelectItem value="non_controlled">Non-controlled only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                    <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expiration">Soonest expiration</SelectItem>
                      <SelectItem value="quantity">Lowest quantity</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={exportStockCsv}>
                  <Download className="h-4 w-4 mr-1" />
                  Export current stock CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Total qty</TableHead>
                    <TableHead className="text-right">Lots</TableHead>
                    <TableHead>Earliest exp.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skuStatusRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                        No SKUs match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    skuStatusRows.map((r) => (
                      <TableRow
                        key={r.sku.id}
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => setSkuPanelId(r.sku.id)}
                      >
                        <TableCell>
                          <div className="font-medium">{r.sku.display_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.sku.sku_code}
                            {r.sku.is_controlled_substance ? ` · CIII` : ""}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs capitalize">{r.sku.category.replace(/_/g, " ")}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {r.totalQuantity} {r.sku.default_unit}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{r.lotCount}</TableCell>
                        <TableCell>
                          {r.earliestExpiration ? (
                            <span className={r.hasExpiringSoon ? "text-amber-700" : ""}>
                              {r.earliestExpiration}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{reorderBadge(r.reorderStatus)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDispensePrefillSku(r.sku.id);
                              setDispenseOpen(true);
                            }}
                            disabled={r.totalQuantity <= 0}
                          >
                            Dispense
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─────────────── TAB 2 — RECEIVE SHIPMENT ─────────────── */}
        <TabsContent value="receive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-base">Log incoming inventory</CardTitle>
              <p className="text-xs text-muted-foreground">
                Adds an active lot. Barcode scanning will be added once FCC ships with codes.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>SKU</Label>
                {receiveSku ? (
                  <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 p-2 text-sm">
                    <div>
                      <div className="font-medium">{receiveSku.display_name}</div>
                      <div className="text-xs text-muted-foreground">{receiveSku.sku_code} · default unit {receiveSku.default_unit}</div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setReceiveSku(null)}>Change</Button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input
                        value={receiveSkuQuery}
                        onChange={(e) => setReceiveSkuQuery(e.target.value)}
                        placeholder="Search by name or SKU code"
                      />
                      <Button type="button" variant="secondary" onClick={() => void searchReceiveSkus()}>
                        Search
                      </Button>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {receiveSkuHits.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className="w-full text-left rounded-md border border-border/60 px-2 py-1.5 text-sm hover:bg-muted/50"
                          onClick={() => setReceiveSku(s)}
                        >
                          <div className="font-medium">{s.display_name}</div>
                          <div className="text-xs text-muted-foreground">{s.sku_code} · {s.category}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="lot-number">Lot number</Label>
                  <Input id="lot-number" value={receiveLotNumber} onChange={(e) => setReceiveLotNumber(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exp-date">Expiration date</Label>
                  <Input id="exp-date" type="date" value={receiveExpiration} onChange={(e) => setReceiveExpiration(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="qty-rcvd">Quantity received</Label>
                  <Input id="qty-rcvd" type="number" step="any" min={0} value={receiveQty} onChange={(e) => setReceiveQty(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="invoice">Vendor invoice #</Label>
                  <Input id="invoice" value={receiveInvoice} onChange={(e) => setReceiveInvoice(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="loc">Storage location</Label>
                  <Select value={receiveLocation} onValueChange={setReceiveLocation}>
                    <SelectTrigger id="loc"><SelectValue placeholder="Select location" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="refrigerator_1">Refrigerator 1</SelectItem>
                      <SelectItem value="refrigerator_2">Refrigerator 2</SelectItem>
                      <SelectItem value="cabinet_a">Cabinet A</SelectItem>
                      <SelectItem value="cabinet_b">Cabinet B</SelectItem>
                      <SelectItem value="safe">Safe (controlled)</SelectItem>
                      <SelectItem value="iv_lounge_supply">IV lounge supply</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cost">Cost per unit (USD)</Label>
                  <Input id="cost" type="number" step="0.01" min={0} value={receiveCost} onChange={(e) => setReceiveCost(e.target.value)} placeholder="optional" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => void receiveLot()} disabled={receiving || !receiveSku}>
                  {receiving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PackagePlus className="h-4 w-4 mr-2" />}
                  Receive
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─────────────── TAB 3 — DISPENSATION LOG ─────────────── */}
        <TabsContent value="log" className="space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="from">From</Label>
                  <Input id="from" type="date" value={logFromDate} onChange={(e) => setLogFromDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="to">To</Label>
                  <Input id="to" type="date" value={logToDate} onChange={(e) => setLogToDate(e.target.value)} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Transaction type</Label>
                  <Select value={logTxType} onValueChange={setLogTxType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => exportLogCsv(false)}>
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportLogCsv(true)}>
                  <Download className="h-4 w-4 mr-1" />
                  Export DEA Schedule III subset
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {logLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Lot</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Reason / notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                          No dispensations match the current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      logRows.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-xs">{new Date(r.dispensed_at).toLocaleString()}</TableCell>
                          <TableCell className="text-xs capitalize">{r.transaction_type.replace(/_/g, " ")}</TableCell>
                          <TableCell>
                            <div className="text-sm">{r.sku?.display_name ?? "—"}</div>
                            <div className="text-xs text-muted-foreground">{r.sku?.sku_code ?? ""}</div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {r.lot?.lot_number ?? "—"}
                            {r.lot?.expiration_date ? ` (exp ${r.lot.expiration_date})` : ""}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {r.quantity_dispensed} {r.unit}
                          </TableCell>
                          <TableCell className="text-sm">{r.patientName ?? <span className="text-muted-foreground">—</span>}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[260px]">
                            {[r.reason, r.notes].filter(Boolean).join(" — ")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SKU detail panel */}
      <Sheet open={!!skuPanelId} onOpenChange={(v) => { if (!v) setSkuPanelId(null); }}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {skuOnPanel && (
            <>
              <SheetHeader>
                <SheetTitle className="font-playfair">{skuOnPanel.display_name}</SheetTitle>
                <SheetDescription>
                  {skuOnPanel.sku_code} · {skuOnPanel.category.replace(/_/g, " ")} · {skuOnPanel.vendor}
                  {skuOnPanel.is_controlled_substance ? ` · Schedule ${skuOnPanel.controlled_schedule ?? "C"}` : ""}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="text-sm">
                  Reorder threshold <span className="font-mono">{skuOnPanel.reorder_threshold}</span> · target <span className="font-mono">{skuOnPanel.reorder_target}</span> · default unit{" "}
                  <span className="font-mono">{skuOnPanel.default_unit}</span>
                </div>
                <div>
                  <h3 className="font-playfair text-sm mb-2">Lots ({lotsForPanel.length})</h3>
                  {lotsForPanel.length === 0 ? (
                    <p className="text-sm italic text-muted-foreground">No lots received yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {lotsForPanel.map((l) => (
                        <div key={l.id} className="rounded-md border border-border/60 p-2 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">Lot {l.lot_number}</span>
                            <Badge variant={l.status === "active" ? "secondary" : "outline"} className="text-[10px]">{l.status}</Badge>
                          </div>
                          <div className="text-muted-foreground">
                            Exp {l.expiration_date} · {l.quantity_remaining} of {l.quantity_received} {l.unit} remaining
                          </div>
                          <div className="text-muted-foreground">
                            Received {new Date(l.received_at).toLocaleDateString()}
                            {l.storage_location ? ` · ${l.storage_location}` : ""}
                            {l.vendor_invoice_number ? ` · invoice ${l.vendor_invoice_number}` : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setDispensePrefillSku(skuOnPanel.id);
                      setDispenseOpen(true);
                    }}
                  >
                    <Syringe className="h-4 w-4 mr-1" />
                    Dispense from this SKU
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <DispenseFromInventoryModal
        open={dispenseOpen}
        onOpenChange={setDispenseOpen}
        prefillSkuId={dispensePrefillSku}
        onDispensed={() => void refresh()}
      />

      <p className="text-xs text-muted-foreground text-center">
        Need help? See the <Link to="/clinical-protocols" className="underline">clinical protocols</Link> for dosing guidance.
      </p>
    </div>
  );
}
