import { Helmet } from "react-helmet";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AssistantHub from "@/components/AssistantHub";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight,
  Check,
  Clock,
  Droplet,
  Heart,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react";

interface Therapy {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  feelings: string[] | null;
  ingredients: string[] | null;
  icon_name: string | null;
  sort_order: number | null;
}

interface Addon {
  id: string;
  name: string;
  description: string | null;
  detailed_description: string | null;
  price: number;
  benefits: string[] | null;
  best_for: string[] | null;
  icon_name: string | null;
}

const CATEGORY_META: Record<string, { color: string; icon: any; tagline: string }> = {
  Recovery: { color: "from-rose-500/15 to-orange-400/10", icon: Zap, tagline: "Bounce back fast" },
  Wellness: { color: "from-emerald-500/15 to-teal-400/10", icon: Heart, tagline: "Daily defense" },
  Performance: { color: "from-blue-500/15 to-indigo-400/10", icon: Zap, tagline: "Train. Recover. Repeat." },
  Immunity: { color: "from-amber-500/15 to-yellow-400/10", icon: ShieldCheck, tagline: "Stay in the game" },
  Glow: { color: "from-pink-500/15 to-fuchsia-400/10", icon: Sparkles, tagline: "Skin, hair & nails" },
};

const IV_START_FEE_NOTE = "RN start & monitoring included";

