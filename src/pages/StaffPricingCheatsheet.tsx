import { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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
  Printer,
  ArrowLeft,
  Search,
  X,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Searchable content data structure
const serviceCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    keywords: ["discovery", "consultation", "99", "initial", "assessment", "labs", "review"]
  },
  {
    id: "diagnostics",
    title: "Diagnostic Testing",
    keywords: ["hormone", "mapping", "kit", "zrt", "saliva", "349", "250", "cortisol", "dhea", "estradiol", "progesterone", "testosterone"]
  },
  {
    id: "hormones",
    title: "Hormone Therapy (HRT/TRT)",
    keywords: ["women", "vitality", "men", "concierge", "249", "399", "bi-est", "progesterone", "testosterone", "thyroid", "hcg", "cream", "injection", "149", "89", "79", "pellets", "hgh", "trt", "hrt"]
  },
  {
    id: "weightloss",
    title: "Weight Loss (GLP-1)",
    keywords: ["semaglutide", "tirzepatide", "glp-1", "449", "ozempic", "wegovy", "mounjaro", "metabolic", "weight"]
  },
  {
    id: "ketamine",
    title: "Ketamine Therapy",
    keywords: ["iv", "infusion", "spravato", "150", "400", "2200", "depression", "anxiety", "mental", "candidacy", "series", "bcbs", "tricare", "insurance"]
  },
  {
    id: "peptides",
    title: "Peptide Therapy",
    keywords: ["sermorelin", "cjc", "ipamorelin", "tesamorelin", "nad", "pt-141", "5-amino", "149", "179", "399", "99", "199", "225", "279", "sleep", "fat", "energy", "libido", "recovery"]
  },
  {
    id: "sexual",
    title: "Sexual Wellness",
    keywords: ["tadalafil", "sildenafil", "cialis", "viagra", "pt-141", "oxytocin", "99", "79", "225", "89", "libido", "erectile"]
  },
  {
    id: "hair",
    title: "Hair Restoration",
    keywords: ["minoxidil", "finasteride", "dutasteride", "ghk-cu", "129", "149", "scalp", "hair", "loss"]
  },
  {
    id: "iv",
    title: "IV Lounge",
    keywords: ["iv", "drip", "149", "249", "booster", "hydration", "vitamin"]
  },
  {
    id: "insurance",
    title: "Insurance Fee Schedule",
    keywords: ["tricare", "vaccn", "va", "esketamine", "spravato", "G2082", "G2083", "99204", "99205", "99214", "99215", "G2212", "80305", "fee", "reimbursement", "billing", "cpt"]
  }
];

