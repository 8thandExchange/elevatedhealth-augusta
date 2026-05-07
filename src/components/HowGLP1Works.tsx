import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, Scale, Heart, Utensils, Clock, TrendingDown,
  CheckCircle2, AlertCircle
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const HowGLP1Works = () => {
  const mechanisms = [
    {
      icon: Brain,
      title: "Appetite Control Center",
      description: "GLP-1 acts on the hypothalamus to reduce hunger signals and increase feelings of fullness after smaller meals."
    },
    {
      icon: Utensils,
      title: "Delayed Gastric Emptying",
      description: "Slows the rate at which food leaves your stomach, keeping you satisfied longer between meals."
    },
    {
      icon: Scale,
      title: "Metabolic Reset",
      description: "Improves insulin sensitivity and reduces blood sugar spikes, helping your body burn fat more efficiently."
    },
    {
      icon: Heart,
      title: "Cardiovascular Benefits",
      description: "Clinical trials show reduced risk of major cardiovascular events in patients using GLP-1 medications."
    }
  ];

  const comparisonData = [
    {
      feature: "How It Works",
      semaglutide: "Mimics GLP-1 hormone to reduce appetite and regulate blood sugar",
      tirzepatide: "Dual-action: mimics both GLP-1 and GIP hormones for enhanced metabolic effects"
    },
    {
      feature: "Average Weight Loss",
      semaglutide: "~15% of body weight",
      tirzepatide: "~22.5% of body weight",
      highlight: "tirzepatide"
    },
    {
      feature: "FDA Approval",
      semaglutide: "2017 (Ozempic), 2021 (Wegovy)",
      tirzepatide: "2022 (Mounjaro), 2023 (Zepbound)"
    },
    {
      feature: "Injection Frequency",
      semaglutide: "Once weekly",
      tirzepatide: "Once weekly"
    },
    {
      feature: "Blood Sugar Control",
      semaglutide: "Strong improvement",
      tirzepatide: "Superior A1C reduction",
      highlight: "tirzepatide"
    },
    {
      feature: "Research Data",
      semaglutide: "8+ years of real-world data",
      tirzepatide: "Newer with stronger trial results"
    },
    {
      feature: "Best For",
      semaglutide: "Steady, sustainable weight loss with proven long-term safety",
      tirzepatide: "Maximum weight loss, insulin resistance, or breaking plateaus"
    },
    {
      feature: "Monthly Cost",
      semaglutide: "$399/month",
      tirzepatide: "$499/month"
    }
  ];

  const faqs = [
    {
      q: "How do GLP-1 medications cause weight loss?",
      a: "GLP-1 (glucagon-like peptide-1) is a hormone your body naturally produces after eating. GLP-1 medications like Semaglutide and Tirzepatide mimic this hormone at higher levels, signaling to your brain that you're full, slowing stomach emptying, and improving how your body processes glucose. This triple action reduces appetite, decreases calorie intake, and helps your body burn stored fat more efficiently."
    },
    {
      q: "What is the difference between Semaglutide and Tirzepatide?",
      a: "Semaglutide (brand names Ozempic, Wegovy) targets only the GLP-1 receptor. Tirzepatide (brand names Mounjaro, Zepbound) is a dual-agonist that targets both GLP-1 and GIP receptors. This dual action typically produces greater weight loss results—clinical trials showed 22.5% average body weight loss with Tirzepatide compared to 15% with Semaglutide. Tirzepatide also shows superior blood sugar control, making it particularly effective for patients with insulin resistance."
    },
    {
      q: "How quickly will I see results from GLP-1 medication?",
      a: "Most patients notice reduced appetite within the first 1-2 weeks of treatment. Measurable weight loss typically begins within 4-6 weeks. The dosage is gradually increased over 3-4 months to reach the therapeutic dose that maximizes weight loss while minimizing side effects. Peak results are usually seen at 12-18 months of consistent treatment."
    },
    {
      q: "Are GLP-1 medications safe for long-term use?",
      a: "Semaglutide has been FDA-approved since 2017 with extensive real-world safety data. Both medications have undergone rigorous clinical trials involving tens of thousands of patients. Common side effects (nausea, constipation) are typically mild and decrease over time. Your provider monitors your progress and adjusts treatment as needed."
    },
    {
      q: "Will I regain weight if I stop taking GLP-1 medication?",
      a: "Studies show that some weight regain can occur after discontinuing GLP-1 medications, which is why we emphasize lifestyle changes during treatment. Our program includes nutrition guidance and ongoing support to help you maintain results. Many patients continue on a maintenance dose long-term, while others transition off successfully after reaching their goals."
    },
    {
      q: "Why is Tirzepatide more expensive than Semaglutide?",
      a: "Tirzepatide is a newer, dual-action medication that typically produces 30-50% greater weight loss than Semaglutide. The additional $100/month reflects both the higher pharmaceutical cost and the enhanced clinical outcomes. For patients with significant weight to lose or insulin resistance, the investment often delivers proportionally greater results."
    }
  ];

  return (
    <section id="how-glp1-works" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
              The Science
            </p>
            <h2 className="font-cormorant text-primary text-3xl md:text-4xl font-bold mb-4">
              How GLP-1 Medications Transform Your Metabolism
            </h2>
            <p className="text-lg text-muted-foreground font-lato max-w-3xl mx-auto">
              FDA-approved GLP-1 receptor agonists represent a breakthrough in medical weight loss, 
              working with your body's natural hunger hormones to produce sustainable results.
            </p>
          </div>

          {/* Mechanism Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {mechanisms.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="border-gold/20 hover:border-gold/40 transition-all hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex p-3 bg-gold/10 rounded-full mb-4">
                      <Icon className="h-6 w-6 text-gold" />
                    </div>
                    <h3 className="font-cormorant text-lg text-primary font-bold mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-lato">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* SEO-Optimized Explainer */}
          <div className="bg-gradient-to-br from-[#f5f0e8] via-[#faf7f2] to-[#f0ebe3] rounded-2xl p-8 mb-16 border border-gold/20">
            <div className="flex items-start gap-4 mb-6">
              <div className="shrink-0 p-2 bg-gold/10 rounded-lg">
                <Clock className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h3 className="font-cormorant text-xl text-primary font-bold mb-2">
                  What Happens When You Take a GLP-1 Medication
                </h3>
                <p className="text-muted-foreground font-lato leading-relaxed">
                  Within hours of your weekly injection, GLP-1 levels rise in your bloodstream. Your brain's 
                  appetite center receives signals that you're satisfied, even before finishing a normal-sized meal. 
                  Over the following days, your stomach empties more slowly, extending that fullness. Meanwhile, 
                  your pancreas responds more efficiently to blood sugar, reducing the insulin spikes that trigger 
                  fat storage. This coordinated response makes it easier to eat less while feeling satisfied—not 
                  deprived.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                <TrendingDown className="h-5 w-5 text-green-600" />
                <span className="text-sm font-lato text-primary">Reduced hunger hormones</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-lato text-primary">Improved insulin response</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                <Scale className="h-5 w-5 text-green-600" />
                <span className="text-sm font-lato text-primary">Enhanced fat metabolism</span>
              </div>
            </div>
          </div>

          {/* Comparison Section Header */}
          <div className="text-center mb-8">
            <h3 className="font-cormorant text-2xl md:text-3xl text-primary font-bold mb-3">
              Semaglutide vs. Tirzepatide: Which is Right for You?
            </h3>
            <p className="text-muted-foreground font-lato max-w-2xl mx-auto">
              Both medications are FDA-approved and clinically proven. Your provider will help you choose 
              based on your goals, medical history, and budget.
            </p>
          </div>

          {/* Mobile-Friendly Comparison Cards */}
          <div className="md:hidden space-y-4 mb-12">
            {comparisonData.map((row, index) => (
              <Card key={index} className="border-gold/20">
                <CardContent className="p-4">
                  <h4 className="font-cormorant text-primary font-bold mb-3">{row.feature}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gold font-medium mb-1">Semaglutide</p>
                      <p className="text-sm text-muted-foreground">{row.semaglutide}</p>
                    </div>
                    <div className={row.highlight === "tirzepatide" ? "bg-gold/10 -m-2 p-2 rounded-lg" : ""}>
                      <p className="text-xs text-gold font-medium mb-1">Tirzepatide</p>
                      <p className={`text-sm ${row.highlight === "tirzepatide" ? "text-gold font-medium" : "text-muted-foreground"}`}>
                        {row.tirzepatide}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Comparison Table */}
          <div className="hidden md:block overflow-x-auto mb-12">
            <table className="w-full border-collapse bg-white rounded-xl shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-primary/5">
                  <th className="p-4 text-left font-cormorant text-lg text-primary w-1/4"></th>
                  <th className="p-4 text-center font-cormorant text-lg text-primary w-[37.5%]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold">Semaglutide</span>
                      <span className="text-sm font-lato font-normal text-muted-foreground">Ozempic • Wegovy</span>
                    </div>
                  </th>
                  <th className="p-4 text-center font-cormorant text-lg text-gold bg-gold/10 w-[37.5%]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-block px-2 py-0.5 bg-gold text-white text-xs rounded-full mb-1 font-lato">Premium</span>
                      <span className="font-bold">Tirzepatide</span>
                      <span className="text-sm font-lato font-normal text-muted-foreground">Mounjaro • Zepbound</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="p-4 font-lato text-primary font-medium">{row.feature}</td>
                    <td className="p-4 text-center font-lato text-muted-foreground text-sm">
                      {row.semaglutide}
                    </td>
                    <td className={`p-4 text-center font-lato text-sm bg-gold/5 ${row.highlight === "tirzepatide" ? "text-gold font-medium" : "text-muted-foreground"}`}>
                      {row.tirzepatide}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Clinical Note */}
          <div className="flex items-start gap-4 p-6 bg-blue-50 border border-blue-200 rounded-xl mb-12">
            <AlertCircle className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-cormorant text-lg text-primary font-bold mb-1">
                Clinical Guidance
              </h4>
              <p className="text-sm text-muted-foreground font-lato">
                During your $79 RN Wellness Assessment, your provider will review your medical history, current medications, 
                and weight loss goals to recommend the most appropriate medication. Factors like insulin resistance, 
                prior GLP-1 experience, and cardiovascular history influence which option is safest and most effective for you.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h3 className="font-cormorant text-2xl text-primary font-bold text-center mb-8">
              GLP-1 Medication FAQs
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-lato font-semibold text-primary">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-lato leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowGLP1Works;
