import { Helmet } from "react-helmet";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { CORE_SERVICES, ELEVATED_PROGRAMS } from "@/lib/stripeConfig";
import { EverythingIncludedPillars } from "@/components/marketing/EverythingIncludedPillars";
import { MembershipComparison } from "@/components/marketing/MembershipComparison";
import { PatternCSplit } from "@/components/marketing/PatternCSplit";
import { StorefrontStepCards } from "@/components/marketing/StorefrontStepCards";
import { StorefrontSectionHeader } from "@/components/marketing/StorefrontSectionHeader";
import {
  PUBLIC_AVAILABILITY_DISCLAIMER,
  PUBLIC_PEPTIDE_CATEGORIES,
} from "@/lib/clinicalOptimizationCatalog";
import { RECOVERY_PEPTIDE_PUBLIC_LANGUAGE } from "@/lib/recoveryPeptideCareLane";
import { MARKETING_IMAGES } from "@/lib/marketingImages";
import {
  storefrontHeroInner,
  storefrontHeroLabel,
  storefrontHeroLead,
  storefrontHeroSection,
  storefrontHeroTitle,
} from "@/lib/storefrontHero";

const PRICE_CONSULT = CORE_SERVICES.wellnessAssessment.displayPrice;
const PRICE_PANEL = CORE_SERVICES.comprehensivePanel.displayPrice;
const PRICE_PROGRAM_WELLNESS = ELEVATED_PROGRAMS.wellness.displayPrice;

const steps = [
  {
    n: "01",
    title: `Wellness Assessment (${PRICE_CONSULT})`,
    body: "In-person visit — goals, history, medications, and whether peptide therapy fits your situation.",
  },
  {
    n: "02",
    title: "Labs when indicated",
    body: `In-office LabCorp draw (${CORE_SERVICES.comprehensivePanel.displayPrice} or ${CORE_SERVICES.expandedPanel.displayPrice} when expanded markers are ordered).`,
  },
  {
    n: "03",
    title: "Provider review",
    body: "Recovery peptides (BPC-157, TB-500, combined stack) require a dedicated clinical review before any plan is discussed.",
  },
  {
    n: "04",
    title: "Your plan",
    body: "If appropriate, your physician selects compounds and routes — instructions are provided at your visit, not published online.",
  },
];

const symptoms = [
  "Slow recovery from training or competition",
  "Tendon, ligament, or joint support goals",
  "Post-injury or soft-tissue recovery",
  "Active lifestyle / performance recovery",
  "Longevity and cellular energy interest",
  "Skin, hair, or post–weight-loss transformation support",
];

const faqs = [
  {
    q: "Are BPC-157 and TB-500 available?",
    a: "Yes — when clinically appropriate and after provider review, safety screening, consent, and pharmacy availability. They are not walk-in or self-selected products. Pentadeca Arginate (PDA) is an optional oral alternate your physician may discuss.",
  },
  {
    q: "Are peptides FDA-approved?",
    a: "Some therapies have FDA-approved forms (for example PT-141 as Vyleesi). Many recovery and optimization peptides are compounded under 503A pharmacy authority for specific patients under physician oversight and informed consent.",
  },
  {
    q: "Can I buy peptides cheaper online?",
    a: "Research-grade kits are not pharmacy-compounded medicine. We work only with licensed 503A pharmacies, physician prescriptions, and monitoring when indicated.",
  },
  {
    q: "How are peptides given?",
    a: "Depends on the protocol — subcutaneous injection, sublingual, or topical. Your clinical team trains you on home injection when applicable.",
  },
  {
    q: "How long until I notice a difference?",
    a: "Timelines vary. Your physician sets realistic expectations — we do not guarantee specific healing or performance outcomes.",
  },
  {
    q: "What if standard weight loss isn't enough?",
    a: "Some patients plateau or need fat loss without losing lean tissue. Advanced body recomposition protocols are physician-directed, phased, and discussed in person after your Wellness Assessment and labs — not offered as a walk-in or online catalog item.",
  },
];

