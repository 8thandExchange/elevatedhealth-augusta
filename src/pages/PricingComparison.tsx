import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConsultationModal from "@/components/ConsultationModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EverythingIncludedPillars } from "@/components/marketing/EverythingIncludedPillars";
import { MembershipComparison, type Program } from "@/components/marketing/MembershipComparison";
import { CORE_SERVICES } from "@/lib/stripeConfig";
import { ArrowRight, Calculator } from "lucide-react";

const PROGRAM_TABS: { value: Program; label: string }[] = [
  { value: "trt", label: "TRT" },
  { value: "hrt", label: "HRT" },
  { value: "glp1", label: "GLP-1" },
  { value: "wellness", label: "Wellness" },
];

const PricingComparison = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [glpDrug, setGlpDrug] = useState<"semaglutide" | "tirzepatide">("semaglutide");

  return (
    <>
      <Helmet>
        <title>Membership vs À La Carte Pricing | Elevated Health Augusta</title>
        <meta
          name="description"
          content={`Compare ELEVATED program memberships to à la carte pricing. Start with a ${CORE_SERVICES.wellnessAssessment.displayPrice} Wellness Assessment and transparent monthly programs.`}
        />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/pricing-comparison" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-background">
        <section className="py-16 lg:py-20 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 border-gold/30 text-gold">
              <Calculator className="w-4 h-4 mr-2" />
              Pricing comparison
            </Badge>
            <h1 className="text-4xl md:text-5xl font-cormorant text-foreground mb-6">
              ELEVATED programs vs. <span className="text-gold">à la carte</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-lato">
              Every path starts with a {CORE_SERVICES.wellnessAssessment.displayPrice}{" "}
              {CORE_SERVICES.wellnessAssessment.name} and baseline labs. Choose a tab to see how
              bundled ELEVATED care compares to paying for each service individually.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <EverythingIncludedPillars className="mb-12" />
            <Tabs defaultValue="trt" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
                {PROGRAM_TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value} className="font-lato text-xs md:text-sm">
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {PROGRAM_TABS.filter((t) => t.value !== "glp1").map((t) => (
                <TabsContent key={t.value} value={t.value} className="mt-0">
                  <MembershipComparison program={t.value} />
                </TabsContent>
              ))}
              <TabsContent value="glp1" className="mt-0 space-y-6">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    type="button"
                    size="sm"
                    variant={glpDrug === "semaglutide" ? "default" : "outline"}
                    onClick={() => setGlpDrug("semaglutide")}
                  >
                    Semaglutide context
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={glpDrug === "tirzepatide" ? "default" : "outline"}
                    onClick={() => setGlpDrug("tirzepatide")}
                  >
                    Tirzepatide context
                  </Button>
                </div>
                <MembershipComparison program="glp1" drug={glpDrug} />
              </TabsContent>
            </Tabs>

            <div className="mt-12 text-center space-y-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => setIsBookingOpen(true)}>
                Book {CORE_SERVICES.wellnessAssessment.displayPrice} Wellness Assessment
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <div>
                <Button variant="outline" asChild>
                  <Link to="/pricing">View full pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-cormorant text-center mb-8">Common questions</h2>
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-background p-6">
                  <h3 className="font-medium mb-2">Can I switch from à la carte to an ELEVATED program?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes. Many patients begin with individual visits or fills, then enroll in ELEVATED TRT,
                    HRT, GLP-1, or Wellness when they want predictable monthly pricing. Your care team will
                    outline onboarding labs and program pricing before you enroll.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-6">
                  <h3 className="font-medium mb-2">What is included in ELEVATED memberships?</h3>
                  <p className="text-sm text-muted-foreground">
                    Program memberships include monthly medication where applicable, monthly check-ins with our clinical team,
                    quarterly in-office labs, clinically appropriate physician review, and unlimited
                    messaging. Initial {CORE_SERVICES.wellnessAssessment.displayPrice} assessment and baseline
                    labs ({CORE_SERVICES.comprehensivePanel.displayPrice} or {CORE_SERVICES.expandedPanel.displayPrice}{" "}
                    when indicated) are separate one-time fees.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-6">
                  <h3 className="font-medium mb-2">Do I still pay for visits if I am not a member?</h3>
                  <p className="text-sm text-muted-foreground">
                    Non-members book services individually at published à la carte rates. Compare the tables
                    above to see typical steady-state costs versus bundled ELEVATED pricing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ConsultationModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </>
  );
};

export default PricingComparison;
