import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VENDORS, resolveVendorForLane } from "@/lib/vendorRouting";
import { HORMONE_PROTOCOLS } from "@/lib/hormoneProtocolDefaults";
import {
  MENU_SIMPLIFICATION_RATIONALE,
  PUBLIC_MENU,
  STAFF_ESCALATION_MENU,
  publicMenuItemCount,
} from "@/lib/simplifiedMenus";

const StaffVendorGuide = () => {
  return (
    <>
      <Helmet>
        <title>Staff Vendor Guide | Elevated Health Augusta</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="min-h-screen bg-background print:bg-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8 print:max-w-none">
          <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
            <Button asChild variant="ghost" size="sm" className="font-jost gap-2">
              <Link to="/office-manager">
                <ArrowLeft className="h-4 w-4" />
                Office manager
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="font-jost">
                <Link to="/staff/system-guide">System guide</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="font-jost">
                <Link to="/formulary-economics">Economics dashboard</Link>
              </Button>
              <Button type="button" variant="outline" size="sm" className="font-jost" onClick={() => window.print()}>
                Print
              </Button>
            </div>
          </div>

          <div>
            <p className="section-label mb-2">Internal — vendor routing & menu discipline</p>
            <h1 className="font-playfair text-3xl md:text-4xl text-foreground mb-2">Staff vendor guide</h1>
            <p className="font-jost text-sm text-muted-foreground">
              GC = peptides (metabolic stack). FCC = IV + core catalog. Custom Pharmacy of Evans = all hormones.
              Do not offer the full FCC catalog to prospects — {publicMenuItemCount()} headline items only.
            </p>
          </div>

          {/* Vendor lanes */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Who fulfills what</CardTitle>
            </CardHeader>
            <CardContent className="font-jost text-sm space-y-4">
              {Object.values(VENDORS).map((v) => (
                <div key={v.slug} className="border-b border-border/60 pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{v.displayName}</span>
                    <Badge variant="outline" className="text-xs uppercase">
                      {v.fulfillment}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{v.role}</p>
                  <p className="text-xs mt-1 text-accent-foreground/80">{v.routingNote}</p>
                </div>
              ))}
              <div className="border-t border-border pt-4 space-y-2">
                <p className="font-medium text-foreground">Quick lane lookup</p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>IV Lounge → {resolveVendorForLane("iv_lounge").displayName}</li>
                  <li>Metabolic / GC peptides → {resolveVendorForLane("peptides_gc").displayName}</li>
                  <li>Sermorelin, NAD+, healing stack → {resolveVendorForLane("peptides_fcc").displayName}</li>
                  <li>GLP-1 sema/tirz → {resolveVendorForLane("weight_glp1").displayName}</li>
                  <li>All hormones → {resolveVendorForLane("hormones").displayName}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Hormone defaults */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Hormone defaults (reduce options)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {HORMONE_PROTOCOLS.map((protocol) => (
                <div key={protocol.sex}>
                  <h3 className="font-playfair text-lg text-foreground mb-3">{protocol.title}</h3>
                  <ul className="font-jost text-sm space-y-2 mb-3">
                    {protocol.lines.map((line) => (
                      <li key={line.compound} className="flex flex-wrap gap-2">
                        {line.publicDefault ? (
                          <Badge className="text-xs">Default</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Add-on
                          </Badge>
                        )}
                        <span>
                          <strong>{line.compound}</strong> — {line.route} ({line.defaultDose})
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="font-jost text-xs text-muted-foreground">
                    Escalation: {protocol.escalationPaths.join(" · ")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Public menu */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Public menu (quote these first)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {PUBLIC_MENU.map((tier) => (
                <div key={tier.id}>
                  <h3 className="font-jost font-medium text-foreground mb-1">{tier.title}</h3>
                  <p className="font-jost text-xs text-muted-foreground mb-2">{tier.description}</p>
                  <ul className="font-jost text-sm space-y-1">
                    {tier.items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-4 border-b border-border/40 py-1.5">
                        <span>{item.label}</span>
                        <span className="text-muted-foreground whitespace-nowrap">{item.priceDisplay}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Escalation */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Staff escalation only</CardTitle>
            </CardHeader>
            <CardContent className="font-jost text-sm">
              <ul className="space-y-2">
                {STAFF_ESCALATION_MENU.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4 border-b border-border/40 py-2">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground text-xs text-right">{item.priceDisplay}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Why simplify */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Why we limit choices</CardTitle>
            </CardHeader>
            <CardContent className="font-jost text-sm text-muted-foreground space-y-2">
              {MENU_SIMPLIFICATION_RATIONALE.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <p className="pt-2 text-foreground">
                What other clinics do: 3–5 program tiers, one default route per sex, named stacks instead of
                à la carte peptide menus, IV capped at signature drips. Full formulary stays internal for ops
                and margin analysis — not front-desk conversation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default StaffVendorGuide;
