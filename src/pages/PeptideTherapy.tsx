import { Helmet } from "react-helmet";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { isServiceActive } from "@/lib/serviceConfig";
import {
  CORE_SERVICES,
  ELEVATED_PROGRAMS,
  MEMBER_DISCOUNT_PERCENT,
  PEPTIDE_PRODUCTS,
  SEXUAL_WELLNESS_PRODUCTS,
} from "@/lib/stripeConfig";
import { EverythingIncludedPillars } from "@/components/marketing/EverythingIncludedPillars";
import { MembershipComparison } from "@/components/marketing/MembershipComparison";

const PRICE_CONSULT = CORE_SERVICES.wellnessAssessment.displayPrice;
const PRICE_PANEL = CORE_SERVICES.comprehensivePanel.displayPrice;
const PRICE_PROGRAM_WELLNESS = ELEVATED_PROGRAMS.wellness.displayPrice;

const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;
const memberCents = (cents: number) => Math.round((cents * (100 - MEMBER_DISCOUNT_PERCENT)) / 100);
const pairNonMember = (a: number, b: number) => `${fmt(a + b)}/mo`;
const pairMember = (a: number, b: number) => `${fmt(memberCents(a) + memberCents(b))}/mo`;

const TB500_AVAILABLE = isServiceActive("peptideTB500");

/** IV Lounge walk-in reference until NAD infusion SKU is exported here (SOT IV menu). */
const NAD_250_IV_LOUNGE_CENTS = 45000;

type Stack = {
  name: string;
  tagline: string;
  includes: string[];
  bestFor: string[];
  priceMember: string;
  priceNonMember: string;
  priceVariant?: { label: string; member: string; nonMember: string };
  note: string;
};

const vitalityBaseNon = PEPTIDE_PRODUCTS.sermorelin.amount + PEPTIDE_PRODUCTS.nadInjection.amount;
const vitalityBaseMember = memberCents(PEPTIDE_PRODUCTS.sermorelin.amount) + memberCents(PEPTIDE_PRODUCTS.nadInjection.amount);
const vitalityIvNon = PEPTIDE_PRODUCTS.sermorelin.amount + NAD_250_IV_LOUNGE_CENTS;
const vitalityIvMember = memberCents(PEPTIDE_PRODUCTS.sermorelin.amount) + memberCents(NAD_250_IV_LOUNGE_CENTS);

