import { CheckCircle, Shield, ArrowRight, Calendar, Heart, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ketraLogo from "@/assets/ketra-logo-transparent.png";

const KetraTherapy = () => {
  const coreValues = [
    {
      icon: Shield,
      title: "Safety First",
      description: "Medical-grade monitoring and physician oversight throughout every session"
    },
    {
      icon: Heart,
      title: "Comfort-Focused",
      description: "Private, calming treatment rooms designed for your peace of mind"
    },
    {
      icon: User,
      title: "Tailored Dosing",
      description: "Personalized protocols adjusted to your unique needs and response"
    }
  ];

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="ketra" className="py-24 scroll-mt-20 relative overflow-hidden">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-secondary/5 to-background -z-10"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Branded Hero Section with Logo */}
          <div className="text-center mb-20">
            <div className="mb-8 animate-fade-in">
              <img 
                src={ketraLogo} 
                alt="KETRA Therapy" 
                className="h-20 md:h-28 mx-auto mb-6 drop-shadow-lg"
              />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Stigma-Free Healing.<br />Science-Backed Results.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              KETRA™ represents a breakthrough in mental health treatment—ketamine therapy 
              delivered with compassion, precision, and respect for your journey.
            </p>

            {/* Core Values - Safety, Comfort, Tailored Dosing */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {coreValues.map((value, index) => (
                <Card 
                  key={index} 
                  className="p-8 text-center border-accent/20 bg-card/60 backdrop-blur hover:border-accent/40 transition-all hover:shadow-lg"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-secondary/20 mb-4">
                    <value.icon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </Card>
              ))}
            </div>

            <Button 
              variant="default" 
              size="lg" 
              className="gap-2 group bg-accent hover:bg-accent/90"
              onClick={() => {
                const element = document.querySelector('.ketra-details');
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Discover How KETRA™ Works
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* The Science Behind KETRA */}
          <div className="mb-20 ketra-details">
            <Card className="p-8 md:p-12 border-accent/20 bg-card/60 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/10 to-secondary/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
                  The Science Behind KETRA™
                </h3>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed text-center max-w-4xl mx-auto">
                  Traditional antidepressants work by slowly adjusting brain chemistry over weeks or months. 
                  Ketamine takes a different approach—it rapidly activates glutamate, a neurotransmitter that 
                  helps neurons communicate. This triggers the growth of new neural connections, essentially 
                  helping your brain "rewire" around the patterns created by depression and trauma.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-accent/10 to-secondary/10 backdrop-blur">
                    <div className="text-5xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent mb-3">70%+</div>
                    <div className="text-sm font-medium text-foreground">Response Rate in Clinical Studies</div>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-accent/10 to-secondary/10 backdrop-blur">
                    <div className="text-5xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent mb-3">24hrs</div>
                    <div className="text-sm font-medium text-foreground">Average Time to Initial Relief</div>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-accent/10 to-secondary/10 backdrop-blur">
                    <div className="text-5xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent mb-3">50yrs</div>
                    <div className="text-sm font-medium text-foreground">Of Medical Research & Use</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Patient Success Story / Testimonial */}
          <div className="mb-16">
            <Card className="p-10 md:p-16 border-accent/30 bg-gradient-to-br from-card/80 to-accent/5 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-48 h-48 bg-secondary/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl"></div>
              <div className="relative z-10 text-center max-w-4xl mx-auto">
                <div className="text-6xl text-accent/40 mb-6">"</div>
                <blockquote className="text-2xl md:text-3xl font-light text-foreground mb-8 leading-relaxed italic">
                  After years of trying different medications with little success, KETRA™ therapy gave me 
                  hope again. Within days, I felt the fog lifting. The care team made me feel safe and 
                  understood every step of the way.
                </blockquote>
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                  <div className="w-12 h-0.5 bg-accent/30"></div>
                  <span className="font-semibold">M.K., Augusta</span>
                  <div className="w-12 h-0.5 bg-accent/30"></div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 italic">Treatment-Resistant Depression Patient</p>
              </div>
            </Card>
          </div>

          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-xl mb-8 opacity-90">
              Schedule a consultation to learn if KETRA™ therapy is right for you
            </p>
            <Button variant="cta" size="xl" asChild className="gap-2">
              <a
                href="https://calendar.app.google/dmUqXpAwVspD7Nyi9"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="h-5 w-5" />
                Book Your Consultation
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KetraTherapy;
