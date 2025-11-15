import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import providerImage from "@/assets/provider-portrait.jpg";
import quoteImage from "@/assets/provider-testimonial.jpg";

const About = () => {
  const scrollToTeam = () => {
    const element = document.getElementById("team");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="about" className="py-24 bg-background scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Provider Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src={providerImage} 
                  alt="Lauren Bursey, NP-C - Board-Certified Nurse Practitioner at Elevated Health Augusta" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Right: Content */}
            <div className="space-y-6">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-primary leading-tight">
                Healing Starts with Trust
              </h2>
              
              <div className="space-y-4 font-inter text-lg text-muted-foreground leading-relaxed">
                <p>
                  Elevated Health was created as a space for patients to start healing. Our services help with anxiety, depression, PTSD, and OCD.
                </p>
                
                <p>
                  Patients feel safe here, and that's our goal.
                </p>
                
                <p className="font-semibold text-foreground">
                  While the journey to healing is hard, it's worth the effort.
                </p>
              </div>

              {/* Pull Quote Graphic */}
              <Card className="p-0 overflow-hidden border-0 shadow-lg mt-8">
                <img 
                  src={quoteImage} 
                  alt="Lauren's story about creating Elevated Health" 
                  className="w-full h-auto"
                />
              </Card>

              <div className="pt-6">
                <Button 
                  onClick={scrollToTeam}
                  size="lg"
                  className="font-inter font-semibold uppercase bg-primary hover:bg-primary-dark text-white"
                >
                  Meet Our Full Team
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
