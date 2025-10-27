import { Shield, Cross, BadgeCheck, CheckCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Veterans = () => {
  const programs = [
    {
      icon: Shield,
      title: "VA Community Care",
      description: "We accept VA Community Care referrals for eligible veterans seeking mental health treatment",
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
        "Trauma-informed care",
        "Confidential treatment options"
      ]
    }
  ];

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="veterans" className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-gold/10 text-gold-dark px-6 py-3 rounded-full text-sm font-semibold mb-6 border border-gold/20">
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
              <Card key={index} className="p-8 border-gold/20 hover:border-gold/40 transition-all duration-300 hover:shadow-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-6">
                  <program.icon className="h-8 w-8 text-gold-dark" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">{program.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {program.description}
                </p>
                <ul className="space-y-3">
                  {program.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* Why This Matters Section */}
          <div className="mb-16">
            <Card className="p-8 md:p-12 border-gold/20 bg-card/50 backdrop-blur">
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
                    Our KETRA™ therapy offers a path forward without the stigma. We understand the unique challenges 
                    you face and provide care that respects your experience while helping you heal.
                  </p>
                </div>
                <div>
                  <p className="mb-4">
                    Whether you're navigating VA benefits, TRICARE coverage, or seeking confidential support as a 
                    first responder, we handle the paperwork so you can focus on recovery.
                  </p>
                  <p>
                    You've spent your career protecting others. Let us help protect your mental health.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-gold/10 to-gold-light/5 border border-gold/20 rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-3xl font-bold mb-4 text-foreground">We're Here When You're Ready</h3>
            <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
              Connect with us to verify your coverage and learn how we can support your mental health journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="xl" onClick={scrollToContact} className="gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Consultation
              </Button>
              <a href="tel:7065509202">
                <Button variant="outline" size="xl" className="gap-2 border-2">
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
