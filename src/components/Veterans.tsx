import { Shield, Cross, BadgeCheck, CheckCircle, Calendar, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Veterans = () => {
  const programs = [
    {
      icon: Shield,
      title: "VA Community Care",
      description: "We accept VA Community Care referrals for eligible Veterans seeking mental health treatment",
      features: [
        "Streamlined authorization process",
        "Direct billing to VA",
        "Experienced with VA requirements"
      ]
    },
    {
      icon: Cross,
      title: "TRICARE",
      description: "Serving active duty, reserve members, and military families through TRICARE coverage",
      features: [
        "TRICARE Prime & Select accepted",
        "Military family support",
        "Flexible scheduling for deployments"
      ]
    },
    {
      icon: BadgeCheck,
      title: "First Responder Mental Health",
      description: "Specialized care for police, firefighters, EMS, and emergency personnel",
      features: [
        "Understanding of first responder culture",
        "Trauma-informed, evidence-based care",
        "Confidential treatment options"
      ]
    }
  ];

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="veterans" className="py-24 bg-gradient-subtle scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-accent/10 text-accent px-6 py-3 rounded-full text-sm font-semibold mb-6 border border-accent/20">
              Coverage & Support Programs
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Serving Those Who Serve
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We honor your commitment to protecting others by providing accessible, 
              specialized mental health care when you need it most.
            </p>
          </div>

          {/* Programs Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {programs.map((program, index) => (
              <Card key={index} className="p-8 border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                  <program.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">{program.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {program.description}
                </p>
                <ul className="space-y-3">
                  {program.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* Veterans Assistance Program Callout */}
          <div className="mb-12">
            <Card className="p-8 md:p-10 border-accent/30 bg-accent/5 backdrop-blur relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-start gap-4 mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 flex-shrink-0">
                    <Heart className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
                      Ask About Our Veterans Assistance Program
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      We partner with the VA and TRICARE to ensure accessible care for those who've served. Our Veterans 
                      Assistance Program includes discounted rates for eligible Veterans and service members, streamlined 
                      authorization support, and dedicated care coordination. Every treatment is delivered with trauma-informed, 
                      evidence-based protocols that honor your service while addressing the unique mental health challenges 
                      faced by our military and first responder communities.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Why This Matters Section */}
          <div className="mb-16">
            <Card className="p-8 md:p-12 border-accent/20 bg-card/50 backdrop-blur">
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-foreground text-center">
                Why Your Mental Health Matters
              </h3>
              <div className="grid md:grid-cols-2 gap-8 text-muted-foreground leading-relaxed">
                <div>
                  <p className="mb-4">
                    The weight of service—whether military or first responder—can take an invisible toll. 
                    Depression, anxiety, and PTSD don't diminish your strength; they're evidence of what you've endured.
                  </p>
                  <p>
                    Our ketamine therapy offers a path forward without the stigma. We understand the unique challenges 
                    you face and provide trauma-informed care that respects your experience while helping you heal.
                  </p>
                </div>
                <div>
                  <p className="mb-4">
                    Through our partnerships with the VA and TRICARE, we handle the paperwork and authorization process 
                    so you can focus on recovery. Our team is experienced with military and first responder benefits, 
                    and we offer discounted rates to ensure care is accessible.
                  </p>
                  <p>
                    You've spent your career protecting others. Let us help protect your mental health.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-primary/5 border border-accent/20 rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-3xl font-bold mb-4 text-foreground">We're Here When You're Ready</h3>
            <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
              Connect with us to learn about our services and how we can support your mental health journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="xl" asChild className="gap-2">
                <a
                  href="https://calendar.app.google/hf3NNdiqJDueUuSN9"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Calendar className="h-5 w-5" />
                  Schedule Consultation
                </a>
              </Button>
              <a href="tel:7067603470">
                <Button variant="outline" size="xl" className="gap-2 border-2">
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

export default Veterans;
