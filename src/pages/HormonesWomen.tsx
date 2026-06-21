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
import { WOMENS_HRT_SERVICES } from "@/lib/hormoneStorefrontContent";
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
const PRICE_MEMBERSHIP = ELEVATED_PROGRAMS.hrt.displayPrice;

const services = [...WOMENS_HRT_SERVICES];

const symptoms = [
  "Hot flashes", "Night sweats", "Sleep disruption", "Mood changes",
  "Brain fog", "Weight gain", "Libido changes", "Joint pain",
  "Dry skin", "Irregular cycles",
];

const steps = [
  { n: "01", title: "Wellness Assessment ($79)", body: "Meet your physician. Walk through symptoms, history, goals. About 45 minutes." },
  { n: "02", title: "Lab Draw On-Site", body: `Comprehensive hormone panel — drawn at your visit, processed by LabCorp. Baseline comprehensive wellness panel ${PRICE_PANEL}.` },
  { n: "03", title: "Your personalized plan", body: "Physician reviews labs, designs your protocol, sends Rx to our compounding pharmacy. Your medication ships directly to your door." },
  { n: "04", title: "Ongoing Care", body: `ELEVATED HRT (${PRICE_MEMBERSHIP}) includes prescribed creams, monthly check-ins with our clinical team, quarterly labs, and unlimited messaging.` },
];

const faqs = [
  { q: "Is this covered by insurance?", a: "No — we're cash-pay. We provide a superbill you can submit to your insurance for potential out-of-network reimbursement." },
  { q: "How long until I feel different?", a: "Most patients notice meaningful changes within 4–6 weeks. Sleep and energy often improve first; mood and libido follow." },
  { q: "Do I have to come in weekly?", a: "No — most patients apply cream at home daily. Follow-up visits are scheduled per your protocol, with quarterly labs while you're enrolled." },
  { q: "What if I don't like the cream?", a: "Your protocol is flexible. We can pivot to gels, sprays, or patches when available, or discuss other delivery methods with your physician." },
  { q: "What's the difference between FDA-approved and compounded?", a: "Both are legitimate. FDA-approved products come in fixed doses your insurance might cover if billed. Compounded medications are made by a licensed 503A pharmacy and allow custom dosing tailored to your labs." },
  { q: "Can I do this remotely?", a: "Your initial consultation and lab draw are in person at our Evans, GA clinic. Follow-up visits can be telehealth once you're established." },
  { q: "What if I'm not yet menopausal?", a: "We treat perimenopause too. Symptoms can begin 5–10 years before menopause proper, and they're just as treatable." },
];

