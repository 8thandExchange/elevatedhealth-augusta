/**
 * /medication-confirmed
 *
 * Post-payment landing for compounded medication subscriptions
 * (semaglutide, tirzepatide, GLP-1 starter, GLP-1 continuation).
 *
 * These medications ship from our state-licensed 503A compounding pharmacy; no in-clinic visit is required at the
 * confirmation step, so this page intentionally does not embed a slot
 * picker. Patients see what they paid for, what to expect (kit ships in
 * 5-7 business days, dosing instructions arrive separately), and a
 * direct line to our clinical team if they have questions.
 */
import { Helmet } from "react-helmet";
import { useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Package, Phone, MessageSquare, Calendar, ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";

type MedKey = "semaglutide" | "tirzepatide" | "glp1-continuation" | "glp1_starter";

const MEDICATION_INFO: Record<MedKey, {
  label: string;
  shortName: string;
  category: string;
  cadence: string;
  shipsIn: string;
  whatToExpect: string[];
}> = {
  semaglutide: {
    label: "Compounded Semaglutide",
    shortName: "Semaglutide",
    category: "Medical Weight Loss",
    cadence: "Monthly subscription",
    shipsIn: "5–7 business days",
    whatToExpect: [
      "Refrigerated, direct-ship from our state-licensed 503A compounding pharmacy",
      "Patient-specific compounded under 503A pharmacy authority",
      "Our clinical team reaches out within 2 business days to confirm titration schedule and answer questions",
    ],
  },
  tirzepatide: {
    label: "Compounded Tirzepatide",
    shortName: "Tirzepatide",
    category: "Medical Weight Loss",
    cadence: "Monthly subscription",
    shipsIn: "5–7 business days",
    whatToExpect: [
      "Refrigerated, direct-ship from our state-licensed 503A compounding pharmacy",
      "Patient-specific compounded under 503A pharmacy authority",
      "Our clinical team reaches out within 2 business days to confirm titration schedule and answer questions",
    ],
  },
  "glp1-continuation": {
    label: "GLP-1 Continuation",
    shortName: "GLP-1 Refill",
    category: "Medical Weight Loss",
    cadence: "Monthly continuation",
    shipsIn: "5–7 business days",
    whatToExpect: [
      "Refrigerated refill ships direct from our compounding pharmacy",
      "Same dose tier as your previous month unless your physician adjusted",
      "Reach out if your titration schedule changes — refills can be paused at any time",
    ],
  },
  glp1_starter: {
    label: "GLP-1 Starter",
    shortName: "GLP-1 Starter",
    category: "Medical Weight Loss",
    cadence: "Starter dose, monthly thereafter",
    shipsIn: "5–7 business days",
    whatToExpect: [
      "Refrigerated, direct-ship from our state-licensed 503A compounding pharmacy",
      "Begin at your starter dose; titration is supervised by your physician",
      "Our clinical team reaches out within 2 business days to confirm your start date and answer questions",
    ],
  },
};

const isMedKey = (v: string | null): v is MedKey =>
  !!v && (v === "semaglutide" || v === "tirzepatide" || v === "glp1-continuation" || v === "glp1_starter");

const MedicationConfirmed = () => {
  const [searchParams] = useSearchParams();
  const medParam = searchParams.get("med");

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const med = useMemo(() => (isMedKey(medParam) ? MEDICATION_INFO[medParam] : null), [medParam]);

  return (
    <>
      <Helmet>
        <title>Order Confirmed | {SITE_CONFIG.clinicName}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="public-page-shell">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <CheckCircle2 className="h-8 w-8 text-accent" />
              </div>
              <p className="section-label mb-3">{med?.category ?? "Order"}</p>
              <h1 className="font-playfair text-3xl md:text-4xl text-foreground mb-3">
                Order confirmed.
              </h1>
              {med ? (
                <p className="font-jost font-light text-lg text-muted-foreground max-w-xl mx-auto">
                  Your <span className="text-foreground font-medium">{med.label}</span> subscription
                  is active. A receipt is on its way to your inbox.
                </p>
              ) : (
                <p className="font-jost font-light text-lg text-muted-foreground max-w-xl mx-auto">
                  Your subscription is active. A receipt is on its way to your inbox.
                </p>
              )}
            </div>

            {med && (
              <Card className="border-accent/30 mb-6">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <Package className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="font-jost text-xs uppercase tracking-[2.5px] text-muted-foreground mb-1">
                        Ships in
                      </p>
                      <p className="font-playfair text-2xl text-foreground mb-3">{med.shipsIn}</p>
                      <p className="font-jost font-light text-sm text-muted-foreground">
                        {med.cadence}. Refrigerated direct-ship from our state-licensed 503A compounding pharmacy.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {med && (
              <Card className="mb-6">
                <CardContent className="p-6 md:p-8">
                  <h2 className="font-playfair text-xl text-foreground mb-4">What happens next</h2>
                  <ul className="space-y-3 font-jost font-light text-foreground">
                    {med.whatToExpect.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="font-playfair italic text-accent mt-0.5 w-6 flex-shrink-0">
                          0{i + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card className="bg-secondary/30 mb-8">
              <CardContent className="p-6 md:p-8">
                <h3 className="font-playfair text-lg text-foreground mb-3">
                  Questions, dose changes, or anything urgent?
                </h3>
                <p className="font-jost font-light text-sm text-muted-foreground mb-4">
                  Reach our clinical team directly. Members get same-day SMS response during clinic hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => window.location.assign(`tel:${SITE_CONFIG.phoneRaw}`)}
                    className="font-jost"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {SITE_CONFIG.phone}
                  </Button>
                  <Button variant="outline" asChild className="font-jost">
                    <Link to="/patient/dashboard">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Open patient portal
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="font-jost font-medium tracking-wide text-sm px-8 py-6 rounded-sm">
                <Link to="/patient/dashboard">
                  Go to your dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="font-jost font-medium tracking-wide text-sm px-8 py-6 rounded-sm">
                <Link to="/membership">
                  <Calendar className="mr-2 h-4 w-4" />
                  Learn about Elevated Membership
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default MedicationConfirmed;
