import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { 
  Play, 
  FileText, 
  Download, 
  BookOpen, 
  Syringe, 
  Heart, 
  Scale, 
  Brain, 
  Droplets, 
  Sparkles,
  ChevronDown,
  ExternalLink,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";

type ResourceCategory = 
  | "hormone_therapy" 
  | "weight_loss" 
  | "peptide_therapy" 
  | "iv_hydration"
  | "general_wellness"
  | "injection_tutorials" 
  | "nutrition_guides" 
  | "stress_management"
  | "billing_payment"
  | "getting_started";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: ResourceCategory;
  resource_type: "video" | "pdf";
  url: string;
  thumbnail_url: string | null;
}

const categoryConfig: Record<string, { label: string; icon: any; description: string; color: string }> = {
  hormone_therapy: {
    label: "Hormone Therapy",
    icon: Sparkles,
    description: "Bio-identical hormone replacement guides and protocols",
    color: "pink"
  },
  weight_loss: {
    label: "Weight Loss",
    icon: Scale,
    description: "GLP-1 injection tutorials and metabolic optimization",
    color: "green"
  },
  peptide_therapy: {
    label: "Peptide Therapy",
    icon: Syringe,
    description: "Peptide protocols for cellular optimization",
    color: "blue"
  },
  iv_hydration: {
    label: "IV Hydration",
    icon: Droplets,
    description: "IV therapy benefits and preparation guides",
    color: "teal"
  },
  general_wellness: {
    label: "General Wellness",
    icon: Heart,
    description: "Overall health and wellness resources",
    color: "gold"
  },
  injection_tutorials: {
    label: "Injection Tutorials",
    icon: Syringe,
    description: "Step-by-step guides for self-administration",
    color: "blue"
  },
  nutrition_guides: {
    label: "Nutrition Guides",
    icon: BookOpen,
    description: "Optimize your results with proper nutrition",
    color: "green"
  },
  stress_management: {
    label: "Stress Management",
    icon: Heart,
    description: "Techniques for hormonal balance and mental wellness",
    color: "purple"
  },
  billing_payment: {
    label: "Billing & Payment",
    icon: FileText,
    description: "HSA/FSA, insurance, superbills, and membership info",
    color: "gold"
  },
  getting_started: {
    label: "Getting Started",
    icon: BookOpen,
    description: "Your journey from intake to treatment",
    color: "teal"
  }
};

