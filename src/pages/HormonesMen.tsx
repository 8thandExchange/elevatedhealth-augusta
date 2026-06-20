import { Helmet } from "react-helmet";
import { useEffect } from "react";
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
import { StorefrontPricingStrip } from "@/components/marketing/StorefrontPricingStrip";
import { MARKETING_IMAGES } from "@/lib/marketingImages";
import {
  HORMONE_PHARMACY_FOOTNOTE,
  MENS_TRT_ALTERNATIVES_COPY,
  MENS_TRT_LEAD_COPY,
  MENS_TRT_MONITORING_COPY,
  MENS_TRT_SERVICES,
} from "@/lib/hormoneStorefrontContent";
import {
  storefrontHeroInner,
  storefrontHeroLabel,
  storefrontHeroLead,
  storefrontHeroSection,
  storefrontHeroTitle,
} from "@/lib/storefrontHero";

// Display values — actual charges flow through Stripe via
// create-consultation-checkout and program checkout edge functions.
const PRICE_CONSULT = CORE_SERVICES.wellnessAssessment.displayPrice;
const PRICE_PANEL = CORE_SERVICES.comprehensivePanel.displayPrice;
const PRICE_MEMBERSHIP = ELEVATED_PROGRAMS.trt.displayPrice;

const services = [...MENS_TRT_SERVICES];

const symptoms = [
  "Low energy", "Decreased libido", "Slow recovery", "Loss of muscle mass",
  "Mood / motivation changes", "Sleep issues", "Abdominal weight gain",
  "Brain fog", "Decreased morning erections",
];

const steps = [
  { n: "01", title: "Wellness Assessment ($79)", body: "Meet your physician. Walk through symptoms, history, goals. About 45 minutes." },
  { n: "02", title: "Comprehensive labs", body: `Full hormone and foundation panel — testosterone, thyroid, and the markers your physician needs to dose safely. Drawn in-office, processed by LabCorp. ${PRICE_PANEL}.` },
  { n: "03", title: "Your personalized plan", body: "Your physician reviews results and designs your protocol — testosterone dosing, how you take it, and any supporting medications based on your labs and goals." },
  { n: "04", title: "Ongoing Care", body: `ELEVATED TRT (${PRICE_MEMBERSHIP}) includes medication, monthly check-ins with our clinical team, quarterly labs, and unlimited messaging.` },
];

const faqs = [
  { q: "Is testosterone safe long-term?", a: "When properly monitored — including PSA, hematocrit, and lipids — yes. The risk profile of physician-supervised TRT is well established. The risk of unmonitored or under-dosed clinics is what gives TRT a bad name." },
  { q: "Will I need TRT for the rest of my life?", a: "If you start TRT, your body reduces its own testosterone production. That's a known trade-off. Your physician will discuss whether starting is the right call before you commit." },
  { q: "Can I still have kids on TRT?", a: "Yes. If fertility is a priority, tell your physician at your assessment — there are protocols designed to preserve it while you're on TRT." },
  { q: "Why transdermal cream instead of injections?", a: "Daily cream maintains steadier hormone levels than weekly injections — fewer peaks and crashes, and your dose can be adjusted quickly based on how you feel and what your labs show." },
  { q: "What if I prefer a gel or patch?", a: "We can prescribe FDA-approved gels, sprays, or patches via standard e-Rx when available and clinically appropriate. Compounded cream remains our default for custom dosing." },
  { q: "Is this just steroids?", a: "No. Therapeutic TRT keeps your levels in optimal physiologic range. Performance-enhancement doses are a different category — and not what we do." },
  { q: "Can I use HSA/FSA?", a: "Yes for the consult and labs. Medication coverage varies by plan." },
];

