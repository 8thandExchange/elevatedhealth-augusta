import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fullPricingReadinessAudit, readinessSummary } from "@/lib/pricingReadiness";
import { fmtUsd } from "@/lib/pricing";
import { supplyProfileForItem, type SupplyReadinessProfile } from "@/lib/supplyReadiness";
import { catalogBySlug, CLINICAL_OPTIMIZATION_CATALOG } from "@/lib/clinicalOptimizationCatalog";

const PricingReadinessAdmin = () => {
  const summary = readinessSummary();
  const rows = fullPricingReadinessAudit();

  return (
    <>
      <Helmet>
        <title>Pricing Readiness | Elevated Health Augusta</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button asChild variant="ghost" size="sm" className="font-jost gap-2">
              <Link to="/formulary-economics">
                <ArrowLeft className="h-4 w-4" />
                Formulary economics
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="font-jost">
              <Link to="/clinical-policy">Clinical policy</Link>
            </Button>
          </div>

          <div>
            <p className="section-label mb-2">Internal — operations</p>
            <h1 className="font-playfair text-3xl md:text-4xl text-foreground mb-2">
              Pricing &amp; supply <span className="italic">readiness</span>
            </h1>
            <p className="font-jost text-sm text-muted-foreground max-w-3xl">
              Items with blockers cannot be quoted until cost, supplier, margin, and consent fields
              are complete. Sync prices to docs/pricing/pricing_source_of_truth.md.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-jost">Catalog items</CardTitle>
              </CardHeader>
              <CardContent className="font-playfair text-2xl">{summary.total}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-jost text-green-700">Quotable</CardTitle>
              </CardHeader>
              <CardContent className="font-playfair text-2xl text-green-700">{summary.quotable}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-jost text-destructive">Blocked</CardTitle>
              </CardHeader>
              <CardContent className="font-playfair text-2xl text-destructive">{summary.blocked}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-jost">Missing COGS</CardTitle>
              </CardHeader>
              <CardContent className="font-playfair text-2xl">{summary.missingCost}</CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-jost text-base">Readiness audit</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>COGS</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.slug}>
                      <TableCell className="font-jost text-sm font-medium">{row.display_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">{row.clinical_status}</Badge>
                          <Badge variant="secondary" className="text-xs">{row.public_status}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.patient_price_cents != null ? fmtUsd(row.patient_price_cents) : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.clinic_cost_cents != null ? fmtUsd(row.clinic_cost_cents) : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.margin_percent != null ? `${row.margin_percent}%` : "—"}
                      </TableCell>
                      <TableCell>
                        {row.quotable ? (
                          <span className="inline-flex items-center gap-1 text-green-700 text-xs font-jost">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-destructive text-xs font-jost">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {row.blockers.slice(0, 2).join("; ")}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-jost text-base">Recovery Peptide Review lane</CardTitle>
            </CardHeader>
            <CardContent className="font-jost text-sm text-muted-foreground space-y-2">
              <p>
                Care lane ID: <code className="text-xs">recovery_peptide_review</code> — required before
                quoting BPC-157, TB-500, recovery stack, or PDA.
              </p>
              <p>Gates: foundational labs, medication review, malignancy screen, pregnancy screen, recovery goal documentation, Research Peptide Consent, provider sign-off, economics, supply.</p>
              <p>See <code>src/lib/recoveryPeptideCareLane.ts</code> and provider protocol algorithms.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-jost text-base">Supply checklist reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {CLINICAL_OPTIMIZATION_CATALOG.filter((i) => i.ordering_supplies_required)
                .slice(0, 6)
                .map((item) => {
                  const profile: SupplyReadinessProfile = supplyProfileForItem(item);
                  return (
                    <div key={item.slug} className="border-b border-border pb-4 last:border-0">
                      <p className="font-jost font-medium text-sm mb-2">{item.display_name}</p>
                      <ul className="font-jost text-xs text-muted-foreground grid sm:grid-cols-2 gap-1">
                        {profile.checklist.map((c) => (
                          <li key={c.key}>• {c.label}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              <p className="font-jost text-xs text-muted-foreground">
                Full profiles in <code>src/lib/supplyReadiness.ts</code>. IV and lab draw lists included.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PricingReadinessAdmin;
