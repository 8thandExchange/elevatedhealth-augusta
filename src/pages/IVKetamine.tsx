import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const IVKetamine = () => {
  const scrollToContact = () => {
    window.location.href = "/#contact";
  };

  const safetyItems = [
    "Comprehensive screening including cardiovascular history, current medications, and substance-use assessment",
    "Continuous vitals monitoring throughout your infusion session",
    "Integration visits to support your treatment journey and discuss progress",
    "Coordination with your primary care provider and mental health professionals"
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        {/* Intro Section */}
        <section id="iv-intro" className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                IV Ketamine Therapy (Infusion)
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                For adults who haven't found relief with standard treatments, IV ketamine—delivered 
                in a monitored clinic—may help reset stuck mood pathways.
              </p>
            </div>
          </div>
        </section>

        {/* Safety Section */}
        <section id="iv-safety" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                Safety & Monitoring
              </h2>
              <Card>
                <CardContent className="p-6 md:p-8">
                  <p className="text-muted-foreground mb-6">
                    Your safety is our top priority. Every IV ketamine session includes:
                  </p>
                  <ul className="space-y-4">
                    {safetyItems.map((item, index) => (
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
        <section id="iv-cta" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Ready to Explore IV Ketamine?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Schedule a consultation to discuss your treatment options and determine if 
                IV ketamine therapy is right for you.
              </p>
              <Button
                onClick={scrollToContact}
                size="lg"
                className="text-base md:text-lg px-8 py-6"
              >
                Request an IV Ketamine Consultation
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default IVKetamine;
