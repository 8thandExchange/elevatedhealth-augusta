import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
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
  buildGoalLabTable,
  buildVendorRoutingTable,
  CHARGE_CHECKPOINTS,
  CONSENT_CHECKLIST,
  LAB_REDIRECT_EXAMPLES,
  LANE_A_IV_STEPS,
  LANE_B_CONSULT_STEPS,
  NEVER_DO,
  NEVER_SAY,
  PATIENT_JOURNEY_STEPS,
  PRINTABLE_CHECKLIST,
  STAFF_OPENING_SCRIPT,
} from "@/lib/staffSystemGuideContent";

const StaffSystemGuide = () => {
  const goalLabRows = buildGoalLabTable();
  const vendorRows = buildVendorRoutingTable();

  return (
    <>
      <Helmet>
        <title>How the System Works | Elevated Health Augusta</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background print:bg-white">
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8 print:max-w-none print:py-4">
          <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
            <Button asChild variant="ghost" size="sm" className="font-jost gap-2">
              <Link to="/provider/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Provider dashboard
              </Link>
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="font-jost">
                <Link to="/clinical-policy">Clinical policy</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="font-jost">
                <Link to="/staff/clinical-pathway">Clinical pathway</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="font-jost">
                <Link to="/lab-catalog">Lab catalog</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-jost gap-2"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" />
                Print guide
              </Button>
            </div>
          </div>

          <div>
            <p className="section-label mb-2">Internal — staff training</p>
            <h1 className="font-playfair text-3xl md:text-4xl text-foreground mb-2">
              How the <span className="italic">System</span> Works
            </h1>
            <p className="font-jost text-sm text-muted-foreground max-w-3xl">
              Patient journey, booking lanes, goal→lab routing, vendor handoffs, charge checkpoints, and
              consent discipline. Physician signs all protocols and prescriptions.
            </p>
          </div>

          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="pt-6">
              <p className="font-jost text-sm text-foreground italic leading-relaxed">
                &ldquo;{STAFF_OPENING_SCRIPT}&rdquo;
              </p>
            </CardContent>
          </Card>

          {/* Patient journey */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Patient journey (Lane B default)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PATIENT_JOURNEY_STEPS.map((step) => (
                  <div key={step.phase} className="border border-border rounded-lg p-3">
                    <p className="font-playfair text-2xl text-accent mb-1">{step.phase}</p>
                    <p className="font-jost text-sm font-medium text-foreground mb-1">{step.title}</p>
                    <p className="font-jost text-xs text-muted-foreground">{step.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lanes */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair text-lg flex items-center gap-2">
                  Lane A
                  <Badge variant="outline" className="font-jost text-xs">IV Lounge</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="font-jost text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                  {LANE_A_IV_STEPS.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-playfair text-lg flex items-center gap-2">
                  Lane B
                  <Badge variant="outline" className="font-jost text-xs">Consult-gated</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="font-jost text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                  {LANE_B_CONSULT_STEPS.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Goal → lab */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Goal → lab panel</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient goal</TableHead>
                    <TableHead>Default panel</TableHead>
                    <TableHead>Stripe tier</TableHead>
                    <TableHead className="text-right">Patient charge</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goalLabRows.map((row) => (
                    <TableRow key={row.goalKey}>
                      <TableCell className="font-jost text-sm">{row.goalLabel}</TableCell>
                      <TableCell className="font-jost text-sm">{row.panelName}</TableCell>
                      <TableCell>
                        {row.checkoutTier ? (
                          <Badge variant="secondary" className="font-jost text-xs capitalize">
                            {row.checkoutTier}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-jost">{row.patientCharge}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Lab redirects */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Lab redirect examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {LAB_REDIRECT_EXAMPLES.map((ex) => (
                <div key={ex.goal} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <p className="font-jost text-sm font-medium text-foreground">{ex.goal}</p>
                  <p className="font-jost text-xs text-muted-foreground mt-1">
                    <span className="text-destructive/90">Trigger:</span> {ex.trigger}
                  </p>
                  <p className="font-jost text-xs text-muted-foreground">
                    <span className="text-accent">Action:</span> {ex.action}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Vendor routing */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Vendor routing</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service lane</TableHead>
                    <TableHead>Primary vendor</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorRows.map((row) => (
                    <TableRow key={row.laneKey}>
                      <TableCell className="font-jost text-sm">{row.lane}</TableCell>
                      <TableCell className="font-jost text-sm font-medium">{row.vendor}</TableCell>
                      <TableCell className="font-jost text-xs text-muted-foreground">{row.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Charges */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Charge checkpoints</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CHARGE_CHECKPOINTS.map((row) => (
                    <TableRow key={row.item}>
                      <TableCell className="font-jost text-xs">{row.when}</TableCell>
                      <TableCell className="font-jost text-sm">{row.item}</TableCell>
                      <TableCell className="text-right font-jost font-medium">{row.amount}</TableCell>
                      <TableCell className="font-jost text-xs text-muted-foreground">{row.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Consents */}
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-xl">Consent checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="font-jost text-sm space-y-2">
                {CONSENT_CHECKLIST.map((c) => (
                  <li key={c.consent} className="flex flex-wrap gap-2 border-b border-border/40 py-2">
                    <span className="font-medium min-w-[200px]">{c.consent}</span>
                    <span className="text-muted-foreground text-xs">{c.when}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Never say / never do */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="font-playfair text-lg text-destructive">Never say</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="font-jost text-sm space-y-2 text-muted-foreground list-disc list-inside">
                  {NEVER_SAY.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="font-playfair text-lg text-destructive">Never do</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="font-jost text-sm space-y-2 text-muted-foreground list-disc list-inside">
                  {NEVER_DO.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Printable checklist */}
          <Card className="print:break-before-page border-foreground/20">
            <CardHeader>
              <CardTitle className="font-playfair text-xl">One-page visit checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-2">
                {PRINTABLE_CHECKLIST.map((item, i) => (
                  <label
                    key={item}
                    className="flex items-start gap-2 font-jost text-sm text-muted-foreground print:text-black"
                  >
                    <span className="inline-flex h-4 w-4 shrink-0 border border-border rounded print:border-black mt-0.5" />
                    <span>
                      <span className="text-xs text-accent mr-1 print:text-black">{i + 1}.</span>
                      {item}
                    </span>
                  </label>
                ))}
              </div>
              <p className="font-jost text-xs text-muted-foreground mt-4 print:text-black">
                Related:{" "}
                <span className="print:hidden">
                  <Link to="/staff/quick-card" className="text-accent underline">
                    Quick reference card
                  </Link>
                  {" · "}
                  <Link to="/staff/vendor-guide" className="text-accent underline">
                    Vendor guide
                  </Link>
                </span>
                <span className="hidden print:inline">/staff/quick-card · /staff/vendor-guide</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default StaffSystemGuide;
