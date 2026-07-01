import {
  GLP1_PROGRAM_VARIANTS,
  MEDICATION_FILLS,
} from "@/lib/stripeConfig";
import { therapyByKey } from "@/lib/therapyCatalog";
import { TherapyComparisonCard } from "./design-system";

const GLP_CARDS = [
  {
    key: "semaglutide",
    price: GLP1_PROGRAM_VARIANTS.semaglutide.displayPrice,
    badge: "Headline program",
    fill: MEDICATION_FILLS.semaglutide.displayPrice,
    highlighted: true,
  },
  {
    key: "tirzepatide",
    price: GLP1_PROGRAM_VARIANTS.tirzepatide.displayPrice,
    badge: "Dual-action program",
    fill: MEDICATION_FILLS.tirzepatide.displayPrice,
    highlighted: false,
  },
  {
    key: "retatrutide",
    price: MEDICATION_FILLS.retatrutide.displayPrice,
    badge: "Investigational option",
    fill: null as string | null,
    highlighted: false,
    providerGated: true,
  },
] as const;

export function GlpTherapyOverviewCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {GLP_CARDS.map(({ key, price, badge, fill, highlighted, providerGated }) => {
        const therapy = therapyByKey(key);
        if (!therapy) return null;
        return (
          <TherapyComparisonCard
            key={key}
            name={therapy.name.replace(/\s*\(.+\)$/, "")}
            description={therapy.description}
            programPrice={price}
            badge={badge}
            fillPrice={fill}
            providerGated={providerGated}
            highlighted={highlighted}
          />
        );
      })}
    </div>
  );
}
