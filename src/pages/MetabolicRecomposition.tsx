import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2 } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { CORE_SERVICES, ELEVATED_PROGRAMS } from "@/lib/stripeConfig";
import { fmtUsd } from "@/lib/pricing";
import { EverythingIncludedPillars } from "@/components/marketing/EverythingIncludedPillars";
import { MetabolicStackPricingTable } from "@/components/marketing/MetabolicStackPricingTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  METABOLIC_STACK_COMPOUNDS,
  METABOLIC_STACK_LABS,
  METABOLIC_STACK_MOTSC_NOTE,
  METABOLIC_STACK_PHASES,
  metabolicStackMarginPct,
  metabolicStackWholesaleCentsFull,
} from "@/lib/metabolicStackConfig";
import { metabolicStackAlacarteNonMemberCents } from "@/lib/metabolicStackPricing";
import {
  storefrontHeroInner,
  storefrontHeroLabel,
  storefrontHeroLead,
  storefrontHeroSection,
  storefrontHeroTitle,
} from "@/lib/storefrontHero";

const PRICE_CONSULT = CORE_SERVICES.wellnessAssessment.displayPrice;
const PRICE_BASELINE_LABS = CORE_SERVICES.expandedPanel.displayPrice;
const PRICE_STACK = ELEVATED_PROGRAMS.metabolicRecomposition.displayPrice;

const tierColor: Record<string, string> = {
  S: "bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30",
  A: "bg-orange-500/15 text-orange-900 dark:text-orange-200 border-orange-500/30",
  B: "bg-yellow-500/15 text-yellow-900 dark:text-yellow-200 border-yellow-500/30",
  F: "bg-purple-500/15 text-purple-900 dark:text-purple-200 border-purple-500/30",
};

const steps = [
  {
    n: "01",
    t: `Wellness Assessment (${PRICE_CONSULT})`,
    d: "Goals, history, candidacy for phased retatrutide protocol. Required before Rx.",
  },
  {
    n: "02",
    t: "Baseline labs",
    d: `${CORE_SERVICES.expandedPanel.name} (${PRICE_BASELINE_LABS} one-time). Weight/metabolic markers drawn in-office, LabCorp processed.`,
  },
  {
    n: "03",
    t: "Phased protocol launch",
    d: "Week 1: retatrutide anchor at lowest effective dose. Phases 2–4 added per physician schedule as you tolerate each layer.",
  },
  {
    n: "04",
    t: `Ongoing stack (${PRICE_STACK})`,
    d: "One transparent monthly price — medication phases, RN check-ins, quarterly labs, unlimited messaging, physician oversight.",
  },
];

const faqs = [
  {
    q: "Why retatrutide instead of semaglutide or tirzepatide?",
    a: "Retatrutide is a triple agonist (GLP-1, GIP, and glucagon) — a different mechanism class than single- or dual-agonist options. Your physician confirms candidacy and may substitute tirzepatide if retatrutide is not tolerated.",
  },
  {
    q: "Is everything in the stack included in the monthly price?",
    a: "Yes — the ELEVATED Metabolic Recomposition program bundles phased medications, monitoring, and clinical oversight into one monthly price. Initial consult and baseline labs are separate one-time onboarding fees, consistent with our other ELEVATED programs.",
  },
  {
    q: "When do the other peptides start?",
    a: "SS-31 and NAD+ typically begin once retatrutide is tolerated (around weeks 2–8). CJC/Ipamorelin and tesamorelin often start around week 8 when muscle protection becomes critical. Optional B-tier adjuncts are physician-directed.",
  },
  {
    q: "What labs are required?",
    a: `Baseline ${CORE_SERVICES.expandedPanel.name} (${PRICE_BASELINE_LABS}) before starting. CMP safety check around week 4 at provider discretion. Quarterly Expanded panels are included while enrolled.`,
  },
  {
    q: "Will I lose muscle?",
    a: "Aggressive GLP therapy without GH support can cost lean mass. Phase 3 specifically adds CJC/Ipamorelin and tesamorelin to protect muscle and target visceral fat — plus adequate protein and resistance training are non-negotiable.",
  },
];

