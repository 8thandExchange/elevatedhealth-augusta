import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import providerImage from "@/assets/provider-portrait.jpg";
import quoteImage from "@/assets/provider-testimonial.jpg";
import { Award, Heart, GraduationCap, Phone, Calendar, ArrowRight } from "lucide-react";
import { trackCTAClick } from "@/lib/analytics";

const Team = () => {
  return (
    <section id="team" className="py-24 bg-muted/30 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
              Your Provider
            </p>
            <h2 className="font-cormorant text-4xl md:text-5xl text-primary mb-6">
              Meet Your Metabolic Architect
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-lato font-light">
              In a healthcare system designed for 15-minute visits and band-aid prescriptions, 
              Lauren built Elevated Health to do the opposite.
            </p>
          </div>

          {/* Lauren Bursey Card - Centered */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="overflow-hidden bg-card shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-[500px] md:h-auto">
                  <img 
                    src={providerImage} 
                    alt="Lauren Bursey, NP-C - Board-Certified Nurse Practitioner at Elevated Health Augusta" 
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width="800"
                    height="1000"
                  />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center bg-gradient-subtle">
                  <div className="mb-6">
                    <p className="text-sm tracking-[0.2em] uppercase text-gold mb-2 font-lato font-light">
                      Your Metabolic Architect
                    </p>
                    <h3 className="font-cormorant text-3xl text-primary mb-2">Lauren Bursey, NP-C</h3>
                    <p className="text-muted-foreground font-light">Board-Certified Nurse Practitioner</p>
                  </div>
                  
                  <p className="text-muted-foreground font-light leading-relaxed mb-6">
                    Specializing in the intersection of hormonal health and mental wellness, 
                    Lauren uses clinical data to design personalized roadmaps for longevity. 
                    She does not just treat patients—she partners with them.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <GraduationCap className="h-5 w-5 text-gold flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-medium text-foreground mb-1">Advanced Certification</div>
                        <div className="text-sm text-muted-foreground font-light">
                          Ketamine therapy, hormone optimization, and metabolic medicine
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Heart className="h-5 w-5 text-gold flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-medium text-foreground mb-1">Concierge Approach</div>
                        <div className="text-sm text-muted-foreground font-light">
                          Extended consultations, direct access, and personalized protocols
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Award className="h-5 w-5 text-gold flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-medium text-foreground mb-1">Data-Driven Care</div>
                        <div className="text-sm text-muted-foreground font-light">
                          ZRT diagnostics and evidence-based treatment protocols
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quote Graphic */}
          <div className="max-w-3xl mx-auto mb-12">
            <Card className="p-0 overflow-hidden border-0 shadow-lg">
              <img 
                src={quoteImage} 
                alt="Lauren's story about creating Elevated Health - A space for patients to start healing" 
                className="w-full h-auto"
                loading="lazy"
                width="800"
                height="400"
              />
            </Card>
          </div>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-2xl mx-auto">
            <Button
              size="lg"
              asChild
              className="font-lato text-base px-8 py-6 bg-gold hover:bg-gold/90 text-white shadow-xl hover:translate-y-[-2px] transition-all w-full sm:w-auto"
              onClick={() => trackCTAClick('ai_voice_call_team', 'tel:+17067603470')}
            >
              <a href="tel:+17067603470">
                <Phone className="mr-2 h-5 w-5" />
                Call (706) 760-3470
              </a>
            </Button>

            <Button 
              size="lg" 
              asChild
              className="font-lato text-base px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-xl hover:translate-y-[-2px] transition-all w-full sm:w-auto"
            >
              <a
                href="https://calendar.app.google/hf3NNdiqJDueUuSN9"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Request Consultation
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;