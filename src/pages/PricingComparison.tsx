import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConsultationModal from "@/components/ConsultationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ALACARTE_PRICES, MEMBERSHIP_PRICES, CONSULTATION_PRICES, DIAGNOSTIC_KIT_PRICES } from "@/lib/stripeConfig";
import {
  Check,
  X,
  Crown,
  ShoppingBag,
  Calculator,
  ArrowRight,
  DollarSign,
  Pill,
  TestTube,
  MessageSquare,
  Calendar,
  Shield,
  TrendingUp,
} from "lucide-react";

const PricingComparison = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [monthsPlanned, setMonthsPlanned] = useState(12);
  const [labsPerYear, setLabsPerYear] = useState(2);
  const [followUpsPerYear, setFollowUpsPerYear] = useState(4);
  const [medsNeeded, setMedsNeeded] = useState<string[]>(["testosterone", "progesterone"]);

  // Calculate à la carte annual cost
  const calculateAlaCarteCost = () => {
    const consultation = CONSULTATION_PRICES.discovery.amount / 100;
    const labKit = DIAGNOSTIC_KIT_PRICES.hormone.amount / 100;
    const labCost = labsPerYear * (ALACARTE_PRICES.labPanel.amount / 100);
    const followUpCost = followUpsPerYear * (ALACARTE_PRICES.followUp.amount / 100);
    
    // Calculate medication costs per year (assuming monthly refills)
    const medCosts = medsNeeded.reduce((total, med) => {
      const price = ALACARTE_PRICES[med as keyof typeof ALACARTE_PRICES];
      if (price) {
        // Testosterone is 10-week supply, others are monthly
        const fillsPerYear = med === "testosterone" ? 5.2 : 12;
        return total + (price.amount / 100) * fillsPerYear;
      }
      return total;
    }, 0);

    return {
      initial: consultation + labKit,
      annual: labCost + followUpCost + medCosts,
      total: consultation + labKit + labCost + followUpCost + medCosts,
    };
  };

  // Calculate membership annual cost
  const calculateMembershipCost = () => {
    const consultation = CONSULTATION_PRICES.discovery.amount / 100;
    const labKit = DIAGNOSTIC_KIT_PRICES.hormone.amount / 100;
    const monthlyRate = MEMBERSHIP_PRICES.vitality.amount / 100;
    const annualMembership = monthlyRate * monthsPlanned;

    return {
      initial: consultation + labKit,
      annual: annualMembership,
      total: consultation + labKit + annualMembership,
    };
  };

  const alaCarte = calculateAlaCarteCost();
  const membership = calculateMembershipCost();
  const savings = alaCarte.total - membership.total;
  const savingsPercent = Math.round((savings / alaCarte.total) * 100);

  const toggleMed = (med: string) => {
    setMedsNeeded(prev => 
      prev.includes(med) 
        ? prev.filter(m => m !== med)
        : [...prev, med]
    );
  };

  return (
    <>
      <Helmet>
        <title>Membership vs À La Carte Pricing | Elevated Health Augusta</title>
        <meta
          name="description"
          content="Compare membership vs pay-per-visit pricing for hormone therapy. See how much you can save with a Vitality Membership at Elevated Health Augusta."
        />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/pricing-comparison" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-16 lg:py-20 bg-gradient-to-b from-secondary to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 border-gold/30 text-gold">
              <Calculator className="w-4 h-4 mr-2" />
              Pricing Calculator
            </Badge>
            <h1 className="text-4xl md:text-5xl font-cormorant text-foreground mb-6">
              Membership vs. <span className="text-gold">À La Carte</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-lato">
              Not sure which path is right for you? Use our calculator to see your 
              potential savings with a membership versus paying per visit.
            </p>
          </div>
        </section>

        {/* Comparison Cards */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Membership Card */}
              <Card className="border-2 border-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-bl-lg">
                  <Crown className="w-4 h-4 inline mr-1" />
                  Best Value
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-2xl font-cormorant">
                    <Shield className="w-6 h-6 text-primary" />
                    Vitality Membership
                  </CardTitle>
                  <p className="text-muted-foreground font-lato text-sm">
                    All-inclusive hormone optimization
                  </p>
                  <div className="mt-4">
                    <span className="text-4xl font-cormorant text-foreground">
                      {MEMBERSHIP_PRICES.vitality.displayPrice}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>All hormone medications included</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Quarterly lab testing included</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Unlimited provider messaging</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Priority scheduling</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Weekly symptom check-ins</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Protocol adjustments as needed</span>
                    </div>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4 mt-6">
                    <p className="text-sm font-medium text-primary">Your Annual Cost</p>
                    <p className="text-3xl font-cormorant text-foreground">
                      ${membership.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (${membership.initial} initial + ${membership.annual}/yr membership)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* À La Carte Card */}
              <Card className="border border-amber-500/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-2xl font-cormorant">
                    <ShoppingBag className="w-6 h-6 text-amber-600" />
                    À La Carte
                  </CardTitle>
                  <p className="text-muted-foreground font-lato text-sm">
                    Pay as you go, per service
                  </p>
                  <div className="mt-4">
                    <span className="text-4xl font-cormorant text-foreground">Varies</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <Pill className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <span>Testosterone Cream</span>
                      </div>
                      <span className="text-muted-foreground">{ALACARTE_PRICES.testosterone.displayPrice}/fill</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <Pill className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <span>Bi-Est Cream</span>
                      </div>
                      <span className="text-muted-foreground">{ALACARTE_PRICES.biEst.displayPrice}/mo</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <Pill className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <span>Progesterone</span>
                      </div>
                      <span className="text-muted-foreground">{ALACARTE_PRICES.progesterone.displayPrice}/mo</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <TestTube className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <span>Lab Panel</span>
                      </div>
                      <span className="text-muted-foreground">{ALACARTE_PRICES.labPanel.displayPrice}/panel</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <span>Follow-up Visit</span>
                      </div>
                      <span className="text-muted-foreground">{ALACARTE_PRICES.followUp.displayPrice}/visit</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">No unlimited messaging</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 rounded-lg p-4 mt-6">
                    <p className="text-sm font-medium text-amber-600">Your Estimated Annual Cost</p>
                    <p className="text-3xl font-cormorant text-foreground">
                      ${alaCarte.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on your selections below
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Savings Banner */}
            {savings > 0 && (
              <div className="max-w-5xl mx-auto mt-8">
                <div className="bg-gradient-to-r from-primary/20 to-gold/20 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <span className="text-lg font-medium text-foreground">Membership Saves You</span>
                  </div>
                  <p className="text-4xl font-cormorant text-primary">
                    ${savings.toLocaleString()} <span className="text-xl text-muted-foreground">({savingsPercent}%)</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    annually compared to à la carte pricing
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-12 lg:py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-cormorant text-center mb-8">
                Customize Your Estimate
              </h2>

              <Card>
                <CardContent className="p-6 space-y-8">
                  {/* Months of Treatment */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Months of Membership</label>
                      <span className="text-sm text-primary font-medium">{monthsPlanned} months</span>
                    </div>
                    <Slider
                      value={[monthsPlanned]}
                      onValueChange={(v) => setMonthsPlanned(v[0])}
                      min={3}
                      max={24}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  {/* Labs Per Year */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Lab Panels Per Year (À La Carte)</label>
                      <span className="text-sm text-amber-600 font-medium">{labsPerYear} panels</span>
                    </div>
                    <Slider
                      value={[labsPerYear]}
                      onValueChange={(v) => setLabsPerYear(v[0])}
                      min={1}
                      max={4}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  {/* Follow-ups Per Year */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Follow-up Visits Per Year (À La Carte)</label>
                      <span className="text-sm text-amber-600 font-medium">{followUpsPerYear} visits</span>
                    </div>
                    <Slider
                      value={[followUpsPerYear]}
                      onValueChange={(v) => setFollowUpsPerYear(v[0])}
                      min={1}
                      max={12}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  {/* Medications Needed */}
                  <div>
                    <label className="text-sm font-medium block mb-3">Medications Needed (À La Carte)</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(ALACARTE_PRICES)
                        .filter(([key]) => !["followUp", "labPanel"].includes(key))
                        .map(([key, value]) => (
                          <button
                            key={key}
                            onClick={() => toggleMed(key)}
                            className={`px-4 py-2 rounded-full text-sm transition-all ${
                              medsNeeded.includes(key)
                                ? "bg-amber-500 text-white"
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {value.name}
                          </button>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <div className="text-center mt-10">
                <p className="text-muted-foreground mb-4">
                  Ready to get started? Both paths begin with a consultation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setIsBookingOpen(true)}
                  >
                    Book Discovery Consultation
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                  >
                    <Link to="/pricing">View Full Pricing</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-cormorant text-center mb-8">
                Common Questions
              </h2>

              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-2">Can I switch from à la carte to membership?</h3>
                    <p className="text-sm text-muted-foreground">
                      Absolutely! Many patients start with à la carte to try our services, then upgrade 
                      to membership for better value. Your $99 consultation credit still applies to your 
                      initial lab kit, regardless of which path you choose.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-2">What's included in the membership medications?</h3>
                    <p className="text-sm text-muted-foreground">
                      The Vitality Membership includes up to three hormones (testosterone, bi-estrogen, 
                      and progesterone) compounded specifically for you. Higher-tier add-ons are available 
                      for additional compounds or peptide therapy.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-2">What if I only need one medication?</h3>
                    <p className="text-sm text-muted-foreground">
                      If you only need a single hormone, à la carte might work for you initially. However, 
                      once you factor in labs and follow-ups, membership often becomes more cost-effective 
                      within 4-6 months—plus you get unlimited provider access.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ConsultationModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </>
  );
};

export default PricingComparison;
