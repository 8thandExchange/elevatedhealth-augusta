import { useState, useMemo } from "react";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Copy, Check, ExternalLink, Pill } from "lucide-react";
import { toast } from "sonner";
import {
  FCC_FORMULARY,
  FCC_CATEGORY_LABELS,
  FCC_PORTAL_URL,
  type FCCCategory,
  type FCCItem,
} from "@/lib/fccFormulary";

interface FCCFormularyLookupProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onSelect?: (item: FCCItem) => void;
}

const ALL = "all" as const;
type Filter = FCCCategory | typeof ALL;

const FCCFormularyLookup = ({ isOpen, onClose, initialQuery = "", onSelect }: FCCFormularyLookupProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>(ALL);
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FCC_FORMULARY.filter((item) => {
      if (filter !== ALL && item.category !== filter) return false;
      if (!q) return true;
      return (
        item.sku.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.strength.toLowerCase().includes(q)
      );
    }).slice(0, 200);
  }, [query, filter]);

  const handleCopySku = async (sku: string) => {
    await navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    toast.success(`SKU ${sku} copied`);
    setTimeout(() => setCopiedSku(null), 1800);
  };

  const handleCopyLine = async (item: FCCItem) => {
    const line = `SKU ${item.sku} — ${item.name} ${item.strength}, ${item.quantity} (${item.price})`;
    await navigator.clipboard.writeText(line);
    toast.success("Order line copied");
  };

  const categories: Filter[] = [ALL, ...(Object.keys(FCC_CATEGORY_LABELS) as FCCCategory[])];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent layout="pinned" className="max-h-[85vh] max-w-3xl rounded-2xl border border-gold/30 bg-card">
        <DialogHeader className="border-b border-border/50 px-6 py-4 pr-12 pt-10 text-left">
          <DialogTitle className="flex items-center gap-2 font-playfair text-xl">
            <Pill className="h-5 w-5 text-accent" />
            FCC FormuConnect 2026 Formulary
          </DialogTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Search by SKU, drug name, or strength. Prices are wholesale FCC cost (not patient-facing).
          </p>
        </DialogHeader>

        <DialogBody className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. Sermorelin, NAD, Tirzepatide, 3122..."
            className="pl-9 bg-background border-gold/30"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-1.5 flex-wrap mt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                filter === cat
                  ? "bg-accent text-white border-gold"
                  : "bg-secondary/40 text-muted-foreground border-border hover:border-gold/30"
              }`}
            >
              {cat === ALL ? "All" : FCC_CATEGORY_LABELS[cat as FCCCategory]}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-1.5 pr-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No matches. Try a partial drug name or SKU number.
            </p>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={`${item.sku}-${idx}`}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 bg-card hover:border-gold/30 transition-colors"
              >
                <button
                  onClick={() => handleCopySku(item.sku)}
                  className="flex-shrink-0 font-mono text-xs px-2 py-1 rounded bg-accent/10 text-accent border border-gold/30 hover:bg-accent/20 min-w-[60px]"
                  title="Copy SKU"
                >
                  {copiedSku === item.sku ? (
                    <Check className="w-3 h-3 mx-auto" />
                  ) : (
                    item.sku
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.strength} • {item.quantity}
                    {item.notes && <span className="text-amber-600"> • {item.notes}</span>}
                  </p>
                </div>
                <Badge variant="outline" className="text-accent border-gold/30 text-xs whitespace-nowrap">
                  {item.price}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => handleCopyLine(item)} className="h-7 w-7 p-0" title="Copy full line">
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                {onSelect && (
                  <Button size="sm" variant="outline" onClick={() => { onSelect(item); onClose(); }} className="text-xs h-7">
                    Use
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
        </DialogBody>

        {/* Footer */}
        <div className="mt-2 flex shrink-0 items-center justify-between border-t border-border/50 px-6 py-4">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {FCC_FORMULARY.length} items
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(FCC_PORTAL_URL, "_blank")}
            className="border-gold/30"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Open FormuConnect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FCCFormularyLookup;
