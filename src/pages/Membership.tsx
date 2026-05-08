import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ELEVATED_MEMBERSHIP, SITE_CONFIG } from "@/lib/siteConfigCompat";

// Pricing constants — keep in lock-step with stripeConfig.ts and the storefronts.
const PRICE_CONSULT = "$79";
const PRICE_PANEL_FROM = "$245";
const PRICE_PANEL_MEMBER_FROM = "$195";
const PRICE_MEMBERSHIP = "$199";

const INCLUDED = [
  "Unlimited weekly clinic visits",
  "All in-office supplies (syringes, needles, sharps disposal)",
  "Member-rate labs (~40% off à la carte; $50 off named panels)",
  "Dedicated SMS line to your care lead",
  "Full patient portal access",
  "15% off IV add-ons at the IV Lounge",
  "Priority booking",
  "Quarterly physician check-in",
];

const EXCLUDED = [
  { l: "Compounded medications", d: "Billed separately at FCC cost-plus — typically $40–$200/mo" },
  { l: "Initial consultation", d: "$79 one-time, credited toward your first protocol" },
  { l: "Lab panels", d: "Billed at member rates when drawn on-site" },
  { l: "Brand-name pharmacy prescriptions", d: "Paid directly at your retail pharmacy" },
];

const FAQ = [
  { q: "Is the membership month-to-month or annual?", a: "Month-to-month. No annual contract, no cancellation fee. You can pause or cancel any time before your next billing date." },
  { q: "Can I pause my membership?", a: "Yes — for travel, medical leave, or any reason. We hold your member rate while paused; coverage resumes when you reactivate." },
  { q: "What if I'm on multiple programs (hormones + peptides + weight loss)?", a: "One $199 membership covers visits across every program you're on. We don't stack membership fees per service." },
  { q: "Why aren't medications included in the price?", a: "Pharmacy costs vary patient-by-patient. Bundling them would force everyone to subsidize the most expensive compounds. Pass-through cost-plus pricing keeps your bill honest and the membership fee predictable." },
  { q: "Can I share the membership with a spouse?", a: "Memberships are individual. We offer a household discount when two members enroll together — ask Caroline at your consultation." },
  { q: "What's the cancellation policy?", a: "Cancel any time before your next billing date — no penalty. Medication you've already received is yours; pending refills are paused." },
];

const HOW_IT_WORKS = [
  { n: "01", t: "Initial labs", d: "Drawn on-site or via Hormone Mapping Kit at your $79 consult." },
  { n: "02", t: "Protocol set", d: "Your physician establishes a personalized care plan." },
  { n: "03", t: "Membership starts", d: "Schedule your weekly in-clinic visit cadence." },
  { n: "04", t: "Refills auto-ship", d: "Compounded creams and oral protocols delivered home." },
];

