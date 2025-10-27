import { Medal, Flag, HeartHandshake, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import veteransImage from "@/assets/veterans-heroes.jpg";

const Veterans = () => {
  const veteranBenefits = [
    {
      icon: Medal,
      title: "Specialized PTSD Treatment",
      description: "Combat-related trauma and PTSD are our areas of expertise",
    },
    {
      icon: Flag,
      title: "Military-Friendly Environment",
      description: "Staff trained in military culture and veteran-specific needs",
    },
    {
      icon: HeartHandshake,
      title: "Flexible Scheduling",
      description: "Accommodating appointment times for active duty and veterans",
    },
  ];

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="veterans" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Honoring Our Heroes
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              <span className="text-secondary">Veterans</span> & Heroes Program
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Dedicated mental health care for those who have served our nation with honor and courage
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative">
              <img
                src={veteransImage}
                alt="Military veterans receiving dedicated mental health care"
                className="rounded-2xl shadow-lg w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-secondary text-secondary-foreground p-6 rounded-xl shadow-xl">
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm">Veteran Satisfaction</div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-semibold text-foreground">Supporting Those Who Served</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We understand the unique mental health challenges faced by military service members and veterans. 
                Combat exposure, deployment stress, and the transition to civilian life can contribute to depression, 
                anxiety, and PTSD.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our KETRA™ therapy has shown remarkable results in treating combat-related trauma and service-connected 
                mental health conditions. We're proud to provide specialized care that honors your service while 
                addressing your specific needs.
              </p>

              <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-lg">
                <p className="text-foreground font-semibold mb-2">
                  "The KETRA™ treatment helped me reclaim my life after years of struggling with PTSD. 
                  The team truly understands what veterans go through."
                </p>
                <p className="text-sm text-muted-foreground">- John M., U.S. Army Veteran</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {veteranBenefits.map((benefit, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <benefit.icon className="h-12 w-12 text-secondary mb-4" />
                <h4 className="text-xl font-semibold mb-2 text-foreground">{benefit.title}</h4>
                <p className="text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>

          <div className="bg-secondary text-secondary-foreground rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Thank You For Your Service</h3>
            <p className="text-xl mb-8 opacity-90">
              Connect with us to learn about specialized veteran mental health programs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" onClick={scrollToContact} className="gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Consultation
              </Button>
              <a href="tel:7065509202">
                <Button variant="outline" size="xl" className="gap-2 border-2 border-current">
                  Call (706) 550-9202
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Veterans;
