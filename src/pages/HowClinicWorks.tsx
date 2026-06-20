import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowRight, Droplet, Stethoscope } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBooking } from "@/contexts/BookingContext";
import { CORE_SERVICES } from "@/lib/stripeConfig";
import {
  IV_LOUNGE_PATIENT_STEPS,
  WELLNESS_PROGRAM_PATIENT_STEPS,
  PATIENT_CARE_JOURNEY,
} from "@/lib/howClinicWorksContent";
import { StorefrontSectionHeader } from "@/components/marketing/StorefrontSectionHeader";

const HowClinicWorks = () => {
  const { openBooking } = useBooking();

  return (
    <div className="public-page-shell">
      <Helmet>
        <title>How the Clinic Works | Elevated Health Augusta</title>
        <meta
          name="description"
          content="Physician-owned wellness clinic in Evans, GA. IV Lounge walk-ins or $79 Wellness Assessment for hormones, GLP-1 weight loss, and peptides — transparent cash-pay pricing."
        />
      </Helmet>
      <Navbar />
      <main id="main-content" className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl space-y-12">
          <StorefrontSectionHeader
            label="Evans, Georgia"
            title={
              <>
                How our <span className="italic">clinic</span> works
              </>
            }
            lead="Physician-owned, cash-pay care with transparent pricing. Two simple paths: walk-in IV hydration, or a consult-gated program for hormones, medical weight loss, and peptides. In-office LabCorp draws when labs are needed."
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pb-12">
            <Button size="lg" onClick={openBooking} className="font-jost gap-2">
              Book {CORE_SERVICES.wellnessAssessment.displayPrice} Wellness Assessment
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button asChild size="lg" variant="outline" className="font-jost">
              <Link to="/iv-lounge">Book IV Lounge</Link>
            </Button>
          </div>

          <section className="grid md:grid-cols-2 gap-5">
            <Card className="premium-card border-accent/30">
              <CardHeader>
                <CardTitle className="font-playfair text-xl flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-accent" />
                  IV Lounge
                </CardTitle>
                <p className="font-jost text-sm text-muted-foreground">
                  Walk-in or online booking. No consult required.
                </p>
              </CardHeader>
              <CardContent>
                <ol className="font-jost text-sm space-y-3 list-decimal list-inside text-muted-foreground">
                  {IV_LOUNGE_PATIENT_STEPS.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card className="premium-card border-primary/20">
              <CardHeader>
                <CardTitle className="font-playfair text-xl flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Wellness Programs
                </CardTitle>
                <p className="font-jost text-sm text-muted-foreground">
                  Hormones, GLP-1 weight loss, peptide therapy, and ongoing optimization — all start here.
                </p>
              </CardHeader>
              <CardContent>
                <ol className="font-jost text-sm space-y-3 list-decimal list-inside text-muted-foreground">
                  {WELLNESS_PROGRAM_PATIENT_STEPS.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="font-playfair text-2xl mb-6 text-center">
              Your journey <span className="italic">with us</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {PATIENT_CARE_JOURNEY.map((step) => (
                <div
                  key={step.phase}
                  className="rounded-sm border border-border/60 p-5 bg-card/50"
                >
                  <p className="font-playfair text-2xl text-accent/80 italic mb-1">{step.phase}</p>
                  <p className="font-jost font-medium text-foreground mb-1">{step.title}</p>
                  <p className="font-jost text-sm text-muted-foreground">{step.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="text-center space-y-4 rounded-sm bg-muted/40 p-8">
            <p className="font-jost text-sm text-muted-foreground max-w-xl mx-auto">
              We do not prescribe from symptoms alone. Your provider reviews labs, confirms the right
              path, and you complete the appropriate consents before treatment begins.
            </p>
            <Button asChild variant="link" className="font-jost text-accent">
              <Link to="/pricing">See transparent pricing →</Link>
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowClinicWorks;
