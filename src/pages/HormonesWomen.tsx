import { Helmet } from "react-helmet";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { SITE_CONFIG } from "@/lib/siteConfig";

// Display values — actual charges flow through Stripe via
// create-consultation-checkout ($79) and the membership product.
const PRICE_CONSULT = "$79";
const PRICE_PANEL = "$395";
const PRICE_PANEL_MEMBER = "$345";
const PRICE_MEMBERSHIP = "$199";

const services = [
  "Bioidentical hormone replacement (BHRT)",
  "Estradiol (Bi-Est, sensitive E2 monitoring)",
  "Progesterone optimization",
  "Testosterone therapy for women",
  "Thyroid optimization (when indicated by labs)",
  "Comprehensive hormone labs (LabCorp)",
  "Quarterly monitoring and dose adjustment",
];

const symptoms = [
  "Hot flashes", "Night sweats", "Sleep disruption", "Mood changes",
  "Brain fog", "Weight gain", "Libido changes", "Joint pain",
  "Dry skin", "Irregular cycles",
];

const steps = [
  { n: "01", t: "Wellness Assessment ($79)", d: "Meet your physician. Walk through symptoms, history, goals. About 45 minutes." },
  { n: "02", t: "Lab Draw On-Site", d: `Comprehensive Hormone Panel — Female (${PRICE_PANEL}, ${PRICE_PANEL_MEMBER} for members) — drawn at your visit, processed by LabCorp. Results in 1–3 days.` },
  { n: "03", t: "Custom Protocol", d: "Physician reviews labs, designs your protocol, sends Rx to FCC. Your medication ships directly to your door." },
  { n: "04", t: "Ongoing Care", d: "Weekly visits if needed, quarterly physician check-in, member-rate labs at follow-up. All included with membership." },
];

const faqs = [
  { q: "Is this covered by insurance?", a: "No — we're cash-pay. We provide a superbill you can submit to your insurance for potential out-of-network reimbursement." },
  { q: "How long until I feel different?", a: "Most patients notice meaningful changes within 4–6 weeks. Sleep and energy often improve first; mood and libido follow." },
  { q: "Do I have to come in weekly?", a: "Only if your protocol calls for it. Many patients self-administer at home after a brief training visit." },
  { q: "What if I don't like the cream?", a: "Your protocol is flexible. We can pivot to gels, sprays, or patches when available, or discuss other delivery methods with your physician." },
  { q: "What's the difference between FDA-approved and compounded?", a: "Both are legitimate. FDA-approved products come in fixed doses your insurance might cover if billed. Compounded medications are made by a licensed 503A pharmacy and allow custom dosing tailored to your labs." },
  { q: "Can I do this remotely?", a: "Your initial consultation and lab draw are in person at our Evans, GA clinic. Follow-up visits can be telehealth once you're established." },
  { q: "What if I'm not yet menopausal?", a: "We treat perimenopause too. Symptoms can begin 5–10 years before menopause proper, and they're just as treatable." },
];

