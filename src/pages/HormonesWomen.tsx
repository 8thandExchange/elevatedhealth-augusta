import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { useEffect } from "react";

const HormonesWomen = () => {
  const { openBooking } = useBooking();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const services = [
    "Bioidentical hormone replacement therapy (BHRT)",
    "Estrogen and progesterone optimization",
    "Testosterone therapy for women",
    "Pellet therapy (coming soon)",
    "Thyroid optimization",
    "Comprehensive hormone labs",
    "DUTCH testing for complex cases",
    "Quarterly monitoring and dose adjustment",
  ];

  const steps = [
    "Initial Wellness Assessment ($79, credited toward treatment)",
    "Comprehensive hormone panel ordered",
    "Physician reviews labs and creates your protocol",
    "Treatment begins — in-clinic or compounded pharmacy",
    "Quarterly monitoring under physician supervision",
  ];

  return (
    <>
      <Helmet>
        <title>Women's Hormone Therapy | Elevated Health Augusta</title>
        <meta name="description" content="BHRT, estrogen, progesterone & testosterone optimization for women. Physician-supervised hormone therapy in Evans, GA." />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/hormones-women" />
      </Helmet>
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <p className="section-label mb-6">Women's Hormones</p>
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-tight">
              The fog isn't permanent.<br /><span className="italic">Neither is the fatigue.</span>
            </h1>
            <p className="font-jost font-light text-lg text-muted-foreground leading-relaxed mb-8">
              Hot flashes. Night sweats. The weight that won't move. The mood that isn't yours. You've been told this is just aging. It isn't. It's hormones — and they're fixable.
            </p>
            <p className="font-jost font-light text-lg text-muted-foreground leading-relaxed">
              At Elevated Health Augusta, our physician evaluates your labs, your symptoms, and your goals. Then we build a protocol designed specifically for you. Not a template. Not a starter pack. Yours.
            </p>
          </div>
        </section>
        <div className="section-divider max-w-3xl mx-auto" />
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <p className="section-label mb-6">What We Offer</p>
            <ul className="space-y-4">
              {services.map((s) => (
                <li key={s} className="font-jost font-light text-foreground text-lg flex items-start gap-3">
                  <span className="text-accent mt-1.5 text-sm">—</span>{s}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <div className="section-divider max-w-3xl mx-auto" />
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <p className="section-label mb-6">What to Expect</p>
            <ol className="space-y-6">
              {steps.map((step, i) => (
                <li key={i} className="font-jost font-light text-foreground text-lg flex items-start gap-4">
                  <span className="font-jost font-medium text-accent text-sm mt-1 shrink-0">{String(i + 1).padStart(2, '0')}</span>{step}
                </li>
              ))}
            </ol>
          </div>
        </section>
        <div className="section-divider max-w-3xl mx-auto" />
        <section className="py-16 md:py-24 bg-background text-center">
          <div className="container mx-auto px-6">
            <Button onClick={openBooking} size="lg" className="bg-primary text-accent font-jost font-medium tracking-wide text-sm px-10 py-6 rounded-sm hover:bg-primary-light">
              Book your Wellness Assessment — $79<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default HormonesWomen;