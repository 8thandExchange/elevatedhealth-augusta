import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
const KetamineTherapy = () => {
  const coreValues = [{
    title: "Safety First",
    description: "Medical supervision throughout your entire treatment"
  }, {
    title: "Personalized Care",
    description: "Tailored protocols based on your unique needs"
  }, {
    title: "Evidence-Based",
    description: "Backed by decades of research and clinical studies"
  }];
  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };
  return <section id="ketamine-therapy" className="py-24 scroll-mt-20 relative overflow-hidden">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-hope/5 -z-10" />
      
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Main Headline */}
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary">
              Ketamine Therapy
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              Evidence-based ketamine therapy delivered with compassion, precision, 
              and respect for your journey.
            </p>
            
            {/* Core Values */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {coreValues.map((value, index) => <Card key={index} className="p-6 bg-card/80 backdrop-blur border-accent/10 hover:border-accent/30 transition-colors">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>)}
            </div>
            
            
          </div>

          {/* The Science Behind Ketamine */}
          <div className="mb-20 ketamine-details">
            <Card className="p-8 md:p-12 border-accent/20 bg-card/60 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-32 translate-x-32" />
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
                  The Science Behind Ketamine Therapy
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Ketamine works differently than traditional antidepressants. Instead of altering serotonin or dopamine, 
                  it targets <strong className="text-foreground">glutamate</strong>—the brain's most abundant neurotransmitter—helping 
                  to rapidly rebuild neural connections damaged by chronic stress, trauma, or depression.
                </p>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-accent mb-2">70%</div>
                    <p className="text-sm text-muted-foreground">Response rate in treatment-resistant depression</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-accent mb-2">24hrs</div>
                    <p className="text-sm text-muted-foreground">Many patients notice improvement within 1 day</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-accent mb-2">FDA</div>
                    <p className="text-sm text-muted-foreground">SPRAVATO® nasal spray FDA-approved for depression</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* How Ketamine Works Link */}
          <div className="mb-16 text-center">
            <Link 
              to="/how-ketamine-works"
              className="inline-flex items-center gap-2 font-inter text-lg font-semibold text-hope hover:text-hope/80 transition-colors group"
            >
              <span className="border-b-2 border-hope group-hover:border-hope/80">
                Watch: How Ketamine Works
              </span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>


          {/* Final CTA */}
          <div className="text-center bg-gradient-to-r from-accent/10 via-primary/10 to-hope/10 rounded-2xl p-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Start Your Healing Journey?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Schedule a consultation to learn if ketamine therapy is right for you
            </p>
            <Button onClick={scrollToContact} size="lg" className="bg-accent hover:bg-accent-light text-white font-semibold shadow-xl">
              Book Your Free Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

        </div>
      </div>
    </section>;
};
export default KetamineTherapy;