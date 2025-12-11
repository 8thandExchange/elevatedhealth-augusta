import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Droplets, 
  Sparkles, 
  Dumbbell, 
  Shield, 
  Sun,
  Plus,
  Check
} from "lucide-react";

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
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleBookNow = (therapy: IVTherapy) => {
    // Open Google Calendar booking link
    window.open(
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1VfeDDUhPJgGJcLwhKB5Sh8n5uoVH8bZLOb0yPqZx8uClvHC6JvLlKzJg0E5nNE8gXiWL1fj2k",
      "_blank"
    );
  };

  return (
    <>
      <Helmet>
        <title>IV Lounge | Elevated Health Augusta</title>
        <meta
          name="description"
          content="Premium IV hydration therapy in Augusta. The Resurrection hangover relief, immune boosters, beauty drips, and athletic recovery infusions."
        />
      </Helmet>

      <Navbar />

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

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="font-cormorant text-3xl text-foreground">
                        ${therapy.price}
                      </span>
                      <Button
                        onClick={() => handleBookNow(therapy)}
                        className="rounded-full"
                      >
                        Book Now
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Add-ons Section */}
        <section className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-cormorant text-3xl md:text-4xl font-light text-foreground mb-3">
                Boost Your Drip
              </h2>
              <p className="text-muted-foreground">
                Customize your infusion with premium add-ons
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {addons.map((addon) => (
                <Card
                  key={addon.id}
                  className={`p-4 cursor-pointer transition-all duration-200 border-2 ${
                    selectedAddons.includes(addon.id)
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:border-primary/30"
                  }`}
                  onClick={() => toggleAddon(addon.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedAddons.includes(addon.id)
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {selectedAddons.includes(addon.id) && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-primary">
                      +${addon.price}
                    </span>
                  </div>
                  <h4 className="font-medium text-foreground text-sm mb-1">
                    {addon.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {addon.description}
                  </p>
                </Card>
              ))}
            </div>

            {selectedAddons.length > 0 && (
              <div className="text-center mt-8">
                <p className="text-sm text-muted-foreground">
                  {selectedAddons.length} add-on{selectedAddons.length > 1 ? "s" : ""} selected • +$
                  {selectedAddons.reduce((total, id) => {
                    const addon = addons.find((a) => a.id === id);
                    return total + (addon?.price || 0);
                  }, 0)}
                </p>
              </div>
            )}
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
    </>
  );
};

export default IVLounge;