const StaffPricingCheatsheet = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handlePrint = () => {
    window.print();
  };

  // Filter categories based on search
  const { filteredIds, openSections } = useMemo(() => {
    if (!searchQuery.trim()) {
      return { 
        filteredIds: serviceCategories.map(c => c.id), 
        openSections: ["getting-started", "hormones"] 
      };
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = serviceCategories.filter(cat => 
      cat.title.toLowerCase().includes(query) ||
      cat.keywords.some(kw => kw.includes(query))
    );
    
    const ids = filtered.map(c => c.id);
    return { 
      filteredIds: ids, 
      openSections: ids 
    };
  }, [searchQuery]);

  const showCategory = (id: string) => filteredIds.includes(id);

  return (
    <>
      <Helmet>
        <title>Staff Quick Reference | Réveil</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background print:bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8 print:py-4">
          {/* Back Button */}
          <div className="mb-6 print:hidden">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/provider/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-8 print:mb-4">
            <Badge variant="outline" className="mb-4 print:hidden">
              Internal Use Only
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2 print:text-2xl">
              Staff Quick Reference: Services & Pricing
            </h1>
            <p className="text-muted-foreground">
              Updated January 2025 • All prices subject to change
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

          {/* Search Bar */}
          <div className="relative mb-6 print:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search services, prices, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Search Results Count */}
          {searchQuery && (
            <p className="text-sm text-muted-foreground mb-4 print:hidden">
              {filteredIds.length === 0 
                ? "No services found" 
                : `Found ${filteredIds.length} matching ${filteredIds.length === 1 ? 'category' : 'categories'}`
              }
            </p>
          )}

          {/* Quick Highlight Box */}
          <Card className="mb-6 border-primary/20 bg-primary/5 print:border print:bg-transparent">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Key Starting Point</span>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Discovery Consultation: $99 (30 min, IN-PERSON)</strong> — First visit is at our Evans clinic. 
                This fee is credited toward any treatment plan. Use this as the entry point for all new patient inquiries.
              </p>
            </CardContent>
          </Card>

          {/* Services Accordion */}
          <Accordion type="multiple" value={openSections} className="space-y-2">
            
            {/* Getting Started */}
            {showCategory("getting-started") && (
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
                        <p className="text-sm text-muted-foreground">30-minute, IN-PERSON at Evans clinic • Credited toward treatment</p>
                      </div>
                      <Badge variant="secondary" className="font-mono">$149</Badge>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <p className="font-medium mb-1">💡 Pro Tip:</p>
                      <p className="text-muted-foreground">
                        Patients who already have labs from another provider can still book a $99 consult to have our providers review their existing labs.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Diagnostic Testing */}
            {showCategory("diagnostics") && (
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
                        <p className="text-xs text-muted-foreground mt-1">or $250 with $149 credit</p>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <p className="text-muted-foreground">
                        At-home saliva collection kit. Tests cortisol rhythm, DHEA-S, estradiol, progesterone, testosterone, and more.
                      </p>
                    </div>
                    <div className="bg-amber-500/10 rounded-lg p-3 text-sm mt-3">
                      <p className="font-medium text-amber-700 dark:text-amber-400 mb-1">⚠️ Lab Requirements by Service</p>
                      <p className="text-muted-foreground">
                        <strong>Hormones:</strong> Labs REQUIRED before treatment<br />
                        <strong>Weight Loss:</strong> Labs NOT required — most start same week
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Hormone Therapy */}
            {showCategory("hormones") && (
              <AccordionItem value="hormones" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Hormone Therapy (HRT/TRT)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-4">
                    <div className="border-b border-border/50 pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Vitality Membership</p>
                          <p className="text-sm text-muted-foreground">Bi-Est, Progesterone, Testosterone, Thyroid optimization</p>
                        </div>
                        <Badge className="font-mono bg-primary">$249/mo</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">For all hormone therapy patients (men & women)</p>
                    </div>
                    
                    <div className="border-b border-border/50 pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Hormone Add-On for GLP-1 Patients</p>
                          <p className="text-sm text-muted-foreground">Add hormones to weight loss membership</p>
                        </div>
                        <Badge className="font-mono bg-primary">+$149/mo</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Includes any combination of Bi-Est, Testosterone, Progesterone</p>
                    </div>

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
                          <span className="font-mono">$149</span>
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
            )}

            {/* Weight Loss */}
            {showCategory("weightloss") && (
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
                      <Badge className="font-mono bg-primary">$399/mo</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <div>
                        <p className="font-medium">Tirzepatide</p>
                        <p className="text-sm text-muted-foreground">Monthly supply, compounded</p>
                      </div>
                      <Badge className="font-mono bg-primary">$499/mo</Badge>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-3 text-sm">
                      <p className="font-medium text-green-700 dark:text-green-400 mb-1">✓ Labs NOT Required to Start</p>
                      <p className="text-muted-foreground">
                        Most weight loss patients start GLP-1 medication after their $149 consultation—no mandatory lab kit. Our physician reviews eligibility in-person.
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                      <p className="font-medium mb-1">💡 Optional Add-on:</p>
                      <p className="text-muted-foreground">
                        If patient suspects hormonal barriers (thyroid, cortisol), offer Hormone Optimization Bundle at +$149/mo.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Ketamine */}
            {showCategory("ketamine") && (
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
            )}

            {/* Peptides */}
            {showCategory("peptides") && (
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
            )}

            {/* Sexual Wellness */}
            {showCategory("sexual") && (
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
            )}

            {/* Hair Restoration */}
            {showCategory("hair") && (
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
            )}

            {/* IV Lounge */}
            {showCategory("iv") && (
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
            )}

            {/* Insurance Fee Schedule */}
            {showCategory("insurance") && (
              <AccordionItem value="insurance" className="border rounded-lg px-4 border-amber-500/30 bg-amber-500/5">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold">Insurance Fee Schedule (Billing Reference)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 pb-4">
                    {/* TRICARE Section */}
                    <div>
                      <h4 className="font-semibold text-sm uppercase tracking-wide mb-3 text-blue-600 dark:text-blue-400">
                        TRICARE
                      </h4>
                      
                      {/* Esketamine */}
                      <p className="text-xs font-medium text-muted-foreground mb-2">Esketamine (SPRAVATO®)</p>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm border">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left py-2 px-3 font-medium border-b">Code</th>
                              <th className="text-left py-2 px-3 font-medium border-b">Description</th>
                              <th className="text-right py-2 px-3 font-medium border-b">Billed</th>
                              <th className="text-right py-2 px-3 font-medium border-b">Fee Schedule</th>
                              <th className="text-right py-2 px-3 font-medium border-b">Drug Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-mono">G2082</td>
                              <td className="py-2 px-3">Esketamine 56 mg</td>
                              <td className="py-2 px-3 text-right font-mono">$1,200.00</td>
                              <td className="py-2 px-3 text-right font-mono text-green-600">$662.53</td>
                              <td className="py-2 px-3 text-right font-mono text-muted-foreground">$583.94</td>
                            </tr>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-mono">G2083</td>
                              <td className="py-2 px-3">Esketamine 84 mg</td>
                              <td className="py-2 px-3 text-right font-mono">$1,800.00</td>
                              <td className="py-2 px-3 text-right font-mono text-green-600">$881.81</td>
                              <td className="py-2 px-3 text-right font-mono text-muted-foreground">$875.92</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* E&M Codes */}
                      <p className="text-xs font-medium text-muted-foreground mb-2">E&M Codes</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left py-2 px-3 font-medium border-b">Code</th>
                              <th className="text-left py-2 px-3 font-medium border-b">Description</th>
                              <th className="text-right py-2 px-3 font-medium border-b">Billed</th>
                              <th className="text-right py-2 px-3 font-medium border-b">Fee Schedule</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-mono">99204</td>
                              <td className="py-2 px-3">New Patient Level 2</td>
                              <td className="py-2 px-3 text-right font-mono">—</td>
                              <td className="py-2 px-3 text-right font-mono text-green-600">—</td>
                            </tr>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-mono">99205</td>
                              <td className="py-2 px-3">New Patient Level 3</td>
                              <td className="py-2 px-3 text-right font-mono">$250.00</td>
                              <td className="py-2 px-3 text-right font-mono text-green-600">$175.45</td>
                            </tr>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-mono">99214</td>
                              <td className="py-2 px-3">Est Patient 30-39 Min</td>
                              <td className="py-2 px-3 text-right font-mono">$185.00</td>
                              <td className="py-2 px-3 text-right font-mono text-green-600">$101.13</td>
                            </tr>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-mono">99215</td>
                              <td className="py-2 px-3">Est Patient 40-54 Min</td>
                              <td className="py-2 px-3 text-right font-mono">$215.00</td>
                              <td className="py-2 px-3 text-right font-mono text-green-600">$142.23</td>
                            </tr>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-mono">G2212</td>
                              <td className="py-2 px-3">Prolonged +15 min</td>
                              <td className="py-2 px-3 text-right font-mono">$200.00</td>
                              <td className="py-2 px-3 text-right font-mono text-green-600">$102.12</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* VACCN Section */}
                    <div>
                      <h4 className="font-semibold text-sm uppercase tracking-wide mb-3 text-purple-600 dark:text-purple-400">
                        VACCN (VA Community Care)
                      </h4>
                      
                      {/* Esketamine */}
                      <p className="text-xs font-medium text-muted-foreground mb-2">Esketamine (SPRAVATO®)</p>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm border">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left py-2 px-3 font-medium border-b">Code</th>
                              <th className="text-left py-2 px-3 font-medium border-b">Description</th>
                              <th className="text-right py-2 px-3 font-medium border-b">Billed</th>
                              <th className="text-right py-2 px-3 font-medium border-b">Fee Schedule</th>
                              <th className="text-right py-2 px-3 font-medium border-b">Drug Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-mono">G2082</td>
                              <td className="py-2 px-3">Esketamine 56 mg</td>
                              <td className="py-2 px-3 text-right font-mono">$1,200.00</td>
                              <td className="py-2 px-3 text-right font-mono text-green-600">$622.52</td>
                              <td className="py-2 px-3 text-right font-mono text-muted-foreground">$583.94</td>
                            </tr>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-mono">G2083</td>
                              <td className="py-2 px-3">Esketamine 84 mg</td>
                              <td className="py-2 px-3 text-right font-mono">$1,800.00</td>
                              <td className="py-2 px-3 text-right font-mono text-green-600">$918.58</td>
                              <td className="py-2 px-3 text-right font-mono text-muted-foreground">$875.92</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* E&M Codes */}
                      <p className="text-xs font-medium text-muted-foreground mb-2">E&M Codes</p>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm border">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left py-2 px-3 font-medium border-b">Code</th>
                              <th className="text-left py-2 px-3 font-medium border-b">Description</th>
                              <th className="text-right py-2 px-3 font-medium border-b">Billed</th>
                              <th className="text-right py-2 px-3 font-medium border-b">Fee Schedule</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-mono">99204</td>
                              <td className="py-2 px-3">New Patient 25-59 min</td>
                              <td className="py-2 px-3 text-right font-mono">—</td>
                              <td className="py-2 px-3 text-right font-mono text-green-600">—</td>
                            </tr>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-mono">99205</td>
                              <td className="py-2 px-3">New Patient 60-74 min</td>
                              <td className="py-2 px-3 text-right font-mono">$250.00</td>
                              <td className="py-2 px-3 text-right font-mono text-green-600">$132.57</td>
                            </tr>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-mono">99214</td>
                              <td className="py-2 px-3">Est Patient 30-39 Min</td>
                              <td className="py-2 px-3 text-right font-mono">$350.00</td>
                              <td className="py-2 px-3 text-right font-mono text-green-600">$147.72</td>
                            </tr>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-mono">99215</td>
                              <td className="py-2 px-3">Est Patient 40-54 Min</td>
                              <td className="py-2 px-3 text-right font-mono">$185.00</td>
                              <td className="py-2 px-3 text-right font-mono text-green-600">$156.25</td>
                            </tr>
                            <tr className="border-b border-border/50">
                              <td className="py-2 px-3 font-mono">G2212</td>
                              <td className="py-2 px-3">Prolonged +15 min</td>
                              <td className="py-2 px-3 text-right font-mono">$215.00</td>
                              <td className="py-2 px-3 text-right font-mono text-green-600">$112.51</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Drug Screen */}
                    <div>
                      <h4 className="font-semibold text-sm uppercase tracking-wide mb-3">
                        Drug Screen (All Payers)
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left py-2 px-3 font-medium border-b">Code</th>
                              <th className="text-left py-2 px-3 font-medium border-b">Description</th>
                              <th className="text-right py-2 px-3 font-medium border-b">Billed</th>
                              <th className="text-right py-2 px-3 font-medium border-b">Fee Schedule</th>
                              <th className="text-right py-2 px-3 font-medium border-b">Drug Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-2 px-3 font-mono">80305</td>
                              <td className="py-2 px-3">Urine Drug Screen</td>
                              <td className="py-2 px-3 text-right font-mono">$65.00</td>
                              <td className="py-2 px-3 text-right font-mono text-green-600">$11.12</td>
                              <td className="py-2 px-3 text-right font-mono text-muted-foreground">$2.65</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 rounded-lg p-3 text-sm">
                      <p className="font-medium text-amber-700 dark:text-amber-400 mb-1">📋 Billing Notes</p>
                      <p className="text-muted-foreground">
                        Fee Schedule = Expected reimbursement. Drug Cost = Acquisition cost (for margin calculation). 
                        Created by Kristen C. — Last updated Feb 2025.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

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
                    $149 Discovery Consultation — it's credited toward any treatment plan.
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
                  <p className="font-medium text-sm">"They have labs from another provider"</p>
                  <p className="text-sm text-muted-foreground">
                    Offer $99 consult to review their existing labs and discuss our protocols.
                  </p>
                </div>

                <div className="border-l-2 border-primary pl-4">
                  <p className="font-medium text-sm">"Is the consultation in-person or telehealth?"</p>
                  <p className="text-sm text-muted-foreground">
                    First visit is IN-PERSON (30 minutes) at our Evans clinic. Follow-up appointments can be done via telehealth.
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
