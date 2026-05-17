import { useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { normalizeFaxInput, slugifyPharmacyName } from "@/lib/faxNumber";
import type { Pharmacy } from "./PharmacySelector";

interface AddPharmacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (pharmacy: Pharmacy) => void;
  initialFaxNumber?: string;
}

export function AddPharmacyDialog({
  open,
  onOpenChange,
  onSaved,
  initialFaxNumber = "",
}: AddPharmacyDialogProps) {
  const [displayName, setDisplayName] = useState("");
  const [faxNumber, setFaxNumber] = useState(initialFaxNumber);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setDisplayName("");
    setFaxNumber(initialFaxNumber);
    setPhoneNumber("");
    setContactName("");
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setFaxNumber(initialFaxNumber);
    } else {
      resetForm();
    }
    onOpenChange(next);
  };

  const handleSave = async () => {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      toast.error("Pharmacy name is required");
      return;
    }

    const normalizedFax = normalizeFaxInput(faxNumber);
    if (!normalizedFax) {
      toast.error("Enter a valid 10-digit US fax number");
      return;
    }

    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("pharmacies")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1);

      const nextSort = ((existing?.[0]?.sort_order as number | undefined) ?? 0) + 10;
      const baseSlug = slugifyPharmacyName(trimmedName);
      let slug = baseSlug;
      let attempt = 0;

      while (attempt < 5) {
        const { data, error } = await supabase
          .from("pharmacies")
          .insert({
            slug,
            name: trimmedName,
            display_name: trimmedName,
            fulfillment_method: "fax",
            fax_number: normalizedFax,
            phone_number: phoneNumber.trim() || null,
            contact_name: contactName.trim() || null,
            default_for_categories: [],
            is_active: true,
            sort_order: nextSort,
          })
          .select("*")
          .single();

        if (!error && data) {
          toast.success(`${trimmedName} added to pharmacy list`);
          onSaved(data as Pharmacy);
          handleOpenChange(false);
          return;
        }

        if (error?.code === "23505") {
          attempt += 1;
          slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
          continue;
        }

        throw error;
      }

      throw new Error("Could not create pharmacy — try a different name");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save pharmacy";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-card border border-gold/30">
        <DialogHeader>
          <DialogTitle className="font-cormorant text-xl">Add fax pharmacy</DialogTitle>
          <DialogDescription>
            Saves to your pharmacy list for future prescriptions. Fax-only — use FCC from the main
            list for portal orders.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pharmacy-display-name">Pharmacy name</Label>
            <Input
              id="pharmacy-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. ABC Compounding"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pharmacy-fax">Fax number</Label>
            <Input
              id="pharmacy-fax"
              value={faxNumber}
              onChange={(e) => setFaxNumber(e.target.value)}
              placeholder="(706) 555-1234"
              inputMode="tel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pharmacy-phone">Phone (optional)</Label>
            <Input
              id="pharmacy-phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(706) 555-1234"
              inputMode="tel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pharmacy-contact">Contact / pharmacist (optional)</Label>
            <Input
              id="pharmacy-contact"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Eric Holgate, RPh"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving} className="bg-gold hover:bg-gold/90 text-primary-foreground">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save pharmacy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
