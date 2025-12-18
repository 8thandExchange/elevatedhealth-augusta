import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Wind, ClipboardCheck, ChevronDown, CheckCircle2, ArrowRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TreatmentsProps {
  onOpenQuiz?: () => void;
}

const Treatments = ({ onOpenQuiz }: TreatmentsProps) => {
  const [openCard, setOpenCard] = useState<number | null>(null);

  const treatments = [
    {
      icon: Droplet,
      iconColor: "text-hope",
      title: "IV Ketamine Infusions",
      headline: "Rapid Relief in 45 Minutes",
      bullets: [
        "70%+ response rate for treatment-resistant depression¹",
        "Private suite with Netflix & noise-canceling headphones",
        "Starting at $400/session (financing available)"
      ],
      ctaText: "Book IV Ketamine",
      ctaUrl: "https://calendar.app.google/Cmwuzg5TYMeACQ4i6" // Ketamine Candidacy Review
    },
    {
      icon: Wind,
      iconColor: "text-accent",
      title: "Spravato® Nasal Spray",
      headline: "FDA-Approved, Insurance-Covered",
      bullets: [
        "Same-day approval for most plans",
        "30-minute observed sessions",
        "No IV required"
      ],
      ctaText: "Check Insurance Coverage",
      ctaUrl: "#insurance"
    },
    {
      icon: ClipboardCheck,
      iconColor: "text-gold",
      title: "Mood & Symptom Quiz",
      headline: "Not Sure Where to Start?",
      description: "Answer 6 quick questions → get your personalized treatment path in 60 seconds.",
      ctaText: "Take the Quiz",
      ctaUrl: "#compare"
    }
  ];

  const handleCardClick = (index: number) => {
    setOpenCard(openCard === index ? null : index);
  };

  const handleCtaClick = (url: string, isQuiz: boolean = false) => {
    if (isQuiz && onOpenQuiz) {
      onOpenQuiz();
    } else if (url.startsWith('#')) {
      const element = document.getElementById(url.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section id="treatments" className="py-16 md:py-24 bg-secondary/30 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-primary">
              Your Path to Healing
            </h2>
            <p className="font-inter text-xl text-muted-foreground max-w-3xl mx-auto">
              Evidence-based treatments tailored to your unique needs
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {treatments.map((treatment, index) => {
              const Icon = treatment.icon;
              const isOpen = openCard === index;
              
              return (
                <Card 
                  key={index} 
                  className="flex flex-col hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  style={{
                    transform: isOpen ? 'translateY(-8px)' : 'translateY(0)'
                  }}
                  onClick={() => handleCardClick(index)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-full ${treatment.iconColor.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
                        <Icon className={`h-7 w-7 ${treatment.iconColor}`} />
                      </div>
                      <ChevronDown 
                        className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </div>
                    <CardTitle className="font-playfair text-2xl mb-2 text-foreground">
                      {treatment.title}
                    </CardTitle>
                    <p className="font-inter text-lg font-semibold text-primary">
                      {treatment.headline}
                    </p>
                  </CardHeader>
                  
                  <Collapsible open={isOpen}>
                    <CollapsibleContent>
                      <CardContent className="flex-1 space-y-4">
                        {treatment.description && (
                          <p className="font-inter text-muted-foreground leading-relaxed">
                            {treatment.description}
                          </p>
                        )}
                        
                        {treatment.bullets && (
                          <ul className="space-y-3">
                            {treatment.bullets.map((bullet, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-hope flex-shrink-0 mt-0.5" />
                                <span className="font-inter text-foreground">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                      
                      <CardFooter>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCtaClick(treatment.ctaUrl, treatment.title === "Mood & Symptom Quiz");
                          }}
                          className="w-full font-inter font-semibold uppercase bg-accent hover:bg-accent-light text-white"
                          size="lg"
                        >
                          {treatment.ctaText}
                        </Button>
                      </CardFooter>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>


          {/* Disclaimer */}
          <div className="mt-8 text-center">
            <p className="font-inter text-sm text-muted-foreground">
              ¹ Results vary by individual. Consult with our providers to determine the best treatment plan for you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Treatments;
