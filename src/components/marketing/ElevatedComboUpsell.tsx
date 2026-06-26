import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";
import {
  COMBO_GLP1_HORMONE_BODY,
  COMBO_GLP1_HORMONE_HEADLINE,
  COMBO_HORMONE_GLP1_BODY,
  COMBO_HORMONE_GLP1_HEADLINE,
  COMBO_SAVINGS_HOOK,
  comboAddonMarketingLine,
} from "@/lib/comboMarketingCopy";
import { COMBO_ADDONS } from "@/lib/elevatedComboPrograms";

type ComboUpsellVariant = "glp1_led" | "hormone_led";

interface ElevatedComboUpsellProps {
  variant: ComboUpsellVariant;
  className?: string;
  showCta?: boolean;
}

const ElevatedComboUpsell = ({
  variant,
  className = "",
  showCta = true,
}: ElevatedComboUpsellProps) => {
  const headline =
    variant === "glp1_led" ? COMBO_GLP1_HORMONE_HEADLINE : COMBO_HORMONE_GLP1_HEADLINE;
  const body = variant === "glp1_led" ? COMBO_GLP1_HORMONE_BODY : COMBO_HORMONE_GLP1_BODY;

  const addonLines =
    variant === "glp1_led"
      ? [
          comboAddonMarketingLine("trt"),
          comboAddonMarketingLine("hrt"),
        ]
      : [
          comboAddonMarketingLine("glp1_semaglutide"),
          comboAddonMarketingLine("glp1_tirzepatide"),
        ];

  return (
    <section
      className={`rounded-xl border border-accent/25 bg-gradient-to-br from-accent/5 to-transparent p-6 md:p-8 ${className}`}
    >
      <div className="flex items-start gap-3 mb-4">
        <Layers className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <div>
          <h3 className="font-playfair text-xl md:text-2xl text-foreground">{headline}</h3>
          <p className="font-jost text-sm text-muted-foreground mt-2 leading-relaxed">{body}</p>
        </div>
      </div>
      <ul className="font-jost text-sm space-y-1.5 mb-4 ml-8">
        {addonLines.map((line) => (
          <li key={line} className="text-foreground">
            <span className="text-accent font-medium">{line}</span>
          </li>
        ))}
      </ul>
      <p className="font-jost text-xs text-muted-foreground ml-8 mb-4">{COMBO_SAVINGS_HOOK}</p>
      <p className="font-jost text-[11px] text-muted-foreground ml-8">
        Add-ons are medication-only; your anchor program includes RN check-ins, messaging, and
        quarterly labs. Both lanes require physician approval.
      </p>
      {showCta && (
        <div className="mt-6 ml-8">
          <Button asChild variant="outline" size="sm" className="border-accent/40">
            <Link to="/consult/start">Start with a Wellness Assessment</Link>
          </Button>
        </div>
      )}
    </section>
  );
};

export default ElevatedComboUpsell;