const stacks: Stack[] = [
  {
    name: "The Restore Protocol",
    tagline: "Sexual wellness, redefined. Works on the brain — not just the body.",
    includes: [
      "PT-141 (Bremelanotide) injectable, weekly",
      "Optional: PT-141 / Oxytocin nasal spray for couples",
    ],
    bestFor: ["Low libido", "Arousal challenges", "Intimacy disconnect"],
    priceMember: `${fmt(memberCents(SEXUAL_WELLNESS_PRODUCTS.pt141.amount))} + ${fmt(memberCents(SEXUAL_WELLNESS_PRODUCTS.oxytocin.amount))}/mo`,
    priceNonMember: `${SEXUAL_WELLNESS_PRODUCTS.pt141.displayPrice} + ${SEXUAL_WELLNESS_PRODUCTS.oxytocin.displayPrice}/mo`,
    note: "PT-141 is FDA-approved as Vyleesi. Compounded alternative dosing available.",
  },
  {
    name: "The Healing Protocol",
    tagline: "Soft tissue, joints, gut, inflammation — accelerated recovery.",
    includes: TB500_AVAILABLE
      ? [
          "Pentadeca Arginate (PDA) oral capsules, daily",
          "TB-500 (Thymosin Beta-4) subcutaneous injection, weekly",
        ]
      : ["Pentadeca Arginate (PDA) oral capsules, daily"],
    bestFor: ["Post-injury recovery", "Tendon & ligament healing", "Chronic inflammation", "Gut barrier integrity"],
    priceMember: TB500_AVAILABLE
      ? pairMember(PEPTIDE_PRODUCTS.cjc1295Ipamorelin.amount, PEPTIDE_PRODUCTS.nadInjection.amount)
      : pairMember(PEPTIDE_PRODUCTS.ghkCuSublingual.amount, PEPTIDE_PRODUCTS.nadTroches.amount),
    priceNonMember: TB500_AVAILABLE
      ? pairNonMember(PEPTIDE_PRODUCTS.cjc1295Ipamorelin.amount, PEPTIDE_PRODUCTS.nadInjection.amount)
      : pairNonMember(PEPTIDE_PRODUCTS.ghkCuSublingual.amount, PEPTIDE_PRODUCTS.nadTroches.amount),
    note: TB500_AVAILABLE
      ? "PDA is the successor to BPC-157, available through legal compounding channels. Posted totals use representative pharmacy-line items; your physician may substitute equivalents."
      : "PDA is the successor to BPC-157. TB-500 temporarily unavailable pending pharmacy compliance review. Posted totals use representative pharmacy-line items.",
  },
  {
    name: "The Vitality Protocol",
    tagline: "Energy, cognition, sleep, body composition — the longevity foundation.",
    includes: [
      "Sermorelin subcutaneous injection, nightly",
      "NAD+ subcutaneous take-home OR IV at the IV Lounge",
    ],
    bestFor: ["Low energy", "Cognitive dulling", "Poor sleep quality", "Age-related decline"],
    priceMember: `${fmt(vitalityBaseMember)}/mo`,
    priceNonMember: `${fmt(vitalityBaseNon)}/mo`,
    priceVariant: {
      label: "With monthly NAD+ IV at the lounge",
      member: `${fmt(vitalityIvMember)}/mo`,
      nonMember: `${fmt(vitalityIvNon)}/mo`,
    },
    note: "Sermorelin and NAD+ are well-established peptides with clear regulatory standing. IV add-on uses IV Lounge walk-in pricing reference.",
  },
];

type AlaCarte = { name: string; desc: string; bestFor: string; priceMember: string; priceNonMember: string; note?: string };

const alacarte: AlaCarte[] = [
  ...(
    [
      ["sermorelin", "GH support, sleep, recovery.", "Sleep · energy · body comp"],
      ["cjc1295Ipamorelin", "Recovery-focused peptide support.", "Recovery · performance"],
      ["tesamorelin", "Metabolic and body-composition support.", "Visceral fat · metabolic health"],
      ["nadTroches", "Cellular energy support.", "Longevity · convenience"],
      ["nadInjection", "Cellular energy, longevity.", "Longevity · home protocol"],
      ["nadNasal", "Cellular energy, nasal delivery.", "Longevity · travel-friendly"],
      ["ghkCuSublingual", "Skin, hair, collagen support.", "Skin · hair · collagen"],
      ["ghkCuTopical", "Skin, hair, collagen support.", "Skin · hair · topical"],
    ] as const
  ).map(([key, desc, bestFor]) => {
    const p = PEPTIDE_PRODUCTS[key];
    return {
      name: p.name,
      desc,
      bestFor,
      priceMember: `${fmt(memberCents(p.amount))}/mo`,
      priceNonMember: p.displayPrice,
    };
  }),
  ...(TB500_AVAILABLE
    ? ([
        {
          name: "TB-500 (Thymosin Beta-4)",
          desc: "Tissue repair and recovery.",
          bestFor: "Tendon · ligament · muscle",
          priceMember: "—",
          priceNonMember: "—",
          note: "Subject to 503A pharmacy compliance verification; priced at enrollment.",
        },
      ] as AlaCarte[])
    : []),
  {
    name: SEXUAL_WELLNESS_PRODUCTS.tadalafil.name,
    desc: "Sexual wellness — men.",
    bestFor: "Performance · confidence",
    priceMember: `${fmt(memberCents(SEXUAL_WELLNESS_PRODUCTS.tadalafil.amount))}/mo`,
    priceNonMember: SEXUAL_WELLNESS_PRODUCTS.tadalafil.displayPrice,
  },
  {
    name: SEXUAL_WELLNESS_PRODUCTS.sildenafil.name,
    desc: "Sexual wellness — men.",
    bestFor: "Performance · confidence",
    priceMember: `${fmt(memberCents(SEXUAL_WELLNESS_PRODUCTS.sildenafil.amount))}/mo`,
    priceNonMember: SEXUAL_WELLNESS_PRODUCTS.sildenafil.displayPrice,
  },
  {
    name: SEXUAL_WELLNESS_PRODUCTS.pt141.name,
    desc: "Sexual wellness — for men and women.",
    bestFor: "Libido · desire",
    priceMember: fmt(memberCents(SEXUAL_WELLNESS_PRODUCTS.pt141.amount)),
    priceNonMember: SEXUAL_WELLNESS_PRODUCTS.pt141.displayPrice,
  },
  {
    name: SEXUAL_WELLNESS_PRODUCTS.oxytocin.name,
    desc: "Bonding and intimacy support.",
    bestFor: "Couples · connection",
    priceMember: `${fmt(memberCents(SEXUAL_WELLNESS_PRODUCTS.oxytocin.amount))}/mo`,
    priceNonMember: SEXUAL_WELLNESS_PRODUCTS.oxytocin.displayPrice,
  },
];

