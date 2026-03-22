import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Heart, GraduationCap, Phone, Calendar, ShieldCheck, Brain, Activity } from "lucide-react";
import { trackCTAClick } from "@/lib/analytics";
import { useBooking } from "@/contexts/BookingContext";

const Team = () => {
  const { openBooking } = useBooking();

  return (
    <section id="team" className="py-24 bg-muted/30 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
              Our Team
            </p>
            <h2 className="font-cormorant text-4xl md:text-5xl text-primary mb-6">
              A Team Built for Results
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-lato font-light">
              Our board-certified providers combine clinical expertise with a concierge approach —
              because your health deserves more than a 15-minute visit.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="p-8 bg-card shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                <Brain className="h-7 w-7 text-gold" />
              </div>
              <h3 className="font-cormorant text-xl text-primary mb-3">Mental Wellness</h3>
              <p className="text-muted-foreground font-light text-sm leading-relaxed">
                Peptide protocols and IV therapy for cellular restoration, cognitive clarity, and resilience.
              </p>
            </Card>

            <Card className="p-8 bg-card shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                <Activity className="h-7 w-7 text-gold" />
              </div>
              <h3 className="font-cormorant text-xl text-primary mb-3">Hormone Optimization</h3>
              <p className="text-muted-foreground font-light text-sm leading-relaxed">
                Data-driven hormone protocols using ZRT diagnostics and bioidentical therapies for men and women.
              </p>
            </Card>

            <Card className="p-8 bg-card shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="h-7 w-7 text-gold" />
              </div>
              <h3 className="font-cormorant text-xl text-primary mb-3">Medical Weight Loss</h3>
              <p className="text-muted-foreground font-light text-sm leading-relaxed">
                In-person GLP-1 programs with real medical oversight — not a telehealth prescription mill.
              </p>
            </Card>
          </div>

          {/* Credentials Bar */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="p-8 bg-gradient-subtle shadow-xl">
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="flex items-start gap-4">
                  <GraduationCap className="h-5 w-5 text-gold flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-medium text-foreground mb-1">Board-Certified Providers</div>
                    <div className="text-sm text-muted-foreground font-light">
                      Advanced training in ketamine therapy, hormone optimization, and metabolic medicine
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
              className="font-lato text-base px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-xl hover:translate-y-[-2px] transition-all w-full sm:w-auto"
              onClick={openBooking}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Request Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