// Built-in interactive FAQ content for each service
const serviceFAQs: Record<string, Array<{ question: string; answer: string }>> = {
  hormone_therapy: [
    {
      question: "How long until I see results from hormone therapy?",
      answer: "Most patients begin noticing improvements in energy, sleep, and mood within 2-4 weeks. Full optimization typically takes 3-6 months as we fine-tune your protocol based on lab results and symptom response."
    },
    {
      question: "Where do I apply my transdermal cream?",
      answer: "Bi-Est (estrogen): Apply to inner thigh or behind knee—areas with thin skin for optimal absorption. Testosterone: Apply to clitoral area for localized effect. Progesterone: Apply to breast or neck area at bedtime. Always wash hands immediately after application."
    },
    {
      question: "What if I experience side effects?",
      answer: "The advantage of transdermal therapy is daily dose adjustment. If you experience any side effects, message your provider immediately through the patient portal. We can adjust your dosing within days, unlike pellet therapy which locks you in for months."
    },
    {
      question: "Do I need to fast for my hormone lab tests?",
      answer: "For LabCorp blood work ordered by your provider, fasting 8-12 hours is recommended when specified on your requisition. Morning collection is typical for baseline panels."
    }
  ],
  weight_loss: [
    {
      question: "How do I inject my GLP-1 medication?",
      answer: "Inject subcutaneously (under the skin) into your abdomen, thigh, or upper arm. Rotate injection sites weekly to prevent lipodystrophy. Inject at the same time each week. Your medication comes in a pre-filled pen—simply dial your dose and inject."
    },
    {
      question: "What should I eat while on GLP-1 therapy?",
      answer: "Focus on protein-first eating (30g protein per meal), plenty of vegetables, and limited processed carbs. GLP-1s reduce appetite, so prioritize nutrient-dense foods. Stay hydrated—aim for half your body weight in ounces of water daily."
    },
    {
      question: "What if I experience nausea?",
      answer: "Nausea is common during dose escalation and typically resolves within 2-4 weeks. Eat smaller, more frequent meals. Avoid fatty or greasy foods. Ginger tea and peppermint can help. If severe, contact your provider—we may slow your titration schedule."
    },
    {
      question: "How much weight can I expect to lose?",
      answer: "Clinical trials show 15-20% body weight loss over 12-18 months with GLP-1 therapy. Results vary based on starting weight, diet adherence, and activity level. Our metabolic optimization approach typically enhances these results."
    }
  ],
  peptide_therapy: [
    {
      question: "How do I reconstitute my peptide?",
      answer: "Using the bacteriostatic water provided, draw the specified amount into your syringe. Inject slowly into the peptide vial, aiming at the glass wall (not directly onto powder). Gently swirl—never shake. Refrigerate after reconstitution. Use within 30 days."
    },
    {
      question: "When should I take Sermorelin?",
      answer: "Inject subcutaneously at bedtime on an empty stomach (2-3 hours after eating). Growth hormone is naturally released during sleep, so bedtime dosing amplifies this effect. Consistency is key—take at the same time daily."
    },
    {
      question: "How long until peptides show results?",
      answer: "NAD+ effects (mental clarity, energy) often within 1-2 weeks. Sermorelin benefits (sleep, recovery, body composition) typically 4-8 weeks. PT-141 works within 1-4 hours per dose. Full optimization may take 3-6 months of consistent use."
    },
    {
      question: "Can I combine peptides with hormone therapy?",
      answer: "Yes! Peptides complement hormone optimization beautifully. Sermorelin supports natural growth hormone while you optimize sex hormones. NAD+ enhances cellular energy alongside metabolic treatments. Your provider will design a synergistic protocol."
    }
  ],
  iv_hydration: [
    {
      question: "How should I prepare for my IV session?",
      answer: "Eat a light meal 1-2 hours before. Wear loose, comfortable clothing with easy arm access. Stay hydrated beforehand. Arrive 10 minutes early to complete intake. Sessions typically last 45-60 minutes—bring a book or headphones."
    },
    {
      question: "How often should I get IV therapy?",
      answer: "For general wellness: monthly. For athletic recovery or illness: weekly during active periods. For hangover recovery: as needed. For chronic conditions: your provider will recommend an optimal schedule based on your goals."
    },
    {
      question: "Are there any side effects?",
      answer: "Most people tolerate IV therapy very well. You may feel a cool sensation as fluids enter. Minor bruising at the injection site is possible. Some report increased urination (your body processing the fluids). Rarely, some feel lightheaded—we monitor you throughout."
    },
    {
      question: "Which IV drip is right for me?",
      answer: "The Meyers: General wellness boost. The Shield: Immunity support (cold season, travel). The Glow: Beauty/skin health. The Resurrection: Hangover/recovery. Beast Mode: Athletic performance. Not sure? Our team can recommend based on your needs."
    }
  ],
  billing_payment: [
    {
      question: "Can I use my HSA or FSA card to pay?",
      answer: "Yes! HSA (Health Savings Account) and FSA (Flexible Spending Account) cards work just like credit cards at checkout. Many of our cash-pay services are eligible expenses—confirm with your plan administrator."
    },
    {
      question: "What is a superbill and how do I use it?",
      answer: "A superbill is an itemized receipt showing the medical services you received, including diagnosis codes (ICD-10) and procedure codes (CPT). You can download your superbill from the patient portal or request one from your provider. Submit it to your insurance for potential out-of-network reimbursement."
    },
    {
      question: "Does insurance cover hormone therapy?",
      answer: "While we don't bill insurance directly, many patients receive partial reimbursement for out-of-network services. We provide superbills with proper medical coding. Hormone therapy is often covered as a medical necessity. Contact your insurance to verify your out-of-network benefits."
    },
    {
      question: "What are the ELEVATED programs?",
      answer:
        "We offer four monthly ELEVATED programs — TRT, HRT, GLP-1, and WELLNESS — each with medication included when prescribed as part of that program, monthly check-ins with our clinical team, quarterly labs, lab review, and unlimited messaging. See elevatedhealthaugusta.com/membership for details.",
    },
    {
      question: "What does 'Everything Included' mean for billing?",
      answer:
        "Your program price covers the clinical bundle described for that tier. Initial Wellness Assessment and baseline labs are paid upfront. We do not use 'pass-through pharmacy' language for medications that are part of your enrolled program.",
    },
    {
      question: "When is my membership renewal date?",
      answer:
        "Your membership renews on the same day each month that you initially enrolled. You can view your renewal date in the Patient Dashboard under 'Membership Summary'. You'll receive an email reminder 3 days before each renewal.",
    },
  ],
  getting_started: [
    {
      question: "What happens after I complete the intake form?",
      answer: "After you submit your intake and symptom questionnaire, our team reviews your information within 24-48 hours. If labs are ordered, we coordinate LabCorp draws in-office at your visit. Results timing depends on the panel ordered."
    },
    {
      question: "How long until I start treatment?",
      answer: "The typical timeline is: Intake (Day 1) → Lab kit arrives (3-5 days) → Complete testing → Results ready (7-10 days) → Provider review (1-2 days) → Treatment authorized → Pharmacy ships (2-3 days). Most patients start treatment within 3 weeks of signing up."
    },
    {
      question: "How do I message my provider?",
      answer: "Use the 'Messages' tab in your Patient Dashboard to send secure messages directly to your care team. We typically respond within 24 hours on business days. For urgent matters, call the clinic directly during office hours."
    },
    {
      question: "How do I track my progress?",
      answer: "Complete the Symptom Check-In on your dashboard weekly (it takes just 2 minutes). This helps your provider see trends over time and adjust your protocol accordingly. You'll also have access to your lab results and Health Report showing your progress."
    }
  ]
};