const Membership = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    if (isSuccess) toast.success("Welcome to Elevated Membership! Watch your inbox for scheduling instructions.");
  }, [isSuccess]);

  const handleEnroll = async () => {
    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-elevated-membership-checkout");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else throw new Error("No checkout URL returned");
    } catch (err) {
      console.error(err);
      toast.error("Could not start checkout. Members enroll after their consultation — please book your $79 consult and Caroline will set you up.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Elevated Membership — $199/mo | Elevated Health Augusta</title>
        <meta name="description" content="One membership. Everything that matters. $199/month covers unlimited weekly visits, in-office supplies, member-rate labs, and quarterly physician check-in." />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/membership" />
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

        {/* HERO — Pattern A */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-4xl text-center">
            <p className="section-label mb-6">Elevated Membership</p>
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-tight">
              One membership. Everything that matters.<br />
              <span className="italic">{PRICE_MEMBERSHIP}/month.</span>
            </h1>
            <p className="font-jost font-light text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Unlimited weekly visits. Member-rate labs. Compounded medications at cost-plus.
              Quarterly physician check-in. Direct line to your care lead.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.open(SITE_CONFIG.bookingUrl, "_blank")}
                className="bg-primary text-accent font-jost font-medium tracking-wide text-sm px-8 py-6 rounded-sm hover:bg-primary-light"
              >
                Become a member
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => window.open(SITE_CONFIG.bookingUrl, "_blank")}
                variant="outline"
                className="font-jost font-medium tracking-wide text-sm px-8 py-6 rounded-sm"
              >
                Schedule your {PRICE_CONSULT} consultation
              </Button>
            </div>
            <p className="font-jost text-xs text-muted-foreground mt-6 italic">
              Members enroll after their consultation and lab review — your physician confirms fit before billing starts.
            </p>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto" />

        {/* PRICING STRIP — Pattern B */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { l: "Initial Consultation", p: PRICE_CONSULT, sub: "credited toward your protocol" },
                { l: "Lab Panel", p: `from ${PRICE_PANEL_FROM}`, sub: `members from ${PRICE_PANEL_MEMBER_FROM}` },
                { l: "Elevated Membership", p: `${PRICE_MEMBERSHIP}/mo`, sub: "ongoing care, supplies, member labs" },
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

        {/* WHAT'S INCLUDED + WHAT'S NOT */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
            <h2 className="font-playfair text-3xl md:text-4xl text-foreground text-center mb-12">
              What your membership covers
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-accent/40 p-8 bg-background">
                <h3 className="font-playfair text-2xl text-foreground mb-4">Included in your {PRICE_MEMBERSHIP}/mo</h3>
                <ul className="space-y-3 font-jost font-light text-foreground">
                  {INCLUDED.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-border p-8 bg-secondary/30">
                <h3 className="font-playfair text-2xl text-foreground mb-4">Billed separately at cost</h3>
                <ul className="space-y-4 font-jost font-light text-foreground">
                  {EXCLUDED.map((e) => (
                    <li key={e.l}>
                      <p className="font-medium">— {e.l}</p>
                      <p className="text-sm text-muted-foreground ml-3">{e.d}</p>
                    </li>
                  ))}
                </ul>
                <p className="font-jost text-sm text-muted-foreground mt-6 italic">
                  We pass medication and lab fees through at our actual cost. You see the invoice.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto" />

        {/* PRICING TRANSPARENCY — Pattern E */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <h2 className="font-playfair text-3xl md:text-4xl text-foreground text-center mb-12">
              What does a typical month look like?
            </h2>
            <div className="border border-border/60 p-8 bg-secondary/20 font-jost text-foreground">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-border/60 pb-3">
                  <span>Elevated Membership</span>
                  <span className="font-medium whitespace-nowrap">{PRICE_MEMBERSHIP}/mo</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-3">
                  <span>Compounded medication (varies by protocol)</span>
                  <span className="font-medium whitespace-nowrap">$40–$200/mo</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-muted-foreground">Typical total ongoing month</span>
                  <span className="font-medium text-foreground whitespace-nowrap">~$240–$400/mo</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-6 italic">
                Initial month adds the {PRICE_CONSULT} consult and your selected lab panel.
                We never mark up medications or labs.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16 md:py-20 bg-secondary/20">
          <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
            <h2 className="font-playfair text-3xl md:text-4xl text-foreground text-center mb-12">
              How your membership works
            </h2>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              {HOW_IT_WORKS.map((s) => (
                <div key={s.n}>
                  <div className="font-playfair text-3xl text-accent mb-2">{s.n}</div>
                  <h4 className="font-jost font-medium text-foreground mb-1">{s.t}</h4>
                  <p className="font-jost font-light text-sm text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider max-w-5xl mx-auto" />

        {/* FAQ — Pattern F */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <h2 className="font-playfair text-3xl md:text-4xl text-foreground text-center mb-10">
              Frequently asked
            </h2>
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
                onClick={() => window.open(SITE_CONFIG.bookingUrl, "_blank")}
                className="bg-primary text-accent font-jost font-medium tracking-wide text-sm px-10 py-6 rounded-sm hover:bg-primary-light"
              >
                Schedule your {PRICE_CONSULT} consultation
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
            {/* Existing-patient direct enroll path (post-consult) */}
            <button
              onClick={handleEnroll}
              disabled={isCheckingOut}
              className="mt-8 font-jost text-xs text-muted-foreground underline underline-offset-4 hover:text-accent disabled:opacity-50"
            >
              {isCheckingOut ? <Loader2 className="h-3 w-3 animate-spin inline" /> : "Already a patient? Enroll now →"}
            </button>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Membership;