const HormonesMen = () => {
  const { openBooking } = useBooking();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const fmtCents = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const typicalProgramMonth1Cents =
    CORE_SERVICES.wellnessAssessment.amount +
    CORE_SERVICES.comprehensivePanel.amount +
    ELEVATED_PROGRAMS.trt.amount;

  return (
    <>
      <Helmet>
        <title>TRT Augusta GA | Men's Hormone Therapy — Elevated Health</title>
        <meta name="description" content="Physician-supervised testosterone replacement therapy in Augusta, GA. Compounded transdermal testosterone cream, lab-driven dosing, and ELEVATED TRT membership." />
        <meta name="keywords" content="TRT Augusta GA, testosterone replacement Augusta, men's hormone therapy, low T treatment Augusta" />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/hormones-men" />
      </Helmet>

      <div className="public-page-shell">
        <Navbar />

        <main className="flex-1">
          {/* 1. Hero (Pattern A) */}
          <section className={storefrontHeroSection}>
            <div className={storefrontHeroInner}>
              <p className={storefrontHeroLabel}>Men's Hormones</p>
              <h1 className={storefrontHeroTitle}>
                You used to recover faster.<br /><span className="italic">You can again.</span>
              </h1>
              <p className={storefrontHeroLead}>
                Testosterone replacement therapy under physician supervision. Compounded transdermal cream, lab-driven, no shortcuts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={openBooking} size="lg" className="font-jost tracking-wide">
                  Book your {PRICE_CONSULT} Wellness Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button asChild variant="link" size="lg" className="font-jost tracking-wide text-foreground">
                  <a href="#how-it-works">Learn how it works ↓</a>
                </Button>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-16 bg-muted/20 border-b border-border">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl space-y-10">
              <EverythingIncludedPillars />
              <MembershipComparison program="trt" />
            </div>
          </section>

          <StorefrontPricingStrip
            columns={[
              { label: "Wellness Assessment", price: PRICE_CONSULT, sub: "RN intake, in-office at Evans" },
              { label: "Comprehensive Wellness Panel", price: PRICE_PANEL, sub: "drawn on-site, processed by LabCorp" },
              { label: ELEVATED_PROGRAMS.trt.name, price: PRICE_MEMBERSHIP, sub: "medication + monitoring included" },
            ]}
          />

          {/* 3. What it is (Pattern C) */}
          <section className="section-band-white">
            <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
              <PatternCSplit
                imageSrc={MARKETING_IMAGES.editorialHormonesMen}
                imageAlt="Men's hormone optimization at Elevated Health Augusta"
              >
                <p className="section-label mb-4">What it is</p>
                <h2 className="font-playfair italic text-4xl md:text-5xl lg:text-6xl text-foreground mb-8">
                  Compounded transdermal cream.
                </h2>
                <div className="space-y-5 font-jost font-light text-lg text-muted-foreground leading-relaxed">
                  <p>Most men's TRT clinics push maximum-dose injections with minimal labs. We don't.</p>
                  <p>{MENS_TRT_MONITORING_COPY}</p>
                  <p>{MENS_TRT_LEAD_COPY}</p>
                  <p>{MENS_TRT_ALTERNATIVES_COPY}</p>
                </div>
              </PatternCSplit>
            </div>
          </section>

          <section id="how-it-works" className="section-band-surface">
            <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
              <StorefrontSectionHeader
                label="How It Works"
                title={
                  <>
                    Four steps. <span className="italic">No shortcuts.</span>
                  </>
                }
              />
              <StorefrontStepCards steps={steps} />
            </div>
          </section>

          {/* 5. Who it's for */}
          <section className="section-band-white">
            <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
              <p className="section-label mb-4">Who It's For</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-10">
                If you're noticing<span className="italic">…</span>
              </h2>
              <ul className="grid sm:grid-cols-2 gap-4">
                {symptoms.map((s) => (
                  <li key={s} className="font-jost font-light text-foreground text-lg flex items-start gap-3">
                    <span className="text-accent mt-1.5 text-sm">—</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 6. What's offered */}
          <section className="py-20 md:py-28 bg-background border-t border-border">
            <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
              <p className="section-label mb-4">What's Offered</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-10">What's <span className="italic">included</span>.</h2>
              <ul className="space-y-4 mb-10">
                {services.map((s) => (
                  <li key={s} className="font-jost font-light text-foreground text-lg flex items-start gap-3">
                    <span className="text-accent mt-1.5 text-sm">—</span>{s}
                  </li>
                ))}
              </ul>
              <p className="font-jost font-light text-sm text-muted-foreground italic border-l-2 border-accent pl-4">
                {HORMONE_PHARMACY_FOOTNOTE}
              </p>
            </div>
          </section>

          {/* 7. Pricing transparency (Pattern E) */}
          <section className="py-20 md:py-28 bg-muted/30">
            <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
              <p className="section-label mb-4">Pricing</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-10">Transparent <span className="italic">all the way through</span>.</h2>

              <div className="space-y-10">
                <div>
                  <p className="section-label mb-4">One-time costs</p>
                  <div className="space-y-3 font-jost text-foreground">
                    <div className="flex justify-between border-b border-border/60 pb-3"><span>Wellness Assessment</span><span className="font-medium">{PRICE_CONSULT}</span></div>
                    <div className="flex justify-between border-b border-border/60 pb-3"><span>Comprehensive Wellness Panel — Male</span><span className="font-medium">{PRICE_PANEL}</span></div>
                  </div>
                </div>

                <div>
                  <p className="section-label mb-4">Ongoing</p>
                  <div className="space-y-3 font-jost text-foreground">
                    <div className="flex justify-between border-b border-border/60 pb-3">
                      <span>
                        {ELEVATED_PROGRAMS.trt.name}
                        <br />
                        <span className="font-light text-sm text-muted-foreground">
                          Medication, monthly clinical check-in, quarterly labs, messaging included
                        </span>
                      </span>
                      <span className="font-medium whitespace-nowrap">{PRICE_MEMBERSHIP}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 pb-3">
                      <span>
                        Supportive medications
                        <br />
                        <span className="font-light text-sm text-muted-foreground">when clinically indicated</span>
                      </span>
                      <span className="font-medium whitespace-nowrap">Included</span>
                    </div>
                  </div>
                </div>

                <div className="bg-background border border-border p-6 space-y-2 font-jost text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Typical first month (assessment + labs + TRT)</span>
                    <span className="font-medium text-foreground">{fmtCents(typicalProgramMonth1Cents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ongoing (program month 2+)</span>
                    <span className="font-medium text-foreground">{ELEVATED_PROGRAMS.trt.displayPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 8. FAQ */}
          <section className="py-20 md:py-28 bg-background">
            <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
              <p className="section-label mb-4">FAQ</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-10">Questions, <span className="italic">answered</span>.</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((f, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left font-playfair text-lg text-foreground">{f.q}</AccordionTrigger>
                    <AccordionContent className="font-jost font-light text-muted-foreground text-base leading-relaxed">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* 9. Closing CTA */}
          <section className="py-24 md:py-32 bg-muted/30 text-center">
            <div className="container mx-auto px-6 max-w-2xl">
              <h2 className="font-playfair text-4xl md:text-5xl text-foreground mb-8">
                Get back to operating at <span className="italic">your level</span>.
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={openBooking} size="lg" className="font-jost tracking-wide">
                  Book your {PRICE_CONSULT} Wellness Assessment
                </Button>
                <Button asChild variant="outline" size="lg" className="font-jost tracking-wide">
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`}>Or call {SITE_CONFIG.phone}</a>
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

export default HormonesMen;
