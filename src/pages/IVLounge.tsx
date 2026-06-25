import { Helmet } from "react-helmet";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Check, Clock, Droplet, Plus, ShieldCheck, Star, X } from "lucide-react";
import { ELEVATED_PROGRAMS } from "@/lib/stripeConfig";
import { MEMBER_DISCOUNT_PERCENT } from "@/lib/pricing";
import { IV_THERAPIES_CATALOG } from "@/lib/ivTherapiesCatalog";
import { IV_ADDONS_CATALOG } from "@/lib/ivAddonsCatalog";
import { openAssistantChat } from "@/lib/openAssistantChat";
import {
  CANCELLATION_NOTICE_HOURS,
  CARE_EMAIL,
  REBOOKING_FEE_DISPLAY,
  REFUND_PROCESSING_WINDOW,
} from "@/lib/cancellationPolicy";
import { SITE_CONFIG } from "@/lib/siteConfig";

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

const CATEGORY_META: Record<string, { tagline: string }> = {
  Recovery: { tagline: "Bounce back fast" },
  Wellness: { tagline: "Daily balance" },
  Performance: { tagline: "Train. Recover. Repeat." },
  Immunity: { tagline: "Stay in the game" },
  Glow: { tagline: "Skin, hair & nails" },
};

const IV_START_FEE_NOTE = "RN start & monitoring included";

