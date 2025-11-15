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

          {/* Team Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Lauren Bursey Card */}
            <Card className="overflow-hidden bg-card shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="relative h-[400px]">
                <img 
                  src={providerImage} 
                  alt="Lauren Bursey, NP-C - Board-Certified Nurse Practitioner at Elevated Health Augusta" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width="800"
                  height="1000"
                />
              </div>
              <div className="p-8 bg-gradient-subtle">
                <h3 className="font-playfair text-3xl font-bold text-primary mb-2">Lauren Bursey, NP-C</h3>
                <p className="text-lg text-muted-foreground mb-6">Board-Certified Nurse Practitioner</p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-foreground mb-1">Specialized Training</div>
                      <div className="text-muted-foreground text-sm">
                        Advanced certification in ketamine therapy and mental health treatment protocols
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Heart className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-foreground mb-1">Patient-Centered Approach</div>
                      <div className="text-muted-foreground text-sm">
                        Committed to creating a safe, welcoming environment where patients feel heard and supported
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-foreground mb-1">Evidence-Based Care</div>
                      <div className="text-muted-foreground text-sm">
                        Utilizes the latest research and proven protocols to deliver optimal outcomes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Dr. Troy Akers Card */}
            <Card className="overflow-hidden bg-card shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="relative h-[400px] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <Award className="h-16 w-16 text-primary" />
                  </div>
                  <h3 className="font-playfair text-3xl font-bold text-primary mb-2">Dr. Troy Akers</h3>
                  <p className="text-lg text-muted-foreground mb-4">Founder & Medical Director</p>
                  <a 
                    href="https://x.com/Dr_Troy_Akers" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors font-semibold"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    @Dr_Troy_Akers
                  </a>
                </div>
              </div>
              <div className="p-8 bg-gradient-subtle">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Award className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-foreground mb-1">Visionary Leadership</div>
                      <div className="text-muted-foreground text-sm">
                        Founded Elevated Health Augusta to provide innovative mental health treatments
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-foreground mb-1">Clinical Expertise</div>
                      <div className="text-muted-foreground text-sm">
                        Board-certified with extensive experience in ketamine therapy protocols
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Heart className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-foreground mb-1">Veteran Advocacy</div>
                      <div className="text-muted-foreground text-sm">
                        Dedicated to serving military veterans and first responders with specialized care
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
              className="font-inter font-semibold text-base px-8 py-6 bg-gold hover:bg-gold/90 text-white shadow-xl hover:translate-y-[-2px] transition-all w-full sm:w-auto"
              onClick={() => trackCTAClick('ai_voice_call_team', 'tel:+17067603470')}
            >
              <a href="tel:+17067603470">
                <Phone className="mr-2 h-5 w-5" />
                Call AI Assistant (706) 760-3470
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
