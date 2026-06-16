import { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ALL_PATIENT_GOALS,
  EXCLUDED_COMPOUNDS,
  GOAL_LABELS,
  recommendPathway,
  recommendPathwayFromSymptoms,
  type PatientGoal,
} from "@/lib/clinicalPathwayEngine";
import { fmtUsd } from "@/lib/pricing";
import { CORE_SERVICES } from "@/lib/stripeConfig";

const SYMPTOM_CHIPS = [
  "weight loss",
  "low testosterone",
  "hot flashes",
  "injury recovery",
  "fatigue",
  "libido",
  "IV hydration",
  "metabolic recomposition",
];

const StaffClinicalPathway = () => {
  const [goal, setGoal] = useState<PatientGoal>("weight_loss");
  const [symptoms, setSymptoms] = useState<string[]>([]);

  const pathway = useMemo(() => {
    if (symptoms.length > 0) return recommendPathwayFromSymptoms(symptoms);
    return recommendPathway(goal);
  }, [goal, symptoms]);

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  return (
    <>
      <Helmet>
        <title>Clinical Pathway Engine | Elevated Health Augusta</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-primary/5">
          <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 max-w-5xl">
            <Button asChild variant="ghost" size="sm" className="font-jost gap-2">
              <Link to="/staff/sop-manual">
                <ArrowLeft className="h-4 w-4" />
                SOP Manual
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="font-jost">
              <Link to="/staff/system-guide">System guide</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="font-jost">
              <Link to="/lab-catalog">Lab catalog</Link>
            </Button>
            <Badge variant="outline" className="font-jost text-xs">
              Physician signs all Rx
            </Badge>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <p className="section-label mb-2">Clinical decision support</p>
          <h1 className="font-playfair text-3xl md:text-4xl text-foreground mb-2">
            Pathway <span className="italic">Engine</span>
          </h1>
          <p className="font-jost text-muted-foreground mb-8 max-w-2xl">
            Patient states a goal → this engine returns program, labs, compounds, patient explanation,
            and dosing protocol. Distilled from 104 GC dosing guides into one canonical SKU per compound.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="border border-border rounded-lg p-4">
              <label className="font-jost text-sm font-medium mb-2 block">Primary goal (manual)</label>
              <Select
                value={goal}
                onValueChange={(v) => {
                  setSymptoms([]);
                  setGoal(v as PatientGoal);
                }}
              >
                <SelectTrigger className="font-jost">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_PATIENT_GOALS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {GOAL_LABELS[g]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border border-border rounded-lg p-4">
              <p className="font-jost text-sm font-medium mb-2">Or tap symptoms (auto-route)</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_CHIPS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSymptom(s)}
                    className={`font-jost text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      symptoms.includes(s)
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {symptoms.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 font-jost text-xs"
                  onClick={() => setSymptoms([])}
                >
                  Clear symptoms
                </Button>
              )}
            </div>
          </div>

          {/* Recommendation card */}
          <section className="border border-accent/30 rounded-lg overflow-hidden mb-10">
            <div className="bg-primary px-4 py-3">
              <h2 className="font-playfair text-xl text-primary-foreground">{pathway.goalLabel}</h2>
              <p className="font-jost text-xs text-primary-foreground/80 mt-1">
                Tier: {pathway.offerTier}
                {pathway.programName && ` · ${pathway.programName} (${pathway.programPriceDisplay})`}
              </p>
            </div>
            <div className="p-4 space-y-4 font-jost text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Say to patient</p>
                <p className="leading-relaxed">{pathway.patientExplanation}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Staff script</p>
                <p className="leading-relaxed text-muted-foreground">{pathway.staffScript}</p>
              </div>
              {pathway.upsell && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3">
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-200">Upsell</p>
                  <p className="text-sm">{pathway.upsell}</p>
                </div>
              )}
            </div>
          </section>

          {/* Labs + pricing */}
          <section className="mb-10">
            <h3 className="font-playfair text-xl mb-4">Labs & month-one economics</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Panel / SKU</TableHead>
                  <TableHead className="text-right">Charge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Wellness Assessment</TableCell>
                  <TableCell>All Lane B paths</TableCell>
                  <TableCell className="text-right">{CORE_SERVICES.wellnessAssessment.displayPrice}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Baseline labs</TableCell>
                  <TableCell>{pathway.labPanelName}</TableCell>
                  <TableCell className="text-right">{pathway.labChargeDisplay}</TableCell>
                </TableRow>
                {pathway.programPriceDisplay && (
                  <TableRow>
                    <TableCell>Program month 1</TableCell>
                    <TableCell>{pathway.programName}</TableCell>
                    <TableCell className="text-right">{pathway.programPriceDisplay}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </section>

          {/* Dosing */}
          {pathway.dosing.length > 0 && (
            <section className="mb-10">
              <h3 className="font-playfair text-xl mb-4">Dosing protocols (canonical GC SKU)</h3>
              {pathway.dosing.map((d) => (
                <div key={d.compoundKey} className="border border-border rounded-lg mb-4 overflow-hidden">
                  <div className="bg-muted/40 px-4 py-2 flex flex-wrap justify-between gap-2">
                    <span className="font-medium">{d.displayName}</span>
                    <span className="text-xs font-mono text-muted-foreground">{d.gcSku}</span>
                  </div>
                  <div className="p-4 font-jost text-sm space-y-3">
                    <p>
                      <strong>Reconstitute:</strong> {d.reconstitutionMl}ml BAC · {d.concentrationNote} ·{" "}
                      {d.route} · {d.frequency}
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Weeks</TableHead>
                          <TableHead>Dose</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {d.titration.map((t, i) => (
                          <TableRow key={i}>
                            <TableCell>{t.weeks}</TableCell>
                            <TableCell>
                              {t.dose}
                              {t.syringeNote && (
                                <span className="text-xs text-muted-foreground block">{t.syringeNote}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <p className="text-muted-foreground">{d.patientExplanation}</p>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Algorithm steps */}
          <section className="mb-10">
            <h3 className="font-playfair text-xl mb-4">Algorithm steps</h3>
            <ol className="space-y-2">
              {pathway.algorithmSteps.map((s) => (
                <li
                  key={s.order}
                  className="flex gap-3 border border-border rounded-lg p-3 font-jost text-sm"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-medium">
                    {s.order}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-accent">{s.phase}</p>
                    <p>{s.action}</p>
                    {s.charge && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Charge: {s.charge}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Excluded */}
          <section className="mb-10">
            <h3 className="font-playfair text-xl mb-4">Excluded from menu (104 PDFs reviewed)</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compound</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {EXCLUDED_COMPOUNDS.map((e) => (
                  <TableRow key={e.key}>
                    <TableCell className="font-mono text-xs">{e.key}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="font-jost gap-2">
              <Link to="/staff/sop-manual">
                Full SOP Manual
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="font-jost gap-2">
              <Link to="/formulary-economics">
                Formulary economics
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffClinicalPathway;