const IVLounge = () => {
  const { toast } = useToast();
  const [therapies, setTherapies] = useState<Therapy[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTherapyId, setSelectedTherapyId] = useState<string | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      const [{ data: t }, { data: a }] = await Promise.all([
        supabase.from("iv_therapies").select("*").eq("is_active", true).order("sort_order").order("price"),
        supabase.from("iv_addons").select("*").eq("is_active", true).order("price"),
      ]);
      setTherapies((t as Therapy[]) || []);
      setAddons((a as Addon[]) || []);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(therapies.map((t) => t.category));
    return ["All", ...Array.from(set)];
  }, [therapies]);

  const filtered = useMemo(
    () => (activeCategory === "All" ? therapies : therapies.filter((t) => t.category === activeCategory)),
    [therapies, activeCategory]
  );

  const selectedTherapy = therapies.find((t) => t.id === selectedTherapyId) || null;
  const selectedAddons = addons.filter((a) => selectedAddonIds.includes(a.id));
  const total =
    (selectedTherapy?.price || 0) + selectedAddons.reduce((sum, a) => sum + a.price, 0);

  const toggleAddon = (id: string) =>
    setSelectedAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const selectTherapy = (id: string) => {
    setSelectedTherapyId(id);
    requestAnimationFrame(() => {
      document.getElementById("your-drip")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleCheckout = async () => {
    if (!selectedTherapy) return;
    setCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-iv-drip-checkout", {
        body: { therapy_id: selectedTherapy.id, addon_ids: selectedAddonIds },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast({
        title: "Checkout error",
        description: e?.message || "Please try again or call us at (706) 760-3470.",
        variant: "destructive",
      });
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>IV Therapy in Augusta, GA | Book Your Drip Online | Elevated Health</title>
        <meta
          name="description"
          content="Book IV hydration therapy online in Augusta. Myers, NAD+, Immunity, Recovery & Beauty drips. RN-administered. No consultation required. Same-day appointments."
        />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/iv-lounge" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        {/* HERO */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-20 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

          <div className="relative container mx-auto px-6 lg:px-8 max-w-5xl text-center">
            <Badge className="mb-6 bg-accent/10 text-accent border-accent/20 hover:bg-accent/15">
              <Droplet className="h-3 w-3 mr-1.5" /> Walk-in friendly · No consult needed
            </Badge>
            <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] mb-6">
              Pick your drip.<br />
              <span className="italic text-accent">Book in 60 seconds.</span>
            </h1>
            <p className="font-jost font-light text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Physician-formulated IV therapy, administered by a registered nurse in our private Augusta lounge.
              Choose your drip, add boosters, pay online — schedule instantly after checkout.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> RN-administered</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> 45–60 minute sessions</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> Same-day availability</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> Memberships save 20%</div>
            </div>
          </div>
        </section>

        {/* MENU */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <p className="section-label mb-3">The Menu</p>
                <h2 className="font-playfair text-3xl md:text-4xl text-foreground">
                  Choose what you need today
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 text-sm font-jost rounded-full border transition-all ${
                      activeCategory === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-accent hover:text-accent"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((therapy) => {
                  const meta = CATEGORY_META[therapy.category] || CATEGORY_META.Wellness;
                  const Icon = meta.icon;
                  const isSelected = selectedTherapyId === therapy.id;
                  const isPopular = therapy.name === "The Meyers";

                  return (
                    <Card
                      key={therapy.id}
                      className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border ${
                        isSelected ? "border-accent ring-2 ring-accent/30 shadow-xl" : "border-border"
                      }`}
                      onClick={() => selectTherapy(therapy.id)}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                      {isPopular && (
                        <div className="absolute top-4 right-4 z-10">
                          <Badge className="bg-accent text-accent-foreground border-0 shadow-md">
                            <Star className="h-3 w-3 mr-1 fill-current" /> Most Popular
                          </Badge>
                        </div>
                      )}
                      <CardContent className="relative p-6 md:p-7 flex flex-col h-full min-h-[360px]">
                        <div className="flex items-start justify-between mb-5">
                          <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-sm">
                            <Icon className="h-5 w-5 text-accent" />
                          </div>
                          <span className="text-xs font-jost uppercase tracking-wider text-muted-foreground">
                            {therapy.category}
                          </span>
                        </div>

                        <h3 className="font-playfair text-2xl text-foreground mb-1">{therapy.name}</h3>
                        <p className="text-xs text-muted-foreground italic mb-3">{meta.tagline}</p>
                        <p className="font-jost text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
                          {therapy.description}
                        </p>

                        {therapy.ingredients && therapy.ingredients.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {therapy.ingredients.slice(0, 4).map((ing) => (
                              <span key={ing} className="text-[11px] px-2 py-1 bg-background/70 backdrop-blur rounded-full text-foreground/80">
                                {ing}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-end justify-between pt-4 border-t border-border/50">
                          <div>
                            <div className="font-playfair text-3xl text-foreground">${therapy.price}</div>
                            <div className="text-[10px] text-muted-foreground">{IV_START_FEE_NOTE}</div>
                          </div>
                          <Button
                            size="sm"
                            className={`rounded-full transition-all ${
                              isSelected
                                ? "bg-accent text-accent-foreground"
                                : "bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            {isSelected ? <><Check className="h-4 w-4 mr-1" /> Selected</> : <>Select <ArrowRight className="h-4 w-4 ml-1" /></>}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* BUILD YOUR DRIP / CHECKOUT */}
        <section id="your-drip" className="py-16 md:py-20 bg-secondary/40 scroll-mt-24">
          <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <p className="section-label mb-3">Build Your Drip</p>
              <h2 className="font-playfair text-3xl md:text-4xl text-foreground">
                {selectedTherapy ? "Add boosters & check out" : "Pick a drip above to begin"}
              </h2>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
              {/* Add-ons list */}
              <div className="lg:col-span-3 space-y-4">
                <h3 className="font-playfair text-xl text-foreground mb-2">Optional Boosters</h3>
                <p className="text-sm text-muted-foreground mb-4">Stack any add-on for $25 each.</p>

                {loading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addons.map((addon) => {
                      const checked = selectedAddonIds.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          disabled={!selectedTherapy}
                          className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                            checked
                              ? "border-accent bg-accent/5"
                              : "border-border bg-background hover:border-accent/50"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                              checked ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                            }`}>
                              {checked ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <span className="font-playfair text-lg text-foreground">{addon.name}</span>
                                <span className="font-jost font-medium text-accent">+${addon.price}</span>
                              </div>
                              {addon.description && (
                                <p className="text-sm text-muted-foreground">{addon.description}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sticky order summary */}
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-28">
                  <Card className="border-2 border-primary/20 shadow-xl">
                    <CardContent className="p-6 md:p-7">
                      <h3 className="font-playfair text-2xl text-foreground mb-1">Your Order</h3>
                      <p className="text-xs text-muted-foreground mb-5">Pay online → schedule instantly.</p>

                      {!selectedTherapy ? (
                        <div className="py-8 text-center text-muted-foreground text-sm">
                          <Droplet className="h-10 w-10 mx-auto mb-3 opacity-30" />
                          No drip selected yet.<br />Choose one above to continue.
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3 mb-5">
                            <div className="flex justify-between items-start gap-3 pb-3 border-b border-border">
                              <div>
                                <div className="font-jost font-medium text-foreground">{selectedTherapy.name}</div>
                                <div className="text-xs text-muted-foreground">{selectedTherapy.category}</div>
                              </div>
                              <span className="font-jost font-medium text-foreground">${selectedTherapy.price}</span>
                            </div>
                            {selectedAddons.map((a) => (
                              <div key={a.id} className="flex justify-between items-center gap-3 text-sm">
                                <button
                                  onClick={() => toggleAddon(a.id)}
                                  className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>{a.name}</span>
                                </button>
                                <span className="text-foreground">+${a.price}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-baseline mb-6 pt-2 border-t border-border">
                            <span className="font-jost text-foreground">Total</span>
                            <span className="font-playfair text-3xl text-foreground">${total}</span>
                          </div>

                          <Button
                            onClick={handleCheckout}
                            disabled={checkingOut}
                            size="lg"
                            className="w-full bg-primary text-accent hover:bg-primary-light font-jost font-medium tracking-wide rounded-sm py-6"
                          >
                            {checkingOut ? "Loading checkout…" : <>Pay & Schedule <ArrowRight className="ml-2 h-4 w-4" /></>}
                          </Button>

                          <div className="mt-4 space-y-1.5 text-xs text-muted-foreground text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout via Stripe
                            </div>
                            <div className="flex items-center justify-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" /> Schedule on the next screen
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PREGNANCY IV CALLOUT */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
            <div className="border-2 border-accent/30 rounded-2xl p-8 md:p-10 bg-gradient-to-br from-accent/5 to-transparent">
              <Badge className="mb-4 bg-accent text-accent-foreground">Same-day appointments</Badge>
              <h2 className="font-playfair text-2xl md:text-3xl text-foreground mb-4">
                Suffering from morning sickness? You don't have to.
              </h2>
              <p className="font-jost font-light text-muted-foreground leading-relaxed mb-2">
                Physician-supervised pregnancy IV therapy for hyperemesis gravidarum.
                Lactated Ringer's + B6 + Zofran (physician discretion).
              </p>
              <p className="font-jost font-medium text-foreground mb-6">$185 · OB-referred welcome</p>
              <a href="tel:+17067603470">
                <Button className="bg-primary text-accent hover:bg-primary-light font-jost font-medium tracking-wide rounded-sm">
                  Call to book same-day <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* MEMBERSHIP */}
        <section className="py-16 md:py-20 bg-secondary/40">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl text-center">
            <p className="section-label mb-4">Membership</p>
            <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-3">
              Wellness Pass — $199/mo <span className="text-accent">(Founding: $149)</span>
            </h2>
            <p className="font-jost font-light text-muted-foreground leading-relaxed mb-2">
              2 IVs per month · Priority booking · 10% off additional services
            </p>
            <p className="text-sm text-muted-foreground italic mt-4">
              Ask about Longevity Protocol & Executive Concierge bundles for hormone + IV + peptide care.
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default IVLounge;