const MetabolicRecomposition = () => {
  const { openBooking } = useBooking();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleStackCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-metabolic-stack-checkout", {
        body: {},
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else throw new Error("No checkout URL returned");
    } catch {
      toast.error("Failed to start checkout. Book a consult or call the clinic.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const savingsVsAlacarte = metabolicStackAlacarteNonMemberCents() - ELEVATED_PROGRAMS.metabolicRecomposition.amount;

  return (
    <>
      <Helmet>
        <title>Metabolic Recomposition Stack | Retatrutide Fat Loss — Elevated Health Augusta</title>
        <meta
          name="description"
          content="Physician-supervised 90-day metabolic recomposition stack in Evans, GA. Retatrutide anchor, SS-31, NAD+, CJC/Tesamorelin — phased protocol with labs and transparent pricing."
        />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/metabolic-recomposition" />
      </Helmet>

      <Navbar />

      <main>
        {/* Pattern A — Hero */}
        <section className={storefrontHeroSection}>
          <div className={storefrontHeroInner}>
            <p className={storefrontHeroLabel}>Fat loss · Body recomposition</p>
            <h1 className={storefrontHeroTitle}>
              The <span className="italic">Metabolic Recomposition</span> Stack
            </h1>
            <p className={storefrontHeroLead}>
              A phased 90-day physician protocol — retatrutide anchor, mitochondrial support, and growth-hormone
              optimization — designed for men who want fat loss without looking depleted.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Button size="lg" onClick={handleStackCheckout} disabled={checkoutLoading}>
                {checkoutLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Join the Stack — {PRICE_STACK}
              </Button>
              <Button size="lg" variant="outline" onClick={() => openBooking("consult")}>
                Start with {PRICE_CONSULT} Assessment
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-3 max-w-2xl">
              Compounded medications from 503A pharmacy partners · Lab-monitored · Not medical advice — consult required
            </p>
          </div>
        </section>

        <EverythingIncludedPillars />

        {/* Pattern B — Pricing strip */}
        <section className="py-12 bg-muted/30 border-y border-border">
          <div className="container max-w-5xl grid md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">One-time start</p>
              <p className="font-playfair text-2xl">{PRICE_CONSULT} + {PRICE_BASELINE_LABS}</p>
              <p className="text-xs text-muted-foreground mt-1">Assessment + baseline labs</p>
            </div>
            <div className="md:border-x border-border px-4">
              <p className="text-sm text-muted-foreground mb-1">Program (monthly)</p>
              <p className="font-playfair text-2xl text-accent-foreground">{PRICE_STACK}</p>
              <p className="text-xs text-muted-foreground mt-1">All phases included as prescribed</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">vs. à la carte estimate</p>
              <p className="font-playfair text-2xl">{fmtUsd(metabolicStackAlacarteNonMemberCents())}/mo</p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                Save {fmtUsd(savingsVsAlacarte)}+/mo at full stack
              </p>
            </div>
          </div>
        </section>

        {/* Program vs à la carte */}
        <section className="py-16 container max-w-4xl">
          <p className="section-label mb-2">Program vs à la carte</p>
          <h2 className="font-playfair text-3xl mb-8">
            Membership <span className="italic">or</span> pay-as-you-go
          </h2>
          <MetabolicStackPricingTable />
        </section>

        {/* Why EHA vs remote coaching */}
        <section className="py-16 bg-muted/20 border-y border-border">
          <div className="container max-w-3xl">
            <p className="section-label mb-2">Why in-person matters</p>
            <h2 className="font-playfair text-3xl mb-6">Real clinic. Real labs. Real oversight.</h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                National biohacking and peptide-coaching programs (including influencer-led stacks popularized on
                YouTube) typically ship compounds to your door with app-based check-ins and mail-order bloodwork.
                That model works for some people — but it is not the same as a physician-owned clinic where Caroline
                draws your labs in Evans, Dr. Akers reviews results, and your protocol adjusts in person when
                something does not feel right.
              </p>
              <p>
                Our stack follows the same <em>mechanism-layered</em> logic you see in advanced fat-loss education
                (GLP anchor → mitochondrial support → GH optimization → optional adjuncts) — with FCC 503A sourcing,
                Georgia-compliant prescribing, and no research-grade gray market.
              </p>
              <p className="text-xs">{METABOLIC_STACK_MOTSC_NOTE}</p>
            </div>
          </div>
        </section>

        {/* Tier list */}
        <section className="py-16 container max-w-4xl">
          <p className="section-label mb-2">Mechanism-ranked compounds</p>
          <h2 className="font-playfair text-3xl mb-3">
            What goes into a <span className="italic">serious</span> fat-loss stack
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Specific dosing schedules are determined at your visit and are not published online.
          </p>
          <div className="space-y-3">
            {METABOLIC_STACK_COMPOUNDS.map((c) => (
              <div
                key={c.key}
                className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-lg border border-border bg-background"
              >
                <Badge variant="outline" className={tierColor[c.tier]}>
                  {c.tier}-Tier
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.mechanism}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Phases */}
        <section className="py-16 bg-secondary/20">
          <div className="container max-w-4xl">
            <p className="section-label mb-2">90-day phased protocol</p>
            <h2 className="font-playfair text-3xl mb-8">How the stack builds over time</h2>
            <div className="space-y-6">
              {METABOLIC_STACK_PHASES.map((phase, i) => (
                <div key={phase.id} className="flex gap-4">
                  <span className="font-playfair text-3xl text-accent italic shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-playfair text-xl">{phase.label}</p>
                    <p className="text-sm text-accent-foreground mb-1">{phase.weeks}</p>
                    <p className="text-sm text-muted-foreground mb-2">{phase.clinicalNotes}</p>
                    <div className="flex flex-wrap gap-2">
                      {phase.compounds.map((k) => {
                        const c = METABOLIC_STACK_COMPOUNDS.find((x) => x.key === k);
                        return (
                          <Badge key={k} variant="secondary">
                            {c?.name ?? k}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Labs */}
        <section className="py-16 container max-w-4xl">
          <p className="section-label mb-2">Lab monitoring</p>
          <h2 className="font-playfair text-3xl mb-6">Labs required for safe progression</h2>
          <ul className="space-y-3">
            {METABOLIC_STACK_LABS.map((lab) => (
              <li key={lab.when} className="flex justify-between gap-4 border-b border-border pb-3 text-sm">
                <span className="text-muted-foreground">{lab.when}</span>
                <span className="font-medium text-right">{lab.panel}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="py-16 bg-muted/20">
          <div className="container max-w-4xl">
            <p className="section-label mb-2">How it works</p>
            <h2 className="font-playfair text-3xl mb-10">From consult to full stack</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {steps.map((s) => (
                <div key={s.n}>
                  <span className="font-playfair text-4xl text-accent italic">{s.n}</span>
                  <p className="font-playfair text-lg mt-2">{s.t}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Staff-facing cost transparency (visible — builds trust with sophisticated buyers) */}
        <section className="py-12 container max-w-4xl">
          <p className="section-label mb-2">Pricing integrity</p>
          <h2 className="font-playfair text-2xl mb-4">Why the bundle beats à la carte</h2>
          <p className="text-sm text-muted-foreground max-w-2xl mb-4">
            At full protocol capacity, sourcing each compound separately runs approximately{" "}
            {fmtUsd(metabolicStackAlacarteNonMemberCents())}/month before clinical oversight. The {PRICE_STACK}{" "}
            program consolidates phased pharmacy, labs, and unlimited messaging — one price, no hidden pharmacy
            invoices.
          </p>
          <p className="text-xs text-muted-foreground">
            Internal COGS reference at full dose: ~{fmtUsd(metabolicStackWholesaleCentsFull())} wholesale · Program
            margin ~{metabolicStackMarginPct()}% at capacity (phased start improves early-month economics).
          </p>
        </section>

        {/* FAQ */}
        <section className="py-16 container max-w-3xl">
          <h2 className="font-playfair text-3xl mb-6 text-center">Common questions</h2>
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`f-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground text-center">
          <div className="container max-w-2xl">
            <h2 className="font-playfair text-3xl md:text-4xl mb-4">
              Ready for a stack built on <span className="italic">mechanism</span>, not hype?
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              {SITE_CONFIG.phoneFormatted} · {SITE_CONFIG.address.full}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" onClick={handleStackCheckout} disabled={checkoutLoading}>
                {checkoutLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Enroll — {PRICE_STACK}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => openBooking("consult")}
              >
                Book {PRICE_CONSULT} Assessment
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default MetabolicRecomposition;
