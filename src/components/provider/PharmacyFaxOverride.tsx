import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatFaxDisplay, normalizeFaxInput } from "@/lib/faxNumber";
import type { Pharmacy } from "./PharmacySelector";

interface PharmacyFaxOverrideProps {
  pharmacy: Pharmacy | null;
  useOverride: boolean;
  onUseOverrideChange: (checked: boolean) => void;
  overrideValue: string;
  onOverrideValueChange: (value: string) => void;
  disabled?: boolean;
}

export function resolveOutboundFaxNumber(
  pharmacy: Pharmacy | null,
  useOverride: boolean,
  overrideValue: string,
): { e164: string | null; error?: string } {
  if (!pharmacy || pharmacy.fulfillment_method !== "fax") {
    return { e164: null, error: "Select a fax pharmacy" };
  }

  if (useOverride) {
    const normalized = normalizeFaxInput(overrideValue);
    if (!normalized) {
      return { e164: null, error: "Enter a valid 10-digit US fax number" };
    }
    return { e164: normalized };
  }

  if (!pharmacy.fax_number) {
    return { e164: null, error: `${pharmacy.display_name} has no fax number on file` };
  }

  return { e164: pharmacy.fax_number };
}

export function PharmacyFaxOverride({
  pharmacy,
  useOverride,
  onUseOverrideChange,
  overrideValue,
  onOverrideValueChange,
  disabled,
}: PharmacyFaxOverrideProps) {
  if (!pharmacy || pharmacy.fulfillment_method !== "fax") {
    return null;
  }

  const onFile = pharmacy.fax_number
    ? formatFaxDisplay(pharmacy.fax_number)
    : "No fax on file";

  return (
    <div className="rounded-lg border border-gold/20 bg-muted/20 p-3 space-y-3">
      <p className="text-xs text-muted-foreground">
        On file for <span className="font-medium text-foreground">{pharmacy.display_name}</span>:{" "}
        {onFile}
      </p>

      <div className="flex items-start gap-2">
        <Checkbox
          id="fax-override"
          checked={useOverride}
          onCheckedChange={(v) => onUseOverrideChange(v === true)}
          disabled={disabled}
        />
        <div className="space-y-1 leading-none">
          <Label htmlFor="fax-override" className="text-sm font-normal cursor-pointer">
            Fax to a different number (this prescription only)
          </Label>
        </div>
      </div>

      {useOverride && (
        <div className="space-y-2 pl-6">
          <Label htmlFor="fax-override-number" className="text-xs text-muted-foreground">
            Fax number
          </Label>
          <Input
            id="fax-override-number"
            value={overrideValue}
            onChange={(e) => onOverrideValueChange(e.target.value)}
            placeholder="(706) 555-1234"
            inputMode="tel"
            disabled={disabled}
            className="bg-background border-gold/30"
          />
        </div>
      )}
    </div>
  );
}
