import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface Pharmacy {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  fulfillment_method: "online_portal" | "fax";
  fax_number: string | null;
  phone_number: string | null;
  portal_url: string | null;
  address: string | null;
  contact_email: string | null;
  contact_name: string | null;
  default_for_categories: string[];
  is_active: boolean;
  sort_order: number;
}

interface PharmacySelectorProps {
  category: string;
  selectedPharmacyId: string | null;
  onChange: (pharmacyId: string, pharmacy: Pharmacy) => void;
  disabled?: boolean;
  /** Bump to reload the pharmacy list after adding one */
  refreshToken?: number;
  onAddPharmacyClick?: () => void;
}

export function PharmacySelector({
  category,
  selectedPharmacyId,
  onChange,
  disabled,
  refreshToken = 0,
  onAddPharmacyClick,
}: PharmacySelectorProps) {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: fetchError } = await supabase
        .from("pharmacies")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }
      const list = (data ?? []) as Pharmacy[];
      setPharmacies(list);
      setLoading(false);
      if (!selectedPharmacyId && list.length > 0) {
        const defaultPharm = list.find((p) => p.default_for_categories.includes(category));
        const fallback = defaultPharm ?? list[0];
        if (fallback) {
          onChange(fallback.id, fallback);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category, refreshToken]);

  const selected = pharmacies.find((p) => p.id === selectedPharmacyId);
  const isNonDefault = selected && !selected.default_for_categories.includes(category);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading pharmacies…</div>;
  }
  if (error) {
    return <div className="text-sm text-destructive">Failed to load pharmacies: {error}</div>;
  }
  if (pharmacies.length === 0) {
    return (
      <div className="text-sm text-destructive">No active pharmacies configured. Contact admin.</div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
      <Select
        value={selectedPharmacyId ?? undefined}
        onValueChange={(id) => {
          const p = pharmacies.find((x) => x.id === id);
          if (p) onChange(id, p);
        }}
        disabled={disabled}
      >
        <SelectTrigger className="bg-background border-gold/30">
          <SelectValue placeholder="Select pharmacy…" />
        </SelectTrigger>
        <SelectContent className="bg-background border">
          {pharmacies.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.display_name} — {p.fulfillment_method === "online_portal" ? "Portal" : "Fax"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {onAddPharmacyClick && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 border-gold/30"
          onClick={onAddPharmacyClick}
          disabled={disabled}
          title="Add fax pharmacy"
        >
          <Plus className="w-4 h-4" />
        </Button>
      )}
      </div>
      {selected && (
        <p className="text-xs text-muted-foreground">
          {selected.fulfillment_method === "online_portal"
            ? `Prescription will be entered via ${selected.display_name}'s portal. We'll format it for easy copy-paste.`
            : `Prescription will be faxed to ${selected.display_name} at ${selected.fax_number ?? "fax on file"}.`}
        </p>
      )}
      {selected && isNonDefault && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Warning: {selected.display_name} isn&apos;t the typical pharmacy for this category. Continue
          only if intentional.
        </p>
      )}
    </div>
  );
}
