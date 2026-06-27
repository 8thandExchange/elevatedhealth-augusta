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
              <Link to="/office/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button type="button" variant="outline" size="sm" className="font-jost" onClick={() => window.print()}>
              Print
            </Button>
            <Button asChild variant="default" size="sm" className="font-jost">
              <Link to="/staff/formulary-cheat-sheet">Full formulary cheat sheet (PDF layout)</Link>
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
              {Object.entries(PEPTIDE_PRODUCTS)
                .filter(([key]) => !key.startsWith("nad"))
                .map(([, p]) => (
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
              <CardTitle className="font-playfair text-xl">Vendor routing (GC + FCC)</CardTitle>
            </CardHeader>
            <CardContent className="font-jost text-sm space-y-2">
              <p>
                <strong>GC Scientific</strong> — metabolic stack, retatrutide, SS-31, tesamorelin, CJC/Ipamorelin (GC
                network 503A).
              </p>
              <p>
                <strong>FCC</strong> — IV Lounge premix, glutathione pushes, GLP-1 backup when GC unavailable.
              </p>
              <p>
                <strong>Custom Pharmacy of Evans</strong> — all hormones (Bi-Est cream + prog caps women; men's testosterone cream).
              </p>
              <p className="text-xs text-muted-foreground pt-2">
                Full guide: <Link to="/staff/vendor-guide" className="text-accent underline">/staff/vendor-guide</Link> ·
                Margins: <Link to="/formulary-economics" className="text-accent underline">/formulary-economics</Link>
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/40">
            <CardContent className="font-jost text-sm space-y-3">
              <p>
                <span className="font-medium text-foreground">Advanced recomposition:</span>{" "}
                The standalone ELEVATED Metabolic program was retired 2026-06-24. Advanced support is
                delivered inside the GLP-1 program (semaglutide $349/mo · tirzepatide $449/mo) — reviewed
                in person, not advertised.
              </p>
              <p className="text-muted-foreground">
                Provider-directed metabolic peptides (à la carte, monthly):
              </p>
              <ul className="space-y-1 text-xs">
                {Object.values(METABOLIC_STACK_ALACARTE).map((p) => (
                  <li key={p.priceId} className="flex justify-between gap-2">
                    <span>{p.name}</span>
                    <span className="whitespace-nowrap">{p.displayPrice}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Retatrutide fill {MEDICATION_FILLS.retatrutide.displayPrice} — gated, physician-selected
                ONLY, within the GLP-1 lane under the GLP-1 consent. Never the lead, never advertised.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="font-playfair text-xl">ELEVATED Combo (dual lane)</CardTitle>
            </CardHeader>
            <CardContent className="font-jost text-sm space-y-2">
              <p className="text-muted-foreground">
                One anchor program (full bundle) + medication-only add-on on the same subscription. Use
                Provider Dashboard → ELEVATED Combo Enrollment.
              </p>
              <ul className="space-y-1 text-xs">
                <li className="flex justify-between gap-2"><span>TRT med add-on</span><span>+$149/mo</span></li>
                <li className="flex justify-between gap-2"><span>HRT med add-on</span><span>+$129/mo</span></li>
                <li className="flex justify-between gap-2"><span>GLP-1 sema med add-on</span><span>+$249/mo</span></li>
                <li className="flex justify-between gap-2"><span>GLP-1 tirz med add-on</span><span>+$349/mo</span></li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Example: GLP-1 sema $349 + TRT add-on $149 = $498/mo (save $100 vs two full programs).
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
