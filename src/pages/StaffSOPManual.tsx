import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  CHARGE_CHECKPOINTS,
  PATIENT_JOURNEY_PHASES,
  SOP_ALGORITHMS,
  SOP_MANUAL_META,
  SOP_SECTIONS,
  UPSELL_MATRIX,
  getAlgorithmById,
  getFeaturedAlgorithm,
  type SOPAlgorithm,
  type AlgorithmStep,
} from "@/lib/sopManualContent";
import { downloadSOPManualHtml, downloadSOPManualMarkdown } from "@/lib/sopManualExport";
import {
  allEconomicsRows,
  fmtPct,
  fmtUsd,
} from "@/lib/formularyEconomics";
import { CORE_SERVICES, ELEVATED_PROGRAMS, GLP1_PROGRAM_VARIANTS } from "@/lib/stripeConfig";
import { VENDORS } from "@/lib/vendorRouting";

function StepMeta({ step }: { step: AlgorithmStep }) {
  if (!step.charge && !step.upsell) return null;
  return (
    <div className="pl-8 mt-2 space-y-1">
      {step.charge && (
        <p className="font-jost text-xs text-emerald-700 dark:text-emerald-400">
          <span className="font-medium">Charge →</span> {step.charge}
        </p>
      )}
      {step.upsell && (
        <p className="font-jost text-xs text-amber-800 dark:text-amber-400">
          <span className="font-medium">Upsell →</span> {step.upsell}
        </p>
      )}
    </div>
  );
}

