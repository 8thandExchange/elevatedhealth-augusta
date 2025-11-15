import { Shield, Heart, Brain, Users, Award, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import clinicImage from "@/assets/clinic-interior.jpg";
import providerImage from "@/assets/provider-portrait.jpg";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Medical Excellence",
      description: "Board-certified nurse practitioner with specialized training in ketamine therapy"
    },
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "Personalized treatment plans tailored to your unique needs"
    },
    {
      icon: Brain,
      title: "Science-Driven",
      description: "Evidence-based protocols using the latest research in mental health"
    },
    {
      icon: Users,
      title: "Community Focus",
      description: "Serving Augusta, GA and surrounding communities with dedication"
    }
  ];

  return (
    <section id="about" className="py-24 bg-gradient-subtle scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-6 py-2 rounded-full mb-6">
              <Award className="h-5 w-5" />
              <span className="font-semibold">A Clinic Built for Healing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Compassion Meets Clinical Excellence
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Expert-led mental health care combining medical expertise with genuine human connection
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h3 className="text-3xl font-semibold text-foreground flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-gold" />
                Led by Medical Experts Who Care
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every treatment at Elevated Health Augusta is overseen by Lauren Bursey, NP-C, our board-certified nurse practitioner with specialized training in ketamine therapy. We believe that exceptional mental health care requires both clinical precision and compassionate understanding of each patient's unique journey.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our proprietary <span className="font-bold text-primary">KETRA™ protocol</span> represents the gold standard in ketamine-assisted therapy, combining evidence-based medicine with personalized care plans designed to address depression, anxiety, PTSD, and treatment-resistant conditions.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe in collaborative care. Our team works closely with your existing healthcare providers—including your primary care physician, psychiatrist, and therapists—to ensure comprehensive, coordinated treatment. We strongly encourage our patients to maintain a relationship with a primary care physician, as this partnership allows us to provide the most effective and holistic care possible.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We are proud to serve both the Augusta community and our nation's Veterans, offering specialized programs for those who have served. At our Evans, GA facility, you'll find a welcoming environment where medical excellence meets heartfelt compassion.
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-border mt-6">
                <div>
                  <div className="text-xl font-semibold text-foreground">7013 Evans Town Center Blvd</div>
                  <div className="text-muted-foreground">Suite 203, Evans, GA 30809</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={providerImage} 
                alt="Compassionate healthcare provider at Elevated Health Augusta" 
                className="rounded-2xl shadow-2xl w-full h-[600px] object-cover" 
              />
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-2xl border-4 border-background">
                <div className="text-3xl font-bold">Expert-Led</div>
                <div className="text-sm opacity-90">Every Session, Every Time</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className="p-6 bg-card hover:bg-muted/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg border-border/50"
              >
                <value.icon className="h-12 w-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold mb-2 text-foreground">{value.title}</h4>
                <p className="text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
