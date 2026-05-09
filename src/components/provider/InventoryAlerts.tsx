import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, PackageX, RefreshCw } from "lucide-react";

type Sku = Tables<"inventory_skus">;
type Lot = Tables<"inventory_lots">;

type AlertCounts = {
  reorderNow: Array<{ sku: Sku; total: number }>;
  expiringSoon: Array<{ sku: Sku; lot: Lot; daysToExpiry: number }>;
  recentlyDepleted: Array<{ sku: Sku; lot: Lot }>;
};

export type InventoryAlertsCounts = {
  reorderCount: number;
  expiringCount: number;
};

type Props = {
  /** Optional callback so a parent (sidebar badge) can react to fresh counts. */
  onCounts?: (counts: InventoryAlertsCounts) => void;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default function InventoryAlerts({ onCounts }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AlertCounts>({ reorderNow: [], expiringSoon: [], recentlyDepleted: [] });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: skuRows } = await supabase.from("inventory_skus").select("*").eq("is_active", true);
      const { data: lotRows } = await supabase
        .from("inventory_lots")
        .select("*")
        .in("status", ["active", "depleted"]);
      const skus = (skuRows ?? []) as Sku[];
      const lots = (lotRows ?? []) as Lot[];

      const skuById = new Map(skus.map((s) => [s.id, s]));
      const totals = new Map<string, number>();
      for (const lot of lots) {
        if (lot.status !== "active" || Number(lot.quantity_remaining) <= 0) continue;
        totals.set(lot.sku_id, (totals.get(lot.sku_id) ?? 0) + Number(lot.quantity_remaining));
      }

      const reorderNow: AlertCounts["reorderNow"] = [];
      for (const sku of skus) {
        const total = totals.get(sku.id) ?? 0;
        if (total <= sku.reorder_threshold) {
          reorderNow.push({ sku, total });
        }
      }
      reorderNow.sort((a, b) => a.total - b.total);

      const today = new Date();
      const expiringSoon: AlertCounts["expiringSoon"] = [];
      for (const lot of lots) {
        if (lot.status !== "active" || Number(lot.quantity_remaining) <= 0) continue;
        const days = Math.ceil((new Date(lot.expiration_date).getTime() - today.getTime()) / MS_PER_DAY);
        if (days <= 30) {
          const sku = skuById.get(lot.sku_id);
          if (sku) expiringSoon.push({ sku, lot, daysToExpiry: days });
        }
      }
      expiringSoon.sort((a, b) => a.daysToExpiry - b.daysToExpiry);

      const sevenDaysAgo = new Date(Date.now() - 7 * MS_PER_DAY);
      const recentlyDepleted: AlertCounts["recentlyDepleted"] = [];
      for (const lot of lots) {
        if (lot.status !== "depleted") continue;
        if (new Date(lot.updated_at).getTime() < sevenDaysAgo.getTime()) continue;
        const sku = skuById.get(lot.sku_id);
        if (sku) recentlyDepleted.push({ sku, lot });
      }
      recentlyDepleted.sort((a, b) => b.lot.updated_at.localeCompare(a.lot.updated_at));

      const next = { reorderNow, expiringSoon, recentlyDepleted };
      setData(next);
      onCounts?.({ reorderCount: reorderNow.length, expiringCount: expiringSoon.length });
    } finally {
      setLoading(false);
    }
  }, [onCounts]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="font-playfair text-lg">Inventory alerts</CardTitle>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => void load()} aria-label="Refresh inventory alerts">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/inventory">Open inventory</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Section
          icon={<PackageX className="h-4 w-4 text-orange-600" />}
          title="Reorder now"
          empty="All stock above reorder threshold."
          items={data.reorderNow.map(({ sku, total }) => ({
            key: sku.id,
            primary: sku.display_name,
            secondary: `${total} ${sku.default_unit} on hand · threshold ${sku.reorder_threshold}`,
            badge: <Badge className="bg-orange-500 hover:bg-orange-500 text-white">Reorder</Badge>,
          }))}
        />

        <Section
          icon={<Clock className="h-4 w-4 text-amber-600" />}
          title="Expiring within 30 days"
          empty="Nothing expiring in the next 30 days."
          items={data.expiringSoon.map(({ sku, lot, daysToExpiry }) => ({
            key: lot.id,
            primary: sku.display_name,
            secondary: `Lot ${lot.lot_number} · expires ${lot.expiration_date} (${daysToExpiry < 0 ? "past due" : `${daysToExpiry}d`})`,
            badge: (
              <Badge className={daysToExpiry < 0 ? "bg-destructive text-destructive-foreground" : "bg-amber-500 text-white hover:bg-amber-500"}>
                {daysToExpiry < 0 ? "Past due" : `${daysToExpiry}d`}
              </Badge>
            ),
          }))}
        />

        <Section
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          title="Recently depleted (7d)"
          empty="No lots have hit zero in the last 7 days."
          items={data.recentlyDepleted.map(({ sku, lot }) => ({
            key: lot.id,
            primary: sku.display_name,
            secondary: `Lot ${lot.lot_number} depleted ${new Date(lot.updated_at).toLocaleDateString()}`,
            badge: <Badge variant="outline">Depleted</Badge>,
          }))}
        />
      </CardContent>
    </Card>
  );
}

function Section({
  icon,
  title,
  empty,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  empty: string;
  items: Array<{ key: string; primary: string; secondary: string; badge: React.ReactNode }>;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-medium">{title}</span>
        <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 5).map((it) => (
            <li key={it.key} className="flex items-start justify-between gap-2 rounded-md border border-border/40 px-2 py-1.5">
              <div className="min-w-0 flex-1">
                <div className="text-sm leading-tight truncate">{it.primary}</div>
                <div className="text-xs text-muted-foreground">{it.secondary}</div>
              </div>
              {it.badge}
            </li>
          ))}
          {items.length > 5 ? (
            <li className="text-xs text-muted-foreground pl-2">+ {items.length - 5} more — see Inventory dashboard</li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
