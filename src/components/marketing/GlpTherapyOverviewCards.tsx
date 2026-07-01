import { Card, CardContent } from "@/components/ui/card";
import { therapyByKey } from "@/lib/therapyCatalog";
import {
  GLP1_PROGRAM_VARIANTS,
  MEDICATION_FILLS,
} from "@/lib/stripeConfig";

const GLP_CARDS = [
  {
    key: "semaglutide",
    price: GLP1_PROGRAM_VARIANTS.semaglutide.displayPrice,
    badge: "Headline program",
    fill: MEDICATION_FILLS.semaglutide.displayPrice,
  },
  {
    key: "tirzepatide",
    price: GLP1_PROGRAM_VARIANTS.tirzepatide.displayPrice,
    badge: "Dual-action program",
    fill: MEDICATION_FILLS.tirzepatide.displayPrice,
  },
  {
    key: "retatrutide",
    price: MEDICATION_FILLS.retatrutide.displayPrice,
    badge: "Physician-selected only",
    fill: null as string | null,
  },
] as const;

export function GlpTherapyOverviewCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {GLP_CARDS.map(({ key, price, badge, fill }) => {
        const therapy = therapyByKey(key);
        if (!therapy) return null;
        return (
          <Card key={key} className="border-border/60">
            <CardContent className="p-6 space-y-3">
              <p className="text-[10px] font-jost uppercase tracking-[0.14em] text-accent">{badge}</p>
              <h3 className="font-playfair text-xl text-foreground">{therapy.name.replace(/\s*\(.+\)$/, "")}</h3>
              <p className="font-jost text-sm text-muted-foreground leading-relaxed">{therapy.description}</p>
              <p className="font-jost text-sm">
                <span className="font-medium text-foreground">Program: </span>
                <span className="text-accent">{price}</span>
              </p>
              {fill ? (
                <p className="font-jost text-xs text-muted-foreground">À la carte fill when not on program: {fill}</p>
              ) : (
                <p className="font-jost text-xs text-muted-foreground">
                  Available only when your physician selects it within the GLP-1 program — not self-serve online.
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
