import { fmtUsd } from "@/lib/pricing";
import {
  metabolicStackAlacarteMemberCents,
  metabolicStackAlacarteNonMemberCents,
  stackAlacarteLineItems,
} from "@/lib/metabolicStackPricing";
import { ELEVATED_PROGRAMS } from "@/lib/stripeConfig";
import { METABOLIC_STACK_MOTSC_NOTE } from "@/lib/metabolicStackConfig";

export function MetabolicStackPricingTable() {
  const lines = stackAlacarteLineItems();
  const programCents = ELEVATED_PROGRAMS.metabolicRecomposition.amount;
  const alacarteNon = metabolicStackAlacarteNonMemberCents();
  const alacarteMember = metabolicStackAlacarteMemberCents();
  const savings = alacarteNon - programCents;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground max-w-3xl">
        You can buy every compound à la carte after your consult — or enroll in the{" "}
        <strong className="text-foreground">named program</strong> and get phased medications, labs, and clinical
        oversight in one monthly price. Active ELEVATED members on <em>other</em> tiers still get 20% off eligible
        stack add-ons bought separately.
      </p>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-4 gap-0 bg-muted/40 border-b border-border text-sm font-medium">
          <div className="p-3 col-span-2">Compound (à la carte)</div>
          <div className="p-3 text-right">Non-member</div>
          <div className="p-3 text-right">Other ELEVATED member</div>
        </div>
        {lines.map((line) => (
          <div
            key={line.key}
            className="grid grid-cols-4 gap-0 border-b border-border last:border-b-0 text-sm"
          >
            <div className="p-3 col-span-2">
              {line.name}
              <span className="text-xs text-muted-foreground ml-1">
                ({line.interval === "one_time" ? "per fill" : "/mo"})
              </span>
            </div>
            <div className="p-3 text-right">{fmtUsd(line.nonMemberCents)}</div>
            <div className="p-3 text-right">{fmtUsd(line.memberCents)}</div>
          </div>
        ))}
        <div className="grid grid-cols-4 gap-0 border-t-2 border-border bg-muted/20 font-medium text-sm">
          <div className="p-3 col-span-2">À la carte total (all lines at full stack)</div>
          <div className="p-3 text-right">{fmtUsd(alacarteNon)}/mo eq.</div>
          <div className="p-3 text-right">{fmtUsd(alacarteMember)}/mo eq.</div>
        </div>
        <div className="grid grid-cols-4 gap-0 bg-accent/10 font-playfair text-base">
          <div className="p-4 col-span-2">
            ELEVATED Metabolic Recomposition program
            <p className="text-xs font-jost font-normal text-muted-foreground mt-1">
              Medications phased in + RN check-ins + quarterly labs + messaging included
            </p>
          </div>
          <div className="p-4 text-right col-span-2 text-accent-foreground">
            {ELEVATED_PROGRAMS.metabolicRecomposition.displayPrice}
            {savings > 0 && (
              <p className="text-xs font-jost text-green-700 dark:text-green-400 mt-1">
                Saves {fmtUsd(savings)}+/mo vs buying every line separately
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{METABOLIC_STACK_MOTSC_NOTE}</p>
    </div>
  );
}
