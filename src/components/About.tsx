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
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              About <span className="text-primary">Elevated Health Augusta</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Leading the way in innovative mental health treatment with physician-led KETRA™ therapy
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h3 className="text-3xl font-semibold text-foreground">Our Mission</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At Elevated Health Augusta, we're committed to transforming mental health care through our proprietary 
                KETRA™ therapy. Our physician-led team combines cutting-edge ketamine treatment with compassionate, 
                personalized care to help you achieve lasting mental wellness.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We proudly serve both the general public and military veterans, recognizing the unique challenges 
                faced by those who have served our country. Our state-of-the-art facility in Evans, GA provides 
                a comfortable, professional environment for your healing journey.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div>
                  <div className="text-2xl font-bold text-primary">7013 Evans Town Center Blvd</div>
                  <div className="text-muted-foreground">Suite 203, Evans, GA 30809</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src={clinicImage}
                alt="Modern clinic interior at Elevated Health Augusta"
                className="rounded-2xl shadow-lg w-full h-[400px] object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-secondary text-secondary-foreground p-6 rounded-xl shadow-xl">
                <div className="text-3xl font-bold">5+</div>
                <div className="text-sm">Years of Excellence</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
