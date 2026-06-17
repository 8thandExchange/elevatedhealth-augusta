import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBooking } from "@/contexts/BookingContext";
import {
  LANE_A_IV_STEPS,
  LANE_B_CONSULT_STEPS,
  PATIENT_JOURNEY_STEPS,
} from "@/lib/staffSystemGuideContent";
import { CORE_SERVICES } from "@/lib/stripeConfig";
import { ArrowRight, Droplet, Stethoscope } from "lucide-react";

const HowClinicWorks = () => {
  const { openBooking } = useBooking();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>How the Clinic Works | Elevated Health Augusta</title>
        <meta
          name="description"
          content="Physician-owned wellness clinic in Evans, GA. IV Lounge walk-ins or $79 Wellness Assessment for hormones, GLP-1 weight loss, and peptides — transparent cash-pay pricing."
        />
      </Helmet>
      <Navbar />
      <main id="main-content" className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl space-y-12">
          <header className="text-center space-y-4">
            <p className="section-label">Evans, Georgia</p>
            <h1 className="font-playfair text-4xl md:text-5xl text-foreground">
              How our <span className="italic">clinic</span> works
            </h1>
            <p className="font-jost text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Physician-owned, cash-pay care with transparent pricing. Two simple paths: walk-in IV
              hydration, or a consult-gated program for hormones, medical weight loss, and peptides.
              In-office LabCorp draws when labs are needed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" onClick={openBooking} className="font-jost gap-2">
                Book {CORE_SERVICES.wellnessAssessment.displayPrice} Wellness Assessment
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button asChild size="lg" variant="outline" className="font-jost">
                <Link to="/iv-lounge">Book IV Lounge</Link>
              </Button>
            </div>
          </header>

          <section className="grid md:grid-cols-2 gap-6">
            <Card className="border-accent/30">
              <CardHeader>
                <CardTitle className="font-playfair text-xl flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-accent" />
                  Lane A — IV Lounge
                </CardTitle>
                <p className="font-jost text-sm text-muted-foreground">
                  Walk-in or online booking. No consult required.
                </p>
              </CardHeader>
              <CardContent>
                <ol className="font-jost text-sm space-y-3 list-decimal list-inside text-muted-foreground">
                  {LANE_A_IV_STEPS.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="font-playfair text-xl flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Lane B — Programs
                </CardTitle>
                <p className="font-jost text-sm text-muted-foreground">
                  Hormones, GLP-1 weight loss, Recovery Peptide Review, and peptide optimization.
                </p>
              </CardHeader>
              <CardContent>
                <ol className="font-jost text-sm space-y-3 list-decimal list-inside text-muted-foreground">
                  {LANE_B_CONSULT_STEPS.map((step) => (
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
              {PATIENT_JOURNEY_STEPS.map((step) => (
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
