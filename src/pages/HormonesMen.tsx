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

// Display values — actual charges flow through Stripe via
// create-consultation-checkout and program checkout edge functions.
const PRICE_CONSULT = CORE_SERVICES.wellnessAssessment.displayPrice;
const PRICE_PANEL = CORE_SERVICES.comprehensivePanel.displayPrice;
const PRICE_MEMBERSHIP = ELEVATED_PROGRAMS.trt.displayPrice;

const services = [
  "Testosterone cypionate (injectable, weekly)",
  "Testosterone enanthate (alternative)",
  "Testosterone cream (transdermal, for non-injection patients)",
  "Brand-name options when preferred (AndroGel, Testim)",
  "Anastrozole when indicated (estradiol management)",
  "Gonadorelin for fertility preservation",
  "HCG (when indicated)",
  "Comprehensive labs and quarterly monitoring",
];

const symptoms = [
  "Low energy", "Decreased libido", "Slow recovery", "Loss of muscle mass",
  "Mood / motivation changes", "Sleep issues", "Abdominal weight gain",
  "Brain fog", "Decreased morning erections",
];

const steps = [
  { n: "01", t: "Wellness Assessment ($79)", d: "Meet your physician. Walk through symptoms, history, goals. About 45 minutes." },
  { n: "02", t: "Comprehensive Male Panel", d: `Total T, Free T, Estradiol Sensitive, SHBG, DHEA-S, PSA (if ≥40), full thyroid, foundation labs. Baseline draw in-office, processed by LabCorp. ${PRICE_PANEL}.` },
  { n: "03", t: "Custom Protocol", d: "Physician designs your protocol — typically Test cyp weekly with ancillaries (anastrozole if needed, gonadorelin for fertility preservation if desired)." },
  { n: "04", t: "Ongoing Care", d: `ELEVATED TRT (${PRICE_MEMBERSHIP}) includes medication, monthly check-ins with our clinical team, quarterly labs, and unlimited messaging.` },
];

const faqs = [
  { q: "Is testosterone safe long-term?", a: "When properly monitored — including PSA, hematocrit, and lipids — yes. The risk profile of physician-supervised TRT is well established. The risk of unmonitored or under-dosed clinics is what gives TRT a bad name." },
  { q: "Will I need TRT for the rest of my life?", a: "If you start TRT, your body reduces its own testosterone production. That's a known trade-off. Your physician will discuss whether starting is the right call before you commit." },
  { q: "Can I still have kids on TRT?", a: "Yes, with a gonadorelin or HCG protocol that maintains fertility. Discuss this with your physician before starting if fertility matters." },
  { q: "Self-injection vs in-clinic?", a: "Both are options. Many patients prefer self-injection at home after a brief training visit. Some prefer the routine of weekly clinic visits — your membership covers either." },
  { q: "What about pellets?", a: "Available, but we don't lead with them — dose adjustment is harder once a pellet is placed. Discuss with the physician if you're interested." },
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
        <meta name="description" content="Physician-supervised testosterone replacement therapy in Augusta, GA. Lab-driven, custom-dosed TRT. Compounded testosterone, in-clinic or at-home." />
        <meta name="keywords" content="TRT Augusta GA, testosterone replacement Augusta, men's hormone therapy, low T treatment Augusta" />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/hormones-men" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main>
          {/* 1. Hero (Pattern A) */}
          <section className="min-h-[70vh] flex items-center bg-muted/30">
            <div className="container mx-auto px-6 lg:px-8 max-w-4xl py-24">
              <p className="section-label mb-6">Men's Hormones</p>
              <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl text-foreground mb-8 leading-tight">
                You used to recover faster.<br /><span className="italic">You can again.</span>
              </h1>
              <p className="font-jost font-light text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
                Testosterone replacement therapy under physician supervision. Lab-driven, custom-dosed, no shortcuts.
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

          {/* 2. Pricing Strip */}
          <section className="py-16 md:py-20 bg-background border-y border-border">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                {[
                  { l: "Wellness Assessment", p: PRICE_CONSULT, sub: "RN intake, in-office at Evans" },
                  { l: "Comprehensive Wellness Panel", p: PRICE_PANEL, sub: "drawn on-site, processed by LabCorp" },
                  { l: ELEVATED_PROGRAMS.trt.name, p: PRICE_MEMBERSHIP, sub: "medication + monitoring included" },
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

          {/* 3. What it is (Pattern C) */}
          <section className="py-20 md:py-28 bg-background">
            <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
              <div className="grid md:grid-cols-12 gap-12 items-center">
                <div className="md:col-span-5">
                  <div className="aspect-[4/5] bg-muted/40 flex items-center justify-center text-muted-foreground/40 font-jost text-xs tracking-widest uppercase">
                    {/* TODO: editorial photograph — TRT clinical setting */}
                    Editorial Image
                  </div>
                </div>
                <div className="md:col-span-7">
                  <p className="section-label mb-4">What it is</p>
                  <h2 className="font-playfair italic text-4xl md:text-5xl text-foreground mb-8">
                    TRT done right.
                  </h2>
                  <div className="space-y-5 font-jost font-light text-lg text-muted-foreground leading-relaxed">
                    <p>Most men's TRT clinics push you to the maximum dose, fastest, with minimal labs. We don't.</p>
                    <p>Your protocol is built from your testosterone, free testosterone, estradiol-sensitive, SHBG, DHEA, and PSA (if ≥40). We monitor quarterly and adjust to keep you in optimal range — not just "above the floor."</p>
                    <p>Most patients use compounded testosterone cypionate (injectable, weekly). We also offer testosterone cream (transdermal) for patients who prefer it. Brand-name options like AndroGel, Testim, and Androderm are available via standard e-Rx when preferred.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. How it works (Pattern D) */}
          <section id="how-it-works" className="py-20 md:py-28 bg-muted/30">
            <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
              <div className="text-center mb-16">
                <p className="section-label mb-4">How It Works</p>
                <h2 className="font-playfair text-4xl md:text-5xl text-foreground">Four steps. <span className="italic">No shortcuts.</span></h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {steps.map((s) => (
                  <div key={s.n}>
                    <p className="font-playfair italic text-4xl text-accent mb-4">{s.n}</p>
                    <h3 className="font-playfair text-xl text-foreground mb-3">{s.t}</h3>
                    <p className="font-jost font-light text-muted-foreground leading-relaxed text-sm">{s.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 5. Who it's for */}
          <section className="py-20 md:py-28 bg-background">
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
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-10">A full men's <span className="italic">formulary</span>.</h2>
              <ul className="space-y-4 mb-10">
                {services.map((s) => (
                  <li key={s} className="font-jost font-light text-foreground text-lg flex items-start gap-3">
                    <span className="text-accent mt-1.5 text-sm">—</span>{s}
                  </li>
                ))}
              </ul>
              <p className="font-jost font-light text-sm text-muted-foreground italic border-l-2 border-accent pl-4">
                Schedule III prescribing requires DEA registration; the physician's DEA is on file. Compounded TRT prescriptions are faxed directly to our state-licensed 503A compounding pharmacy, which ships to clinic or to the patient's home.
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
                        Supportive medications (e.g., anastrozole, HCG)
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
