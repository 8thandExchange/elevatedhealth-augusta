import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRight, Phone, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { filterVisibleVisitReasons } from "@/lib/serviceConfig";

const ALL_VISIT_REASONS: { id: string; label: string }[] = [
  { id: "hormone", label: "Hormone optimization (HRT/TRT)" },
  { id: "weight_loss", label: "Weight loss (GLP-1 therapy)" },
  { id: "peptide", label: "Peptide therapy" },
  { id: "iv", label: "IV therapy / wellness drips" },
  { id: "sexual_wellness", label: "Sexual wellness" },
  { id: "hair_restoration", label: "Hair restoration" },
  { id: "general_wellness", label: "General wellness / longevity" },
  { id: "exploring", label: "Just exploring" },
];

const Consult = () => {
  const visitReasons = filterVisibleVisitReasons(ALL_VISIT_REASONS);
  const [selectedReasons, setSelectedReasons] = useState<Set<string>>(new Set());
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const toggleReason = (id: string, checked: boolean) => {
    setSelectedReasons((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleContinueToCheckout = async () => {
    const reasons = [...selectedReasons];
    trackEvent("consultation_booking_click", {
      source: "consult_page",
      reasons,
      serviceType: "wellness_assessment",
    });
    setCheckoutLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-consultation-checkout", {
        body: { serviceType: "wellness_assessment", reasons },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(`Unable to start checkout. Please call us at ${SITE_CONFIG.phone} to schedule.`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Book Your $79 Wellness Assessment | Elevated Health Augusta</title>
        <meta
          name="description"
          content="Book your $79 Wellness Assessment at Elevated Health Augusta. One in-person visit to align on goals, history, and next steps for consult-gated care."
        />
      </Helmet>
      <Navbar />

      <main className="flex-1 pt-40 pb-16 px-4 bg-background">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <p className="section-label mb-4">Wellness Assessment</p>
            <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-4">
              Book Your $79 Wellness Assessment
            </h1>
            <p className="font-jost font-light text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              30-minute in-person visit at Elevated Health Augusta (Evans, GA) to review your goals,
              health history, and labs, and design your personalized treatment plan.
            </p>
            <p className="font-jost text-xs text-muted-foreground/80 max-w-2xl mx-auto mt-4">
              Need a physician evaluation for prescription therapies? We&apos;ll schedule the MD visit
              ($149) after your assessment if clinically appropriate.
            </p>
          </div>

          <div className="max-w-2xl mx-auto rounded-2xl border border-border/60 bg-card/80 p-6 md:p-10 shadow-sm">
            <div className="mb-6">
              <p className="text-base font-jost font-medium text-foreground">
                What&apos;s bringing you in? (optional)
              </p>
              <p className="text-sm text-muted-foreground font-jost mt-2">
                Help us prepare for your visit. You can skip this and we&apos;ll cover it in the assessment.
              </p>
            </div>

            <div
              className={cn(
                "grid gap-3 mb-8",
                "grid-cols-1 sm:grid-cols-2",
              )}
            >
              {visitReasons.map(({ id, label }) => (
                <div
                  key={id}
                  className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/15 px-3 py-3"
                >
                  <Checkbox
                    id={`consult-reason-${id}`}
                    checked={selectedReasons.has(id)}
                    onCheckedChange={(v) => toggleReason(id, v === true)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={`consult-reason-${id}`}
                    className="text-sm font-jost font-normal text-foreground leading-snug cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>

            <Button
              type="button"
              disabled={checkoutLoading}
              className="w-full bg-primary text-accent font-jost font-medium rounded-sm hover:bg-primary-light py-6 text-base"
              onClick={handleContinueToCheckout}
            >
              {checkoutLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Continue to Checkout — $79
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-[10px] sm:text-xs text-muted-foreground font-jost text-center leading-snug mt-4 px-1">
              Paid upfront. Not a deposit or credit. Refund policy: full refund if canceled 24+ hours in advance.
            </p>
          </div>

          <div className="mt-12 text-center">
            <p className="font-jost text-muted-foreground inline-flex items-center justify-center gap-2 flex-wrap">
              <Phone className="h-4 w-4 text-accent shrink-0" />
              <span>
                Questions? Call us at{" "}
                <a
                  href={`tel:${SITE_CONFIG.phoneRaw}`}
                  className="text-accent font-medium hover:underline"
                >
                  {SITE_CONFIG.phone}
                </a>
              </span>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Consult;
