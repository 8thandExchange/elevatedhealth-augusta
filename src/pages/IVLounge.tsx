import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { useEffect } from "react";

const ivMenu = [
  { name: "Myers Cocktail", price: "$175" },
  { name: "Immune Boost", price: "$195" },
  { name: "Athletic Recovery", price: "$195" },
  { name: "Hydration", price: "$150" },
  { name: "NAD+ Infusion", price: "$299–399" },
  { name: "Glutathione Push", price: "$50 add-on" },
];

const IVLounge = () => {
  const { openBooking } = useBooking();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Helmet>
        <title>IV Therapy | Réveil</title>
        <meta name="description" content="Physician-formulated IV therapy in Evans, GA. Myers Cocktail, NAD+, Immune Boost & more. Same-day pregnancy IV available." />
        <link rel="canonical" href="https://reveil.health/iv-lounge" />
      </Helmet>
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <p className="section-label mb-6">IV Therapy</p>
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 leading-tight">
              What a hospital charges thousands for.<br /><span className="italic">We charge hundreds.</span>
            </h1>
            <p className="font-jost font-light text-lg text-muted-foreground leading-relaxed">
              IV therapy delivers nutrients, hydration, and medication directly into your bloodstream — 100% absorption, immediate effect. At Réveil, every infusion is physician-formulated and administered by a trained RN under direct medical supervision. Not a wellness bar. Not a hangover spa. Medicine.
            </p>
          </div>
        </section>
        <div className="section-divider max-w-3xl mx-auto" />
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <p className="section-label mb-8">IV Menu</p>
            <div className="space-y-0">
              {ivMenu.map((item) => (
                <div key={item.name} className="flex justify-between items-center py-5 border-b border-border/50">
                  <span className="font-playfair text-lg text-foreground">{item.name}</span>
                  <span className="font-jost font-medium text-accent text-sm">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <div className="section-divider max-w-3xl mx-auto" />
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <div className="border border-accent/40 p-8 md:p-10">
              <h2 className="font-playfair text-2xl md:text-3xl text-foreground mb-4">Suffering through morning sickness? You don't have to.</h2>
              <p className="font-jost font-light text-muted-foreground leading-relaxed mb-4">
                Hyperemesis gravidarum is one of the most common reasons pregnant women end up in the ER. At Réveil, we offer physician-supervised pregnancy IV therapy — same-day appointments reserved for HG patients. Safe. Clinically appropriate. OB-referred welcome.
              </p>
              <p className="font-jost font-medium text-foreground mb-6">Lactated Ringer's + B6 + Zofran (physician discretion) — $185</p>
              <Button onClick={openBooking} className="bg-primary text-accent font-jost font-medium tracking-wide text-sm px-8 py-5 rounded-sm hover:bg-primary-light">
                Book same-day pregnancy IV<ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
        <div className="section-divider max-w-3xl mx-auto" />
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
            <p className="section-label mb-6">Membership</p>
            <h3 className="font-playfair text-2xl text-foreground mb-4">Wellness Pass: $199/mo <span className="text-accent">(Founding: $149)</span></h3>
            <p className="font-jost font-light text-muted-foreground leading-relaxed mb-6">2 IVs/month + priority booking + 10% off additional services</p>
            <p className="font-jost font-light text-sm text-muted-foreground italic">Ask about our Longevity Protocol and Executive Concierge memberships for comprehensive hormone + IV + peptide bundles.</p>
          </div>
        </section>
        <div className="section-divider max-w-3xl mx-auto" />
        <section className="py-16 md:py-24 bg-background text-center">
          <div className="container mx-auto px-6">
            <Button onClick={openBooking} size="lg" className="bg-primary text-accent font-jost font-medium tracking-wide text-sm px-10 py-6 rounded-sm hover:bg-primary-light">
              Book your IV appointment<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default IVLounge;