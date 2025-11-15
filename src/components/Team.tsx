import { Card } from "@/components/ui/card";
import providerImage from "@/assets/provider-portrait.jpg";
import { Award, Heart, GraduationCap } from "lucide-react";

const Team = () => {
  return (
    <section id="team" className="py-24 bg-muted/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-2 rounded-full mb-6">
              <Award className="h-5 w-5" />
              <span className="font-semibold">Meet Our Team</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Experienced Providers Dedicated to Your Healing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our board-certified team brings years of specialized training in ketamine therapy and mental health treatment
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-12 max-w-4xl mx-auto">
            <Card className="overflow-hidden bg-card shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-[500px] md:h-auto">
                  <img 
                    src={providerImage} 
                    alt="Healthcare provider at Elevated Health Augusta" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center bg-gradient-subtle">
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold text-primary mb-2">Lauren Bursey, NP-C</h3>
                    <div className="text-lg text-muted-foreground mb-4">Board-Certified Nurse Practitioner</div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <GraduationCap className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-foreground mb-1">Specialized Training</div>
                        <div className="text-muted-foreground">
                          Advanced certification in ketamine therapy and mental health treatment protocols
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Heart className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-foreground mb-1">Patient-Centered Approach</div>
                        <div className="text-muted-foreground">
                          Committed to creating a safe, welcoming environment where patients feel heard and supported
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Award className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-foreground mb-1">Evidence-Based Care</div>
                        <div className="text-muted-foreground">
                          Utilizes the latest research and proven protocols to deliver optimal outcomes
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="text-foreground italic">
                      "Elevated Health was created as a space for patients to start healing. Our services help with anxiety, depression, PTSD, and OCD. Patients feel safe here, and that's our goal. While the journey to healing is hard, it's worth the effort."
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