const symptoms = [
  "Slow recovery from training", "Age-related decline", "Sleep disruption",
  "Stubborn body composition", "Libido changes", "Post-injury rehab",
  "Chronic inflammation", "Cognitive dulling", "Skin, hair & connective tissue concerns",
];

const steps = [
  { n: "01", t: `Wellness Assessment (${PRICE_CONSULT})`, d: "Meet your physician. Walk through goals, current protocol/medications, history. About 45 minutes." },
  {
    n: "02",
    t: "Targeted Lab Panel",
    d: `Foundation labs plus IGF-1 (for GH peptides) and hormone markers if relevant. Common panels include ${CORE_SERVICES.comprehensivePanel.name} (${CORE_SERVICES.comprehensivePanel.displayPrice}) or ${CORE_SERVICES.expandedPanel.name} (${CORE_SERVICES.expandedPanel.displayPrice}) when ordered.`,
  },
  { n: "03", t: "Custom Protocol", d: "Physician selects your stack or à la carte peptides, designs dosing, sends Rx to our compounding pharmacy. Compounded for you and shipped refrigerated (5-day fulfillment)." },
  { n: "04", t: "Self-Administer or In-Clinic", d: "Most peptides are subcutaneous self-injection at home — our clinical team trains you in 15 minutes. Or come in weekly with your ELEVATED program for in-clinic administration." },
];

const faqs = [
  { q: "Why don't you offer BPC-157?", a: "BPC-157 is currently on the FDA's Category 2 list, meaning licensed compounding pharmacies cannot legally produce it. We use Pentadeca Arginate (PDA) instead — it's the regulatory-cleared successor with similar mechanism. Some online vendors still sell BPC-157 as 'research grade' — that's outside the legal pharmacy framework, and we don't participate in that market." },
  { q: "Are peptides FDA-approved?", a: "Some are — PT-141 is FDA-approved as Vyleesi. Most peptides we prescribe are compounded under 503A authority for specific patients, which is a different legal framework than FDA approval but still regulated. It's not the same as 'research grade' or 'physician use only' branded products." },
  { q: "Can I get peptides cheaper online?", a: "Yes, you can find research-grade peptide kits cheaper. Those are sold for 'research use only' and aren't intended for human medical use — selling them for human use is outside the legal framework. We're not competing on price; we're offering pharmacy-grade compounding with physician oversight and lab monitoring." },
  { q: "How are peptides administered?", a: "Most are subcutaneous self-injection at home — our clinical team trains you. Some are sublingual or topical. NAD+ can be IV at our IV Lounge or subcutaneous take-home depending on preference." },
  { q: "How long until I notice results?", a: "Recovery peptides: 1–3 weeks for inflammation reduction, 4–8 weeks for tissue healing. Sexual wellness peptides: same-day to 2 weeks. Longevity peptides: subjective changes in 4–6 weeks; objective changes (labs, body composition) in 3–6 months." },
  { q: "Do peptides have side effects?", a: "Generally well-tolerated. Specific peptides have specific considerations — PT-141 can cause facial flushing, NAD+ can cause flushing during IV. Your physician will review the profile before starting." },
  { q: "Will more peptides become available later?", a: "Likely yes. The FDA announced in early 2026 the intent to reclassify several peptides currently restricted — including CJC/Ipamorelin and Thymosin Alpha-1 — back to available status. We monitor this and will add new options as they become legally compoundable." },
];