function AlgorithmBlock({ algo, compact }: { algo: SOPAlgorithm; compact?: boolean }) {
  let lastPhase = "";
  return (
    <div className="sop-algorithm border border-border rounded-lg overflow-hidden mb-6 break-inside-avoid">
      <div className="bg-primary px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-jost text-xs text-primary-foreground/70 uppercase tracking-wider">
            {algo.id}
          </span>
          <h4 className="font-playfair text-lg text-primary-foreground">{algo.title}</h4>
        </div>
        <Badge variant="secondary" className="font-jost text-xs">
          {algo.owner}
        </Badge>
      </div>
      {!compact && (
        <div className="px-4 py-2 bg-muted/40 border-b border-border">
          <p className="font-jost text-xs text-muted-foreground">{algo.purpose}</p>
        </div>
      )}
      <ol className="divide-y divide-border">
        {algo.steps.map((s, i) => {
          const showPhase = s.phase && s.phase !== lastPhase;
          if (showPhase) lastPhase = s.phase!;
          return (
            <li key={i}>
              {showPhase && (
                <div className="px-4 py-2 bg-accent/10 border-b border-accent/20">
                  <p className="font-jost text-xs font-medium uppercase tracking-wider text-accent">
                    Phase: {s.phase}
                  </p>
                </div>
              )}
              <div className="px-4 py-3 font-jost text-sm">
                {s.if ? (
                  <div className="space-y-1">
                    <p>
                      <span className="inline-flex h-6 min-w-[1.5rem] px-1 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-medium mr-2">
                        {s.step}
                      </span>
                      <strong>IF</strong> {s.if}
                    </p>
                    {s.then && (
                      <p className="pl-8 text-foreground">
                        <span className="text-accent font-medium">THEN →</span> {s.then}
                      </p>
                    )}
                    {s.else && (
                      <p className="pl-8 text-muted-foreground">
                        <span className="font-medium">ELSE →</span> {s.else}
                      </p>
                    )}
                  </div>
                ) : (
                  <p>
                    <span className="inline-flex h-6 min-w-[1.5rem] px-1 items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-medium mr-2">
                      {s.step}
                    </span>
                    {s.action}
                    {s.stop && (
                      <Badge className="ml-2 text-[10px]" variant="outline">
                        STOP
                      </Badge>
                    )}
                  </p>
                )}
                <StepMeta step={s} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function JourneyTimeline() {
  return (
    <div className="mb-10 overflow-x-auto">
      <div className="flex gap-0 min-w-[720px]">
        {PATIENT_JOURNEY_PHASES.map((p, i) => (
          <div key={p.id} className="flex-1 relative">
            <div className="flex flex-col items-center text-center px-1">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-playfair text-sm mb-2 z-10">
                {p.label}
              </div>
              <p className="font-jost text-xs font-medium text-foreground leading-tight">{p.title}</p>
              <p className="font-jost text-[10px] text-muted-foreground mt-1">{p.owner}</p>
            </div>
            {i < PATIENT_JOURNEY_PHASES.length - 1 && (
              <div
                className="absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 bg-accent/40"
                aria-hidden
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const StaffSOPManual = () => {
  const economics = allEconomicsRows().filter((r) => r.clientPriceCents > 0);
  const master = getFeaturedAlgorithm();

  return (
    <>
      <Helmet>
        <title>SOP Manual | Elevated Health Augusta</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <style>{`
        @media print {
          @page { margin: 0.6in; size: letter; }
          .print\\:hidden { display: none !important; }
          .sop-manual-root { font-size: 9.5pt; }
          .sop-cover { break-after: page; }
          .sop-toc { break-after: page; }
          .sop-section { break-before: page; }
          .sop-section:first-of-type { break-before: auto; }
          .sop-algorithm { break-inside: avoid; }
          table { font-size: 8.5pt; }
          .sop-brand-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="sop-manual-root min-h-screen bg-background print:bg-white">
        {/* Branded top bar */}
        <div className="sop-brand-bar bg-primary print:bg-[#2A2826]">
          <div className="h-1 bg-accent" />
          <div className="container mx-auto px-4 py-2 flex items-center gap-3 max-w-5xl print:hidden">
            <div className="h-8 w-8 rounded bg-primary border border-accent/50 flex items-center justify-center">
              <span className="font-playfair italic text-primary-foreground text-lg leading-none">e</span>
            </div>
            <span className="font-jost text-xs text-primary-foreground/80 tracking-wide uppercase">
              Elevated Health Augusta · Internal SOP
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur print:hidden">
          <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 max-w-5xl">
            <Button asChild variant="ghost" size="sm" className="font-jost gap-2">
              <Link to="/office/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-jost gap-2"
                onClick={() => downloadSOPManualHtml()}
              >
                <FileText className="h-4 w-4" />
                Download HTML
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-jost gap-2"
                onClick={() => downloadSOPManualMarkdown()}
              >
                <Download className="h-4 w-4" />
                Download Markdown
              </Button>
              <Button
                type="button"
                size="sm"
                className="font-jost gap-2 bg-primary"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" />
                Save as PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 max-w-5xl">
          {/* Cover */}
          <header className="sop-cover text-center mb-16 relative">
            <div className="hidden print:block absolute inset-x-0 top-0 h-2 bg-[#B8956A]" />
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-lg bg-primary border-2 border-accent mb-6 print:border-[#B8956A]">
              <span className="font-playfair italic text-5xl text-primary-foreground">e</span>
            </div>
            <p className="section-label mb-4">{SOP_MANUAL_META.classification}</p>
            <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-2 leading-tight">
              Standard Operating
              <br />
              <span className="italic">Procedures Manual</span>
            </h1>
            <p className="font-playfair italic text-accent text-xl mb-6">Elevated Health Augusta</p>
            <p className="font-jost text-muted-foreground max-w-xl mx-auto mb-8">
              Complete patient journey: counsel → labs → review → prescribe → follow-up.
              Billing checkpoints and ethical upsell at every phase.
            </p>
            <div className="inline-grid grid-cols-2 md:grid-cols-4 gap-4 text-left font-jost text-sm border border-border rounded-lg p-6 max-w-3xl mx-auto bg-muted/20">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Version</p>
                <p className="font-medium">{SOP_MANUAL_META.version}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Effective</p>
                <p className="font-medium">{SOP_MANUAL_META.effectiveDate}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Owner</p>
                <p className="font-medium text-xs">{SOP_MANUAL_META.owner}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Clinic</p>
                <p className="font-medium text-xs">{SOP_MANUAL_META.phone}</p>
              </div>
            </div>
          </header>

          {/* Journey timeline */}
          <section className="mb-16 sop-toc">
            <p className="section-label mb-2">At a glance</p>
            <h2 className="font-playfair text-2xl text-foreground mb-6">Patient journey phases</h2>
            <JourneyTimeline />
          </section>

          {/* TOC */}
          <nav className="mb-16 sop-toc print:break-after-page">
            <h2 className="font-playfair text-2xl text-foreground mb-6">Table of contents</h2>
            <ol className="font-jost text-sm space-y-2 columns-1 md:columns-2 gap-8">
              {SOP_SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#sop-${s.id}`} className="text-accent hover:underline">
                    {s.number}. {s.title}
                  </a>
                </li>
              ))}
              <li>
                <a href="#sop-financial-tables" className="text-accent hover:underline">
                  Appendix A — Financial tables
                </a>
              </li>
              <li>
                <a href="#sop-algorithms-index" className="text-accent hover:underline">
                  Appendix B — Sub-algorithms
                </a>
              </li>
            </ol>
          </nav>

          {/* Master algorithm — featured first */}
          {master && (
            <section id="sop-master" className="sop-section mb-16">
              <p className="section-label mb-2">Master algorithm</p>
              <h2 className="font-playfair text-3xl text-foreground mb-4">{master.title}</h2>
              <p className="font-jost text-muted-foreground mb-6 leading-relaxed">{master.purpose}</p>
              <AlgorithmBlock algo={master} />
            </section>
          )}

          {/* Sections */}
          {SOP_SECTIONS.map((section) => (
            <section key={section.id} id={`sop-${section.id}`} className="sop-section mb-16">
              <p className="section-label mb-2">Section {section.number}</p>
              <h2 className="font-playfair text-3xl text-foreground mb-4">{section.title}</h2>
              <p className="font-jost text-muted-foreground mb-6 leading-relaxed">{section.summary}</p>

              {section.bullets && (
                <ul className="font-jost text-sm space-y-2 mb-8 list-disc pl-5">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}

              {section.id === "upsell" && (
                <div className="overflow-x-auto border border-border rounded-lg mb-8">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Phase</TableHead>
                        <TableHead>Trigger</TableHead>
                        <TableHead>Offer</TableHead>
                        <TableHead>Charge</TableHead>
                        <TableHead className="min-w-[200px]">Script</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {UPSELL_MATRIX.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-medium">{r.phase}</TableCell>
                          <TableCell className="text-xs">{r.trigger}</TableCell>
                          <TableCell className="text-xs">{r.offer}</TableCell>
                          <TableCell className="text-xs text-accent">{r.charge}</TableCell>
                          <TableCell className="text-xs italic text-muted-foreground">{r.script}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {section.id === "billing" && (
                <div className="overflow-x-auto border border-border rounded-lg mb-8">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Step</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Stripe SKU</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Verify</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {CHARGE_CHECKPOINTS.map((c) => (
                        <TableRow key={c.step}>
                          <TableCell className="font-mono text-xs font-medium">{c.step}</TableCell>
                          <TableCell className="text-xs">{c.event}</TableCell>
                          <TableCell className="text-xs font-mono">{c.stripeSku}</TableCell>
                          <TableCell className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                            {c.amount}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{c.verify}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {section.id === "vendor" && (
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {Object.values(VENDORS).map((v) => (
                    <div key={v.slug} className="border border-border rounded-lg p-4">
                      <p className="font-jost font-medium text-foreground text-sm">{v.displayName}</p>
                      <p className="font-jost text-xs text-muted-foreground mt-1">{v.role}</p>
                    </div>
                  ))}
                </div>
              )}

              {section.algorithmIds?.map((id) => {
                if (id === "ALGO-000") return null;
                const algo = getAlgorithmById(id);
                return algo ? <AlgorithmBlock key={id} algo={algo} /> : null;
              })}
            </section>
          ))}

          {/* Financial appendix */}
          <section id="sop-financial-tables" className="sop-section mb-16">
            <p className="section-label mb-2">Appendix A</p>
            <h2 className="font-playfair text-3xl text-foreground mb-6">Financial reference</h2>
            <p className="font-jost text-sm text-muted-foreground mb-8">
              Live from vendor routing + Stripe config. Re-download before board meetings — figures
              update with code changes.
            </p>

            <h3 className="font-playfair text-xl mb-4">ELEVATED programs — patient charge</h3>
            <Table className="mb-10">
              <TableHeader>
                <TableRow>
                  <TableHead>Program</TableHead>
                  <TableHead className="text-right">Charge/mo</TableHead>
                  <TableHead>Inclusions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(ELEVATED_PROGRAMS).map((p) => (
                  <TableRow key={p.priceId}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right">{p.displayPrice}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      Rx when in-program, RN check-in, quarterly labs, messaging
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <h3 className="font-playfair text-xl mb-4">First-month patient investment (typical)</h3>
            <Table className="mb-10">
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead className="text-right">Consult</TableHead>
                  <TableHead className="text-right">Labs</TableHead>
                  <TableHead className="text-right">Program mo 1</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(
                  [
                    ["TRT", ELEVATED_PROGRAMS.trt, CORE_SERVICES.comprehensivePanel],
                    ["HRT", ELEVATED_PROGRAMS.hrt, CORE_SERVICES.comprehensivePanel],
                    ["GLP-1 (semaglutide)", GLP1_PROGRAM_VARIANTS.semaglutide, CORE_SERVICES.expandedPanel],
                    ["GLP-1 (tirzepatide)", GLP1_PROGRAM_VARIANTS.tirzepatide, CORE_SERVICES.expandedPanel],
                  ] as const
                ).map(([label, prog, panel]) => {
                  const total =
                    CORE_SERVICES.wellnessAssessment.amount + panel.amount + prog.amount;
                  return (
                    <TableRow key={label}>
                      <TableCell>{label}</TableCell>
                      <TableCell className="text-right">
                        {CORE_SERVICES.wellnessAssessment.displayPrice}
                      </TableCell>
                      <TableCell className="text-right">{panel.displayPrice}</TableCell>
                      <TableCell className="text-right">{prog.displayPrice}</TableCell>
                      <TableCell className="text-right font-medium">{fmtUsd(total)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <h3 className="font-playfair text-xl mb-4">Line-item COGS → charge → margin</h3>
            <div className="overflow-x-auto border border-border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">COGS</TableHead>
                    <TableHead className="text-right">Alt COGS</TableHead>
                    <TableHead className="text-right">Charge</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead className="text-right">$ Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {economics.map((r) => (
                    <TableRow key={r.itemCode}>
                      <TableCell className="text-sm font-medium">{r.label}</TableCell>
                      <TableCell className="text-xs uppercase">{r.primarySupplier}</TableCell>
                      <TableCell className="text-right text-sm">{fmtUsd(r.primaryCostCents)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {r.alternateCostCents != null ? fmtUsd(r.alternateCostCents) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm">{fmtUsd(r.clientPriceCents)}</TableCell>
                      <TableCell className="text-right text-sm">
                        <span className={(r.marginPrimaryPct ?? 0) < 15 ? "text-destructive" : ""}>
                          {fmtPct(r.marginPrimaryPct)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {fmtUsd(r.clientPriceCents - r.primaryCostCents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* Sub-algorithms */}
          <section id="sop-algorithms-index" className="sop-section mb-16">
            <p className="section-label mb-2">Appendix B</p>
            <h2 className="font-playfair text-3xl text-foreground mb-6">Sub-algorithms (quick reference)</h2>
            {SOP_ALGORITHMS.filter((a) => a.id !== "ALGO-000").map((algo) => (
              <AlgorithmBlock key={algo.id} algo={algo} compact />
            ))}
          </section>

          <footer className="border-t border-accent/30 pt-8 font-jost text-xs text-muted-foreground text-center print:mt-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="font-playfair italic text-accent text-base">e</span>
              <span className="uppercase tracking-wider">Elevated Health Augusta</span>
            </div>
            <p>
              {SOP_MANUAL_META.title} · v{SOP_MANUAL_META.version} · {SOP_MANUAL_META.effectiveDate}
            </p>
            <p className="mt-1">
              /staff/sop-manual · /staff/system-guide · /formulary-economics · /staff/vendor-guide
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default StaffSOPManual;
