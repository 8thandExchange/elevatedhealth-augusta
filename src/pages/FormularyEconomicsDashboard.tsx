import { useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, AlertTriangle } from "lucide-react";
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
import {
  allEconomicsRows,
  fmtPct,
  fmtUsd,
  metabolicStackEconomics,
} from "@/lib/formularyEconomics";

const FormularyEconomicsDashboard = () => {
  const stack = useMemo(() => metabolicStackEconomics(), []);
  const rows = useMemo(() => allEconomicsRows(), []);

  return (
    <>
      <Helmet>
        <title>Formulary Economics | Elevated Health Augusta</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button asChild variant="ghost" size="sm" className="font-jost gap-2">
              <Link to="/staff/vendor-guide">
                <ArrowLeft className="h-4 w-4" />
                Vendor guide
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="font-jost">
                <Link to="/formulary">Formulary editor</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="font-jost">
                <Link to="/staff-pricing-cheatsheet">Pricing cheatsheet</Link>
              </Button>
            </div>
          </div>

          <div>
            <p className="section-label mb-2">Internal — financial analysis</p>
            <h1 className="font-playfair text-3xl md:text-4xl text-foreground mb-2">
              Formulary economics
            </h1>
            <p className="font-jost text-sm text-muted-foreground max-w-3xl">
              Primary vs alternate vendor COGS from{" "}
              <code className="text-xs">src/lib/vendorRouting.ts</code>. Synced to{" "}
              <code className="text-xs">clinic_formulary</code> via migration{" "}
              <code className="text-xs">20260615010000</code>. GC = peptide partner; FCC = IV/core;
              Custom Pharmacy = hormones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-jost text-sm font-normal text-muted-foreground">
                  Metabolic stack @ GC COGS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-playfair text-3xl text-foreground">{fmtPct(stack.gcMarginPct)}</p>
                <p className="font-jost text-xs text-muted-foreground mt-1">
                  {fmtUsd(stack.gcModeledCogsCents)} COGS on {fmtUsd(stack.programPriceCents)}/mo
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-jost text-sm font-normal text-muted-foreground">
                  Same program @ FCC COGS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-playfair text-3xl text-destructive">{fmtPct(stack.fccMarginPct)}</p>
                <p className="font-jost text-xs text-muted-foreground mt-1">
                  {fmtUsd(stack.fccModeledCogsCents)} COGS — not viable at full dose
                </p>
              </CardContent>
            </Card>
            <Card className="border-accent/30">
              <CardHeader className="pb-2">
                <CardTitle className="font-jost text-sm font-normal text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  GC savings vs FCC (stack model)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-playfair text-3xl text-accent">
                  {fmtUsd(stack.gcSavingsVsFccCents)}
                </p>
                <p className="font-jost text-xs text-muted-foreground mt-1">per patient-month at modeled capacity</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Line-item COGS & margin</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Primary</TableHead>
                    <TableHead className="text-right">Primary COGS</TableHead>
                    <TableHead>Alternate</TableHead>
                    <TableHead className="text-right">Alt COGS</TableHead>
                    <TableHead className="text-right">Retail</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead>Menu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.itemCode}>
                      <TableCell>
                        <div className="font-medium text-sm">{r.label}</div>
                        <div className="text-xs text-muted-foreground">{r.itemCode}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-jost text-xs uppercase">
                          {r.primarySupplier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {fmtUsd(r.primaryCostCents)}
                        <span className="text-xs text-muted-foreground block">/{r.primaryCostUnit}</span>
                      </TableCell>
                      <TableCell>
                        {r.alternateSupplier ? (
                          <Badge variant="secondary" className="font-jost text-xs uppercase">
                            {r.alternateSupplier}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {r.alternateCostCents != null ? fmtUsd(r.alternateCostCents) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {r.clientPriceCents > 0 ? fmtUsd(r.clientPriceCents) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {r.marginPrimaryPct != null ? (
                          <span
                            className={
                              r.marginPrimaryPct < 15 ? "text-destructive" : "text-foreground"
                            }
                          >
                            {fmtPct(r.marginPrimaryPct)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {r.publicMenu ? (
                          <Badge className="font-jost text-xs">Public</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Escalation</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-6 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="font-jost text-sm text-muted-foreground space-y-2">
                <p>
                  <strong className="text-foreground">SS-31 at full daily dose</strong> uses multiple
                  GC vials/month — margin on à la carte ${249}/mo is thin if patient runs 5 mg/day.
                  Prefer bundle or escalate price before quoting SS-31 alone.
                </p>
                <p>
                  Stack COGS uses <strong className="text-foreground">phased-average</strong> GC model
                  ($748/mo), not worst-case concurrent full dose.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default FormularyEconomicsDashboard;
