import { Check, X, Droplets, Clock, Sliders, Shield, Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface WhyTransdermalCreamProps {
  onBookConsultation: () => void;
}

const comparisonData = [
  {
    feature: "Daily dose adjustments",
    cream: true,
    pellets: false,
    injections: false,
  },
  {
    feature: "No needles required",
    cream: true,
    pellets: false,
    injections: false,
  },
  {
    feature: "Mimics natural hormone rhythm",
    cream: true,
    pellets: false,
    injections: false,
  },
  {
    feature: "Easy to stop if side effects occur",
    cream: true,
    pellets: false,
    injections: true,
  },
  {
    feature: "No surgical procedure",
    cream: true,
    pellets: false,
    injections: true,
  },
  {
    feature: "Stable hormone levels (no peaks/valleys)",
    cream: true,
    pellets: true,
    injections: false,
  },
];

const benefits = [
  {
    icon: Sliders,
    title: "Precision Dosing",
    description: "Adjust your dose daily based on how you feel—impossible with pellets or weekly injections.",
  },
  {
    icon: Clock,
    title: "Natural Rhythm",
    description: "Daily application mimics your body's natural testosterone production cycle.",
  },
  {
    icon: Shield,
    title: "Zero Needle Anxiety",
    description: "No injections, no surgical insertions—just simple topical application.",
  },
  {
    icon: Heart,
    title: "Rapid Response",
    description: "If side effects occur, stop immediately. Pellets lock you in for 4-6 months.",
  },
  {
    icon: Droplets,
    title: "Liposomal Technology",
    description: "Pharmaceutical-grade liposomal base ensures superior skin absorption.",
  },
  {
    icon: Zap,
    title: "Stable Energy",
    description: "No peaks and valleys—consistent hormone levels mean consistent energy.",
  },
];

const faqs = [
  {
    question: "How do I apply testosterone cream?",
    answer: "Apply the prescribed amount to a large, hairless muscle area (typically the shoulder or inner thigh) every morning. Wash your hands thoroughly after application. The cream absorbs within minutes, and you can dress normally afterward.",
  },
  {
    question: "Is transdermal cream as effective as injections?",
    answer: "Yes—and in many ways superior. While injections deliver a large dose all at once (creating peaks and valleys), transdermal cream provides steady, consistent hormone levels that more closely mimic your body's natural production. Studies show comparable effectiveness with better tolerability.",
  },
  {
    question: "Why doesn't Elevated Health Augusta offer pellets?",
    answer: "Pellets are surgically implanted and release a fixed dose for 4-6 months. If you experience side effects—like elevated estrogen, hair loss, or mood changes—you're stuck until they dissolve. With cream, we can adjust your dose the very next day based on your labs and symptoms.",
  },
  {
    question: "Why doesn't Elevated Health Augusta offer injections?",
    answer: "Weekly injections create a 'roller coaster' effect: testosterone spikes after injection, then drops throughout the week. This leads to energy crashes, mood swings, and inconsistent results. Daily cream application maintains stable levels, eliminating these fluctuations.",
  },
  {
    question: "How long until I see results from hormone cream?",
    answer: "Most patients notice improved energy and mood within 2-4 weeks. Optimal results—including improved body composition, libido, and mental clarity—typically develop over 3-6 months as we fine-tune your protocol based on labs and symptoms.",
  },
  {
    question: "Can the cream transfer to my partner or children?",
    answer: "Apply to areas that will be covered by clothing and wash your hands immediately after. Wait at least 2 hours before skin-to-skin contact with others. These simple precautions prevent any transfer risk.",
  },
];

export const WhyTransdermalCream = ({ onBookConsultation }: WhyTransdermalCreamProps) => {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Hero Headline */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-medium tracking-wide uppercase text-sm">
            The Science of Hormone Delivery
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light mt-4 mb-6 text-foreground">
            Why Liposomal Transdermal Cream is the Gold Standard
          </h2>
          <p className="text-muted-foreground text-lg">
            Not all hormone delivery methods are created equal. Our pharmaceutical-grade 
            liposomal cream offers precision, safety, and results that pellets and 
            injections simply cannot match.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border/50">
            <div className="grid grid-cols-4 bg-muted/50 p-4 font-semibold text-sm">
              <div className="text-foreground">Feature</div>
              <div className="text-center text-accent">Cream</div>
              <div className="text-center text-muted-foreground">Pellets</div>
              <div className="text-center text-muted-foreground">Injections</div>
            </div>
            {comparisonData.map((row, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-4 p-4 items-center ${
                  index % 2 === 0 ? "bg-card" : "bg-muted/20"
                }`}
              >
                <div className="text-sm text-foreground">{row.feature}</div>
                <div className="flex justify-center">
                  {row.cream ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="flex justify-center">
                  {row.pellets ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="flex justify-center">
                  {row.injections ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <h3 className="text-center font-display text-2xl md:text-3xl font-light mb-10 text-foreground">
            6 Reasons We Chose Transdermal Cream
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-card p-6 rounded-xl border border-border/50 hover:border-accent/30 transition-colors"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-accent" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{benefit.title}</h4>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h3 className="text-center font-display text-2xl md:text-3xl font-light mb-10 text-foreground">
            Frequently Asked Questions
          </h3>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="bg-card rounded-xl border border-border/50 px-6"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-6">
            Ready to experience the precision of transdermal hormone therapy?
          </p>
          <Button 
            size="lg" 
            onClick={onBookConsultation}
          >
            Book Your $79 Wellness Assessment
          </Button>
        </div>
      </div>
    </section>
  );
};
