import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield, Heart, DollarSign, CheckCircle, Phone } from "lucide-react";
import PaymentMethodsBadge from "@/components/PaymentMethodsBadge";

const Affordability = () => {
  const scrollToContact = () => {
    window.location.href = "tel:+17069733866";
  };

  return (
    <>
      <Helmet>
        <title>Affordable Payment Options | Klarna, Affirm, Insurance | Elevated Health Augusta</title>
        <meta
          name="description"
          content="Flexible payment plans with Klarna and Affirm. We accept Blue Cross Blue Shield, TRICARE, and VA insurance. HSA/FSA eligible. $79 Wellness Assessment credits available."
        />
        <meta name="keywords" content="payment plans Augusta GA, Klarna healthcare, Affirm medical financing, BCBS mental health coverage, TRICARE ketamine therapy, HSA FSA eligible" />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/affordability" />
      </Helmet>

      <Navbar />

      <main id="main-content" className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                Your Health Shouldn't Wait
              </span>
              <h1 className="font-cormorant text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Affordable Care for Everyone
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto font-lato">
                We believe transformative healthcare should be accessible. That's why we offer multiple payment options, 
                insurance billing, and flexible financing—so cost never stands between you and the care you deserve.
              </p>
              <PaymentMethodsBadge variant="light" showText={true} className="justify-center" />
            </div>
          </div>
        </section>

        {/* Payment Options Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              {/* Klarna/Affirm Card */}
              <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-cormorant text-2xl text-foreground">Pay in 4</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground font-lato">
                    Split any treatment into 4 interest-free payments with Klarna or Affirm. 
                    Get care today—pay over time.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>0% interest on 4-payment plans</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Instant approval at checkout</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>No impact on credit score (soft check)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Extended financing up to 36 months with Affirm</span>
                    </li>
                  </ul>
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Example: $399/month becomes 4 payments of $99.75
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Insurance Card */}
              <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-cormorant text-2xl text-foreground">Insurance Coverage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground font-lato">
                    We accept major insurance plans for qualifying services including SPRAVATO® and select consultations.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Blue Cross Blue Shield (BCBS)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>TRICARE (Military & Dependents)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>VA Community Care</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Most major PPO plans</span>
                    </li>
                  </ul>
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      SPRAVATO® often covered with prior authorization. We handle the paperwork.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* HSA/FSA Card */}
              <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-cormorant text-2xl text-foreground">HSA & FSA Eligible</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground font-lato">
                    Use your pre-tax health savings to pay for treatments—saving you up to 30% on out-of-pocket costs.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Health Savings Account (HSA)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Flexible Spending Account (FSA)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Health Reimbursement Arrangement (HRA)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Receipts provided for reimbursement</span>
                    </li>
                  </ul>
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Most treatments qualify as medical expenses under IRS guidelines.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Consultation Credits Card */}
              <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-cormorant text-2xl text-foreground">$79 Assessment Credit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground font-lato">
                    Your initial consultation fee becomes a credit toward your treatment—you never pay twice for getting started.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>$79 Wellness Assessment fee applies to next step</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Reduces Hormone Mapping to $250</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Reduces Metabolic Mapping to $250</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Unique credit code emailed after payment</span>
                    </li>
                  </ul>
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Pay now for consultation, credit applies when you move forward.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Superbill Card */}
              <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-cormorant text-2xl text-foreground">Insurance Reimbursement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground font-lato">
                    Even if we don't bill your insurance directly, we provide superbills for you to submit for potential reimbursement.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Detailed superbill with CPT codes</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>ICD-10 diagnosis codes included</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Submit to out-of-network benefits</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Many patients recover 50-70% of costs</span>
                    </li>
                  </ul>
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Check your plan's out-of-network mental health benefits.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Low Entry Points Card */}
              <Card className="border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-cormorant text-2xl text-foreground">Low Entry Points</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground font-lato">
                    Start with a low-cost consultation before committing to larger treatments—dip your toe in first.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>24/7 Virtual Care Team Support (FREE)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>$79 Wellness Assessments (credited forward)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>$139 IV drips (no membership needed)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>Cancel memberships anytime</span>
                    </li>
                  </ul>
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      No long-term contracts. No hidden fees. Just care.
                    </p>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-cormorant text-3xl md:text-4xl text-foreground mb-4">
                Questions About Payment Options?
              </h2>
              <p className="text-muted-foreground mb-8 font-lato">
                Our team is happy to discuss financing options, verify your insurance benefits, 
                or help you find the most affordable path to care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={scrollToContact}
                  size="lg" 
                  className="rounded-full"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call (706) 973-3866
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full"
                  onClick={() => window.location.href = "/pricing"}
                >
                  View Pricing
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Affordability;
