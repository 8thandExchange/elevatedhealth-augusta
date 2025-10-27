import { CheckCircle, Zap, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ketraLogo from "@/assets/ketra-logo-v2.png";

const KetraTherapy = () => {
  const benefits = [
    "Rapid relief from depression symptoms",
    "Effective for treatment-resistant conditions",
    "Reduced anxiety and PTSD symptoms",
    "Improved mood and emotional regulation",
    "Enhanced neuroplasticity and brain health",
    "Safe, physician-supervised treatment",
  ];

  const conditions = [
    "Major Depressive Disorder",
    "Treatment-Resistant Depression",
    "Anxiety Disorders",
    "PTSD and Trauma",
    "Chronic Pain with Depression",
    "Suicidal Ideation",
  ];

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="ketra" className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex justify-center mb-8">
              <img src={ketraLogo} alt="KETRA - From Darkness, Light" className="h-32 md:h-40" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              What is KETRA™ Therapy?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our innovative ketamine-based treatment protocol designed to rapidly alleviate symptoms of depression, 
              anxiety, and PTSD with physician-led care
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <Card className="p-8 border-accent/20">
              <Zap className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-2xl font-semibold mb-4 text-foreground">How It Works</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                KETRA™ therapy utilizes carefully controlled ketamine administration to create new neural pathways 
                in the brain. Unlike traditional antidepressants that can take weeks or months to work, many patients 
                experience significant improvement within hours to days.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our physician-led approach ensures optimal dosing, safety monitoring, and integration with 
                complementary therapeutic techniques for maximum effectiveness.
              </p>
            </Card>

            <Card className="p-8 border-accent/20">
              <Target className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-2xl font-semibold mb-4 text-foreground">What to Expect</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Treatment typically involves a series of sessions in our comfortable, clinical setting. Each session 
                lasts approximately 60-90 minutes under direct physician supervision. You'll relax in a private room 
                while we monitor your vital signs and response to treatment.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Most patients complete an initial series of 6-8 sessions over 2-3 weeks, followed by maintenance 
                sessions as needed to sustain improvements.
              </p>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-foreground">Key Benefits</h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-6 text-foreground">Conditions We Treat</h3>
              <div className="space-y-4">
                {conditions.map((condition, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{condition}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-xl mb-8 opacity-90">
              Schedule a consultation to learn if KETRA™ therapy is right for you
            </p>
            <Button variant="cta" size="xl" onClick={scrollToContact} className="gap-2">
              <Calendar className="h-5 w-5" />
              Book Your Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KetraTherapy;
