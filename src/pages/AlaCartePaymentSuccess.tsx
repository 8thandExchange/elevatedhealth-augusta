import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ArrowRight,
  Sparkles,
  Calendar,
  Phone,
  Calculator,
  Gift,
  Shield,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { ALACARTE_PRICES, MEMBERSHIP_PRICES } from "@/lib/stripeConfig";
import confetti from "canvas-confetti";

// Product display names and categories
const PRODUCT_INFO: Record<string, { name: string; category: string; membershipSaving: string }> = {
  testosterone: { name: "Testosterone Cream", category: "Men's HRT", membershipSaving: "$100+/mo" },
  biEst: { name: "Bi-Est Cream", category: "Women's HRT", membershipSaving: "$160+/mo" },
  progesterone: { name: "Progesterone", category: "Women's HRT", membershipSaving: "$170+/mo" },
  followUp: { name: "Follow-up Consultation", category: "Consultation", membershipSaving: "FREE with membership" },
  labPanel: { name: "Lab Panel", category: "Diagnostics", membershipSaving: "Quarterly labs included" },
};

const AlaCartePaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productKey = searchParams.get("product") || "";
  const productInfo = PRODUCT_INFO[productKey];
  const productPrice = ALACARTE_PRICES[productKey as keyof typeof ALACARTE_PRICES];

  const [showCalculator, setShowCalculator] = useState(false);

  // Celebration confetti
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#c5a572", "#1a1a2e", "#f5f5f5"],
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Calculate annual comparison
  const alaCarteAnnual = productPrice ? productPrice.amount / 100 * 12 : 0;
  const membershipAnnual = MEMBERSHIP_PRICES.vitality.amount / 100 * 12;
  const potentialSavings = Math.max(0, alaCarteAnnual - membershipAnnual);

  return (
    <>
      <Helmet>
        <title>Payment Complete | Réveil</title>
        <meta name="description" content="Your payment was successful. Thank you for your order!" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-secondary via-background to-background pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Success Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <Badge className="mb-4 bg-green-500/10 text-green-600 border-green-500/30">
              Payment Successful
            </Badge>
            <h1 className="text-3xl md:text-4xl font-cormorant text-foreground mb-4">
              Thank You for Your Order!
            </h1>
            <p className="text-lg text-muted-foreground font-lato">
              {productInfo ? (
                <>Your <span className="text-foreground font-medium">{productInfo.name}</span> order has been confirmed.</>
              ) : (
                <>Your order has been confirmed and is being processed.</>
              )}
            </p>
          </div>

          {/* Order Summary */}
          {productInfo && productPrice && (
            <Card className="border-gold/30 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-lato uppercase tracking-wide mb-1">
                      {productInfo.category}
                    </p>
                    <h3 className="text-xl font-cormorant text-foreground">{productInfo.name}</h3>
                  </div>
                  <span className="text-2xl font-cormorant text-gold">{productPrice.displayPrice}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    Order confirmed
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    Receipt sent to email
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Membership Upsell Card */}
          <Card className="border-2 border-gold bg-gradient-to-br from-gold/10 via-gold/5 to-transparent mb-8 overflow-hidden">
            <CardContent className="p-0">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-gold/20 to-gold/10 p-4 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-gold" />
                <div>
                  <h3 className="font-cormorant text-lg text-foreground">Save More with Membership</h3>
                  <p className="text-xs text-muted-foreground">See how much you could save annually</p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Comparison */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-secondary/50 rounded-lg p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">À La Carte (Annual)</p>
                    <p className="text-2xl font-cormorant text-foreground">
                      ${alaCarteAnnual.toLocaleString()}+
                    </p>
                    <p className="text-xs text-muted-foreground">No labs or follow-ups included</p>
                  </div>
                  <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 text-center">
                    <p className="text-xs text-gold uppercase tracking-wide mb-2">Vitality Membership</p>
                    <p className="text-2xl font-cormorant text-foreground">
                      ${membershipAnnual.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Meds + labs + messaging included</p>
                  </div>
                </div>

                {/* Savings Highlight */}
                {potentialSavings > 0 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                    <Gift className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-foreground font-medium">
                      You could save up to <span className="text-green-600">${potentialSavings.toLocaleString()}/year</span> with Vitality
                    </p>
                  </div>
                )}

                {/* Benefits List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">What's included in Vitality Membership:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      "Hormone medications included",
                      "Quarterly lab testing",
                      "Unlimited provider messaging",
                      "Priority scheduling",
                      "$50/mo medication credit",
                      "No per-visit fees",
                    ].map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1 bg-gold hover:bg-gold-dark text-gold-foreground"
                    onClick={() => navigate("/pricing-comparison")}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    View Full Comparison
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(SITE_CONFIG.bookingUrl, "_blank")}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Discuss with Provider
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-cormorant text-lg text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gold" />
                What Happens Next
              </h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-gold/10 text-gold flex items-center justify-center flex-shrink-0 text-xs font-medium">1</span>
                  <div>
                    <p className="text-foreground font-medium">Order Processing</p>
                    <p className="text-muted-foreground">Your provider will review your order and prepare your medication.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-gold/10 text-gold flex items-center justify-center flex-shrink-0 text-xs font-medium">2</span>
                  <div>
                    <p className="text-foreground font-medium">Pharmacy Fulfillment</p>
                    <p className="text-muted-foreground">Your prescription will be sent to our partner pharmacy for compounding.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-gold/10 text-gold flex items-center justify-center flex-shrink-0 text-xs font-medium">3</span>
                  <div>
                    <p className="text-foreground font-medium">Delivery or Pickup</p>
                    <p className="text-muted-foreground">You'll receive your medication within 5-7 business days.</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link to="/">
                Return Home
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.location.href = `tel:${SITE_CONFIG.phoneRaw}`}>
              <Phone className="w-4 h-4 mr-2" />
              Call {SITE_CONFIG.phone}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AlaCartePaymentSuccess;
