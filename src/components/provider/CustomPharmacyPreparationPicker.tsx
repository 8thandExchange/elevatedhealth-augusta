import { useEffect, useState } from "react";
import {
  type CustomPharmacyPreparation,
  type CustomPharmacyCategory,
  getCustomPharmacyPreparationsForCategory,
  getCustomPharmacyCreamPreparationsForCategory,
} from "@/lib/customPharmacyFormulary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CustomPharmacyRxSelection {
  preparation: CustomPharmacyPreparation;
  strength: string;
  sig: string;
  quantity: string;
  refills: number;
}

interface Props {
  category: CustomPharmacyCategory;
  selection: CustomPharmacyRxSelection | null;
  onChange: (selection: CustomPharmacyRxSelection | null) => void;
  /** When true, only transdermal creams (Provider Dashboard pharmacy orders). */
  creamsOnly?: boolean;
  /** Pre-select preparation when opening from formulary line item */
  initialPreparationId?: string | null;
}

export function CustomPharmacyPreparationPicker({
  category,
  selection,
  onChange,
  creamsOnly = false,
  initialPreparationId = null,
}: Props) {
  const preparations = creamsOnly
    ? getCustomPharmacyCreamPreparationsForCategory(category)
    : getCustomPharmacyPreparationsForCategory(category);
  const [prepId, setPrepId] = useState<string | null>(
    selection?.preparation.id ?? initialPreparationId ?? null,
  );
  const [strength, setStrength] = useState<string>(selection?.strength ?? "");
  const [sig, setSig] = useState<string>(selection?.sig ?? "");
  const [quantity, setQuantity] = useState<string>(selection?.quantity ?? "");
  const [refills, setRefills] = useState<number>(selection?.refills ?? 2);

  const selected = preparations.find((p) => p.id === prepId);

  const handlePrepChange = (id: string) => {
    setPrepId(id);
    const p = preparations.find((x) => x.id === id);
    if (p) {
      setStrength(p.default_strength);
      setSig(p.default_sig);
      setQuantity(p.default_quantity);
    }
  };

  useEffect(() => {
    if (selection) {
      setPrepId(selection.preparation.id);
      setStrength(selection.strength);
      setSig(selection.sig);
      setQuantity(selection.quantity);
      setRefills(selection.refills);
    }
  }, [selection?.preparation.id, selection?.strength, selection?.sig, selection?.quantity, selection?.refills]);

  useEffect(() => {
    if (initialPreparationId && !selection?.preparation.id) {
      handlePrepChange(initialPreparationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPreparationId]);

  useEffect(() => {
    if (!selected) {
      onChange(null);
      return;
    }
    if (!strength || !sig || !quantity) {
      onChange(null);
      return;
    }
    onChange({ preparation: selected, strength, sig, quantity, refills });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- parent should wrap onChange in useCallback
  }, [selected, strength, sig, quantity, refills]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Preparation</Label>
        <Select value={prepId ?? undefined} onValueChange={handlePrepChange}>
          <SelectTrigger className="bg-background border-gold/30">
            <SelectValue placeholder="Choose a preparation…" />
          </SelectTrigger>
          <SelectContent className="bg-background border">
            {preparations.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selected?.notes && (
          <p className="text-xs text-muted-foreground mt-1">{selected.notes}</p>
        )}
      </div>
      {selected && (
        <>
          <div>
            <Label>Strength</Label>
            <Select value={strength} onValueChange={setStrength}>
              <SelectTrigger className="bg-background border-gold/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                {selected.strength_options.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Sig / Directions</Label>
            <Textarea
              value={sig}
              onChange={(e) => setSig(e.target.value)}
              rows={2}
              className="bg-background border-gold/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quantity</Label>
              <Input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-background border-gold/30"
              />
            </div>
            <div>
              <Label>Refills</Label>
              <Input
                type="number"
                min={0}
                max={11}
                value={refills}
                onChange={(e) => setRefills(parseInt(e.target.value || "0", 10))}
                className="bg-background border-gold/30"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