const HormonesWomen = () => {
  const { openBooking } = useBooking();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const fmtCents = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const typicalProgramMonth1Cents =
    CORE_SERVICES.wellnessAssessment.amount +
    CORE_SERVICES.comprehensivePanel.amount +
    ELEVATED_PROGRAMS.hrt.amount;

  return (
    <>
      <Helmet>
        <title>BHRT Augusta GA | Women's Hormone Therapy — Elevated Health</title>
        <meta name="description" content="Bioidentical hormone replacement therapy for women in Augusta, GA. Compounded transdermal estradiol, progesterone, and testosterone. Physician-led, lab-driven." />
        <meta name="keywords" content="BHRT Augusta GA, bioidentical hormones women, estradiol progesterone Augusta, menopause treatment Augusta, perimenopause" />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/hormones-women" />
      </Helmet>

      <div className="public-page-shell">
        <Navbar />

        <main className="flex-1">
          {/* 1. Hero (Pattern A) */}
          <section className={storefrontHeroSection}>
            <div className={storefrontHeroInner}>
              <p className={storefrontHeroLabel}>Women's Hormones</p>
              <h1 className={storefrontHeroTitle}>
                The fog isn't permanent.<br /><span className="italic">Neither is the fatigue.</span>
              </h1>
              <p className={storefrontHeroLead}>
                Hot flashes, night sweats, weight that won't move, mood that isn't yours. You've been told this is just aging. It isn't. It's hormones — and they're fixable.
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
              <MembershipComparison program="hrt" />
            </div>
          </section>

          <StorefrontPricingStrip
            columns={[
              { label: "Wellness Assessment", price: PRICE_CONSULT, sub: "RN intake, in-office at Evans" },
              { label: "Comprehensive Wellness Panel", price: PRICE_PANEL, sub: "drawn on-site, processed by LabCorp" },
              { label: ELEVATED_PROGRAMS.hrt.name, price: PRICE_MEMBERSHIP, sub: "medication + monitoring included" },
            ]}
          />

          {/* 3. What it is (Pattern C) */}
          <section className="section-band-white">
            <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
              <PatternCSplit
                imageSrc={MARKETING_IMAGES.editorialHormonesWomen}
                imageAlt="Compounded hormone therapy at Elevated Health Augusta"
              >
                <p className="section-label mb-4">What it is</p>
                <h2 className="font-playfair italic text-4xl md:text-5xl lg:text-6xl text-foreground mb-8">
                  Compounded transdermal creams.
                </h2>
                <div className="space-y-5 font-jost font-light text-lg text-muted-foreground leading-relaxed">
                  <p>Standard FDA estradiol patches are in nationwide shortage through end of 2026 due to surging demand. We don't depend on that fragile supply.</p>
                  <p>Our default is compounded transdermal cream — Bi-Est (E2/E3), Estradiol, Progesterone, Testosterone — formulated by a state-licensed 503A compounding pharmacy in Texas, dosed to your labs and shipped directly to your door.</p>
                  <p>For patients who prefer FDA-approved gels, sprays, or patches when available, we prescribe via standard e-Rx to your pharmacy of choice. You're not locked into one delivery method.</p>
                </div>
              </PatternCSplit>
            </div>
          </section>

          {/* 4. How it works (Pattern D) */}
          <section id="how-it-works" className="section-band-surface">
            <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
              <StorefrontSectionHeader
                label="How It Works"
                title={
                  <>
                    Four steps. <span className="italic">No surprises.</span>
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
                If you're experiencing<span className="italic">…</span>
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
          <section className="storefront-section bg-background border-t border-border">
            <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
              <p className="section-label mb-4">What's Offered</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-10">What's <span className="italic">included</span>.</h2>
              <ul className="space-y-4">
                {services.map((s) => (
                  <li key={s} className="font-jost font-light text-foreground text-lg flex items-start gap-3">
                    <span className="text-accent mt-1.5 text-sm">—</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 7. Pricing transparency (Pattern E) */}
          <section className="storefront-section bg-muted/30">
            <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
              <p className="section-label mb-4">Pricing</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-10">Transparent <span className="italic">all the way through</span>.</h2>

              <div className="space-y-10">
                <div>
                  <p className="section-label mb-4">One-time costs</p>
                  <div className="space-y-3 font-jost text-foreground">
                    <div className="flex justify-between border-b border-border/60 pb-3"><span>Wellness Assessment</span><span className="font-medium">{PRICE_CONSULT}</span></div>
                    <div className="flex justify-between border-b border-border/60 pb-3"><span>Comprehensive Wellness Panel — Female</span><span className="font-medium">{PRICE_PANEL}</span></div>
                  </div>
                </div>

                <div>
                  <p className="section-label mb-4">Ongoing</p>
                  <div className="space-y-3 font-jost text-foreground">
                    <div className="flex justify-between border-b border-border/60 pb-3">
                      <span>
                        {ELEVATED_PROGRAMS.hrt.name}
                        <br />
                        <span className="font-light text-sm text-muted-foreground">
                          Prescribed creams, monthly clinical check-in, quarterly labs, messaging included
                        </span>
                      </span>
                      <span className="font-medium whitespace-nowrap">{PRICE_MEMBERSHIP}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 pb-3">
                      <span>
                        Supportive adjustments
                        <br />
                        <span className="font-light text-sm text-muted-foreground">when clinically indicated</span>
                      </span>
                      <span className="font-medium whitespace-nowrap">Included</span>
                    </div>
                  </div>
                </div>

                <div className="bg-background border border-border p-6 space-y-2 font-jost text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Typical first month (assessment + labs + HRT)</span>
                    <span className="font-medium text-foreground">{fmtCents(typicalProgramMonth1Cents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ongoing (program month 2+)</span>
                    <span className="font-medium text-foreground">{ELEVATED_PROGRAMS.hrt.displayPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 8. FAQ (Pattern F) */}
          <section className="storefront-section bg-background">
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

          {/* 9. Closing CTA (Pattern G) */}
          <section className="py-14 md:py-24 lg:py-32 bg-muted/30 text-center">
            <div className="container mx-auto px-6 max-w-2xl">
              <h2 className="font-playfair text-4xl md:text-5xl text-foreground mb-8">
                Ready to feel like <span className="italic">yourself</span> again?
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

export default HormonesWomen;
