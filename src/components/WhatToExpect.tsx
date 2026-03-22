import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, ClipboardCheck, Heart, Video, Shield, Clock, Phone } from "lucide-react";
import { trackCTAClick } from "@/lib/analytics";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { useBooking } from "@/contexts/BookingContext";

const WhatToExpect = () => {
  const { openBooking } = useBooking();

  const steps = [
    {
      icon: MessageCircle,
      title: "1. Chat with Our Virtual Care Team",
      description: "Get instant answers about pricing, insurance, and our process. Available 24/7 for all your administrative questions.",
      duration: "Instant • 24/7 • FREE",
      color: "text-accent"
    },
    {
      icon: ClipboardCheck,
      title: "2. $149 Initial Consultation",
      description: "Your first conversation with a provider. Discuss your goals, review your health history, and get a personalized plan.",
      duration: "$149 • Credited toward treatment",
      color: "text-primary"
    },
    {
      icon: Heart,
      title: "3. Lab Work & Personalized Plan",
      description: "Complete any required testing. Receive your customized treatment protocol designed specifically for your needs.",
      duration: "Varies by service",
      color: "text-accent"
    },
    {
      icon: Shield,
      title: "4. Treatment & Ongoing Care",
      description: "Begin your treatment with provider monitoring. Enjoy ongoing support, check-ins, and adjustments as needed.",
      duration: "Ongoing",
      color: "text-primary"
    }
  ];

  const comfortFeatures = [
    { icon: Video, text: "Private treatment suites" },
    { icon: Shield, text: "Provider-monitored care" },
    { icon: Heart, text: "Comfortable recliners & calming music" },
    { icon: Clock, text: "Flexible scheduling" }
  ];

  return (
    <section id="what-to-expect" className="py-16 md:py-24 bg-gradient-to-br from-background via-secondary/5 to-accent/5 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-6">
            What to Expect at Réveil
          </h2>
          <p className="font-inter text-lg text-muted-foreground">
            From your first consultation to ongoing care, we guide you every step of the way 
            in a safe, welcoming environment.
          </p>
        </div>

        {/* Video Section */}
        <div className="max-w-5xl mx-auto mb-16">
          <Card className="overflow-hidden shadow-2xl border-2 border-accent/20">
            <CardContent className="p-0">
              <div className="aspect-video w-full bg-muted">
                <video
                  controls
                  className="w-full h-full object-cover"
                  preload="auto"
                  style={{ 
                    objectFit: 'cover',
                    filter: 'contrast(1.05) saturate(1.1)'
                  }}
                >
                  <source src="/videos/clinic-experience.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="p-6 bg-card">
                <h3 className="font-playfair text-2xl font-semibold text-foreground mb-2">
                  Tour Our Clinic
                </h3>
                <p className="font-inter text-muted-foreground">
                  See our private treatment suites, meet our team, and experience the calming 
                  environment where your healing journey begins.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step-by-Step Timeline */}
        <div className="max-w-6xl mx-auto mb-16">
          <h3 className="font-playfair text-3xl font-bold text-center text-foreground mb-12">
            Your Journey in 4 Simple Steps
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <Card 
                key={index}
                className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-border hover:border-accent/40"
              >
                <CardContent className="p-6 text-center">
                  {/* Icon Circle */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                    <step.icon className={`h-8 w-8 ${step.color}`} />
                  </div>
                  
                  {/* Title */}
                  <h4 className="font-playfair text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h4>
                  
                  {/* Description */}
                  <p className="font-inter text-sm text-muted-foreground mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Duration Badge */}
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/50 rounded-full">
                    <Clock className="h-3 w-3 text-accent" />
                    <span className="text-xs font-medium text-foreground">{step.duration}</span>
                  </div>
                </CardContent>
                
                {/* Step connector line (hidden on mobile, shown on desktop between cards) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/3 -right-3 w-6 h-0.5 bg-accent/30 z-10" />
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Comfort & Safety Features */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-card border-2 border-accent/20">
            <CardContent className="p-8">
              <h3 className="font-playfair text-2xl font-bold text-center text-foreground mb-8">
                Your Comfort & Safety, Our Priority
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {comfortFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-inter text-base text-foreground font-medium">
                        {feature.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What to Bring Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <Card className="bg-secondary/30 border border-border">
            <CardContent className="p-6">
              <h4 className="font-playfair text-xl font-semibold text-foreground mb-4">
                📋 What to Bring to Your First Visit
              </h4>
              <ul className="font-inter text-muted-foreground space-y-2 ml-6 list-disc">
                <li>Government-issued ID and insurance card</li>
                <li>List of current medications</li>
                <li>Comfortable clothing (we recommend layers)</li>
                <li>A trusted friend or family member to drive you home</li>
                <li>Any questions you'd like to discuss with our team</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="font-playfair text-3xl font-bold text-foreground mb-4">
            Ready to Begin Your Journey?
          </h3>
          <p className="font-inter text-lg text-muted-foreground mb-8">
            Your first conversation with a provider is just $149—and it's credited toward your treatment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="hero"
              size="lg"
              className="gap-2 shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                trackCTAClick('what_to_expect_book', 'payment_modal');
                openBooking();
              }}
            >
              <ClipboardCheck className="h-5 w-5" />
              Book $149 Medical Consultation
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => {
                trackCTAClick('what_to_expect_call', `tel:+1${SITE_CONFIG.phoneRaw}`);
                window.location.href = `tel:+1${SITE_CONFIG.phoneRaw}`;
              }}
            >
              <Phone className="h-5 w-5" />
              Call {SITE_CONFIG.phone}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatToExpect;
