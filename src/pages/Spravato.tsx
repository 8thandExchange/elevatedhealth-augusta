import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Spravato = () => {
  const scrollToBooking = () => {
    window.location.href = "/#booking";
  };

  const benefits = [
    "FDA-approved for treatment-resistant depression (TRD)",
    "Used with an oral antidepressant for comprehensive treatment",
    "Self-administered nasal spray under medical supervision",
    "Minimum 2-hour observation period following each dose",
    "REMS-certified clinic ensuring highest safety standards"
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                SPRAVATO® Nasal Spray
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                An FDA-approved esketamine nasal spray for adults with treatment-resistant depression, 
                administered safely in our certified clinic with comprehensive monitoring.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                What to Expect
              </h2>
              <Card>
                <CardContent className="p-6 md:p-8">
                  <p className="text-muted-foreground mb-6">
                    SPRAVATO® is designed for patients who have tried other antidepressants without success:
                  </p>
                  <ul className="space-y-4">
                    {benefits.map((item, index) => (
                      <li key={index} className="flex gap-3 items-start">
                        <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Is SPRAVATO® Right for You?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Schedule a consultation to learn if SPRAVATO® could be part of your treatment plan.
              </p>
              <Button
                variant="hero"
                size="lg"
                asChild
                className="text-base md:text-lg px-8 py-6"
              >
                <a
                  href="https://calendar.app.google/dmUqXpAwVspD7Nyi9"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book Your Free Consultation
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Spravato;
