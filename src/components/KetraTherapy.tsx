import { CheckCircle, Brain, Activity, Beaker, TrendingUp, Shield, ArrowRight, Zap, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const KetraTherapy = () => {
  const scienceFeatures = [
    {
      icon: Brain,
      title: "Neuroplasticity",
      description: "Creates new neural pathways to restore healthy brain function"
    },
    {
      icon: Activity,
      title: "Rapid Relief",
      description: "Most patients see improvement within hours, not weeks"
    },
    {
      icon: Beaker,
      title: "Research-Backed",
      description: "Decades of clinical studies support ketamine's effectiveness"
    },
    {
      icon: Shield,
      title: "Expert-Led",
      description: "Safe, monitored treatment in a clinical setting"
    }
  ];

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
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className="inline-block bg-accent/10 text-accent px-6 py-3 rounded-full text-sm font-semibold mb-6">
              KETRA™ Therapy
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Breakthrough Therapy,<br />Rooted in Research.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Ketamine therapy works by helping your brain form new connections that depression has damaged. 
              Unlike traditional medications that take weeks to work, many patients feel relief within hours.
            </p>
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-2 group"
              onClick={() => {
                const element = document.querySelector('.ketra-details');
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Learn More
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Science Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {scienceFeatures.map((feature, index) => (
              <Card key={index} className="p-6 text-center border-accent/20 hover:border-accent/40 transition-colors">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                  <feature.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>

          {/* Data Visualization */}
          <div className="mb-20 ketra-details">
            <Card className="p-8 md:p-12 border-accent/20 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="h-8 w-8 text-accent" />
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">The Science Behind KETRA™</h3>
              </div>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Traditional antidepressants work by slowly adjusting brain chemistry over weeks or months. 
                Ketamine takes a different approach—it rapidly activates glutamate, a neurotransmitter that 
                helps neurons communicate. This triggers the growth of new neural connections, essentially 
                helping your brain "rewire" around the patterns created by depression and trauma.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center p-4 rounded-lg bg-accent/5">
                  <div className="text-4xl font-bold text-accent mb-2">70%+</div>
                  <div className="text-sm text-muted-foreground">Response Rate in Clinical Studies</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/5">
                  <div className="text-4xl font-bold text-accent mb-2">24hrs</div>
                  <div className="text-sm text-muted-foreground">Average Time to Initial Relief</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/5">
                  <div className="text-4xl font-bold text-accent mb-2">50yrs</div>
                  <div className="text-sm text-muted-foreground">Of Medical Research & Use</div>
                </div>
              </div>
            </Card>
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
                Our expert-led approach ensures optimal dosing, safety monitoring, and integration with 
                complementary therapeutic techniques for maximum effectiveness.
              </p>
            </Card>

            <Card className="p-8 border-accent/20">
              <Target className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-2xl font-semibold mb-4 text-foreground">What to Expect</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Treatment typically involves a series of sessions in our comfortable, clinical setting. Each session 
                lasts approximately 60-90 minutes. You'll relax in a private room 
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