const PeptideTherapy = () => {
  const { openBooking } = useBooking();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Helmet>
        <title>Peptide Therapy Augusta GA | Pharmacy-Sourced Protocols — Elevated Health</title>
        <meta name="description" content="Physician-prescribed, pharmacy-compounded peptide protocols in Augusta, GA. PDA, PT-141, Sermorelin, NAD+, GHK-Cu. Lab-monitored, shipped to your door. No gray-market." />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/peptides" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main>
          {/* 1. Hero (Pattern A) */}
          <section className="min-h-[70vh] flex items-center bg-muted/30">
            <div className="container mx-auto px-6 lg:px-8 max-w-4xl py-24">
              <p className="section-label mb-6">Peptide Protocols</p>
              <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl text-foreground mb-8 leading-tight">
                Targeted regeneration.<br /><span className="italic">Pharmacy-sourced. Physician-led.</span>
              </h1>
              <p className="font-jost font-light text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
                Custom peptide protocols compounded by a licensed 503A pharmacy and shipped to your door. Recovery, sexual wellness, longevity — physician-supervised, lab-monitored, no gray-market shortcuts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={openBooking} size="lg" className="font-jost tracking-wide">
                  Book your {PRICE_CONSULT} Wellness Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button asChild variant="link" size="lg" className="font-jost tracking-wide text-foreground">
                  <a href="#stacks">Explore the protocols ↓</a>
                </Button>
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24 bg-muted/20 border-y border-border">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl space-y-10">
              <EverythingIncludedPillars intro="Pair peptide therapy with ELEVATED WELLNESS for 20% off eligible à la carte items and bundled clinical access." />
              <MembershipComparison program="wellness" />
            </div>
          </section>

          {/* 2. Pricing Strip (Pattern B) */}
          <section className="py-16 md:py-20 bg-background border-y border-border">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                {[
                  { l: "Wellness Assessment", p: PRICE_CONSULT, sub: "RN intake, in-person at Evans" },
                  {
                    l: CORE_SERVICES.comprehensivePanel.name,
                    p: PRICE_PANEL,
                    sub: `or ${CORE_SERVICES.expandedPanel.name} (${CORE_SERVICES.expandedPanel.displayPrice}) when expanded markers are ordered`,
                  },
                  {
                    l: ELEVATED_PROGRAMS.wellness.name,
                    p: PRICE_PROGRAM_WELLNESS,
                    sub: "20% off eligible à la carte IV, peptide, and injectable services",
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

          {/* 3. Responsibly Sourced — Regulatory transparency */}
          <section className="py-20 md:py-28 bg-background">
            <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
              <div className="grid md:grid-cols-12 gap-12">
                <div className="md:col-span-5">
                  <p className="section-label mb-4">Responsibly Sourced</p>
                  <h2 className="font-playfair italic text-4xl md:text-5xl text-foreground leading-tight">
                    Pharmacy-grade.<br />By design.
                  </h2>
                </div>
                <div className="md:col-span-7 space-y-5 font-jost font-light text-lg text-muted-foreground leading-relaxed">
                  <p>Most online peptide vendors operate outside the FDA's compounding framework. Their peptides are sold under labels like "research use only" or "physician-use only" — language that gives an appearance of legitimacy without the legal protection of pharmacy compounding. We don't work with those vendors.</p>
                  <p>Every peptide we prescribe is compounded by a licensed 503A compounding pharmacy. Each prescription is written for a specific patient, dispensed under pharmacy oversight, and shipped refrigerated directly to your door.</p>
                  <p>Some peptides commonly discussed online — including BPC-157 — are not currently legal to compound under FDA guidance. We use the regulatory-cleared alternatives where they exist (Pentadeca Arginate is the modern BPC-157 successor) and are transparent when a popular peptide isn't available through legal channels. You'll never get an unapproved gray-market substance from us.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. What it is (Pattern C) */}
          <section className="py-20 md:py-28 bg-muted/30">
            <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
              <div className="grid md:grid-cols-12 gap-12 items-center">
                <div className="md:col-span-5">
                  <div className="aspect-[4/5] bg-background flex items-center justify-center text-muted-foreground/40 font-jost text-xs tracking-widest uppercase border border-border">
                    Editorial Image
                  </div>
                </div>
                <div className="md:col-span-7">
                  <p className="section-label mb-4">What it is</p>
                  <h2 className="font-playfair italic text-4xl md:text-5xl text-foreground mb-8">
                    Compounded peptides, custom-dosed.
                  </h2>
                  <div className="space-y-5 font-jost font-light text-lg text-muted-foreground leading-relaxed">
                    <p>Peptides aren't generic pharmaceuticals — they're compounded for the individual patient by a 503A pharmacy based on a physician's prescription.</p>
                    <p>Your protocol is built from your labs and your goals. Custom doses, custom delivery — subcutaneous injection, sublingual, topical, or IV depending on the peptide.</p>
                    <p>This is meaningfully different from the off-the-shelf "stack kits" sold by online vendors. Every dose is tied to your physician's clinical judgment, your bloodwork, and your monitoring schedule.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. The Three Protocols — Stacks */}
          <section id="stacks" className="py-20 md:py-28 bg-background scroll-mt-24">
            <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
              <div className="mb-16 max-w-2xl">
                <p className="section-label mb-4">The Three Protocols</p>
                <h2 className="font-playfair text-4xl md:text-5xl text-foreground">
                  Built around <span className="italic">outcomes</span>, not compounds.
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {stacks.map((s) => (
                  <div key={s.name} className="border border-border p-8 flex flex-col bg-background">
                    <h3 className="font-playfair italic text-2xl md:text-3xl text-foreground mb-3">{s.name}</h3>
                    <p className="font-jost font-light text-muted-foreground mb-6 leading-relaxed">{s.tagline}</p>

                    <p className="section-label mb-3">What's included</p>
                    <ul className="space-y-2 mb-6">
                      {s.includes.map((i) => (
                        <li key={i} className="font-jost font-light text-sm text-foreground flex items-start gap-2">
                          <span className="text-accent mt-1.5 text-xs">—</span>{i}
                        </li>
                      ))}
                    </ul>

                    <p className="section-label mb-3">Best for</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {s.bestFor.map((b) => (
                        <span key={b} className="font-jost text-xs uppercase tracking-widest text-muted-foreground border border-border px-2 py-1">{b}</span>
                      ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-border">
                      <div className="flex justify-between font-jost text-sm mb-1">
                        <span className="text-muted-foreground">Member</span>
                        <span className="font-medium text-foreground">{s.priceMember}</span>
                      </div>
                      <div className="flex justify-between font-jost text-sm">
                        <span className="text-muted-foreground">Non-member</span>
                        <span className="font-medium text-foreground">{s.priceNonMember}</span>
                      </div>
                      {s.priceVariant && (
                        <div className="mt-3 pt-3 border-t border-border/60">
                          <p className="font-jost text-xs text-muted-foreground mb-1">{s.priceVariant.label}</p>
                          <div className="flex justify-between font-jost text-sm">
                            <span className="text-muted-foreground">Member / Non-member</span>
                            <span className="font-medium text-foreground">{s.priceVariant.member} / {s.priceVariant.nonMember}</span>
                          </div>
                        </div>
                      )}
                      <p className="font-jost text-xs italic text-muted-foreground mt-4 leading-relaxed">{s.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 6. À la carte */}
          <section className="py-20 md:py-28 bg-muted/30">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
              <p className="section-label mb-4">Or build your own</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-12">
                Individual peptides, <span className="italic">à la carte</span>.
              </h2>
              <div className="grid md:grid-cols-2 gap-x-12">
                {alacarte.map((p) => (
                  <div key={p.name} className="py-6 border-b border-border/60">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <h3 className="font-playfair italic text-xl text-foreground">{p.name}</h3>
                      <span className="font-jost font-medium text-accent text-sm shrink-0 text-right">
                        {p.priceMember}<br /><span className="font-light text-muted-foreground text-xs">non-mbr {p.priceNonMember}</span>
                      </span>
                    </div>
                    <p className="font-jost font-light text-muted-foreground text-sm leading-relaxed mb-2">{p.desc}</p>
                    <p className="font-jost text-xs uppercase tracking-widest text-muted-foreground/70">{p.bestFor}</p>
                    {p.note && <p className="font-jost text-xs italic text-muted-foreground/80 mt-1">{p.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 7. How it works (Pattern D) */}
          <section className="py-20 md:py-28 bg-background">
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

          {/* 8. Who it's for */}
          <section className="py-20 md:py-28 bg-muted/30">
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

          {/* 9. Pricing transparency (Pattern E) */}
          <section className="py-20 md:py-28 bg-background">
            <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
              <p className="section-label mb-4">Pricing</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-10">Transparent <span className="italic">all the way through</span>.</h2>

              <div className="space-y-10">
                <div>
                  <p className="section-label mb-4">One-time</p>
                  <div className="space-y-3 font-jost text-foreground">
                    <div className="flex justify-between border-b border-border/60 pb-3"><span>Initial Wellness Assessment</span><span className="font-medium">{PRICE_CONSULT}</span></div>
                    <div className="flex justify-between border-b border-border/60 pb-3"><span>Peptide Lab Panel<br /><span className="font-light text-sm text-muted-foreground">depends on which markers your physician orders</span></span><span className="font-medium whitespace-nowrap text-right">{CORE_SERVICES.comprehensivePanel.displayPrice} or {CORE_SERVICES.expandedPanel.displayPrice}</span></div>
                  </div>
                </div>

                <div>
                  <p className="section-label mb-4">Ongoing (depends on protocol)</p>
                  <div className="space-y-3 font-jost text-foreground">
                    <div className="flex justify-between border-b border-border/60 pb-3"><span>{ELEVATED_PROGRAMS.wellness.name}<br /><span className="font-light text-sm text-muted-foreground">preferred pathway for peptide patients needing bundled access</span></span><span className="font-medium whitespace-nowrap">{PRICE_PROGRAM_WELLNESS}</span></div>
                    <div className="flex justify-between border-b border-border/60 pb-3"><span>Restore Protocol</span><span className="font-medium whitespace-nowrap">{stacks[0].priceNonMember}</span></div>
                    <div className="flex justify-between border-b border-border/60 pb-3"><span>Healing Protocol</span><span className="font-medium whitespace-nowrap">{stacks[1].priceNonMember}</span></div>
                    <div className="flex justify-between border-b border-border/60 pb-3"><span>Vitality Protocol<br /><span className="font-light text-sm text-muted-foreground">depending on NAD+ delivery</span></span><span className="font-medium whitespace-nowrap">{stacks[2].priceNonMember}</span></div>
                    <div className="flex justify-between border-b border-border/60 pb-3"><span>Individual peptides (à la carte)</span><span className="font-medium whitespace-nowrap">See catalog below</span></div>
                  </div>
                </div>

                <div className="bg-muted/30 border border-border p-6 space-y-2 font-jost text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Typical first month (assessment + labs + first month protocol + program)</span><span className="font-medium text-foreground whitespace-nowrap text-right">Varies by protocol — priced at checkout</span></div>
                </div>
              </div>
            </div>
          </section>

          {/* 10. FAQ (Pattern F) */}
          <section className="py-20 md:py-28 bg-muted/30">
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

          {/* 11. Closing CTA (Pattern G) */}
          <section className="py-24 md:py-32 bg-background text-center">
            <div className="container mx-auto px-6 max-w-2xl">
              <h2 className="font-playfair text-4xl md:text-5xl text-foreground mb-8">
                Build the protocol your <span className="italic">body deserves</span>.
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

export default PeptideTherapy;