const HormonesWomen = () => {
  const { openBooking } = useBooking();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Helmet>
        <title>BHRT Augusta GA | Women's Hormone Therapy — Elevated Health</title>
        <meta name="description" content="Bioidentical hormone replacement therapy for women in Augusta, GA. Compounded transdermal estradiol, progesterone, and testosterone. Physician-led, lab-driven." />
        <meta name="keywords" content="BHRT Augusta GA, bioidentical hormones women, estradiol progesterone Augusta, menopause treatment Augusta, perimenopause" />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/hormones-women" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main>
          {/* 1. Hero (Pattern A) */}
          <section className="min-h-[70vh] flex items-center bg-muted/30">
            <div className="container mx-auto px-6 lg:px-8 max-w-4xl py-24">
              <p className="section-label mb-6">Women's Hormones</p>
              <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl text-foreground mb-8 leading-tight">
                The fog isn't permanent.<br /><span className="italic">Neither is the fatigue.</span>
              </h1>
              <p className="font-jost font-light text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
                Hot flashes, night sweats, weight that won't move, mood that isn't yours. You've been told this is just aging. It isn't. It's hormones — and they're fixable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={openBooking} size="lg" className="font-jost tracking-wide">
                  Book your {PRICE_CONSULT} consultation <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button asChild variant="link" size="lg" className="font-jost tracking-wide text-foreground">
                  <a href="#how-it-works">Learn how it works ↓</a>
                </Button>
              </div>
            </div>
          </section>

          {/* 2. Pricing Strip (Pattern B) */}
          <section className="py-16 md:py-20 bg-background border-y border-border">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                {[
                  { l: "Initial Consultation", p: PRICE_CONSULT, sub: "credited toward your protocol" },
                  { l: "Hormone Panel — Female", p: `${PRICE_PANEL} / Member ${PRICE_PANEL_MEMBER}`, sub: "drawn on-site, processed by LabCorp" },
                  { l: "Elevated Membership", p: `${PRICE_MEMBERSHIP}/mo`, sub: "ongoing care, supplies, member labs" },
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
                    {/* TODO: editorial photograph — compounded cream / pharmacy */}
                    Editorial Image
                  </div>
                </div>
                <div className="md:col-span-7">
                  <p className="section-label mb-4">What it is</p>
                  <h2 className="font-playfair italic text-4xl md:text-5xl text-foreground mb-8">
                    Compounded transdermal creams.
                  </h2>
                  <div className="space-y-5 font-jost font-light text-lg text-muted-foreground leading-relaxed">
                    <p>Standard FDA estradiol patches are in nationwide shortage through end of 2026 due to surging demand. We don't depend on that fragile supply.</p>
                    <p>Our default is compounded transdermal cream — Bi-Est (E2/E3), Estradiol, Progesterone, Testosterone — formulated by FCC, a 503A pharmacy in Texas, dosed to your labs and shipped directly to your door.</p>
                    <p>For patients who prefer FDA-approved gels, sprays, or patches when available, we prescribe via standard e-Rx to your pharmacy of choice. You're not locked into one delivery method.</p>
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
                <h2 className="font-playfair text-4xl md:text-5xl text-foreground">Four steps. <span className="italic">No surprises.</span></h2>
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
          <section className="py-20 md:py-28 bg-background border-t border-border">
            <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
              <p className="section-label mb-4">What's Offered</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-10">A full women's <span className="italic">formulary</span>.</h2>
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
          <section className="py-20 md:py-28 bg-muted/30">
            <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
              <p className="section-label mb-4">Pricing</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-10">Transparent <span className="italic">all the way through</span>.</h2>

              <div className="space-y-10">
                <div>
                  <p className="section-label mb-4">One-time costs</p>
                  <div className="space-y-3 font-jost text-foreground">
                    <div className="flex justify-between border-b border-border/60 pb-3"><span>Initial Wellness Assessment</span><span className="font-medium">{PRICE_CONSULT}</span></div>
                    <div className="flex justify-between border-b border-border/60 pb-3"><span>Hormone Optimization Panel — Female</span><span className="font-medium">{PRICE_PANEL} / Member {PRICE_PANEL_MEMBER}</span></div>
                  </div>
                </div>

                <div>
                  <p className="section-label mb-4">Ongoing (if you proceed)</p>
                  <div className="space-y-3 font-jost text-foreground">
                    <div className="flex justify-between border-b border-border/60 pb-3">
                      <span>Elevated Membership<br /><span className="font-light text-sm text-muted-foreground">unlimited weekly visits, in-office supplies, member-rate labs, quarterly check-in</span></span>
                      <span className="font-medium whitespace-nowrap">{PRICE_MEMBERSHIP}/mo</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 pb-3">
                      <span>Compounded medication (FCC)<br /><span className="font-light text-sm text-muted-foreground">billed separately by FCC, shipped to your door</span></span>
                      <span className="font-medium whitespace-nowrap">$40–$120/mo</span>
                    </div>
                  </div>
                </div>

                <div className="bg-background border border-border p-6 space-y-2 font-jost text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Typical first month (consult + labs + first month membership)</span><span className="font-medium text-foreground">~$673 / $573 members</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Typical ongoing month (membership + medication)</span><span className="font-medium text-foreground">~$240–320/mo</span></div>
                </div>
              </div>
            </div>
          </section>

          {/* 8. FAQ (Pattern F) */}
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

          {/* 9. Closing CTA (Pattern G) */}
          <section className="py-24 md:py-32 bg-muted/30 text-center">
            <div className="container mx-auto px-6 max-w-2xl">
              <h2 className="font-playfair text-4xl md:text-5xl text-foreground mb-8">
                Ready to feel like <span className="italic">yourself</span> again?
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={openBooking} size="lg" className="font-jost tracking-wide">
                  Book your {PRICE_CONSULT} consultation
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
