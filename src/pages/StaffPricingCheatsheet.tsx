import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CORE_SERVICES,
  ELEVATED_PROGRAMS,
  HAIR_RESTORATION_PRODUCTS,
  MEDICATION_FILLS,
  METABOLIC_STACK_ALACARTE,
  PEPTIDE_PRODUCTS,
  SEXUAL_WELLNESS_PRODUCTS,
} from "@/lib/stripeConfig";
import { MEMBER_DISCOUNT_PERCENT } from "@/lib/pricing";
import { metabolicStackAlacarteNonMemberCents, stackAlacarteLineItems } from "@/lib/metabolicStackPricing";
import { METABOLIC_STACK_DISPLAY } from "@/lib/metabolicStackConfig";

const fmtMember = (displayNonMember: string) => `${displayNonMember} → ${MEMBER_DISCOUNT_PERCENT}% off for ELEVATED members`;

const StaffPricingCheatsheet = () => {
  return (
    <>
      <Helmet>
        <title>Staff Pricing Cheatsheet | Elevated Health Augusta</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="min-h-screen bg-background print:bg-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8 print:max-w-none">
          <div className="flex items-center justify-between gap-4 print:hidden">
            <Button asChild variant="ghost" size="sm" className="font-jost gap-2">
              <Link to="/office-manager">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button type="button" variant="outline" size="sm" className="font-jost" onClick={() => window.print()}>
              Print
            </Button>
          </div>

          <div>
            <p className="section-label mb-2">Internal — do not quote legacy SKUs</p>
            <h1 className="font-playfair text-3xl md:text-4xl text-foreground mb-2">Pricing cheatsheet (live catalog)</h1>
            <p className="font-jost text-sm text-muted-foreground">
              Source: <code className="text-xs">src/lib/stripeConfig.ts</code> and docs/pricing/pricing_source_of_truth.md. Member discount on à la
              carte: {MEMBER_DISCOUNT_PERCENT}% when patient holds any active ELEVATED program.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">ELEVATED programs (recurring)</CardTitle>
            </CardHeader>
            <CardContent className="font-jost text-sm space-y-2">
              <p className="text-muted-foreground mb-3">Each includes medication when prescribed in-program, monthly check-in with our clinical team, quarterly labs, lab review, unlimited messaging.</p>
              <ul className="space-y-1">
                {Object.values(ELEVATED_PROGRAMS).map((p) => (
                  <li key={p.priceId}>
                    <span className="font-medium text-foreground">{p.name}</span> — {p.displayPrice}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Core services (one-time)</CardTitle>
            </CardHeader>
            <CardContent className="font-jost text-sm space-y-1">
              {Object.values(CORE_SERVICES).map((s) => (
                <div key={s.priceId} className="flex justify-between gap-4 border-b border-border/60 py-2 last:border-0">
                  <span>{s.name}</span>
                  <span className="font-medium whitespace-nowrap">{s.displayPrice}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">À la carte medication fills (non-member)</CardTitle>
            </CardHeader>
            <CardContent className="font-jost text-sm space-y-1">
              {Object.values(MEDICATION_FILLS).map((m) => (
                <div key={m.priceId} className="flex justify-between gap-4 border-b border-border/60 py-2 last:border-0">
                  <span>{m.name}</span>
                  <span className="font-medium whitespace-nowrap">{fmtMember(m.displayPrice)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Peptide catalog (recurring monthly SKUs)</CardTitle>
            </CardHeader>
            <CardContent className="font-jost text-sm space-y-1">
              {Object.values(PEPTIDE_PRODUCTS).map((p) => (
                <div key={p.priceId} className="flex justify-between gap-4 border-b border-border/60 py-2 last:border-0">
                  <span>{p.name}</span>
                  <span className="font-medium whitespace-nowrap">{fmtMember(p.displayPrice)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Sexual wellness (à la carte)</CardTitle>
            </CardHeader>
            <CardContent className="font-jost text-sm space-y-1">
              {Object.values(SEXUAL_WELLNESS_PRODUCTS).map((p) => (
                <div key={p.priceId} className="flex justify-between gap-4 border-b border-border/60 py-2 last:border-0">
                  <span>{p.name}</span>
                  <span className="font-medium whitespace-nowrap">{fmtMember(p.displayPrice)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Hair restoration (à la carte)</CardTitle>
            </CardHeader>
            <CardContent className="font-jost text-sm space-y-1">
              {Object.values(HAIR_RESTORATION_PRODUCTS).map((p) => (
                <div key={p.priceId} className="flex justify-between gap-4 border-b border-border/60 py-2 last:border-0">
                  <span>{p.name}</span>
                  <span className="font-medium whitespace-nowrap">{fmtMember(p.displayPrice)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-accent/40">
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Metabolic Recomposition Stack</CardTitle>
            </CardHeader>
            <CardContent className="font-jost text-sm space-y-3">
              <p>
                <span className="font-medium text-foreground">Program (recommended):</span>{" "}
                {ELEVATED_PROGRAMS.metabolicRecomposition.name} — {METABOLIC_STACK_DISPLAY} all-in (phased Rx +
                monitoring). Protocol slug: <code className="text-xs">metabolic-recomposition-stack-90d</code> (draft —
                Akers sign-off).
              </p>
              <p className="text-muted-foreground">
                À la carte if patient declines program (sum at full stack ≈ $
                {(metabolicStackAlacarteNonMemberCents() / 100).toFixed(0)}/mo eq.):
              </p>
              <ul className="space-y-1 text-xs">
                {stackAlacarteLineItems().map((line) => (
                  <li key={line.key} className="flex justify-between gap-2">
                    <span>{line.name}</span>
                    <span className="whitespace-nowrap">
                      ${(line.nonMemberCents / 100).toFixed(0)}
                      {line.interval === "one_time" ? "/fill" : "/mo"}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Stack-only à la carte SKUs: {Object.values(METABOLIC_STACK_ALACARTE).map((p) => p.name).join(", ")}.
                Retatrutide fill {MEDICATION_FILLS.retatrutide.displayPrice} — included on program.
              </p>
            </CardContent>
          </Card>

          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="font-playfair text-xl text-destructive">DO NOT QUOTE TO PATIENTS</CardTitle>
            </CardHeader>
            <CardContent className="font-jost text-sm text-muted-foreground space-y-2">
              <p>Legacy pre-2026 tier names, retired home hormone kits, retired $99/$149 consult SKUs, any “pharmacy pass-through” framing, and ketamine or branded esketamine retail pricing are discontinued or Phase 3 only.</p>
              <p>Legacy Stripe price IDs prefixed with legacy test accounts must not appear on new quotes — always use live IDs from stripeConfig.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default StaffPricingCheatsheet;
