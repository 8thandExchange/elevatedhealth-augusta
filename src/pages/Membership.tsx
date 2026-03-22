import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FOUNDING_MEMBERSHIP_TIERS, type FoundingMembershipTier } from "@/lib/stripeConfig";

const tierKeys: FoundingMembershipTier[] = ["wellnessPass", "longevityProtocol", "executiveConcierge"];

const Membership = () => {
  const [searchParams] = useSearchParams();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const successTier = searchParams.get("tier");
  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (isSuccess && successTier) {
      const tierConfig = FOUNDING_MEMBERSHIP_TIERS[successTier as FoundingMembershipTier];
      if (tierConfig) {
        toast.success(`Welcome to ${tierConfig.name}! Your founding rate is locked in forever.`);
      }
    }
  }, [isSuccess, successTier]);

  const handleMembershipCheckout = async (tier: FoundingMembershipTier) => {
    setLoadingTier(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-founding-membership-checkout", {
        body: { tier }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Membership checkout error:", err);
      toast.error("Failed to start checkout. Please try again or call us at (706) 760-3470.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Membership | Réveil</title>
        <meta name="description" content="Réveil founding membership — lock in your rate forever. Wellness Pass $149/mo, Longevity Protocol $299/mo, Executive Concierge $549/mo. 25 spots per tier." />
        <link rel="canonical" href="https://reveil.health/membership" />
      </Helmet>
      <div className="min-h-screen">
        <Navbar />
        
        {/* Success Banner */}
        {isSuccess && (
          <div className="bg-green-50 border-b border-green-200 py-4">
            <div className="container mx-auto px-6 flex items-center justify-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="font-jost text-green-800 font-medium">
                Your founding membership is confirmed! Check your email for details.
              </p>
            </div>
          </div>
        )}
        
        <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl text-center">
            <p className="section-label mb-6">Membership</p>
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-tight">
              Medicine that compounds.<br />
              <span className="italic">The longer you're with us, the better you feel.</span>
            </h1>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto" />

        {/* Tiers */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {tierKeys.map((key) => {
                const tier = FOUNDING_MEMBERSHIP_TIERS[key];
                const isPopular = key === "longevityProtocol";
                const isLoading = loadingTier === key;
                
                return (
                  <div
                    key={key}
                    className={`p-8 border ${isPopular ? 'border-accent' : 'border-border/50'} relative`}
                  >
                    {isPopular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-jost text-xs font-medium uppercase tracking-[2.5px] text-accent bg-background px-3">
                        Most Popular
                      </span>
                    )}
                    <h3 className="font-playfair text-xl text-foreground mb-2">{tier.name}</h3>
                    <p className="font-jost text-2xl font-medium text-accent mb-1">{tier.displayPrice}</p>
                    <p className="font-jost text-sm text-muted-foreground line-through mb-6">{tier.standardDisplayPrice}</p>
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((f) => (
                        <li key={f} className="font-jost font-light text-sm text-foreground flex items-start gap-2">
                          <span className="text-accent mt-0.5">—</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => handleMembershipCheckout(key)}
                      disabled={isLoading}
                      className="w-full bg-primary text-accent font-jost font-medium text-sm rounded-sm hover:bg-primary-light"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Claim your founding rate"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
            <p className="font-jost font-light text-sm text-muted-foreground text-center mt-12 max-w-2xl mx-auto">
              Founding member pricing locks in forever for the first 25 members per tier. 
              Once spots fill, pricing returns to standard rates.
            </p>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto" />

        <section className="py-16 md:py-24 bg-background text-center">
          <div className="container mx-auto px-6">
            <Button 
              onClick={() => handleMembershipCheckout("longevityProtocol")}
              disabled={loadingTier === "longevityProtocol"}
              size="lg"
              className="bg-primary text-accent font-jost font-medium tracking-wide text-sm px-10 py-6 rounded-sm hover:bg-primary-light"
            >
              {loadingTier === "longevityProtocol" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Claim your founding rate
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Membership;
