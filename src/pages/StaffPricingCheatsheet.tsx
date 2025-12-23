import { Helmet } from "react-helmet";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  Phone, 
  Users, 
  Beaker, 
  Brain, 
  Heart,
  Syringe,
  Pill,
  Sparkles,
  Droplets,
  Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";

const StaffPricingCheatsheet = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Helmet>
        <title>Staff Quick Reference | Elevated Health Augusta</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background print:bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8 print:py-4">
          {/* Header */}
          <div className="text-center mb-8 print:mb-4">
            <Badge variant="outline" className="mb-4 print:hidden">
              Internal Use Only
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2 print:text-2xl">
              Staff Quick Reference: Services & Pricing
            </h1>
            <p className="text-muted-foreground">
              Updated December 2024 • All prices subject to change
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint}
              className="mt-4 print:hidden"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print This Page
            </Button>
          </div>

          {/* Quick Highlight Box */}
          <Card className="mb-6 border-primary/20 bg-primary/5 print:border print:bg-transparent">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Key Starting Point</span>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Discovery Consultation: $99</strong> — This fee is credited toward any treatment plan. 
                Use this as the entry point for all new patient inquiries.
              </p>
            </CardContent>
          </Card>

          {/* Services Accordion */}
          <Accordion type="multiple" defaultValue={["getting-started", "hormones"]} className="space-y-2">
            
            {/* Getting Started */}
            <AccordionItem value="getting-started" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Getting Started</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <div>
                      <p className="font-medium">Discovery Consultation</p>
                      <p className="text-sm text-muted-foreground">Initial assessment, credited toward treatment</p>
                    </div>
                    <Badge variant="secondary" className="font-mono">$99</Badge>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <p className="font-medium mb-1">💡 Pro Tip:</p>
                    <p className="text-muted-foreground">
                      Patients who already have labs from another provider (Holgate, etc.) can still book a $99 consult to have our providers review their existing labs.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Diagnostic Testing */}
            <AccordionItem value="diagnostics" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Beaker className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Diagnostic Testing</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <div>
                      <p className="font-medium">Hormone Mapping Kit</p>
                      <p className="text-sm text-muted-foreground">ZRT Saliva Profile III - comprehensive hormone panel</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="font-mono">$349</Badge>
                      <p className="text-xs text-muted-foreground mt-1">or $250 with $99 credit</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <p className="text-muted-foreground">
                      At-home saliva collection kit. Tests cortisol rhythm, DHEA-S, estradiol, progesterone, testosterone, and more.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Hormone Therapy */}
            <AccordionItem value="hormones" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Hormone Therapy (HRT/TRT)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pb-4">
                  {/* Women's */}
                  <div className="border-b border-border/50 pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">Women's Vitality Membership</p>
                        <p className="text-sm text-muted-foreground">Bi-Est, Progesterone, low-dose Testosterone, Thyroid optimization</p>
                      </div>
                      <Badge className="font-mono bg-primary">$249/mo</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Form: Transdermal creams ONLY</p>
                  </div>
                  
                  {/* Men's */}
                  <div className="border-b border-border/50 pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">Men's Concierge Membership</p>
                        <p className="text-sm text-muted-foreground">Testosterone, HCG, Estrogen management, Thyroid</p>
                      </div>
                      <Badge className="font-mono bg-primary">$399/mo</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Form: Creams or injections (patient choice)</p>
                  </div>

                  {/* À La Carte */}
                  <div className="space-y-2">
                    <p className="font-medium text-sm">À La Carte (Non-Members):</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Testosterone Cream (10-wk)</span>
                        <span className="font-mono">$149</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bi-Est Cream (30-day)</span>
                        <span className="font-mono">$89</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Progesterone (30-day)</span>
                        <span className="font-mono">$79</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Follow-up Consultation</span>
                        <span className="font-mono">$99</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-destructive/10 rounded-lg p-3 text-sm">
                    <p className="font-medium text-destructive mb-1">⚠️ What We DON'T Offer:</p>
                    <p className="text-muted-foreground">Pellets, synthetic HGH</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Weight Loss */}
            <AccordionItem value="weightloss" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Weight Loss (GLP-1)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <div>
                      <p className="font-medium">Semaglutide (GLP-1 Continuation)</p>
                      <p className="text-sm text-muted-foreground">Monthly supply, compounded</p>
                    </div>
                    <Badge className="font-mono bg-primary">$449/mo</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <div>
                      <p className="font-medium">Tirzepatide</p>
                      <p className="text-sm text-muted-foreground">Contact provider for pricing</p>
                    </div>
                    <Badge variant="outline">Varies</Badge>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <p className="text-muted-foreground">
                      All GLP-1 patients start with $99 Discovery Consultation + Hormone Mapping Kit for metabolic baseline.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Ketamine */}
            <AccordionItem value="ketamine" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Ketamine Therapy</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <div>
                      <p className="font-medium">Candidacy Review (Deposit)</p>
                      <p className="text-sm text-muted-foreground">Applied toward treatment if approved</p>
                    </div>
                    <Badge variant="secondary" className="font-mono">$150</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <div>
                      <p className="font-medium">IV Ketamine Infusion (Single)</p>
                    </div>
                    <Badge variant="secondary" className="font-mono">$400</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <div>
                      <p className="font-medium">6-Session Series</p>
                      <p className="text-sm text-muted-foreground">Saves $200</p>
                    </div>
                    <Badge className="font-mono bg-primary">$2,200</Badge>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-3 text-sm">
                    <p className="font-medium text-green-700 dark:text-green-400 mb-1">✓ SPRAVATO® (Insurance Covered)</p>
                    <p className="text-muted-foreground">
                      BCBS, TRICARE accepted. Typically $0-50 copay. We handle prior authorization.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Peptides */}
            <AccordionItem value="peptides" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Syringe className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Peptide Therapy</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Peptide</th>
                          <th className="text-right py-2 font-medium">Price</th>
                          <th className="text-left py-2 pl-4 font-medium">Primary Benefit</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50">
                          <td className="py-2">Sermorelin</td>
                          <td className="text-right font-mono">$149/mo</td>
                          <td className="pl-4">GH support, sleep, fat loss</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2">CJC-1295/Ipamorelin</td>
                          <td className="text-right font-mono">$179/mo</td>
                          <td className="pl-4">GH pulses, recovery</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2">Tesamorelin</td>
                          <td className="text-right font-mono">$399/mo</td>
                          <td className="pl-4">Visceral fat reduction (FDA)</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2">NAD+ Troches</td>
                          <td className="text-right font-mono">$99/mo</td>
                          <td className="pl-4">Energy, brain fog</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2">NAD+ Injection</td>
                          <td className="text-right font-mono">$199/mo</td>
                          <td className="pl-4">Higher bioavailability</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2">PT-141</td>
                          <td className="text-right font-mono">$225/kit</td>
                          <td className="pl-4">Libido (10 doses)</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2">5-Amino-1MQ</td>
                          <td className="text-right font-mono">$279/mo</td>
                          <td className="pl-4">Stubborn fat metabolism</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <p className="text-muted-foreground">
                      <strong>Important:</strong> Peptides stimulate NATURAL hormone production — we do NOT use synthetic HGH.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Sexual Wellness */}
            <AccordionItem value="sexual" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Pill className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Sexual Wellness</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pb-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span>Tadalafil (Cialis)</span>
                    <span className="font-mono">$99/mo</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span>Sildenafil (Viagra)</span>
                    <span className="font-mono">$79/mo</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span>PT-141</span>
                    <span className="font-mono">$225/kit (10 doses)</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span>Oxytocin Nasal Spray</span>
                    <span className="font-mono">$89/mo</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Hair Restoration */}
            <AccordionItem value="hair" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Hair Restoration</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pb-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span>Minoxidil + Finasteride</span>
                    <span className="font-mono">$129/mo</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span>Dutasteride</span>
                    <span className="font-mono">$149/mo</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span>GHK-Cu Scalp Therapy</span>
                    <span className="font-mono">$149/mo</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* IV Lounge */}
            <AccordionItem value="iv" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-primary" />
                  <span className="font-semibold">IV Lounge</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pb-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Prices vary by drip (typically $149-$249). Add-on boosters available.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <p className="text-muted-foreground">
                      Refer to the IV Lounge page or provider dashboard for current drip menu and pricing.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>

          <Separator className="my-8" />

          {/* FAQ Quick Answers */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Common Phone Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border-l-2 border-primary pl-4">
                  <p className="font-medium text-sm">"Do you take insurance?"</p>
                  <p className="text-sm text-muted-foreground">
                    SPRAVATO® (ketamine) is covered by most plans including BCBS & TRICARE. Other services — we provide superbills for OON reimbursement.
                  </p>
                </div>
                
                <div className="border-l-2 border-primary pl-4">
                  <p className="font-medium text-sm">"What's the cheapest way to start?"</p>
                  <p className="text-sm text-muted-foreground">
                    $99 Discovery Consultation — it's credited toward any treatment plan.
                  </p>
                </div>

                <div className="border-l-2 border-primary pl-4">
                  <p className="font-medium text-sm">"Do you do pellets?"</p>
                  <p className="text-sm text-muted-foreground">
                    No, we use transdermal creams and injections only. More precise dosing and easier to adjust.
                  </p>
                </div>

                <div className="border-l-2 border-primary pl-4">
                  <p className="font-medium text-sm">"What about HGH?"</p>
                  <p className="text-sm text-muted-foreground">
                    We use peptides that stimulate your body's NATURAL growth hormone production, not synthetic HGH.
                  </p>
                </div>

                <div className="border-l-2 border-primary pl-4">
                  <p className="font-medium text-sm">"They have labs from Holgate/another provider"</p>
                  <p className="text-sm text-muted-foreground">
                    Offer $99 consult to review their existing labs and discuss our protocols.
                  </p>
                </div>

                <div className="border-l-2 border-primary pl-4">
                  <p className="font-medium text-sm">"Do you accept HSA/FSA?"</p>
                  <p className="text-sm text-muted-foreground">
                    Yes, most services qualify.
                  </p>
                </div>

                <div className="border-l-2 border-primary pl-4">
                  <p className="font-medium text-sm">"Payment plans?"</p>
                  <p className="text-sm text-muted-foreground">
                    Klarna/Affirm available — split into 4 payments or monthly financing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="text-center text-xs text-muted-foreground mt-8 print:mt-4">
            <p>Prices may vary. Always confirm current pricing before quoting patients.</p>
            <p className="mt-1">This page is for internal staff reference only.</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:bg-transparent { background: transparent !important; }
          .print\\:border { border: 1px solid #e5e7eb !important; }
          .print\\:py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
          .print\\:mb-4 { margin-bottom: 1rem !important; }
          .print\\:mt-4 { margin-top: 1rem !important; }
          .print\\:text-2xl { font-size: 1.5rem !important; }
        }
      `}</style>
    </>
  );
};

export default StaffPricingCheatsheet;
