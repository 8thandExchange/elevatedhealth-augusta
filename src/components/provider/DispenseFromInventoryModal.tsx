import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Sku = Tables<"inventory_skus">;
type Lot = Tables<"inventory_lots">;
type Patient = Pick<Tables<"patients">, "id" | "full_name">;

type TransactionType = "patient_dose" | "waste" | "clinic_use";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional: pre-populate the SKU (e.g. invoked from a protocol-execution flow). */
  prefillSkuId?: string | null;
  /** Optional: pre-populate the patient. */
  prefillPatientId?: string | null;
  /** Optional: link this dispensation to a clinical protocol execution row. */
  protocolExecutionId?: string | null;
  /** Optional: link to an appointment row. */
  appointmentId?: string | null;
  /** Optional: default quantity (e.g. standard dose). */
  defaultQuantity?: number;
  onDispensed?: (dispensationId: string, depleted: boolean) => void;
};

export default function DispenseFromInventoryModal({
  open,
  onOpenChange,
  prefillSkuId,
  prefillPatientId,
  protocolExecutionId,
  appointmentId,
  defaultQuantity,
  onDispensed,
}: Props) {
  const [skuQuery, setSkuQuery] = useState("");
  const [skuHits, setSkuHits] = useState<Sku[]>([]);
  const [selectedSku, setSelectedSku] = useState<Sku | null>(null);

  const [feFoLot, setFeFoLot] = useState<Lot | null>(null);
  const [overrideLot, setOverrideLot] = useState(false);
  const [allLots, setAllLots] = useState<Lot[]>([]);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);

  const [quantity, setQuantity] = useState<string>(defaultQuantity ? String(defaultQuantity) : "");
  const [transactionType, setTransactionType] = useState<TransactionType>("patient_dose");
  const [patientQuery, setPatientQuery] = useState("");
  const [patientHits, setPatientHits] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(prefillPatientId ?? null);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setSkuQuery("");
    setSkuHits([]);
    setSelectedSku(null);
    setFeFoLot(null);
    setOverrideLot(false);
    setAllLots([]);
    setSelectedLotId(null);
    setQuantity(defaultQuantity ? String(defaultQuantity) : "");
    setTransactionType("patient_dose");
    setPatientQuery("");
    setPatientHits([]);
    setSelectedPatientId(prefillPatientId ?? null);
    setNotes("");
    setReason("");
    setSubmitting(false);
  }, [defaultQuantity, prefillPatientId]);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  // Pre-fill the SKU when opened with an id.
  useEffect(() => {
    let cancelled = false;
    const loadSku = async () => {
      if (!open || !prefillSkuId) return;
      const { data } = await supabase
        .from("inventory_skus")
        .select("*")
        .eq("id", prefillSkuId)
        .maybeSingle();
      if (cancelled) return;
      if (data) setSelectedSku(data as Sku);
    };
    void loadSku();
    return () => {
      cancelled = true;
    };
  }, [open, prefillSkuId]);

  // After a SKU is selected, fetch the FEFO lot.
  useEffect(() => {
    let cancelled = false;
    const loadLot = async () => {
      if (!selectedSku) {
        setFeFoLot(null);
        setSelectedLotId(null);
        setAllLots([]);
        return;
      }
      const { data: lotId, error } = await supabase.rpc("get_active_lot_for_sku", {
        p_sku_id: selectedSku.id,
      });
      if (cancelled) return;
      if (error) {
        toast.error(`Could not look up lot: ${error.message}`);
        return;
      }
      if (!lotId) {
        setFeFoLot(null);
        setSelectedLotId(null);
        return;
      }
      const { data: lot } = await supabase
        .from("inventory_lots")
        .select("*")
        .eq("id", lotId)
        .maybeSingle();
      if (cancelled) return;
      if (lot) {
        setFeFoLot(lot as Lot);
        setSelectedLotId(lot.id);
      }
    };
    void loadLot();
  }, [selectedSku]);

  // When override is toggled on, fetch all active lots for this SKU.
  useEffect(() => {
    let cancelled = false;
    const loadAllLots = async () => {
      if (!overrideLot || !selectedSku) return;
      const { data, error } = await supabase
        .from("inventory_lots")
        .select("*")
        .eq("sku_id", selectedSku.id)
        .eq("status", "active")
        .gt("quantity_remaining", 0)
        .order("expiration_date", { ascending: true });
      if (cancelled) return;
      if (error) {
        toast.error(`Could not load lots: ${error.message}`);
        return;
      }
      setAllLots((data ?? []) as Lot[]);
    };
    void loadAllLots();
  }, [overrideLot, selectedSku]);

  const searchSkus = async () => {
    const q = skuQuery.trim();
    if (q.length < 2) {
      setSkuHits([]);
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
    setSkuHits((data ?? []) as Sku[]);
  };

  const searchPatients = async () => {
    const q = patientQuery.trim();
    if (q.length < 2) {
      setPatientHits([]);
      return;
    }
    const { data, error } = await supabase
      .from("patients")
      .select("id, full_name")
      .ilike("full_name", `%${q}%`)
      .limit(8);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPatientHits((data ?? []) as Patient[]);
  };

  const reasonRequired = transactionType === "waste" || transactionType === "clinic_use";
  const patientRequired = transactionType === "patient_dose";

  const dbTransactionType = useMemo<"patient_dose" | "waste">(() => {
    return transactionType === "patient_dose" ? "patient_dose" : "waste";
  }, [transactionType]);

  const dispense = async () => {
    if (!selectedLotId) {
      toast.error("No lot selected. This SKU may have no active stock.");
      return;
    }
    const qty = Number(quantity);
    if (!qty || Number.isNaN(qty) || qty <= 0) {
      toast.error("Enter a positive quantity");
      return;
    }
    if (patientRequired && !selectedPatientId) {
      toast.error("Select a patient for a patient dose");
      return;
    }
    if (reasonRequired && reason.trim().length === 0) {
      toast.error("Reason is required for waste / clinic use");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("dispense_from_lot", {
        p_lot_id: selectedLotId,
        p_quantity: qty,
        p_transaction_type: dbTransactionType,
        p_patient_id: patientRequired ? selectedPatientId : null,
        p_appointment_id: appointmentId ?? null,
        p_protocol_execution_id: protocolExecutionId ?? null,
        p_notes: notes.trim() || null,
        p_reason: reasonRequired
          ? `${transactionType === "clinic_use" ? "clinic_use: " : ""}${reason.trim()}`
          : null,
      });
      if (error) throw error;

      // Was the lot depleted?
      let depleted = false;
      const { data: latest } = await supabase
        .from("inventory_lots")
        .select("status, quantity_remaining")
        .eq("id", selectedLotId)
        .maybeSingle();
      if (latest && (latest.status === "depleted" || Number(latest.quantity_remaining) === 0)) {
        depleted = true;
        toast.warning("Lot is now depleted — receive a new lot when available.");
      } else {
        toast.success("Dispensation logged");
      }
      onDispensed?.(typeof data === "string" ? data : "", depleted);
      onOpenChange(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Dispensation failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Dispense from inventory</DialogTitle>
          <DialogDescription>
            Logs an immutable audit row and decrements lot quantity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {!prefillSkuId && (
            <div className="space-y-2">
              <Label>Item / SKU</Label>
              {selectedSku ? (
                <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 p-2">
                  <div>
                    <div className="font-medium">{selectedSku.display_name}</div>
                    <div className="text-xs text-muted-foreground">{selectedSku.sku_code}</div>
                  </div>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedSku(null)}>
                    Change
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      value={skuQuery}
                      onChange={(e) => setSkuQuery(e.target.value)}
                      placeholder="Search by name or SKU code"
                    />
                    <Button type="button" variant="secondary" onClick={() => void searchSkus()}>
                      Search
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {skuHits.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="w-full text-left rounded-md border border-border/60 px-2 py-1.5 text-sm hover:bg-muted/50"
                        onClick={() => setSelectedSku(s)}
                      >
                        <div className="font-medium">{s.display_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.sku_code} · {s.category}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {selectedSku && (
            <div className="space-y-2">
              <Label>Lot (FEFO)</Label>
              {feFoLot ? (
                <div className="rounded-md border border-border/60 bg-muted/30 p-2 text-sm space-y-1">
                  <div>
                    Pulling from <span className="font-medium">Lot {feFoLot.lot_number}</span>, expiring{" "}
                    <span className="font-medium">{feFoLot.expiration_date}</span>{" "}
                    <Badge variant="outline" className="ml-1">
                      soonest-expiring active lot
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Remaining {feFoLot.quantity_remaining} {feFoLot.unit}
                    {feFoLot.storage_location ? ` · ${feFoLot.storage_location}` : ""}
                  </div>
                  <button
                    type="button"
                    className="text-xs text-primary underline-offset-2 hover:underline"
                    onClick={() => setOverrideLot((v) => !v)}
                  >
                    {overrideLot ? "Use FEFO lot" : "Override lot selection"}
                  </button>
                  {overrideLot && (
                    <div className="space-y-1 pt-2">
                      {allLots.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          className={`block w-full text-left rounded border px-2 py-1 text-xs ${
                            selectedLotId === l.id
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                          onClick={() => setSelectedLotId(l.id)}
                        >
                          Lot {l.lot_number} — exp {l.expiration_date} — {l.quantity_remaining} {l.unit}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-sm text-destructive">
                  No active lot for this SKU. Receive a shipment in the Receive tab before dispensing.
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                step="any"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 1"
              />
              {feFoLot && (
                <p className="text-xs text-muted-foreground mt-1">in {feFoLot.unit}</p>
              )}
            </div>
            <div>
              <Label>Transaction type</Label>
              <RadioGroup
                value={transactionType}
                onValueChange={(v) => setTransactionType(v as TransactionType)}
                className="mt-1 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="t-patient" value="patient_dose" />
                  <Label htmlFor="t-patient" className="text-xs cursor-pointer">
                    Patient dose
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="t-waste" value="waste" />
                  <Label htmlFor="t-waste" className="text-xs cursor-pointer">
                    Waste
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="t-clinic" value="clinic_use" />
                  <Label htmlFor="t-clinic" className="text-xs cursor-pointer">
                    Clinic use (training / demo)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {patientRequired && (
            <div className="space-y-2">
              <Label>Patient</Label>
              {selectedPatientId ? (
                <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 p-2">
                  <span className="text-sm">
                    {patientHits.find((p) => p.id === selectedPatientId)?.full_name ?? selectedPatientId}
                  </span>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedPatientId(null)}>
                    Change
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      value={patientQuery}
                      onChange={(e) => setPatientQuery(e.target.value)}
                      placeholder="Search by name"
                    />
                    <Button type="button" variant="secondary" onClick={() => void searchPatients()}>
                      Search
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {patientHits.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left rounded-md border border-border/60 px-2 py-1.5 text-sm hover:bg-muted/50"
                        onClick={() => setSelectedPatientId(p.id)}
                      >
                        {p.full_name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {reasonRequired && (
            <div className="space-y-1">
              <Label htmlFor="reason">Reason (required)</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={transactionType === "waste" ? "e.g. dropped vial" : "e.g. staff training session"}
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional context"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={() => void dispense()} disabled={submitting || !feFoLot || !selectedLotId}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Dispense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
