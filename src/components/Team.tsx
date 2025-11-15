import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import providerImage from "@/assets/provider-portrait.jpg";
import quoteImage from "@/assets/provider-testimonial.jpg";
import { Award, Heart, GraduationCap, Phone, Calendar } from "lucide-react";
import { trackCTAClick } from "@/lib/analytics";

const Team = () => {
  return (
    <section id="team" className="py-24 bg-muted/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-primary mb-6">
              Healing Starts with Trust
            </h2>
            <p className="font-inter text-xl text-muted-foreground max-w-3xl mx-auto">
              Our board-certified team brings years of specialized training in ketamine therapy and mental health treatment
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
                    <h3 className="font-playfair text-3xl font-bold text-primary mb-2">Lauren Bursey, NP-C</h3>
                    <p className="text-lg text-muted-foreground">Board-Certified Nurse Practitioner</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <GraduationCap className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-foreground mb-1">Specialized Training</div>
                        <div className="text-muted-foreground">
                          Advanced certification in ketamine therapy and mental health treatment protocols
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Heart className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-foreground mb-1">Patient-Centered Approach</div>
                        <div className="text-muted-foreground">
                          Committed to creating a safe, welcoming environment where patients feel heard and supported
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Award className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-foreground mb-1">Evidence-Based Care</div>
                        <div className="text-muted-foreground">
                          Utilizes the latest research and proven protocols to deliver optimal outcomes
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="text-foreground italic">
                      "Elevated Health was created as a space for patients to start healing. Our services help with anxiety, depression, PTSD, and OCD. Patients feel safe here, and that's our goal. While the journey to healing is hard, it's worth the effort."
                    </p>
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
              className="font-inter font-semibold text-base px-8 py-6 bg-gold hover:bg-gold/90 text-white shadow-xl hover:translate-y-[-2px] transition-all w-full sm:w-auto"
              onClick={() => trackCTAClick('ai_voice_call_team', 'tel:+17067603470')}
            >
              <a href="tel:+17067603470">
                <Phone className="mr-2 h-5 w-5" />
                Call Us (706) 760-3470
              </a>
            </Button>

            <Button 
              size="lg" 
              asChild
              className="font-inter font-semibold text-base px-8 py-6 bg-accent hover:bg-accent-light text-white shadow-xl hover:translate-y-[-2px] transition-all w-full sm:w-auto"
            >
              <a
                href="https://calendar.app.google/SgGgATWunSGzz34s6"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Free Consultation
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
