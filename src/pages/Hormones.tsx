import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { CORE_SERVICES, ELEVATED_PROGRAMS } from "@/lib/stripeConfig";
import { EverythingIncludedPillars } from "@/components/marketing/EverythingIncludedPillars";
import { MembershipComparison } from "@/components/marketing/MembershipComparison";
import {
  storefrontHeroInner,
  storefrontHeroLabel,
  storefrontHeroLead,
  storefrontHeroSection,
  storefrontHeroTitle,
} from "@/lib/storefrontHero";
import {
  HORMONES_GATEWAY_LOCAL_COMPOUNDING,
  HORMONES_GATEWAY_MENS_CARD,
} from "@/lib/hormoneStorefrontContent";

const PRICE_CONSULT = CORE_SERVICES.wellnessAssessment.displayPrice;
const PRICE_PANEL = CORE_SERVICES.comprehensivePanel.displayPrice;

const Hormones = () => {
  const { openBooking } = useBooking();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Helmet>
        <title>Hormone Therapy Augusta GA | BHRT & TRT — Elevated Health</title>
        <meta name="description" content="Bioidentical hormone therapy in Augusta, GA. Compounded transdermal creams for women and men. Lab-driven, physician-led TRT and BHRT." />
        <meta name="keywords" content="hormone therapy Augusta, BHRT Augusta GA, TRT Augusta GA, bioidentical hormones, testosterone replacement" />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/hormones" />
        <meta property="og:title" content="Hormone Therapy Augusta GA | BHRT & TRT" />
        <meta property="og:description" content="Lab-driven, custom-dosed bioidentical hormone therapy. Transdermal creams and physician-led TRT." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elevatedhealthaugusta.com/hormones" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalProcedure",
          "name": "Hormone Replacement Therapy",
          "description": "Bioidentical hormone therapy with compounded transdermal creams for women and men, guided by lab work.",
          "procedureType": "https://schema.org/TherapeuticProcedure",
          "url": "https://elevatedhealthaugusta.com/hormones",
          "provider": { "@type": "MedicalClinic", "name": "Elevated Health Augusta", "url": "https://elevatedhealthaugusta.com" }
        })}</script>
      </Helmet>

      <div className="public-page-shell">
        <Navbar />

        <main className="flex-1">
          {/* Hero */}
          <section className={storefrontHeroSection}>
            <div className={storefrontHeroInner}>
              <p className={storefrontHeroLabel}>Hormone Therapy</p>
              <h1 className={storefrontHeroTitle}>
                Hormones,<br /><span className="italic">done thoughtfully.</span>
              </h1>
              <p className={storefrontHeroLead}>
                Bioidentical, compounded, custom-dosed. For men and women rebuilding what time took.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={openBooking} size="lg" className="font-jost tracking-wide">
                  Find your path <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button asChild variant="outline" size="lg" className="font-jost tracking-wide">
                  <a href="#paths">Compare options ↓</a>
                </Button>
              </div>
            </div>
          </section>

          {/* Split: Women / Men */}
          <section id="paths" className="py-20 md:py-28 bg-background">
            <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
              <div className="text-center mb-16">
                <p className="section-label mb-4">Choose Your Path</p>
                <h2 className="font-playfair text-4xl md:text-5xl text-foreground">
                  Built for <span className="italic">your</span> biology.
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-px bg-border border border-border max-w-4xl mx-auto">
                <Link
                  to="/hormones-women"
                  className="group block bg-background p-10 md:p-12 hover:bg-surface transition-colors"
                >
                  <p className="section-label mb-3">For Women</p>
                  <h3 className="font-playfair italic text-4xl md:text-5xl text-foreground mb-4">Reset.</h3>
                  <p className="font-jost font-light text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
                    BHRT, estradiol, progesterone, testosterone for women. Compounded transdermal creams shipped to your
                    door. Custom-dosed to your labs.
                  </p>
                  <span className="inline-flex items-center gap-2 font-jost text-xs uppercase tracking-[0.12em] text-primary group-hover:gap-3 transition-all">
                    Women&apos;s Hormones <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>

                <Link
                  to="/hormones-men"
                  className="group block bg-background p-10 md:p-12 hover:bg-surface transition-colors border-t md:border-t-0 md:border-l border-border"
                >
                  <p className="section-label mb-3">For Men</p>
                  <h3 className="font-playfair italic text-4xl md:text-5xl text-foreground mb-4">Restore.</h3>
                  <p className="font-jost font-light text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
                    {HORMONES_GATEWAY_MENS_CARD}
                  </p>
                  <span className="inline-flex items-center gap-2 font-jost text-xs uppercase tracking-[0.12em] text-primary group-hover:gap-3 transition-all">
                    Men&apos;s Hormones <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24 bg-muted/20 border-y border-border">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl space-y-16">
              <EverythingIncludedPillars intro="Choose the comparison for the program that matches your biology, then dive into the women's or men's detail page." />
              <div className="space-y-4">
                <h2 className="font-playfair text-2xl text-foreground text-center">{ELEVATED_PROGRAMS.trt.name}</h2>
                <MembershipComparison program="trt" />
              </div>
              <div className="space-y-4">
                <h2 className="font-playfair text-2xl text-foreground text-center">{ELEVATED_PROGRAMS.hrt.name}</h2>
                <MembershipComparison program="hrt" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="outline" className="font-jost tracking-wide">
                  <Link to="/hormones-men">Men&apos;s TRT details</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="font-jost tracking-wide">
                  <Link to="/hormones-women">Women&apos;s HRT details</Link>
                </Button>
              </div>
            </div>
          </section>

          <div className="section-divider max-w-4xl mx-auto" />

          {/* Why Elevated Health for Hormones */}
          <section className="py-20 md:py-28 bg-background">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
              <div className="text-center mb-16">
                <p className="section-label mb-4">Why Elevated Health</p>
                <h2 className="font-playfair text-4xl md:text-5xl text-foreground">
                  Three things that <span className="italic">matter</span>.
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-12">
                {[
                  { n: "01", t: "Local compounding", d: HORMONES_GATEWAY_LOCAL_COMPOUNDING },
                  { n: "02", t: "Physician-led", d: "Every protocol is built and monitored by a physician. Quarterly labs. Real adjustments. No template, no auto-renew." },
                  { n: "03", t: "ELEVATED programs", d: `${ELEVATED_PROGRAMS.hrt.name} (${ELEVATED_PROGRAMS.hrt.displayPrice}) and ${ELEVATED_PROGRAMS.trt.name} (${ELEVATED_PROGRAMS.trt.displayPrice}) bundle medication where prescribed, monthly check-ins with our clinical team, quarterly labs, and unlimited messaging.` },
                ].map((p) => (
                  <div key={p.n}>
                    <p className="font-playfair italic text-3xl text-accent mb-4">{p.n}</p>
                    <h3 className="font-playfair text-2xl text-foreground mb-3">{p.t}</h3>
                    <p className="font-jost font-light text-muted-foreground leading-relaxed">{p.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Strip (Pattern B) */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                {[
                  { l: "Wellness Assessment", p: PRICE_CONSULT, sub: "RN intake, in-office at Evans" },
                  { l: "Comprehensive Wellness Panel", p: PRICE_PANEL, sub: "drawn on-site, processed by LabCorp" },
                  {
                    l: "ELEVATED programs",
                    p: `${ELEVATED_PROGRAMS.hrt.displayPrice} / ${ELEVATED_PROGRAMS.trt.displayPrice}`,
                    sub: "HRT and TRT monthly memberships",
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

          {/* Closing CTA */}
          <section className="py-20 md:py-28 bg-background text-center">
            <div className="container mx-auto px-6 max-w-2xl">
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-6">
                Not sure which path?
              </h2>
              <p className="font-jost font-light text-lg text-muted-foreground mb-10">
                Book a {PRICE_CONSULT} Wellness Assessment and we&apos;ll help you choose TRT vs. HRT.
              </p>
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

export default Hormones;