const scrollToMenu = () => {
  document.getElementById("the-menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const IVLounge = () => {
  const { toast } = useToast();
  const [therapies, setTherapies] = useState<Therapy[]>(IV_THERAPIES_CATALOG as Therapy[]);
  const [addons, setAddons] = useState<Addon[]>(IV_ADDONS_CATALOG as Addon[]);
  const [loading, setLoading] = useState(true);
  const [menuLoadError, setMenuLoadError] = useState<string | null>(null);
  const [selectedTherapyId, setSelectedTherapyId] = useState<string | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      try {
        const [therapiesRes, addonsRes] = await Promise.all([
          supabase
            .from("iv_therapies")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
          supabase.from("iv_addons").select("*").eq("is_active", true).order("price"),
        ]);

        if (therapiesRes.error) {
          throw therapiesRes.error;
        }

        const rows = (therapiesRes.data as Therapy[]) || [];
        if (rows.length > 0) {
          setTherapies(rows);
        }
        setMenuLoadError(null);

        if (addonsRes.error) {
          console.warn("[IVLounge] add-ons load failed:", addonsRes.error.message);
          setAddons(IV_ADDONS_CATALOG as Addon[]);
        } else {
          const addonRows = (addonsRes.data as Addon[]) || [];
          setAddons(addonRows.length > 0 ? addonRows : (IV_ADDONS_CATALOG as Addon[]));
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Could not load menu from server";
        console.warn("[IVLounge] using built-in menu fallback:", message);
        setMenuLoadError(message);
        setTherapies(IV_THERAPIES_CATALOG as Therapy[]);
        setAddons(IV_ADDONS_CATALOG as Addon[]);
      } finally {
        setLoading(false);
      }
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

  const pricingStripCols = useMemo(() => {
    const dripPrices =
      therapies.length > 0
        ? therapies.map((t) => t.price)
        : IV_THERAPIES_CATALOG.map((t) => t.price);
    const addonPrices =
      addons.length > 0
        ? addons.map((a) => a.price)
        : IV_ADDONS_CATALOG.map((a) => a.price);
    const range = (prices: number[]) => {
      if (prices.length === 0) return "—";
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max ? `$${min}` : `$${min}–$${max}`;
    };

    return [
      {
        l: "IV Drips",
        p: range(dripPrices),
        sub: "RN-administered · book online · no consult required",
      },
      {
        l: "Boosters & pushes",
        p: range(addonPrices),
        sub: "Add to any drip — glutathione, B12, NAD+ push, and more",
      },
      {
        l: "Member savings",
        p: `${MEMBER_DISCOUNT_PERCENT}% off`,
        sub: "ELEVATED members on IV drips and add-ons",
      },
    ];
  }, [therapies, addons]);

  const selectedTherapy = therapies.find((t) => t.id === selectedTherapyId) || null;
  const selectedAddons = addons.filter((a) => selectedAddonIds.includes(a.id));
  const total =
    (selectedTherapy?.price || 0) + selectedAddons.reduce((sum, a) => sum + a.price, 0);

  const toggleAddon = (id: string) =>
    setSelectedAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const selectTherapy = (id: string) => {
    const therapy = therapies.find((t) => t.id === id);
    if (!therapy) return;

    setSelectedTherapyId(id);
    toast({
      title: `${therapy.name} selected`,
      description: "Scroll down to add boosters and check out.",
    });

    window.setTimeout(() => {
      const target = document.getElementById("your-drip");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
  };

  const handleCheckout = async () => {
    if (!selectedTherapy) return;
    setCheckingOut(true);
    try {
      navigate(`/book/iv/screening?serviceId=${encodeURIComponent(selectedTherapy.id)}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Could not start screening. Please call us to book.";
      toast({ title: "Unable to continue", description: message, variant: "destructive" });
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>IV Therapy Augusta GA | Book Online — Elevated Health</title>
        <meta name="description" content="Book IV hydration therapy online in Augusta, GA. Signature drips from $139, boosters from $25. RN-administered. Same-day appointments." />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/iv-lounge" />
        <meta property="og:title" content="IV Therapy Augusta GA | Elevated Health" />
        <meta property="og:description" content="RN-administered IV drips and boosters — book online, no consult required. Same-day appointments in Evans." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elevatedhealthaugusta.com/iv-lounge" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalProcedure",
          "name": "IV Hydration Therapy",
          "description": "RN-administered IV hydration and vitamin therapy: signature drips, recovery and wellness blends, and optional boosters.",
          "procedureType": "https://schema.org/TherapeuticProcedure",
          "url": "https://elevatedhealthaugusta.com/iv-lounge",
          "provider": { "@type": "MedicalClinic", "name": "Elevated Health Augusta", "url": "https://elevatedhealthaugusta.com" }
        })}</script>
      </Helmet>

      <div className="public-page-shell">
        <Navbar />

        {/* HERO — navy band matches homepage; clear CTA hierarchy */}
        <section className="relative flex items-center pt-24 pb-12 md:min-h-[85vh] md:pt-40 md:pb-24 overflow-hidden bg-primary text-primary-foreground">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-dark opacity-95" aria-hidden />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(199_89%_39%_/_0.18),transparent_55%)]" aria-hidden />

          <div className="relative container mx-auto px-6 lg:px-8 max-w-5xl text-center">
            <Badge className="mb-6 bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/25 hover:bg-primary-foreground/15 font-jost">
              Walk-in friendly · No consult needed
            </Badge>
            <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl xl:text-[4.5rem] text-primary-foreground leading-[1.06] mb-8 md:mb-10">
              Pick your drip.<br />
              <span className="italic text-accent-light">Book in 60 seconds.</span>
            </h1>
            <p className="font-jost font-light text-lg md:text-xl text-primary-foreground/85 max-w-2xl mx-auto mb-10">
              Physician-formulated IV therapy, administered by a registered nurse in our private Augusta lounge.
              Choose your drip, add boosters, pay online — schedule instantly after checkout.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 text-xs md:text-sm font-jost text-primary-foreground/90 mb-8">
              <span className="inline-flex items-center gap-2"><span className="w-7 h-7 rounded-sm bg-primary-foreground/15 border border-primary-foreground/25 text-[11px] font-semibold flex items-center justify-center">1</span> Pick your drip</span>
              <ArrowRight className="h-3.5 w-3.5 text-primary-foreground/50" />
              <span className="inline-flex items-center gap-2"><span className="w-7 h-7 rounded-sm bg-primary-foreground/15 border border-primary-foreground/25 text-[11px] font-semibold flex items-center justify-center">2</span> Complete screening</span>
              <ArrowRight className="h-3.5 w-3.5 text-primary-foreground/50" />
              <span className="inline-flex items-center gap-2"><span className="w-7 h-7 rounded-sm bg-primary-foreground/15 border border-primary-foreground/25 text-[11px] font-semibold flex items-center justify-center">3</span> Pick slot & pay</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                size="lg"
                variant="heroLight"
                onClick={() => document.getElementById("the-menu")?.scrollIntoView({ behavior: "smooth" })}
              >
                Browse the menu <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="heroOutline"
                onClick={() => openAssistantChat()}
              >
                Not sure? Chat with us
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/75 font-jost">
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-light" /> RN-administered</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-light" /> 45–60 minute sessions</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-light" /> Same-day availability</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-light" /> Memberships save 20%</div>
            </div>
          </div>
        </section>

        {/* PRICING STRIP (Pattern B) */}
        <section className="py-16 md:py-20 bg-surface border-y border-border">
          <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
              {pricingStripCols.map((c) => (
                <div key={c.l} className="px-6 py-8 md:py-4 text-center">
                  <p className="section-label mb-3">{c.l}</p>
                  <p className="font-playfair text-3xl md:text-4xl text-foreground mb-2">{c.p}</p>
                  <p className="font-jost text-xs text-muted-foreground">{c.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MENU */}
        <section id="the-menu" className="py-12 md:py-16 scroll-mt-24">
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

            {loading && (
              <p className="text-sm text-muted-foreground mb-4 font-jost">Refreshing menu…</p>
            )}
            {menuLoadError && (
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-4 font-jost">
                Showing standard menu while we reconnect to booking ({menuLoadError}).
              </p>
            )}

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-10 text-center">
                <p className="font-playfair text-xl text-foreground mb-2">Menu unavailable</p>
                <p className="text-sm text-muted-foreground mb-6 font-jost">
                  Please call <a href="tel:+17067603470" className="text-accent underline">(706) 760-3470</a> to book your IV, or try again in a moment.
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Reload menu
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((therapy) => {
                  const meta = CATEGORY_META[therapy.category] || CATEGORY_META.Wellness;
                  const isSelected = selectedTherapyId === therapy.id;
                  const isPopular = therapy.name === "The Meyers";

                  return (
                    <Card
                      key={therapy.id}
                      className={`group relative overflow-hidden cursor-pointer transition-all duration-300 bg-card hover:shadow-lg border ${
                        isSelected
                          ? "border-accent shadow-md ring-1 ring-accent/25"
                          : "border-border hover:border-accent/40"
                      }`}
                      onClick={() => selectTherapy(therapy.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          selectTherapy(therapy.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-hidden
                      />
                      {isPopular && (
                        <div className="absolute top-4 right-4 z-10">
                          <Badge className="bg-primary text-primary-foreground border border-accent/30">
                            <Star className="h-3 w-3 mr-1 fill-accent text-accent" /> Most Popular
                          </Badge>
                        </div>
                      )}
                      <CardContent className="relative p-6 md:p-7 flex flex-col h-full min-h-[360px]">
                        <div className="flex items-start justify-end mb-4">
                          <span className="section-label text-[10px] tracking-[0.2em]">
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
                              <span key={ing} className="text-[11px] px-2 py-1 border border-border/80 bg-muted/50 rounded-sm text-foreground/85 font-jost">
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
                            type="button"
                            size="sm"
                            className={`rounded-full transition-all ${
                              isSelected
                                ? "bg-primary text-primary-foreground ring-2 ring-primary/25"
                                : "bg-secondary text-secondary-foreground border border-primary/20 hover:bg-secondary-light"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectTherapy(therapy.id);
                            }}
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
        <section
          id="your-drip"
          className={`py-16 md:py-20 scroll-mt-28 border-t border-border bg-background transition-shadow ${
            selectedTherapy ? "ring-2 ring-accent/30 ring-inset" : ""
          }`}
        >
          <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <p className="section-label mb-3">Build Your Drip</p>
                <h2 className="font-playfair text-3xl md:text-4xl text-foreground">
                  {selectedTherapy ? "Continue to medical screening" : "Pick a drip above to begin"}
                </h2>
              <Button
                type="button"
                variant="link"
                className="mt-3 text-primary font-jost underline-offset-4 hover:text-accent"
                onClick={scrollToMenu}
              >
                ← Back to menu
              </Button>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
              {/* Add-ons list */}
              <div className="lg:col-span-3 space-y-4">
                <h3 className="font-playfair text-xl text-foreground mb-2">Optional Boosters</h3>
                <p className="text-sm text-foreground/80 font-jost mb-4">
                  Most add-ons $25 · Glutathione $35 · NAD+ $50
                </p>

                {!selectedTherapy ? (
                  <p className="text-sm text-foreground/70 font-jost py-6">
                    Select a drip from the menu above to unlock booster options.
                  </p>
                ) : loading && addons.length === 0 ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                  </div>
                ) : addons.length === 0 ? (
                  <p className="text-sm text-foreground/70 font-jost py-6">
                    No boosters listed online yet — you can still check out with your drip only, or call us to add boosters at your visit.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {addons.map((addon) => {
                      const checked = selectedAddonIds.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          disabled={!selectedTherapy}
                          className={`w-full text-left p-5 rounded-xl border-2 shadow-sm transition-all ${
                            checked
                              ? "border-accent bg-card ring-1 ring-accent/30"
                              : "border-border bg-card hover:border-accent/50 hover:shadow-md"
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
                                <p className="text-sm text-foreground/75">{addon.description}</p>
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
                          <div className="mt-4">
                            <Button type="button" variant="outline" size="sm" onClick={scrollToMenu}>
                              ← Back to menu
                            </Button>
                          </div>
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
                            className="w-full font-jost font-medium tracking-wide rounded-sm py-6"
                          >
                            {checkingOut ? "Loading..." : <>Continue to Screening <ArrowRight className="ml-2 h-4 w-4" /></>}
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
              <Badge className="mb-4 bg-secondary text-secondary-foreground border border-primary/15">Same-day appointments</Badge>
              <h2 className="font-playfair text-2xl md:text-3xl text-foreground mb-4">
                Suffering from morning sickness? You don't have to.
              </h2>
              <p className="font-jost font-light text-muted-foreground leading-relaxed mb-2">
                Physician-supervised pregnancy IV therapy for hyperemesis gravidarum.
                Lactated Ringer's + B6 + Zofran (physician discretion).
              </p>
              <p className="font-jost font-medium text-foreground mb-6">$185 · OB-referred welcome</p>
              <a href="tel:+17067603470">
                <Button className="font-jost font-medium tracking-wide rounded-sm">
                  Call to book same-day <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* FAQ (Pattern F) */}
        <section className="py-20 md:py-24 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <p className="section-label mb-4">FAQ</p>
            <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-10">
              Questions, <span className="italic">answered</span>.
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: "Do I need a consultation first?", a: "No — IV therapy is direct-book. Our RN screens for contraindications at the visit." },
                { q: "How long does an IV take?", a: "Most drips take 30–45 minutes. Optional boosters add only a few minutes." },
                { q: "Can I add boosters at the visit?", a: "Yes. Let the clinical team know when you arrive — add-ons are charged at checkout after." },
                { q: "Are members charged differently?", a: `ELEVATED members save ${MEMBER_DISCOUNT_PERCENT}% on eligible à la carte IV, peptide, and injectable add-ons and receive priority booking. Base walk-in IV pricing is the same.` },
                { q: "What if I'm not feeling well after?", a: "Reach out. We follow up with every patient. Reactions are rare, but we take every concern seriously." },
                {
                  q: "What is your cancellation and refund policy?",
                  a: `Give us at least ${CANCELLATION_NOTICE_HOURS} hours notice to cancel or reschedule an IV appointment for a full refund or free reschedule. Less than ${CANCELLATION_NOTICE_HOURS} hours or a no-show: no refund, and a ${REBOOKING_FEE_DISPLAY} rebooking fee applies before you can book again. Email ${CARE_EMAIL} or call ${SITE_CONFIG.phone} — do not no-show. Refunds process in ${REFUND_PROCESSING_WINDOW}.`,
                },
              ].map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left font-playfair text-lg text-foreground">{f.q}</AccordionTrigger>
                  <AccordionContent className="font-jost font-light text-muted-foreground text-base leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* MEMBERSHIP */}
        <section className="py-16 md:py-20 bg-secondary/40">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl text-center">
            <p className="section-label mb-4">Membership</p>
            <h2 className="font-playfair text-3xl md:text-4xl text-foreground mb-3">
              {ELEVATED_PROGRAMS.wellness.name} — <span className="italic text-accent">{ELEVATED_PROGRAMS.wellness.displayPrice}</span>
            </h2>
            <p className="font-jost font-light text-muted-foreground leading-relaxed mb-2">
              Two complimentary signature IV drips per month (any drip on our menu) plus {MEMBER_DISCOUNT_PERCENT}% off boosters and à la carte IV, peptide, and injectable services. Boosters are discounted, not free.
            </p>
            <p className="text-sm text-muted-foreground italic mt-4">
              Program enrollment is medically gated. Cancel anytime per your agreement.
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default IVLounge;