const PeptideTherapy = () => {
  const { openBooking } = useBooking();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Recovery Peptide Review & Peptide Therapy | Elevated Health Augusta</title>
        <meta
          name="description"
          content="Physician-supervised Recovery Peptide Review and focused peptide care in Evans, GA. BPC-157 and TB-500 when clinically appropriate — assessment, labs, consent, and provider review required."
        />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/peptides" />
        <meta property="og:title" content="Peptide Therapy Augusta GA — Elevated Health" />
        <meta
          property="og:description"
          content="A focused peptide menu — recovery, metabolic, hormone, sexual wellness, and longevity. Assessment-first, pharmacy-compounded."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elevatedhealthaugusta.com/peptides" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalProcedure",
            name: "Peptide Therapy",
            description:
              "Physician-supervised peptide categories including recovery (BPC-157, TB-500), GLP-1 metabolic care, hormone optimization, sexual wellness, and longevity support.",
            procedureType: "https://schema.org/TherapeuticProcedure",
            url: "https://elevatedhealthaugusta.com/peptides",
            provider: {
              "@type": "MedicalClinic",
              name: "Elevated Health Augusta",
              url: "https://elevatedhealthaugusta.com",
            },
          })}
        </script>
      </Helmet>

      <div className="public-page-shell">
        <Navbar />

        <main className="flex-1">
          <section className={storefrontHeroSection}>
            <div className={storefrontHeroInner}>
              <p className={storefrontHeroLabel}>Peptide Therapy</p>
              <h1 className={storefrontHeroTitle}>
                Recovery Peptide Review.
                <br />
                <span className="italic">Provider-led. Safety-gated.</span>
              </h1>
              <p className={`${storefrontHeroLead} mb-6`}>
                {RECOVERY_PEPTIDE_PUBLIC_LANGUAGE} Care begins with a {PRICE_CONSULT} Wellness
                Assessment — not a walk-in peptide menu. Your physician selects options only after
                review, labs, consent, and pharmacy availability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={openBooking} size="lg" className="font-jost tracking-wide">
                  Start Recovery Peptide Review <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button asChild variant="outline" size="lg" className="font-jost tracking-wide">
                  <Link to="/membership">Book Wellness Assessment ({PRICE_CONSULT})</Link>
                </Button>
              </div>
            </div>
          </section>

          <section id="peptide-categories" className="py-16 md:py-20 bg-background">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <p className="section-label mb-3">Care areas</p>
                <h2 className="font-playfair text-3xl text-foreground">
                  What we <span className="italic">focus on</span>
                </h2>
                <p className="font-jost text-sm text-muted-foreground mt-4">
                  Education only — not a self-serve menu. {PUBLIC_AVAILABILITY_DISCLAIMER}
                </p>
              </div>

              <div className="rounded-sm border border-accent/30 bg-muted/20 p-6 md:p-8">
                <h3 className="font-playfair text-xl mb-3">Recovery Peptide Review</h3>
                <p className="font-jost text-xs text-accent mb-3">
                  BPC-157 · TB-500 · BPC-157/TB-500 recovery stack · PDA (provider-selected alternate)
                </p>
                <p className="font-jost text-sm text-muted-foreground leading-relaxed mb-4">
                  {RECOVERY_PEPTIDE_PUBLIC_LANGUAGE}
                </p>
                <p className="font-jost text-xs text-muted-foreground">
                  Requires assessment, provider review, informed consent, and current pharmacy
                  availability. We do not publish dosing or guarantee healing outcomes.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {PUBLIC_PEPTIDE_CATEGORIES.filter((c) => c.id !== "recovery").map((cat) => (
                  <div
                    key={cat.id}
                    id={cat.id === "sexual" ? "sexual-wellness" : undefined}
                    className="border border-border rounded-sm p-6 bg-card/40"
                  >
                    <h3 className="font-playfair text-lg mb-2">{cat.title}</h3>
                    <p className="font-jost text-xs text-accent mb-2">{cat.examples.join(" · ")}</p>
                    <p className="font-jost text-sm text-muted-foreground">{cat.note}</p>
                    {cat.id === "glp1_metabolic" && (
                      <Button asChild variant="link" className="font-jost text-accent px-0 mt-2 h-auto">
                        <Link to="/weight-loss">GLP-1 program detail →</Link>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24 bg-muted/20 border-y border-border">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl space-y-10">
              <EverythingIncludedPillars intro="ELEVATED members receive 20% off eligible à la carte services when clinically appropriate." />
              <MembershipComparison program="wellness" />
            </div>
          </section>

          <section className="py-16 md:py-20 bg-background border-y border-border">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                {[
                  { l: "Wellness Assessment", p: PRICE_CONSULT, sub: "Required front door for peptide care" },
                  {
                    l: CORE_SERVICES.comprehensivePanel.name,
                    p: PRICE_PANEL,
                    sub: `or ${CORE_SERVICES.expandedPanel.displayPrice} expanded when ordered`,
                  },
                  {
                    l: ELEVATED_PROGRAMS.wellness.name,
                    p: PRICE_PROGRAM_WELLNESS,
                    sub: "Member discount on eligible services",
                  },
                ].map((c) => (
                  <div key={c.l} className="px-6 py-8 md:py-4 text-center">
                    <p className="section-label mb-3">{c.l}</p>
                    <p className="font-playfair text-3xl md:text-4xl text-foreground mb-2">{c.p}</p>
                    <p className="font-jost text-xs text-muted-foreground">{c.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="storefront-section bg-background">
            <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
              <div className="grid md:grid-cols-12 gap-12">
                <div className="md:col-span-5">
                  <p className="section-label mb-4">Responsibly sourced</p>
                  <h2 className="font-playfair italic text-4xl md:text-5xl text-foreground leading-tight">
                    Pharmacy-grade.
                    <br />
                    By design.
                  </h2>
                </div>
                <div className="md:col-span-7 space-y-5 font-jost font-light text-lg text-muted-foreground leading-relaxed">
                  <p>
                    We do not sell research-grade or gray-market peptide kits. Every prescription is
                    compounded by a licensed 503A pharmacy for a specific patient under physician
                    oversight.
                  </p>
                  <p>
                    BPC-157, TB-500, and our recovery stack are available when your provider determines
                    they are clinically appropriate — after safety screening, consent, and pharmacy
                    confirmation. Pentadeca Arginate (PDA) is an optional oral alternate your
                    physician may select when appropriate.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="storefront-section bg-muted/30">
            <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
              <PatternCSplit
                imageSrc={MARKETING_IMAGES.editorialPeptides}
                imageAlt="Peptide therapy at Elevated Health Augusta"
              >
                <p className="section-label mb-4">What it is</p>
                <h2 className="font-playfair italic text-4xl md:text-5xl lg:text-6xl text-foreground mb-8">
                  Individualized — not off-the-shelf.
                </h2>
                <div className="space-y-5 font-jost font-light text-lg text-muted-foreground leading-relaxed">
                  <p>
                    Your protocol is built from your history, labs, and goals. We publish categories —
                    not dosing schedules or a full product catalog.
                  </p>
                  <p>
                    Recovery peptides require a structured clinical review before any compound is
                    discussed or ordered.
                  </p>
                </div>
              </PatternCSplit>
            </div>
          </section>

          <section id="how-it-works" className="section-band-surface">
            <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
              <StorefrontSectionHeader
                label="How it works"
                title={
                  <>
                    Four steps. <span className="italic">No surprises.</span>
                  </>
                }
              />
              <StorefrontStepCards steps={steps} />
            </div>
          </section>

          <section className="section-band-white">
            <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
              <p className="section-label mb-4">Who it&apos;s for</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-10">
                If you&apos;re exploring<span className="italic">…</span>
              </h2>
              <ul className="grid sm:grid-cols-2 gap-4">
                {symptoms.map((s) => (
                  <li key={s} className="font-jost font-light text-foreground text-lg flex items-start gap-3">
                    <span className="text-accent mt-1.5 text-sm">—</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="storefront-section bg-background">
            <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
              <p className="section-label mb-4">Pricing</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-10">
                Transparent <span className="italic">starting points</span>
              </h2>
              <div className="space-y-3 font-jost text-foreground">
                <div className="flex justify-between border-b border-border/60 pb-3">
                  <span>Wellness Assessment</span>
                  <span className="font-medium">{PRICE_CONSULT}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-3">
                  <span>Lab panels (when ordered)</span>
                  <span className="font-medium text-right">
                    {CORE_SERVICES.comprehensivePanel.displayPrice} / {CORE_SERVICES.expandedPanel.displayPrice}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-3">
                  <span>{ELEVATED_PROGRAMS.wellness.name}</span>
                  <span className="font-medium">{PRICE_PROGRAM_WELLNESS}</span>
                </div>
              </div>
              <p className="font-jost text-sm text-muted-foreground mt-6">
                Ongoing peptide program pricing is quoted after your provider review — not listed as a public
                catalog. See <Link to="/pricing" className="text-accent underline-offset-4 hover:underline">full pricing</Link> for program memberships.
              </p>
            </div>
          </section>

          <section className="storefront-section bg-muted/30">
            <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
              <p className="section-label mb-4">FAQ</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-10">
                Questions, <span className="italic">answered</span>.
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((f, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left font-playfair text-lg text-foreground">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="font-jost font-light text-muted-foreground text-base leading-relaxed">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          <section className="py-14 md:py-24 lg:py-32 bg-background text-center">
            <div className="container mx-auto px-6 max-w-2xl">
              <h2 className="font-playfair text-4xl md:text-5xl text-foreground mb-8">
                Start your <span className="italic">Recovery Peptide Review</span>.
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={openBooking} size="lg" className="font-jost tracking-wide">
                  Book Wellness Assessment ({PRICE_CONSULT})
                </Button>
                <Button asChild variant="outline" size="lg" className="font-jost tracking-wide">
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`}>Call {SITE_CONFIG.phone}</a>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PeptideTherapy;