// Quick reference cards for each service
const quickReferenceCards: Record<string, Array<{ title: string; content: string; highlight?: boolean }>> = {
  hormone_therapy: [
    { title: "Bi-Est (Estrogen)", content: "2 clicks AM/PM to inner thigh or behind knee. Thin skin areas for best absorption.", highlight: true },
    { title: "Testosterone", content: "2 clicks AM to clitoral area. Wash hands immediately after.", highlight: false },
    { title: "Progesterone", content: "2 clicks at bedtime to breast or neck. Promotes deep sleep.", highlight: false }
  ],
  weight_loss: [
    { title: "Injection Day", content: "Same day each week. Rotate sites: abdomen, thigh, arm.", highlight: true },
    { title: "Protein Goal", content: "30g protein per meal. Protein first, then vegetables.", highlight: false },
    { title: "Hydration", content: "Half your body weight in ounces of water daily.", highlight: false }
  ],
  peptide_therapy: [
    { title: "Sermorelin", content: "Bedtime injection on empty stomach. 2-3 hours after eating.", highlight: true },
    { title: "NAD+ Troche", content: "Dissolve under tongue. Do not eat/drink for 15 minutes after.", highlight: false },
    { title: "PT-141", content: "Take 1-4 hours before intimacy. Effects last 24-72 hours.", highlight: false }
  ],
  iv_hydration: [
    { title: "Pre-Session", content: "Eat a light meal 1-2 hours before. Stay hydrated.", highlight: true },
    { title: "During Session", content: "Relax and hydrate. Sessions last 45-60 minutes.", highlight: false },
    { title: "Post-Session", content: "Continue hydrating. Results are immediate.", highlight: false }
  ]
};

// Suggested external resources when database is empty
const suggestedResources: Record<string, Array<{ title: string; description: string; url: string; type: "video" | "article" }>> = {
  hormone_therapy: [
    { title: "Understanding Bio-Identical Hormones", description: "Learn how transdermal hormone therapy works and why it's safer than pills.", url: "https://www.youtube.com/watch?v=2MKNsI5CjKI", type: "video" },
    { title: "Menopause Symptom Relief", description: "What to expect during the first weeks of hormone optimization.", url: "https://www.youtube.com/watch?v=8vNIgPjXPQQ", type: "video" }
  ],
  weight_loss: [
    { title: "GLP-1 Injection Technique", description: "Step-by-step guide to self-injecting Semaglutide or Tirzepatide.", url: "https://www.youtube.com/watch?v=2HqzLgNQpCU", type: "video" },
    { title: "Managing GLP-1 Side Effects", description: "Tips for reducing nausea and optimizing your weight loss journey.", url: "https://www.youtube.com/watch?v=bOOJxMQeRm4", type: "video" }
  ],
  general_wellness: [
    { title: "Sleep and stress foundations", description: "Evidence-based habits that support hormone balance, recovery, and mood.", url: "https://www.youtube.com/watch?v=Jui9L-TY6Ac", type: "video" },
  ],
  peptide_therapy: [
    { title: "How to Reconstitute Peptides", description: "Proper technique for mixing and storing your peptide medications.", url: "https://www.youtube.com/watch?v=1KqD-JaNcug", type: "video" }
  ],
  iv_hydration: [
    { title: "Benefits of IV Therapy", description: "Understanding how IV hydration and vitamin infusions work.", url: "https://www.youtube.com/watch?v=Jui9L-TY6Ac", type: "video" }
  ]
};

