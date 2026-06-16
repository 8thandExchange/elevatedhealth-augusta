import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
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
  IV_HARD_BLOCK_RULES,
  IV_INGREDIENT_RULES,
  IV_WARNING_RULES,
} from "@/lib/ivScreeningEngine";

const StaffIVScreeningGuide = () => (
  <>
    <Helmet>
      <title>IV Safety Catalog | Elevated Health Augusta</title>
      <meta name="robots" content="noindex,nofollow" />
    </Helmet>

    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm" className="font-jost gap-2">
            <Link to="/staff/system-guide">
              <ArrowLeft className="h-4 w-4" />
              System guide
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="font-jost">
            <Link to="/iv-lounge">Patient IV Lounge page</Link>
          </Button>
        </div>

        <div>
          <p className="section-label mb-2">Internal — IV Lane A</p>
          <h1 className="font-playfair text-3xl md:text-4xl text-foreground mb-2">
            IV <span className="italic">Safety</span> Catalog
          </h1>
          <p className="font-jost text-sm text-muted-foreground max-w-3xl">
            Deterministic screening rules shared with the patient IV intake edge function. Hard blocks
            stop booking; warnings require RN acknowledgment on the warnings screen before infusion.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-jost text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Universal hard blocks (all IV services)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-jost text-sm">
            {IV_HARD_BLOCK_RULES.map((rule) => (
              <p key={rule.intakeKey}>• {rule.message}</p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-jost text-base">Service-specific blocks</CardTitle>
          </CardHeader>
          <CardContent className="font-jost text-sm space-y-2">
            <p>
              • <strong>G6PD deficiency</strong> — blocks services flagged{" "}
              <code className="text-xs">requires_g6pd_clearance</code> in the IV catalog (high-dose
              vitamin C / NAD+ infusions).
            </p>
            <p>
              • <strong>Sesame allergy</strong> — blocks only therapies flagged{" "}
              <code className="text-xs">contraindicates_sesame_allergy</code> (sesame-oil formulations).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-jost text-base">Warning-only (staff must acknowledge)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Staff action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {IV_WARNING_RULES.map((rule) => (
                  <TableRow key={rule.intakeKey}>
                    <TableCell className="font-mono text-xs">{rule.intakeKey}</TableCell>
                    <TableCell className="text-sm">{rule.message}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{rule.staffAction}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-jost text-base">Ingredient reference</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Hard CI</TableHead>
                  <TableHead>Soft warnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {IV_INGREDIENT_RULES.map((row) => (
                  <TableRow key={row.ingredientKey}>
                    <TableCell className="font-jost text-sm font-medium">{row.displayName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.servicesContaining.join(", ")}
                    </TableCell>
                    <TableCell>
                      {row.hardContraindications.length === 0 ? (
                        <span className="text-muted-foreground text-xs">—</span>
                      ) : (
                        row.hardContraindications.map((c) => (
                          <Badge key={c} variant="destructive" className="mr-1 text-xs">
                            {c}
                          </Badge>
                        ))
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.softWarnings.join(", ") || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  </>
);

export default StaffIVScreeningGuide;
