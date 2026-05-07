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
  // Realistic defaults: quarterly labs, bi-monthly follow-ups, typical HRT stack
  const [labsPerYear, setLabsPerYear] = useState(4);
  const [followUpsPerYear, setFollowUpsPerYear] = useState(6);
  const [medsNeeded, setMedsNeeded] = useState<string[]>(["testosterone", "progesterone", "biEst"]);

  // À la carte: Full price for consultation (no credit), full price for kit, pay per service
  const calculateAlaCarteCost = () => {
    const consultation = CONSULTATION_PRICES.discovery.amount / 100; // $99
    const labKit = DIAGNOSTIC_KIT_PRICES.hormone.amount / 100; // $349
    // Additional labs beyond initial kit (subtract 1 since initial kit counts as first lab)
    const additionalLabs = Math.max(0, labsPerYear - 1);
    const labCost = additionalLabs * (ALACARTE_PRICES.labPanel.amount / 100);
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

    const initial = consultation + labKit;
    const recurring = labCost + followUpCost + medCosts;

    return {
      initial,
      recurring,
      total: initial + recurring,
    };
  };

  // Membership: $79 RN Wellness Assessment credit applied toward kit, then monthly membership
  // Membership INCLUDES: all medications, quarterly labs, unlimited messaging, follow-ups
  const calculateMembershipCost = () => {
    const consultation = CONSULTATION_PRICES.discovery.amount / 100; // $99
    const labKit = DIAGNOSTIC_KIT_PRICES.hormone.amount / 100; // $349
    const consultationCredit = consultation; // $79 credit applied to kit
    const netKitCost = labKit - consultationCredit; // $250 net
    
    const monthlyRate = MEMBERSHIP_PRICES.vitality.amount / 100;
    const membershipTotal = monthlyRate * monthsPlanned;

    // Initial cost: consultation + kit, but credit makes net initial $250 + $99 = $349 total
    // However, the $149 is credited, so effectively you pay $99 then $250 = $349 total initial
    const initial = consultation + netKitCost; // $99 + $250 = $349

    return {
      initial,
      recurring: membershipTotal,
      total: initial + membershipTotal,
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
                    <p className="text-sm font-medium text-primary">Your {monthsPlanned}-Month Cost</p>
                    <p className="text-3xl font-cormorant text-foreground">
                      ${membership.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${membership.initial} onboarding + ${membership.recurring.toLocaleString()} membership
                    </p>
                    <p className="text-xs text-primary mt-2 font-medium">
                      ✓ All meds, labs & follow-ups included
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
                    <p className="text-sm font-medium text-amber-600">Your Estimated {monthsPlanned}-Month Cost</p>
                    <p className="text-3xl font-cormorant text-foreground">
                      ${alaCarte.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${alaCarte.initial} onboarding + ${alaCarte.recurring.toLocaleString()} services
                    </p>
                    <p className="text-xs text-amber-600 mt-2">
                      No consultation credit • Pay per service
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Savings Banner */}
            {savings > 0 && (
              <div className="max-w-5xl mx-auto mt-6 md:mt-8">
                <div className="bg-gradient-to-r from-primary/20 to-gold/20 rounded-xl p-4 md:p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    <span className="text-base md:text-lg font-medium text-foreground">Membership Saves You</span>
                  </div>
                  <p className="text-3xl md:text-4xl font-cormorant text-primary">
                    ${savings.toLocaleString()} <span className="text-lg md:text-xl text-muted-foreground">({savingsPercent}%)</span>
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">
                    annually compared to à la carte pricing
                  </p>
                </div>
              </div>
            )}

            {/* What's Included Comparison Table */}
            <div className="max-w-5xl mx-auto mt-8 md:mt-12">
              <h2 className="text-2xl md:text-3xl font-cormorant text-center mb-6 md:mb-8">
                What's <span className="text-gold">Included</span>
              </h2>
              
              {/* Desktop Table - Hidden on mobile */}
              <Card className="overflow-hidden hidden md:block">
                <div className="grid grid-cols-3 bg-secondary/50 border-b">
                  <div className="p-4 font-medium text-muted-foreground text-sm">Feature</div>
                  <div className="p-4 font-medium text-primary text-sm text-center border-l">
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="w-4 h-4" />
                      Membership
                    </div>
                  </div>
                  <div className="p-4 font-medium text-amber-600 text-sm text-center border-l">
                    <div className="flex items-center justify-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      À La Carte
                    </div>
                  </div>
                </div>

                {/* Medications Section */}
                <div className="border-b">
                  <div className="grid grid-cols-3 bg-secondary/20">
                    <div className="p-3 font-medium text-sm flex items-center gap-2 col-span-3">
                      <Pill className="w-4 h-4 text-primary" />
                      Medications
                    </div>
                  </div>
                  {[
                    { name: "Testosterone Cream", price: "$149/fill" },
                    { name: "Bi-Est Cream", price: "$89/mo" },
                    { name: "Progesterone", price: "$79/mo" },
                  ].map((med) => (
                    <div key={med.name} className="grid grid-cols-3 border-t">
                      <div className="p-3 text-sm text-muted-foreground">{med.name}</div>
                      <div className="p-3 text-center border-l">
                        <div className="flex items-center justify-center gap-1.5 text-primary">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Included</span>
                        </div>
                      </div>
                      <div className="p-3 text-center border-l">
                        <span className="text-sm text-amber-600 font-medium">{med.price}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Labs & Testing Section */}
                <div className="border-b">
                  <div className="grid grid-cols-3 bg-secondary/20">
                    <div className="p-3 font-medium text-sm flex items-center gap-2 col-span-3">
                      <TestTube className="w-4 h-4 text-primary" />
                      Labs & Testing
                    </div>
                  </div>
                  <div className="grid grid-cols-3 border-t">
                    <div className="p-3 text-sm text-muted-foreground">Initial Diagnostic Kit</div>
                    <div className="p-3 text-center border-l">
                      <span className="text-sm text-primary font-medium">$250</span>
                      <span className="text-xs text-muted-foreground block">(after credit)</span>
                    </div>
                    <div className="p-3 text-center border-l">
                      <span className="text-sm text-amber-600 font-medium">$349</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 border-t">
                    <div className="p-3 text-sm text-muted-foreground">Quarterly Lab Panels</div>
                    <div className="p-3 text-center border-l">
                      <div className="flex items-center justify-center gap-1.5 text-primary">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">4/year</span>
                      </div>
                    </div>
                    <div className="p-3 text-center border-l">
                      <span className="text-sm text-amber-600 font-medium">$149/panel</span>
                    </div>
                  </div>
                </div>

                {/* Care & Support Section */}
                <div>
                  <div className="grid grid-cols-3 bg-secondary/20">
                    <div className="p-3 font-medium text-sm flex items-center gap-2 col-span-3">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Care & Support
                    </div>
                  </div>
                  {[
                    { name: "Unlimited Provider Messaging", membership: true, alacarte: null },
                    { name: "Follow-up Consultations", membership: true, alacarte: "$99/visit" },
                    { name: "Priority Scheduling", membership: true, alacarte: null },
                    { name: "Weekly Symptom Check-ins", membership: true, alacarte: null },
                    { name: "Protocol Adjustments", membership: true, alacarte: "Additional fee" },
                  ].map((feature) => (
                    <div key={feature.name} className="grid grid-cols-3 border-t">
                      <div className="p-3 text-sm text-muted-foreground">{feature.name}</div>
                      <div className="p-3 text-center border-l">
                        <div className="flex items-center justify-center gap-1.5 text-primary">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Included</span>
                        </div>
                      </div>
                      <div className="p-3 text-center border-l">
                        {feature.alacarte ? (
                          <span className="text-sm text-amber-600 font-medium">{feature.alacarte}</span>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                            <X className="w-4 h-4" />
                            <span className="text-sm">Not available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Mobile Card Layout - Hidden on desktop */}
              <div className="md:hidden space-y-4">
                {/* Medications Card */}
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Pill className="w-4 h-4 text-primary" />
                      Medications
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    {[
                      { name: "Testosterone Cream", price: "$149/fill" },
                      { name: "Bi-Est Cream", price: "$89/mo" },
                      { name: "Progesterone", price: "$79/mo" },
                    ].map((med, idx, arr) => (
                      <div key={med.name} className={`flex justify-between items-center py-2 ${idx < arr.length - 1 ? 'border-b border-border/50' : ''}`}>
                        <span className="text-sm text-muted-foreground">{med.name}</span>
                        <div className="flex gap-3 text-xs">
                          <span className="text-primary flex items-center gap-1">
                            <Check className="w-3 h-3" /> Included
                          </span>
                          <span className="text-amber-600 font-medium">{med.price}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Labs & Testing Card */}
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <TestTube className="w-4 h-4 text-primary" />
                      Labs & Testing
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Initial Kit</span>
                      <div className="flex gap-3 text-xs">
                        <span className="text-primary font-medium">$250</span>
                        <span className="text-amber-600 font-medium">$349</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Quarterly Labs</span>
                      <div className="flex gap-3 text-xs">
                        <span className="text-primary flex items-center gap-1">
                          <Check className="w-3 h-3" /> 4/year
                        </span>
                        <span className="text-amber-600 font-medium">$149/ea</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Care & Support Card */}
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Care & Support
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    {[
                      { name: "Unlimited Messaging", alacarte: null },
                      { name: "Follow-ups", alacarte: "$99/visit" },
                      { name: "Priority Scheduling", alacarte: null },
                      { name: "Symptom Check-ins", alacarte: null },
                      { name: "Protocol Adjustments", alacarte: "Extra fee" },
                    ].map((feature, idx, arr) => (
                      <div key={feature.name} className={`flex justify-between items-center py-2 ${idx < arr.length - 1 ? 'border-b border-border/50' : ''}`}>
                        <span className="text-sm text-muted-foreground">{feature.name}</span>
                        <div className="flex gap-3 text-xs">
                          <span className="text-primary flex items-center gap-1">
                            <Check className="w-3 h-3" /> Included
                          </span>
                          {feature.alacarte ? (
                            <span className="text-amber-600 font-medium">{feature.alacarte}</span>
                          ) : (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <X className="w-3 h-3" /> N/A
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Mobile Legend */}
                <div className="flex justify-center gap-6 text-xs text-muted-foreground pt-2">
                  <div className="flex items-center gap-1">
                    <Crown className="w-3 h-3 text-primary" />
                    <span>Membership</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3 text-amber-600" />
                    <span>À La Carte</span>
                  </div>
                </div>
              </div>
            </div>
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
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 mb-2">
                      <label className="text-sm font-medium">Lab Panels/Year <span className="text-muted-foreground font-normal">(À La Carte)</span></label>
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
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 mb-2">
                      <label className="text-sm font-medium">Follow-up Visits/Year <span className="text-muted-foreground font-normal">(À La Carte)</span></label>
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
                      to membership for better value. Your $79 RN Wellness Assessment credit still applies to your 
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