const getYouTubeThumbnail = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  }
  return null;
};

const VideoCard = ({ resource }: { resource: Resource }) => {
  const thumbnail = resource.thumbnail_url || getYouTubeThumbnail(resource.url);
  
  const handleClick = () => {
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden border-border/50 hover:border-gold/50 transition-all duration-300 hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <Play className="h-12 w-12 text-primary/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="h-8 w-8 text-primary ml-1" />
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-cormorant text-lg text-foreground mb-1 line-clamp-2">{resource.title}</h3>
        {resource.description && (
          <p className="text-sm text-muted-foreground font-light line-clamp-2">{resource.description}</p>
        )}
      </CardContent>
    </Card>
  );
};

const PDFCard = ({ resource }: { resource: Resource }) => {
  const handleDownload = () => {
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="border-border/50 hover:border-gold/50 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="font-cormorant text-lg text-foreground mb-1 line-clamp-2">{resource.title}</h3>
            {resource.description && (
              <p className="text-sm text-muted-foreground font-light line-clamp-2 mb-3">{resource.description}</p>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              className="text-primary border-primary/30 hover:bg-primary/5"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FAQSection = ({ category }: { category: string }) => {
  const faqs = serviceFAQs[category];
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="font-cormorant text-2xl text-foreground mb-6 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-gold" />
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`faq-${index}`} className="border-border/50">
            <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

const QuickReferenceSection = ({ category }: { category: string }) => {
  const cards = quickReferenceCards[category];
  if (!cards || cards.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="font-cormorant text-2xl text-foreground mb-6 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-gold" />
        Quick Reference
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <Card key={index} className={`${card.highlight ? 'border-gold bg-gold/5' : 'border-border/50'}`}>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const PatientResources = () => {
  const [searchParams] = useSearchParams();
  const serviceFilter = searchParams.get("service");
  
  const [activeTab, setActiveTab] = useState<string>(serviceFilter || "all");

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["patient-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_resources")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Resource[];
    }
  });

  // Map service filter to category
  const categoryMap: Record<string, string> = {
    hormone: "hormone_therapy",
    weight_loss: "weight_loss",
    ketamine: "general_wellness",
    peptides: "peptide_therapy",
    iv_lounge: "iv_hydration"
  };

  const effectiveCategory = activeTab === "all" ? "all" : (categoryMap[activeTab] || activeTab);

  const filteredResources = effectiveCategory === "all" 
    ? resources 
    : resources.filter(r => r.category === effectiveCategory);

  const videos = filteredResources.filter(r => r.resource_type === "video");
  const pdfs = filteredResources.filter(r => r.resource_type === "pdf");

  // Show interactive content for specific service categories
  const showInteractiveContent = effectiveCategory !== "all" && 
    (serviceFAQs[effectiveCategory] || quickReferenceCards[effectiveCategory]);

  const mainCategories = [
    { key: "hormone_therapy", label: "Hormones", icon: Sparkles },
    { key: "weight_loss", label: "Weight Loss", icon: Scale },
    { key: "general_wellness", label: "Wellness", icon: Heart },
    { key: "peptide_therapy", label: "Peptides", icon: Syringe },
    { key: "iv_hydration", label: "IV Therapy", icon: Droplets },
  ];

  return (
    <>
      <Helmet>
        <title>Patient Resources | Elevated Health Augusta</title>
        <meta name="description" content="Educational resources for Elevated Health Augusta patients including injection tutorials, nutrition guides, and stress management techniques." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main>
          {/* Hero Section */}
          <section className="relative py-24 bg-gradient-to-br from-primary via-primary/95 to-[hsl(200,25%,35%)]">
            <div className="container mx-auto px-6 text-center">
              <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                Patient Education
              </p>
              <h1 className="font-cormorant text-white mb-4">
                Patient Resources
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mx-auto font-light">
                Video tutorials, guides, FAQs, and quick references to support your wellness journey
              </p>
            </div>
          </section>

          {/* Resources Section */}
          <section className="section-spacing">
            <div className="container mx-auto px-6">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 justify-center mb-12">
                <Button
                  variant={activeTab === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("all")}
                  className="rounded-full"
                >
                  All Resources
                </Button>
                {mainCategories.map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={activeTab === key || categoryMap[activeTab] === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab(key)}
                    className="rounded-full"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>

              {/* Category Description */}
              {effectiveCategory !== "all" && categoryConfig[effectiveCategory] && (
                <div className="text-center mb-8">
                  <h2 className="font-cormorant text-3xl text-foreground mb-2">
                    {categoryConfig[effectiveCategory].label}
                  </h2>
                  <p className="text-muted-foreground">
                    {categoryConfig[effectiveCategory].description}
                  </p>
                </div>
              )}

              {/* Quick Reference Cards */}
              {showInteractiveContent && <QuickReferenceSection category={effectiveCategory} />}

              {/* Videos & PDFs from Database */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse">
                      <div className="aspect-video bg-muted" />
                      <CardContent className="p-4">
                        <div className="h-5 bg-muted rounded mb-2" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-12 mt-8">
                  {/* Videos Section */}
                  {videos.length > 0 && (
                    <div>
                      <h2 className="font-cormorant text-2xl text-foreground mb-6 flex items-center gap-2">
                        <Play className="h-5 w-5 text-gold" />
                        Video Tutorials
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map(resource => (
                          <VideoCard key={resource.id} resource={resource} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PDFs Section */}
                  {pdfs.length > 0 && (
                    <div>
                      <h2 className="font-cormorant text-2xl text-foreground mb-6 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gold" />
                        Downloadable Guides
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pdfs.map(resource => (
                          <PDFCard key={resource.id} resource={resource} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested External Resources when no database resources */}
                  {filteredResources.length === 0 && effectiveCategory !== "all" && suggestedResources[effectiveCategory] && (
                    <div>
                      <div className="flex items-center gap-2 mb-6">
                        <h2 className="font-cormorant text-2xl text-foreground flex items-center gap-2">
                          <ExternalLink className="h-5 w-5 text-gold" />
                          Recommended Resources
                        </h2>
                        <Badge variant="outline" className="text-xs">External</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {suggestedResources[effectiveCategory].map((resource, idx) => (
                          <Card 
                            key={idx}
                            className="group cursor-pointer overflow-hidden border-border/50 hover:border-gold/50 transition-all duration-300 hover:shadow-lg"
                            onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
                          >
                            <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                              <Play className="h-12 w-12 text-primary/30 group-hover:text-primary/50 transition-colors" />
                              <Badge className="absolute top-2 right-2 text-xs">External Video</Badge>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-cormorant text-lg text-foreground mb-1 line-clamp-2">{resource.title}</h3>
                              <p className="text-sm text-muted-foreground font-light line-clamp-2">{resource.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state only when truly nothing available */}
                  {filteredResources.length === 0 && !showInteractiveContent && (effectiveCategory === "all" || !suggestedResources[effectiveCategory]) && (
                    <div className="text-center py-16">
                      <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="font-cormorant text-2xl text-foreground mb-2">Resources Coming Soon</h3>
                      <p className="text-muted-foreground font-light max-w-md mx-auto">
                        We're adding educational content for this category. In the meantime, check out our FAQ section below or select a specific service category.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* FAQ Section */}
              {showInteractiveContent && <FAQSection category={effectiveCategory} />}

              {/* Contact Card */}
              <Card className="mt-12 bg-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <h3 className="font-cormorant text-xl text-foreground mb-2">Have Questions?</h3>
                  <p className="text-muted-foreground mb-4">
                    Our care team is here to help you understand your treatment.
                  </p>
                  <Button onClick={() => window.location.href = "/patient/dashboard"}>
                    Message Your Provider
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PatientResources;