import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { SITE_CONFIG } from "@/lib/siteConfig";

// Display values — actual charges flow through Stripe via
// create-consultation-checkout ($79) and the membership product.
const PRICE_CONSULT = "$79";
const PRICE_PANEL = "$395";
const PRICE_PANEL_MEMBER = "$345";
const PRICE_MEMBERSHIP = "$199";

const Hormones = () => {
  const { openBooking } = useBooking();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Helmet>
        <title>Hormone Therapy Augusta GA | BHRT & TRT — Elevated Health</title>
        <meta name="description" content="Bioidentical hormone therapy in Augusta, GA. Compounded transdermal creams for women, physician-led TRT for men. Lab-driven, custom-dosed, no shortcuts." />
        <meta name="keywords" content="hormone therapy Augusta, BHRT Augusta GA, TRT Augusta GA, bioidentical hormones, testosterone replacement" />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/hormones" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main>
          {/* Hero */}
          <section className="min-h-[70vh] flex items-center bg-muted/30">
            <div className="container mx-auto px-6 lg:px-8 max-w-4xl py-24">
              <p className="section-label mb-6">Hormone Therapy</p>
              <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl text-foreground mb-8 leading-tight">
                Hormones,<br /><span className="italic">done thoughtfully.</span>
              </h1>
              <p className="font-jost font-light text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
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

              <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Women */}
                <Link to="/hormones-women" className="group block">
                  <div className="aspect-[4/5] bg-muted/40 mb-6 overflow-hidden">
                    {/* TODO: editorial portrait — women's hormones */}
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 font-jost text-xs tracking-widest uppercase">
                      Women's Portrait
                    </div>
                  </div>
                  <p className="section-label mb-3">For Women</p>
                  <h3 className="font-playfair italic text-4xl md:text-5xl text-foreground mb-4">
                    Reset.
                  </h3>
                  <p className="font-jost font-light text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                    BHRT, estradiol, progesterone, testosterone for women. Compounded transdermal creams shipped to your door. Custom-dosed to your labs.
                  </p>
                  <span className="font-jost text-sm tracking-wide text-foreground border-b border-foreground/40 group-hover:border-foreground transition-colors pb-1">
                    Women's Hormones →
                  </span>
                </Link>

                {/* Men */}
                <Link to="/hormones-men" className="group block">
                  <div className="aspect-[4/5] bg-muted/40 mb-6 overflow-hidden">
                    {/* TODO: editorial portrait — men's hormones */}
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 font-jost text-xs tracking-widest uppercase">
                      Men's Portrait
                    </div>
                  </div>
                  <p className="section-label mb-3">For Men</p>
                  <h3 className="font-playfair italic text-4xl md:text-5xl text-foreground mb-4">
                    Restore.
                  </h3>
                  <p className="font-jost font-light text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                    TRT and male hormone optimization. Compounded testosterone, in-clinic injections or take-home protocol. Lab-driven, physician-led.
                  </p>
                  <span className="font-jost text-sm tracking-wide text-foreground border-b border-foreground/40 group-hover:border-foreground transition-colors pb-1">
                    Men's Hormones →
                  </span>
                </Link>
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
                  { n: "01", t: "Compounded transdermal", d: "Our default delivery is compounded transdermal cream from FCC, a 503A pharmacy in Texas. Custom-dosed to your labs. Shipped to your door. Insulated from FDA-patch shortages." },
                  { n: "02", t: "Physician-led", d: "Every protocol is built and monitored by a physician. Quarterly labs. Real adjustments. No template, no auto-renew." },
                  { n: "03", t: "Concierge membership", d: "$199/mo Elevated Membership covers unlimited weekly visits, in-office supplies, and member-rate labs at follow-up." },
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
                  { l: "Initial Consultation", p: PRICE_CONSULT, sub: "credited toward your protocol" },
                  { l: "Hormone Optimization Panel", p: `${PRICE_PANEL} / Member ${PRICE_PANEL_MEMBER}`, sub: "drawn on-site, processed by LabCorp" },
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

          {/* Closing CTA */}
          <section className="py-20 md:py-28 bg-background text-center">
            <div className="container mx-auto px-6 max-w-2xl">
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-6">
                Not sure which path?
              </h2>
              <p className="font-jost font-light text-lg text-muted-foreground mb-10">
                Book a {PRICE_CONSULT} consultation and we'll figure it out together.
              </p>
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

export default Hormones;
