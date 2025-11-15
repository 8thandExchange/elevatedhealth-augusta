import { Shield, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Insurance = () => {
  const scrollToContact = () => {
    if (window.location.pathname !== '/' && window.location.pathname !== '/index') {
      window.location.href = '/#contact';
    } else {
      const element = document.getElementById("contact");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <section id="insurance" className="py-24 bg-secondary/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6 text-primary">
              In-Network with Leading Plans
            </h2>
            <p className="font-inter text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              We're proud to partner with these providers for accessible ketamine therapy
            </p>
            <p className="font-inter text-lg text-hope italic">
              More insurance options coming soon – stay tuned for updates!
            </p>
          </div>

          {/* Insurance Logos - 3 Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
            <Card className="p-8 flex flex-col items-center justify-center text-center hover:shadow-xl transition-all hover:scale-105 border-2 border-accent/20 hover:border-gold">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-inter font-bold text-xl text-foreground mb-2">
                Blue Cross Blue Shield
              </h3>
              <p className="text-sm text-muted-foreground">
                Coverage for eligible plans
              </p>
            </Card>

            <Card className="p-8 flex flex-col items-center justify-center text-center hover:shadow-xl transition-all hover:scale-105 border-2 border-accent/20 hover:border-gold">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-inter font-bold text-xl text-foreground mb-2">
                TRICARE
              </h3>
              <p className="text-sm text-muted-foreground">
                Military family coverage
              </p>
            </Card>

            <Card className="p-8 flex flex-col items-center justify-center text-center hover:shadow-xl transition-all hover:scale-105 border-2 border-accent/20 hover:border-gold">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-inter font-bold text-xl text-foreground mb-2">
                VA (Veterans Affairs)
              </h3>
              <p className="text-sm text-muted-foreground">
                Veterans benefits accepted
              </p>
            </Card>
          </div>

          {/* Treatment Coverage Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
              <h4 className="text-2xl font-semibold mb-4 text-foreground">SPRAVATO® Therapy</h4>
              <p className="text-muted-foreground mb-6">
                SPRAVATO® (intranasal esketamine) is FDA-approved and covered by Blue Cross Blue Shield, 
                TRICARE, and VA for eligible patients with treatment-resistant depression.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">FDA-approved treatment</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">In-clinic administration with monitoring</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Covered by BCBS, TRICARE, VA</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-primary/5 to-gold/5 border-primary/20">
              <h4 className="text-2xl font-semibold mb-4 text-foreground">IV Ketamine Therapy</h4>
              <p className="text-muted-foreground mb-6">
                IV Ketamine therapy is not FDA-approved for depression treatment and is typically 
                offered on a self-pay basis. We provide transparent pricing and flexible payment options.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Self-pay pricing available</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Flexible payment plans offered</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">Receipt provided for HSA/FSA</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Important Note */}
          <Card className="p-8 bg-accent/5 border-accent/20 mb-16">
            <h4 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Important Coverage Information
            </h4>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Coverage varies by plan and diagnosis.</strong> We'll confirm your 
                eligibility during your free consultation – no upfront verification needed. Our team will help you understand 
                your benefits and any out-of-pocket costs before beginning treatment.
              </p>
              <p>
                <strong className="text-foreground">Prior authorization may be required</strong> for SPRAVATO® therapy. 
                We handle all insurance paperwork and communicate with your provider to streamline the approval process.
              </p>
            </div>
          </Card>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-r from-accent/10 via-primary/10 to-gold/10 rounded-2xl p-12">
            <h3 className="text-3xl font-bold mb-4 text-foreground">Ready to Get Started?</h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our team is here to help you understand your coverage and begin your healing journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={scrollToContact} className="gap-2 bg-accent hover:bg-accent-light">
                Schedule Free Consultation
              </Button>
              <a href="tel:7067603470">
                <Button variant="outline" size="lg" className="gap-2 border-2">
                  <Phone className="h-5 w-5" />
                  Call (706) 760-3470
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Insurance;
