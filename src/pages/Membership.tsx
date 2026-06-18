import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SITE_CONFIG } from "@/lib/siteConfig";
import ConsultationModal from "@/components/ConsultationModal";
import { CORE_SERVICES, ELEVATED_PROGRAMS } from "@/lib/stripeConfig";
import { EverythingIncludedPillars } from "@/components/marketing/EverythingIncludedPillars";
import { MembershipComparison } from "@/components/marketing/MembershipComparison";
import { StorefrontStepCards } from "@/components/marketing/StorefrontStepCards";
import { StorefrontSectionHeader } from "@/components/marketing/StorefrontSectionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PRICE_CONSULT = CORE_SERVICES.wellnessAssessment.displayPrice;
const PRICE_PANEL = CORE_SERVICES.comprehensivePanel.displayPrice;

const PROGRAM_ROWS = [
  {
    key: "trt" as const,
    program: ELEVATED_PROGRAMS.trt,
    href: "/hormones-men",
    blurb: "Testosterone replacement and male hormone optimization.",
  },
  {
    key: "hrt" as const,
    program: ELEVATED_PROGRAMS.hrt,
    href: "/hormones-women",
    blurb: "Bioidentical hormone therapy and female hormone optimization.",
  },
  {
    key: "glp1" as const,
    program: ELEVATED_PROGRAMS.glp1,
    href: "/weightloss",
    blurb: "Medical weight loss with compounded GLP-1 therapy when prescribed.",
  },
  {
    key: "wellness" as const,
    program: ELEVATED_PROGRAMS.wellness,
    href: "/peptides",
    blurb: "IV benefit, 20% off eligible à la carte services, and bundled access for non-Rx-forward care.",
  },
];

const SHARED_INCLUDES = [
  "Medication included when prescribed as part of your selected ELEVATED program",
  "Monthly check-in with our clinical team and unlimited secure messaging",
  "Quarterly labs and lab review included in program pricing",
  "Priority scheduling and in-clinic coordination at Evans",
];

const FAQ = [
  {
    q: "Is the membership month-to-month or annual?",
    a: "Month-to-month. No annual contract, no cancellation fee. You can pause or cancel any time before your next billing date.",
  },
  {
    q: "Can I pause my membership?",
    a: "Yes — for travel, medical leave, or any reason. We hold your program rate while paused; coverage resumes when you reactivate.",
  },
  {
    q: "What if I'm on multiple programs (hormones + peptides + weight loss)?",
    a: "You enroll in the ELEVATED program that matches your primary protocol. Your clinician may coordinate add-ons; we do not stack duplicate program fees for the same episode of care without a clinical reason.",
  },
  {
    q: "How do prescriptions and refills work?",
    a: "Program memberships bundle prescribed therapy for what's in your plan—no separate pharmacy invoice for medications included in that program. Items outside your program (for example retail pharmacy brands) may still be paid at the pharmacy counter.",
  },
  {
    q: "Can I share the membership with a spouse?",
    a: "Memberships are individual. We offer a household discount when two members enroll together — ask our clinical team at your Wellness Assessment.",
  },
  {
    q: "What's the cancellation policy?",
    a: "Cancel any time before your next billing date — no penalty. Medication you've already received is yours; pending refills follow clinical and pharmacy policy.",
  },
];

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Wellness Assessment",
    body: `In-person visit at Evans (${PRICE_CONSULT}) to align on goals and clinical fit.`,
  },
  { n: "02", title: "Labs & review", body: "On-site LabCorp draws when ordered; your physician reviews and sets your plan." },
  { n: "03", title: "Program enrollment", body: "Subscribe to the ELEVATED program that matches your protocol." },
  {
    n: "04",
    title: "Ongoing care",
    body: "Quarterly labs, check-ins, messaging, and adjustments with predictable monthly pricing for what's bundled.",
  },
];

