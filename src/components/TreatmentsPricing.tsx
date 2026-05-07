import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, DollarSign } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface TreatmentsPricingProps {
  onOpenBooking: () => void;
}

const TreatmentsPricing = ({ onOpenBooking }: TreatmentsPricingProps) => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-light text-primary mb-4">
            Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            No hidden fees. No surprises. Just clear, upfront pricing for your peace of mind.
          </p>
        </div>

        {/* Treatment Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Ketamine Therapy */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-hope">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-hope/10 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-hope" />
              </div>
              <CardTitle className="text-2xl">Ketamine Therapy</CardTitle>
              <CardDescription className="text-lg font-semibold text-primary">
                $400 per infusion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-hope mt-0.5 flex-shrink-0" />
                  <span className="text-sm">40-minute IV infusion</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-hope mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Provider monitored throughout</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-hope mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Private, comfortable suite</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-hope mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Typical protocol: 6 treatments over 28 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-hope mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Insurance accepted (BCBS, TRICARE, VA)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Medical Weight Loss */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-accent">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-2xl">Medical Weight Loss</CardTitle>
              <CardDescription className="text-lg font-semibold text-primary">
                $399 per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Semaglutide medication included</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Monthly provider consultations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Personalized nutrition guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Average 15-20% weight loss in 6 months</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Insurance coverage expanding</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Hormone Replacement */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-gold">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-gold" />
              </div>
              <CardTitle className="text-2xl">Hormone Replacement</CardTitle>
              <CardDescription className="text-lg font-semibold text-primary">
                $299 per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Bioidentical hormone therapy (BHRT)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Comprehensive lab work included</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Ongoing monitoring & adjustments</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Customized treatment plans</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <span className="text-sm">For men & women</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* What to Expect Accordion */}
        <div className="max-w-3xl mx-auto mb-12">
          <h3 className="text-3xl font-light text-primary text-center mb-8">What to Expect</h3>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                How does ketamine therapy work?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-4">
                  Ketamine works by targeting the glutamate system in your brain, promoting rapid formation of new neural connections. Research from Yale and other leading institutions shows that 70% of patients experience significant relief from treatment-resistant depression.
                </p>
                <p>
                  During your 40-minute infusion, you'll relax in a private suite while our provider monitors you continuously. Many patients describe a gentle, dissociative experience that allows for deep reflection and healing.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                What's the treatment timeline?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-4">
                  <strong>Initial Series:</strong> Most patients begin with 6 infusions over 28 days (typically twice weekly). This allows us to build therapeutic momentum.
                </p>
                <p>
                  <strong>Maintenance:</strong> After the initial series, many patients benefit from monthly or as-needed booster infusions to maintain relief.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                Do you accept insurance?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-4">
                  Yes! We currently accept Blue Cross Blue Shield, TRICARE, and VA benefits for ketamine therapy. More insurance providers are coming soon.
                </p>
                <p>
                  For weight loss and hormone replacement, insurance coverage is expanding. Contact us to verify your specific benefits.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                Is ketamine therapy safe?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-4">
                  Absolutely. Ketamine has been used safely in medical settings for over 50 years. Our clinic follows strict safety protocols, and our clinical team personally monitors every patient throughout their entire infusion.
                </p>
                <p>
                  Side effects are typically mild and temporary, including light nausea or dizziness during treatment. You'll need a driver to take you home after your session.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            variant="cta" 
            size="xl"
            onClick={onOpenBooking}
            className="shadow-gold-glow"
          >
            Start Your Journey Today
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            $79 Wellness Assessment credited toward treatment • Compassionate care
          </p>
        </div>
      </div>
    </section>
  );
};

export default TreatmentsPricing;
