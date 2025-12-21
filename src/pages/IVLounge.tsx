import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { 
  Droplets, 
  Sparkles, 
  Dumbbell, 
  Shield, 
  Sun,
  Check,
  Loader2,
  Info
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import BoosterInfoCard from "@/components/BoosterInfoCard";
import BoosterModal from "@/components/BoosterModal";
import { useIsMobile } from "@/hooks/use-mobile";
import NotReadyToBook from "@/components/NotReadyToBook";

interface IVTherapy {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  feelings: string[];
  ingredients: string[];
  stripe_price_id: string | null;
  icon_name: string | null;
}

interface IVAddon {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stripe_price_id: string | null;
  detailed_description: string | null;
  benefits: string[] | null;
  best_for: string[] | null;
  icon_name: string | null;
}

const FEELING_FILTERS = [
  { id: "all", label: "All Drips" },
  { id: "hungover", label: "Hungover" },
  { id: "sick", label: "Sick" },
  { id: "tired", label: "Tired" },
  { id: "athletic recovery", label: "Athletic" },
  { id: "glow", label: "Glow" },
];

const getIcon = (iconName: string | null) => {
  const iconProps = { className: "w-8 h-8 text-primary" };
  switch (iconName) {
    case "droplets":
      return <Droplets {...iconProps} />;
    case "sparkles":
      return <Sparkles {...iconProps} />;
    case "dumbbell":
      return <Dumbbell {...iconProps} />;
    case "shield":
      return <Shield {...iconProps} />;
    case "sun":
      return <Sun {...iconProps} />;
    default:
      return <Droplets {...iconProps} />;
  }
};

const IVLounge = () => {
  const [therapies, setTherapies] = useState<IVTherapy[]>([]);
  const [addons, setAddons] = useState<IVAddon[]>([]);
  const [selectedFeeling, setSelectedFeeling] = useState("all");
  const [selectedAddons, setSelectedAddons] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [bookingTherapyId, setBookingTherapyId] = useState<string | null>(null);
  const [mobileModalAddon, setMobileModalAddon] = useState<{ addon: IVAddon; therapyId: string } | null>(null);
  const [mobileModalAddonStandalone, setMobileModalAddonStandalone] = useState<IVAddon | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      const [therapiesResult, addonsResult] = await Promise.all([
        supabase.from("iv_therapies").select("*").order("sort_order"),
        supabase.from("iv_addons").select("*").order("name"),
      ]);

      if (therapiesResult.data) setTherapies(therapiesResult.data);
      if (addonsResult.data) setAddons(addonsResult.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredTherapies = therapies.filter((therapy) => {
    if (selectedFeeling === "all") return true;
    return therapy.feelings.includes(selectedFeeling);
  });

  const toggleAddon = (therapyId: string, addonId: string) => {
    setSelectedAddons((prev) => {
      const current = prev[therapyId] || [];
      const updated = current.includes(addonId)
        ? current.filter((id) => id !== addonId)
        : [...current, addonId];
      return { ...prev, [therapyId]: updated };
    });
  };

  const getTherapyAddons = (therapyId: string) => selectedAddons[therapyId] || [];

  const calculateTotal = (therapy: IVTherapy) => {
    const addonIds = getTherapyAddons(therapy.id);
    const addonTotal = addonIds.reduce((total, id) => {
      const addon = addons.find((a) => a.id === id);
      return total + (addon?.price || 0);
    }, 0);
    return therapy.price + addonTotal;
  };

  const handleBookNow = async (therapy: IVTherapy) => {
    setBookingTherapyId(therapy.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-iv-drip-checkout", {
        body: { 
          therapy_id: therapy.id,
          addon_ids: getTherapyAddons(therapy.id)
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("IV checkout error:", err);
      toast.error("Failed to start checkout. Please try again or call us.");
    } finally {
      setBookingTherapyId(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>IV Lounge | Elevated Health Augusta</title>
        <meta
          name="description"
          content="Premium IV hydration therapy in Augusta, GA. Chat with our Virtual Care Team to find your perfect drip. Hangover relief, immune boosters, beauty drips, and athletic recovery."
        />
        <meta property="og:title" content="IV Lounge | Premium Hydration Therapy | Elevated Health Augusta" />
        <meta property="og:description" content="Premium IV hydration therapy in Augusta, GA. Chat with our Virtual Care Team 24/7. Hangover relief, immune boosters, beauty drips." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elevatedhealthaugusta.com/iv-lounge" />
        <meta property="og:image" content="https://elevatedhealthaugusta.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="IV Lounge Augusta | Premium Hydration" />
        <meta name="twitter:description" content="Chat with our Virtual Care Team to find your perfect drip. Hangover relief, immune boosters, beauty drips." />
        <meta name="twitter:image" content="https://elevatedhealthaugusta.com/og-image.jpg" />
      </Helmet>

      <Navbar onOpenBooking={() => window.open(SITE_CONFIG.bookingLinks.iv, "_blank")} />

      <main id="main-content" className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container mx-auto px-4 text-center">
            <span className="inline-block px-4 py-1 mb-4 text-xs tracking-[0.2em] uppercase text-primary border border-primary/30 rounded-full">
              The IV Lounge
            </span>
            <h1 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-4">
              Elevated Hydration
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
              Precision wellness delivered directly to your bloodstream. 
              100% absorption. Immediate results.
            </p>
          </div>
        </section>

        {/* Filter Pills */}
        <section className="py-8 border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              <span className="text-sm text-muted-foreground mr-2 self-center">
                Shop by Feeling:
              </span>
              {FEELING_FILTERS.map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedFeeling === filter.id ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSelectedFeeling(filter.id)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* IV Therapies Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} className="p-8 animate-pulse">
                    <div className="h-8 w-8 bg-muted rounded-full mb-6" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </Card>
                ))}
              </div>
            ) : filteredTherapies.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No drips match this filter.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSelectedFeeling("all")}
                >
                  View All Drips
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTherapies.map((therapy) => (
                  <Card
                    key={therapy.id}
                    className="group bg-card border border-border/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Icon */}
                    <div className="mb-6">{getIcon(therapy.icon_name)}</div>

                    {/* Name & Category */}
                    <div className="mb-4">
                      <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
                        {therapy.category}
                      </span>
                      <h3 className="font-cormorant text-2xl font-medium text-foreground mt-1">
                        {therapy.name}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                      {therapy.description}
                    </p>

                    {/* Ingredients */}
                    <div className="mb-6">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                        Key Ingredients
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {therapy.ingredients.slice(0, 4).map((ingredient, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-secondary/50 text-muted-foreground rounded"
                          >
                            {ingredient}
                          </span>
                        ))}
                        {therapy.ingredients.length > 4 && (
                          <span className="px-2 py-1 text-xs bg-secondary/50 text-muted-foreground rounded">
                            +{therapy.ingredients.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add-ons for this therapy */}
                    {addons.length > 0 && (
                      <div className="mb-4 pt-4 border-t border-border/30">
                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                          Add Boosters <span className="text-primary/60 hidden md:inline">(hover for details)</span>
                          <span className="text-primary/60 md:hidden">(tap for details)</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {addons.slice(0, 5).map((addon) => {
                            const isSelected = getTherapyAddons(therapy.id).includes(addon.id);
                            
                            // Mobile: tap to open modal
                            if (isMobile) {
                              return (
                                <button
                                  key={addon.id}
                                  onClick={() => setMobileModalAddon({ addon, therapyId: therapy.id })}
                                  className={`group/btn flex items-center gap-1 px-2 py-1 text-xs rounded-full border transition-all duration-200 ${
                                    isSelected
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3" />}
                                  {addon.name} +${addon.price}
                                  <Info className={`w-3 h-3 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                                </button>
                              );
                            }
                            
                            // Desktop: hover card
                            return (
                              <HoverCard key={addon.id} openDelay={100} closeDelay={100}>
                                <HoverCardTrigger asChild>
                                  <button
                                    onClick={() => toggleAddon(therapy.id, addon.id)}
                                    className={`group/btn flex items-center gap-1 px-2 py-1 text-xs rounded-full border transition-all duration-200 ${
                                      isSelected
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "border-border hover:border-primary/50 hover:bg-secondary/50"
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3" />}
                                    {addon.name} +${addon.price}
                                    <Info className={`w-3 h-3 opacity-50 group-hover/btn:opacity-100 transition-opacity ${isSelected ? 'text-primary-foreground' : 'text-primary'}`} />
                                  </button>
                                </HoverCardTrigger>
                                <HoverCardContent 
                                  side="top" 
                                  align="center" 
                                  className="p-0 w-auto border-0 bg-transparent shadow-none"
                                  sideOffset={8}
                                >
                                  <BoosterInfoCard
                                    name={addon.name}
                                    price={addon.price}
                                    description={addon.description}
                                    detailedDescription={addon.detailed_description}
                                    benefits={addon.benefits || []}
                                    bestFor={addon.best_for || []}
                                    iconName={addon.icon_name}
                                    isSelected={isSelected}
                                    onToggle={() => toggleAddon(therapy.id, addon.id)}
                                  />
                                </HoverCardContent>
                              </HoverCard>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div>
                        <span className="font-cormorant text-3xl text-foreground">
                          ${calculateTotal(therapy)}
                        </span>
                        {getTherapyAddons(therapy.id).length > 0 && (
                          <span className="block text-xs text-muted-foreground">
                            Base ${therapy.price} + add-ons
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => handleBookNow(therapy)}
                        className="rounded-full"
                        disabled={bookingTherapyId === therapy.id}
                      >
                        {bookingTherapyId === therapy.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {bookingTherapyId === therapy.id ? "Processing..." : "Book & Pay"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Have Questions? Section */}
        <section className="section-spacing-sm bg-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <NotReadyToBook 
                variant="compact" 
                title="Not sure which drip is right for you?"
                description="Our team can recommend the perfect IV based on how you're feeling—whether it's recovery, energy, immunity, or beauty."
                ctaText="Get a Recommendation: (706) 760-3470"
              />
            </div>
          </div>
        </section>

        {/* Available Add-ons Info Section */}
        <section className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-cormorant text-3xl md:text-4xl font-light text-foreground mb-3">
                Premium Boosters
              </h2>
              <p className="text-muted-foreground">
                Add to any drip for enhanced results
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {addons.map((addon) => {
                const cardContent = (
                  <Card className="p-5 border border-primary/20 bg-card hover:shadow-lg hover:border-primary/40 transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                        {addon.icon_name === 'zap' && <Sparkles className="w-4 h-4 text-primary" />}
                        {addon.icon_name === 'sparkles' && <Sparkles className="w-4 h-4 text-primary" />}
                        {addon.icon_name === 'shield' && <Shield className="w-4 h-4 text-primary" />}
                        {(!addon.icon_name || !['zap', 'sparkles', 'shield'].includes(addon.icon_name)) && <Sparkles className="w-4 h-4 text-primary" />}
                      </div>
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                        +${addon.price}
                      </span>
                    </div>
                    <h4 className="font-cormorant text-lg font-medium text-foreground mb-1">
                      {addon.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {addon.description}
                    </p>
                    <p className="text-xs text-primary/70 mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" /> 
                      <span className="hidden md:inline">Hover for details</span>
                      <span className="md:hidden">Tap for details</span>
                    </p>
                  </Card>
                );

                // Mobile: tap to open modal
                if (isMobile) {
                  return (
                    <div key={addon.id} onClick={() => setMobileModalAddonStandalone(addon)}>
                      {cardContent}
                    </div>
                  );
                }

                // Desktop: hover card
                return (
                  <HoverCard key={addon.id} openDelay={100} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      {cardContent}
                    </HoverCardTrigger>
                    <HoverCardContent 
                      side="top" 
                      align="center" 
                      className="p-0 w-auto border-0 bg-transparent shadow-none"
                      sideOffset={8}
                    >
                      <BoosterInfoCard
                        name={addon.name}
                        price={addon.price}
                        description={addon.description}
                        detailedDescription={addon.detailed_description}
                        benefits={addon.benefits || []}
                        bestFor={addon.best_for || []}
                        iconName={addon.icon_name}
                        isSelected={false}
                        onToggle={() => {}}
                      />
                    </HoverCardContent>
                  </HoverCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-cormorant text-3xl md:text-4xl font-light text-foreground mb-4">
              Ready to Feel Elevated?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Walk-ins welcome. Book ahead to skip the wait.
            </p>
            <Button
              size="lg"
              className="rounded-full"
              onClick={() =>
                window.open(
                  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1VfeDDUhPJgGJcLwhKB5Sh8n5uoVH8bZLOb0yPqZx8uClvHC6JvLlKzJg0E5nNE8gXiWL1fj2k",
                  "_blank"
                )
              }
            >
              Book Your Drip
            </Button>
          </div>
        </section>
      </main>

      <Footer />

      {/* Mobile Modal for Boosters in Therapy Cards */}
      {mobileModalAddon && (
        <BoosterModal
          open={!!mobileModalAddon}
          onOpenChange={(open) => !open && setMobileModalAddon(null)}
          name={mobileModalAddon.addon.name}
          price={mobileModalAddon.addon.price}
          description={mobileModalAddon.addon.description}
          detailedDescription={mobileModalAddon.addon.detailed_description}
          benefits={mobileModalAddon.addon.benefits || []}
          bestFor={mobileModalAddon.addon.best_for || []}
          iconName={mobileModalAddon.addon.icon_name}
          isSelected={getTherapyAddons(mobileModalAddon.therapyId).includes(mobileModalAddon.addon.id)}
          onToggle={() => toggleAddon(mobileModalAddon.therapyId, mobileModalAddon.addon.id)}
        />
      )}

      {/* Mobile Modal for Standalone Booster Cards */}
      {mobileModalAddonStandalone && (
        <BoosterModal
          open={!!mobileModalAddonStandalone}
          onOpenChange={(open) => !open && setMobileModalAddonStandalone(null)}
          name={mobileModalAddonStandalone.name}
          price={mobileModalAddonStandalone.price}
          description={mobileModalAddonStandalone.description}
          detailedDescription={mobileModalAddonStandalone.detailed_description}
          benefits={mobileModalAddonStandalone.benefits || []}
          bestFor={mobileModalAddonStandalone.best_for || []}
          iconName={mobileModalAddonStandalone.icon_name}
          isSelected={false}
          onToggle={() => {}}
        />
      )}
    </>
  );
};

export default IVLounge;