const Membership = () => {
  const [searchParams] = useSearchParams();
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [compareTab, setCompareTab] = useState<"trt" | "hrt" | "glp1" | "wellness">("trt");
  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (isSuccess) toast.success("Welcome! Watch your inbox for scheduling instructions.");
  }, [isSuccess]);

  const openConsult = () => setIsConsultModalOpen(true);

  return (
    <>
      <Helmet>
        <title>ELEVATED Programs — Transparent Monthly Care | Elevated Health Augusta</title>
        <meta
          name="description"
          content="ELEVATED TRT, HRT, GLP-1, and WELLNESS programs bundle medication when prescribed, quarterly labs, check-ins, and messaging — one transparent monthly price."
        />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/membership" />
      </Helmet>
      <div className="public-page-shell">
        <Navbar />

        {isSuccess && (
          <div className="bg-green-50 border-b border-green-200 py-4">
            <div className="container mx-auto px-6 flex items-center justify-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="font-jost text-green-800 font-medium">
                Program active. Watch your inbox for scheduling instructions.
              </p>
            </div>
          </div>
        )}

        {/* HERO — Pattern A */}
        <section className="min-h-[88vh] md:min-h-[90vh] flex items-center bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-4xl text-center py-28 md:py-36">
            <p className="section-label mb-6 md:mb-8">ELEVATED Programs</p>
            <h1 className="font-playfair text-6xl md:text-7xl lg:text-8xl text-foreground mb-8 md:mb-10 leading-[1.05]">
              Real medicine, real local care,{" "}
              <span className="italic">one transparent monthly price.</span>
            </h1>
            <p className="font-jost font-light text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Four ELEVATED programs — each bundles medication when prescribed, monthly check-ins, quarterly labs, lab
              review, and unlimited messaging. Initial Wellness Assessment and baseline labs are paid upfront; then
              predictable membership pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={openConsult}
                className="font-jost font-medium tracking-wide text-sm px-8 py-6 rounded-sm"
              >
                Book a {PRICE_CONSULT} Wellness Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                asChild
                variant="outline"
                className="font-jost font-medium tracking-wide text-sm px-8 py-6 rounded-sm"
              >
                <a href={`tel:${SITE_CONFIG.phoneRaw}`}>Call {SITE_CONFIG.phone}</a>
              </Button>
            </div>
            <p className="font-jost text-xs text-muted-foreground mt-6 italic max-w-xl mx-auto">
              Program enrollment happens during or after your Wellness Assessment once your physician has evaluated
              fit. Enrollment is medically gated — there is no shortcut, and that is intentional.
            </p>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto" />

        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
            <EverythingIncludedPillars intro="Every ELEVATED tier follows the same clinical rhythm; only the clinical focus and bundled medication change." />
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto" />

        {/* Program cards */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
            <h2 className="font-playfair text-3xl md:text-4xl text-foreground text-center mb-12">Choose your program</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {PROGRAM_ROWS.map(({ key, program, href, blurb }) => (
                <div key={key} className="border border-border/60 p-6 bg-secondary/20 flex flex-col text-left">
                  <p className="section-label mb-2">{program.name}</p>
                  <p className="font-playfair text-3xl text-accent mb-3">{program.displayPrice}</p>
                  <p className="font-jost font-light text-sm text-muted-foreground mb-6 flex-1">{blurb}</p>
                  <ul className="space-y-2 mb-6 font-jost text-sm text-foreground">
                    {SHARED_INCLUDES.map((line) => (
                      <li key={line} className="flex gap-2">
                        <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="font-jost w-full sm:w-auto">
                    <Link to={href}>View details</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto" />

        {/* Comparison tabs */}
        <section className="py-16 md:py-20 bg-muted/20">
          <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
            <h2 className="font-playfair text-3xl text-foreground text-center mb-8">Program vs. à la carte</h2>
            <Tabs value={compareTab} onValueChange={(v) => setCompareTab(v as typeof compareTab)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto flex-wrap gap-1">
                <TabsTrigger value="trt" className="font-jost text-xs md:text-sm">
                  {ELEVATED_PROGRAMS.trt.name}
                </TabsTrigger>
                <TabsTrigger value="hrt" className="font-jost text-xs md:text-sm">
                  {ELEVATED_PROGRAMS.hrt.name}
                </TabsTrigger>
                <TabsTrigger value="glp1" className="font-jost text-xs md:text-sm">
                  {ELEVATED_PROGRAMS.glp1.name}
                </TabsTrigger>
                <TabsTrigger value="wellness" className="font-jost text-xs md:text-sm">
                  {ELEVATED_PROGRAMS.wellness.name}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="trt" className="mt-8">
                <MembershipComparison program="trt" />
              </TabsContent>
              <TabsContent value="hrt" className="mt-8">
                <MembershipComparison program="hrt" />
              </TabsContent>
              <TabsContent value="glp1" className="mt-8">
                <MembershipComparison program="glp1" />
              </TabsContent>
              <TabsContent value="wellness" className="mt-8">
                <MembershipComparison program="wellness" />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto" />

        {/* PRICING STRIP — Pattern B */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { l: "Wellness Assessment", p: PRICE_CONSULT, sub: "RN intake, in-person at Evans" },
                { l: CORE_SERVICES.comprehensivePanel.name, p: PRICE_PANEL, sub: "drawn on-site, processed by LabCorp" },
                {
                  l: "ELEVATED programs",
                  p: `${ELEVATED_PROGRAMS.trt.displayPrice} – ${ELEVATED_PROGRAMS.wellness.displayPrice}`,
                  sub: "Select the program that matches your protocol",
                },
              ].map((item) => (
                <div key={item.l} className="border border-border/60 p-6 text-center bg-background">
                  <p className="font-jost text-xs uppercase tracking-[2.5px] text-muted-foreground mb-3">{item.l}</p>
                  <p className="font-playfair text-3xl text-accent mb-2">{item.p}</p>
                  <p className="font-jost font-light text-sm text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto" />

        <section className="section-band-surface">
          <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
            <StorefrontSectionHeader label="Enrollment" title="How enrollment works" />
            <StorefrontStepCards steps={HOW_IT_WORKS} />
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto" />

        {/* FAQ — Pattern F */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <h2 className="font-playfair text-3xl md:text-4xl text-foreground text-center mb-10">Frequently asked</h2>
            <div className="space-y-6">
              {FAQ.map((f) => (
                <div key={f.q} className="border-b border-border pb-6">
                  <h4 className="font-playfair text-lg text-foreground mb-2">{f.q}</h4>
                  <p className="font-jost font-light text-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto" />

        {/* CLOSING CTA — Pattern G */}
        <section className="py-16 md:py-24 bg-background text-center">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-8">Ready to start?</h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={openConsult}
                className="font-jost font-medium tracking-wide text-sm px-10 py-6 rounded-sm"
              >
                Book a {PRICE_CONSULT} Wellness Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => window.location.assign(`tel:${SITE_CONFIG.phoneRaw}`)}
                variant="outline"
                className="font-jost font-medium tracking-wide text-sm px-10 py-6 rounded-sm"
              >
                {SITE_CONFIG.phone}
              </Button>
            </div>
            <p className="mt-6 font-jost text-xs text-muted-foreground max-w-md mx-auto">
              Already a patient? Talk to our clinical team at your next visit — they will confirm the right time to enroll based
              on your protocol.
            </p>
          </div>
        </section>

        <Footer />

        <ConsultationModal isOpen={isConsultModalOpen} onClose={() => setIsConsultModalOpen(false)} />
      </div>
    </>
  );
};

export default Membership;
