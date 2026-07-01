import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/contexts/BookingContext";
import { TREATMENT_GOAL_PATHS, therapyLabelsForGoal } from "@/lib/treatmentArchitecture";
import { SERVICE_PILLARS } from "@/lib/marketingPillars";
import { CORE_SERVICES } from "@/lib/stripeConfig";
import { ArrowRight } from "lucide-react";
import {
  ClinicalNoteCard,
  GoalPathCard,
  SectionHero,
  TreatmentCard,
} from "@/components/marketing/design-system";

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
          content="IV therapy, hormone optimization, peptide therapy, medical weight loss, and ELEVATED program memberships — physician-owned wellness in Evans, GA."
        />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/services" />
      </Helmet>

      <div className="public-page-shell">
        <Navbar />

        <main className="flex-1">
          <SectionHero
            eyebrow="Our services"
            title={
              <>
                Care organized by what you want to <span className="italic">feel better in</span>
              </>
            }
            lead="Physician-owned concierge wellness in Evans. Start with your goal — we build an individualized plan after assessment and labs when indicated."
            variant="gradient"
          >
            <Button size="lg" className="font-jost tracking-wide bg-eha-navy hover:bg-eha-navy/90" onClick={() => openBooking()}>
              Book a {PRICE_CONSULT} Wellness Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </SectionHero>

          <section className="py-16 md:py-24 eha-section-ice">
            <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <p className="eha-section-label mb-3">Start with your goal</p>
                <h2 className="font-playfair text-2xl md:text-3xl text-eha-ink mb-3">Which path fits you?</h2>
                <p className="font-jost text-sm text-eha-slate">
                  Goal-first navigation — your physician builds the plan after assessment and labs when indicated.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 mb-16">
                {TREATMENT_GOAL_PATHS.map((path) => (
                  <GoalPathCard key={path.id} path={path} therapyLabels={therapyLabelsForGoal(path)} />
                ))}
              </div>

              <div className="text-center max-w-2xl mx-auto mb-10">
                <p className="eha-section-label mb-3">Service lines</p>
                <h2 className="font-playfair text-2xl md:text-3xl text-eha-ink mb-3">
                  Five ways we help you <span className="italic">feel elevated</span>
                </h2>
                <p className="font-jost text-sm text-eha-slate">
                  IV walk-ins, consult-gated programs for hormones, peptides, and weight management, plus transparent
                  ELEVATED memberships.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {SERVICE_PILLARS.map((pillar) => (
                  <TreatmentCard
                    key={pillar.href}
                    title={pillar.title}
                    description={pillar.description}
                    href={pillar.href}
                    cta={pillar.cta}
                    subLinks={"subLinks" in pillar ? pillar.subLinks : undefined}
                  />
                ))}
              </div>

              <ClinicalNoteCard className="mt-16" title="Not sure where to start?">
                <p>
                  Book a {PRICE_CONSULT} wellness assessment — we will recommend the right lane after your visit and
                  labs when indicated.
                </p>
                <Button
                  size="lg"
                  onClick={() => openBooking()}
                  className="font-jost tracking-wide mt-4 bg-eha-navy hover:bg-eha-navy/90"
                >
                  Book a {PRICE_CONSULT} consultation
                </Button>
              </ClinicalNoteCard>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Services;
