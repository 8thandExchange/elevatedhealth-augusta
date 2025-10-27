import { Shield, Heart, Brain, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import clinicImage from "@/assets/clinic-interior.jpg";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Medical Excellence",
      description: "Board-certified physicians with specialized training in ketamine therapy",
    },
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "Personalized treatment plans tailored to your unique needs",
    },
    {
      icon: Brain,
      title: "Science-Driven",
      description: "Evidence-based protocols using the latest research in mental health",
    },
    {
      icon: Users,
      title: "Community Focus",
      description: "Serving Augusta, GA and surrounding communities with dedication",
    },
  ];

  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              A Clinic Built on Compassion & Clinical Excellence
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Physician-led mental health care combining medical expertise with genuine human connection
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h3 className="text-3xl font-semibold text-foreground">Led by Medical Experts Who Care</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every treatment at Elevated Health Augusta is overseen by board-certified physicians with specialized 
                training in ketamine therapy. We believe that exceptional mental health care requires both clinical 
                precision and compassionate understanding of each patient's unique journey.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our proprietary KETRA™ protocol represents the gold standard in ketamine-assisted therapy, combining 
                evidence-based medicine with personalized care plans designed to address depression, anxiety, PTSD, 
                and treatment-resistant conditions.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We are proud to serve both the Augusta community and our nation's veterans, offering specialized 
                programs for those who have served. At our Evans, GA facility, you'll find a welcoming environment 
                where medical excellence meets heartfelt compassion.
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
                src={clinicImage}
                alt="Warm, professional healthcare environment at Elevated Health Augusta"
                className="rounded-2xl shadow-lg w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-xl">
                <div className="text-3xl font-bold">Physician-Led</div>
                <div className="text-sm opacity-90">Every Session, Every Time</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-6 bg-muted/30 hover:bg-muted/50 transition-all duration-300 hover:-translate-y-1 border-border/50">
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
