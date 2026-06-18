import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBooking } from "@/contexts/BookingContext";
import { SERVICE_PILLARS } from "@/lib/marketingPillars";
import { CORE_SERVICES } from "@/lib/stripeConfig";
import { ArrowRight } from "lucide-react";
import {
  storefrontHeroInner,
  storefrontHeroLabel,
  storefrontHeroLead,
  storefrontHeroSection,
  storefrontHeroTitle,
} from "@/lib/storefrontHero";

const PRICE_CONSULT = CORE_SERVICES.wellnessAssessment.displayPrice;

const Services = () => {
  const { openBooking } = useBooking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Services | Elevated Health Augusta</title>
        <meta
          name="description"
          content="IV therapy, hormone optimization, peptide therapy, medical weight loss, and Elevated Membership — physician-owned wellness in Evans, GA."
        />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/services" />
      </Helmet>

      <div className="public-page-shell">
        <Navbar />

        <main className="flex-1">
          <section className={`${storefrontHeroSection} text-center`}>
            <div className={`${storefrontHeroInner} max-w-4xl mx-auto`}>
              <p className={storefrontHeroLabel}>Our services</p>
              <h1 className={storefrontHeroTitle}>
                Five ways we help you <span className="italic">feel elevated</span>
              </h1>
              <p className={`${storefrontHeroLead} max-w-2xl mx-auto`}>
                Physician-owned care in Evans. IV walk-ins, consult-gated programs for hormones, peptides, and weight
                management, plus one transparent membership.
              </p>
              <Button size="lg" className="font-jost tracking-wide" onClick={() => openBooking()}>
                Book a {PRICE_CONSULT} Wellness Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </section>

          <section className="py-16 md:py-24">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
              <div className="grid gap-6 md:grid-cols-2">
                {SERVICE_PILLARS.map((pillar) => (
                  <Card key={pillar.href} className="border-border/50 hover:border-accent/40 transition-colors">
                    <CardContent className="p-8 flex flex-col h-full">
                      <h2 className="font-playfair text-2xl text-foreground mb-3">{pillar.title}</h2>
                      <p className="font-jost text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                        {pillar.description}
                      </p>
                      {"subLinks" in pillar && pillar.subLinks && (
                        <div className="flex flex-wrap gap-3 mb-4 text-xs font-jost">
                          {pillar.subLinks.map((sub) => (
                            <Link key={sub.href} to={sub.href} className="text-accent hover:underline">
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                      <Button asChild variant="outline" className="font-jost w-fit">
                        <Link to={pillar.href}>
                          {pillar.cta} <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-16 text-center rounded-2xl border border-border/50 bg-muted/20 p-10">
                <p className="font-jost text-muted-foreground mb-6 max-w-xl mx-auto">
                  Not sure where to start? Book a wellness assessment — we will recommend the right lane after your
                  visit and labs when indicated.
                </p>
                <Button size="lg" onClick={() => openBooking()} className="font-jost tracking-wide">
                  Book a {PRICE_CONSULT} consultation
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

export default Services;
