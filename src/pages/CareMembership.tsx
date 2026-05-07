import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type TierKey = "hormone" | "hormone_injection" | "peptide" | "full";

const TIERS: Array<{
  key: TierKey;
  name: string;
  price: string;
  bestFor: string;
  features: string[];
  popular?: boolean;
}> = [
  {
    key: "hormone",
    name: "Hormone Care",
    price: "$149",
    bestFor: "Transdermal cream patients (estradiol, progesterone, testosterone cream)",
    features: [
      "Unlimited in-clinic visits",
      "All visit supplies included",
      "Lab draw / phlebotomy fee included",
      "Provider messaging & dose adjustments",
      "Home delivery for creams & oral protocols",
    ],
  },
  {
    key: "hormone_injection",
    name: "Hormone + Injection",
    price: "$249",
    bestFor: "Men on testosterone cypionate, women on injectable estradiol",
    popular: true,
    features: [
      "Everything in Hormone Care",
      "Unlimited weekly RN-administered injections",
      "All injection supplies (syringes, needles, sharps, prep)",
      "Bulk-sourced medication pricing",
      "Priority weekly scheduling",
    ],
  },
  {
    key: "peptide",
    name: "Peptide Performance",
    price: "$299",
    bestFor: "BPC-157, CJC/Ipamorelin, GHK-Cu, Tesamorelin patients",
    features: [
      "Unlimited in-clinic peptide injections",
      "All peptide titration & dose adjustment",
      "All injection supplies included",
      "Lab draws included",
      "Performance & recovery tracking",
    ],
  },
  {
    key: "full",
    name: "Full Optimization",
    price: "$449",
    bestFor: "Hormone + Peptide combined",
    features: [
      "Everything in Hormone + Injection",
      "Everything in Peptide Performance",
      "Priority same-week scheduling",
      "Quarterly comprehensive review",
      "Best total value",
    ],
  },
];

const CareMembership = () => {
  const [searchParams] = useSearchParams();
  const [loadingTier, setLoadingTier] = useState<TierKey | null>(null);
  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (isSuccess) toast.success("Welcome to your Care Membership! Check your email for next steps.");
  }, [isSuccess]);

  const handleEnroll = async (tier: TierKey) => {
    setLoadingTier(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-care-membership-checkout", {
        body: { tier },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else throw new Error("No checkout URL returned");
    } catch (err) {
      console.error(err);
      toast.error("Could not start checkout. Please try again or call (706) 760-3470.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Care Membership | Elevated Health Augusta</title>
        <meta name="description" content="Care Membership covers unlimited in-clinic injection visits, supplies, and lab draws. Medication and lab fees billed transparently at cost." />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/care-membership" />
      </Helmet>
      <div className="min-h-screen">
        <Navbar />

        {isSuccess && (
          <div className="bg-green-50 border-b border-green-200 py-4">
            <div className="container mx-auto px-6 flex items-center justify-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="font-jost text-green-800 font-medium">
                Membership active. Watch your inbox for scheduling instructions.
              </p>
            </div>
          </div>
        )}

        <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl text-center">
            <p className="section-label mb-6">Care Membership</p>
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
              One flat monthly fee.<br/>
              <span className="italic">Unlimited care visits.</span>
            </h1>
            <p className="font-jost font-light text-lg text-muted-foreground">
              Your membership covers every visit, every supply, every lab draw.
              Medication and lab panels are billed separately at transparent cost — no markups, no surprises.
            </p>
          </div>
        </section>

        {/* Whats included vs separate */}
        <section className="pb-12 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-accent/40 p-8">
                <h3 className="font-playfair text-2xl text-foreground mb-4">Included in your membership</h3>
                <ul className="space-y-3 font-jost font-light text-foreground">
                  {[
                    "Unlimited in-clinic injection & follow-up visits",
                    "All clinical supplies during visits",
                    "Lab draw / phlebotomy fee",
                    "Provider messaging & dose adjustments",
                    "Home delivery coordination for creams",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-border p-8 bg-secondary/30">
                <h3 className="font-playfair text-2xl text-foreground mb-4">Billed separately at cost</h3>
                <ul className="space-y-3 font-jost font-light text-foreground">
                  <li>— Medication (compound creams, GLP-1, peptide vials)</li>
                  <li>— Lab panel costs (LabCorp / ZRT)</li>
                  <li>— MD escalation visits ($149)</li>
                  <li>— One-time Hormone Mapping Kit ($250)</li>
                </ul>
                <p className="font-jost text-sm text-muted-foreground mt-6 italic">
                  We pass medication and lab fees through at our actual cost. You see the invoice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tiers */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {TIERS.map((tier) => {
                const isLoading = loadingTier === tier.key;
                return (
                  <div key={tier.key} className={`p-8 border ${tier.popular ? "border-accent" : "border-border/50"} relative bg-background flex flex-col`}>
                    {tier.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-jost text-xs font-medium uppercase tracking-[2.5px] text-accent bg-background px-3">
                        Most Popular
                      </span>
                    )}
                    <h3 className="font-playfair text-xl text-foreground mb-2">{tier.name}</h3>
                    <p className="font-jost text-3xl font-medium text-accent mb-1">{tier.price}<span className="text-base text-muted-foreground">/mo</span></p>
                    <p className="font-jost text-xs text-muted-foreground mb-6 min-h-[3rem]">{tier.bestFor}</p>
                    <ul className="space-y-2 mb-8 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="font-jost font-light text-sm text-foreground flex items-start gap-2">
                          <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleEnroll(tier.key)}
                      disabled={isLoading}
                      className="w-full bg-primary text-accent font-jost font-medium text-sm rounded-sm hover:bg-primary-light"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enroll"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-20 bg-secondary/20">
          <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
            <h2 className="font-playfair text-3xl md:text-4xl text-foreground text-center mb-12">How your membership works</h2>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              {[
                { n: "1", t: "Initial labs", d: "Hormone Mapping Kit ($250) or LabCorp panel" },
                { n: "2", t: "Protocol set", d: "MD establishes your care plan" },
                { n: "3", t: "Membership starts", d: "Schedule your weekly in-clinic visit" },
                { n: "4", t: "Refills auto-ship", d: "Creams & oral protocols delivered home" },
              ].map((s) => (
                <div key={s.n}>
                  <div className="font-playfair text-3xl text-accent mb-2">{s.n}</div>
                  <h4 className="font-jost font-medium text-foreground mb-1">{s.t}</h4>
                  <p className="font-jost font-light text-sm text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <h2 className="font-playfair text-3xl md:text-4xl text-foreground text-center mb-10">Frequently asked</h2>
            <div className="space-y-6">
              {[
                { q: "Why not include medication in the price?", a: "Pharmacy costs vary patient by patient. Bundling them would force everyone to subsidize the most expensive compounds. Pass-through pricing keeps your bill honest and your membership predictable." },
                { q: "Can I take injections home?", a: "We administer injectables in clinic to keep your dose, sharps disposal, and tracking clean. Transdermal creams and oral protocols ship to your home." },
                { q: "What if I miss a week?", a: "No penalty. Members get unlimited visits — come when it works for your schedule." },
                { q: "Can I cancel anytime?", a: "Yes. Month-to-month, no annual contract. Medication you've already received is yours." },
              ].map((f) => (
                <div key={f.q} className="border-b border-border pb-6">
                  <h4 className="font-playfair text-lg text-foreground mb-2">{f.q}</h4>
                  <p className="font-jost font-light text-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default CareMembership;
