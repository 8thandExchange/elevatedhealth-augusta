import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, TestTube, CheckCircle2, ArrowRight, CreditCard, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useState } from "react";
import ConsultationModal from "@/components/ConsultationModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SITE_CONFIG } from "@/lib/siteConfig";
import NotReadyToBook from "@/components/NotReadyToBook";

const Hormones = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isConsultationLoading, setIsConsultationLoading] = useState(false);
  const [isMappingLoading, setIsMappingLoading] = useState(false);
  

  const handleConsultationCheckout = async () => {
    setIsConsultationLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-consultation-checkout", {
        body: { serviceType: "hormone" }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Consultation checkout error:", err);
      toast.error("Failed to start checkout. Please try again or call us.");
    } finally {
      setIsConsultationLoading(false);
    }
  };

  const handleMappingCheckout = async () => {
    setIsMappingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-hormone-checkout", {
        body: { 
          mappingType: "hormone"
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Mapping checkout error:", err);
      toast.error("Failed to start checkout. Please try again or call us.");
    } finally {
      setIsMappingLoading(false);
    }
  };

  const protocols = [
    {
      name: "Menopause Restoration",
      compound: "Bi-Est / Progesterone",
      description: "Precision estrogen and progesterone balance for women experiencing menopause, perimenopause, or hormonal decline.",
      for: "Women"
    },
    {
      name: "Androgen Vitality",
      compound: "Testosterone Therapy",
      description: "Bio-identical testosterone optimization for men and women experiencing fatigue, low libido, or muscle loss.",
      for: "Men & Women"
    },
    {
      name: "Adrenal Recovery",
      compound: "Cortisol Management",
      description: "Targeted support for cortisol dysregulation, chronic stress, and adrenal fatigue patterns.",
      for: "All Patients"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Precision Bio-Identical Therapy Augusta | Hormone Optimization - Réveil</title>
        <meta name="description" content="Bioidentical hormone replacement therapy in Augusta, GA. $99 medical consultation credited toward treatment. Chat with our Virtual Care Team 24/7. ZRT diagnostics for men and women." />
        <meta name="keywords" content="bioidentical hormones Augusta, BHRT Augusta GA, testosterone therapy, menopause treatment, hormone optimization Augusta, ZRT testing" />
        <meta property="og:title" content="Precision Bio-Identical Therapy Augusta | Hormone Optimization - Réveil" />
        <meta property="og:description" content="Bioidentical hormone replacement therapy in Augusta, GA. $99 medical consultation credited toward treatment. Chat with our Virtual Care Team 24/7." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reveil.health/hormones" />
        <meta property="og:image" content="https://reveil.health/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hormone Optimization Augusta | Bio-Identical Therapy" />
        <meta name="twitter:description" content="$99 medical consultation credited toward treatment. Chat with our Virtual Care Team 24/7. ZRT diagnostics." />
        <meta name="twitter:image" content="https://reveil.health/og-image.jpg" />
      </Helmet>

      <div className="min-h-screen">
        <Navbar />
        
        <main>
          {/* Hero Section */}
          <section className="relative min-h-[60vh] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-[hsl(200,25%,35%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />
            
            <div className="relative z-10 container mx-auto px-6 text-center py-32">
              <p className="text-sm tracking-[0.3em] uppercase text-gold mb-6 font-lato font-light animate-fade-in">
                Biological Reset
              </p>
              
              {/* As low as pricing badge */}
              <div className="mb-4 animate-fade-in" style={{ animationDelay: "0.05s" }}>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-medium">
                  💳 As low as $75/month with Klarna
                </span>
              </div>
              
              <h1 className="font-cormorant text-white mb-6 animate-fade-in text-4xl sm:text-5xl md:text-6xl" style={{ animationDelay: "0.1s" }}>
                Precision Bio-Identical Therapy
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 font-lato font-light leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
                We reject the one-size-fits-all approach. Your hormones are unique. Your protocol should be too.
              </p>
              <Button
                onClick={() => setIsBookingOpen(true)}
                size="lg"
                className="animate-fade-in bg-gold border-gold text-white hover:bg-gold-dark"
                style={{ animationDelay: "0.3s" }}
              >
                Book $99 Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </section>

          {/* Test, Don't Guess Section */}
          <section className="section-spacing bg-background">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                    Our Philosophy
                  </p>
                  <h2 className="font-cormorant text-foreground mb-6">
                    Test, Don't Guess
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <p className="text-lg text-muted-foreground leading-relaxed font-light mb-6">
                      Using advanced Saliva and Blood Spot diagnostics, we map your specific levels 
                      of <span className="text-foreground font-medium">Estrogen, Testosterone, Progesterone, and Cortisol</span> before 
                      writing a single prescription.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed font-light mb-8">
                      This is not guesswork. This is precision medicine—architecting your protocol 
                      based on objective data, not symptoms alone.
                    </p>
                    <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <TestTube className="h-5 w-5 text-gold" />
                      <span className="text-sm text-foreground font-lato">
                        Powered by ZRT Laboratory Diagnostics
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {["Estrogen (E2)", "Progesterone (Pg)", "Testosterone (T)", "Cortisol (Morning & Evening)", "DHEA-S"].map((test, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border/50">
                        <CheckCircle2 className="h-5 w-5 text-gold shrink-0" />
                        <span className="text-foreground font-light">{test}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Have Questions? Section */}
          <section className="section-spacing-sm bg-background">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-2xl mx-auto">
                <NotReadyToBook 
                  variant="b" 
                  title="Not sure if hormone therapy is right for you?"
                  description="Hormone imbalance symptoms can be confusing. Our team can explain the testing process, discuss what your symptoms might indicate, and answer questions about treatment options—no commitment required."
                  ctaText="Discuss Your Symptoms"
                />
              </div>
            </div>
          </section>

          {/* Safety First Section */}
          <section className="section-spacing bg-secondary/30">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                  Safety First
                </p>
                <h2 className="font-cormorant text-foreground mb-8">
                  Your Safety Is Non-Negotiable
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-light mb-8">
                  We rigorously screen for contraindications—including <span className="text-foreground font-medium">prostate health for men</span> and 
                  <span className="text-foreground font-medium"> breast health for women</span>—before initiating any protocol. 
                  Certain conditions require LabCorp blood work rather than saliva testing to ensure complete safety.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed font-light">
                  We partner with leading compounding pharmacies to deliver pure, precise bio-identical medications 
                  tailored to your exact specifications.
                </p>

                {/* Safety Badges */}
                <div className="grid grid-cols-3 gap-6 mt-12">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground font-light">PSA Screening<br />(Men)</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-feminine/10 mb-3">
                      <Heart className="h-6 w-6 text-feminine" />
                    </div>
                    <p className="text-sm text-muted-foreground font-light">Breast Health<br />(Women)</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-3">
                      <TestTube className="h-6 w-6 text-gold" />
                    </div>
                    <p className="text-sm text-muted-foreground font-light">Liver & Kidney<br />Function</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Protocols Section */}
          <section className="section-spacing bg-background">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                    Our Protocols
                  </p>
                  <h2 className="font-cormorant text-foreground mb-6">
                    Precision Restoration Pathways
                  </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {protocols.map((protocol, index) => (
                    <Card key={index} className="border border-border/50 hover:border-primary/30 transition-all bg-card/80">
                      <CardContent className="p-8">
                        <div className="text-xs text-gold uppercase tracking-wider mb-2 font-lato">
                          {protocol.for}
                        </div>
                        <h3 className="text-xl font-cormorant text-foreground mb-2">
                          {protocol.name}
                        </h3>
                        <p className="text-sm text-primary font-medium mb-4">
                          {protocol.compound}
                        </p>
                        <p className="text-muted-foreground font-light text-sm leading-relaxed">
                          {protocol.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* À La Carte Options */}
          <section className="section-spacing bg-background">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                    Flexible Options
                  </p>
                  <h2 className="font-cormorant text-foreground mb-6">
                    À La Carte Services
                  </h2>
                  <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
                    Not ready for ongoing treatment? Start with a diagnostic to understand your hormone levels.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {/* Discovery Consultation */}
                  <Card className="border border-border/50 hover:border-primary/30 transition-all bg-card/80">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                        <Heart className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-cormorant text-xl text-foreground mb-2">
                        Discovery Consultation
                      </h3>
                      <p className="text-3xl font-cormorant text-foreground mb-2">$99</p>
                      <p className="text-xs text-green-600 font-medium mb-2">
                        Includes $99 credit toward Hormone Mapping
                      </p>
                      <p className="text-sm text-muted-foreground mb-4 font-light">
                        30-minute in-person visit with our physician to discuss symptoms and treatment options.
                      </p>
                      <Button 
                        onClick={handleConsultationCheckout}
                        disabled={isConsultationLoading}
                        className="w-full bg-primary hover:bg-primary-dark text-primary-foreground"
                      >
                        {isConsultationLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="mr-2 h-4 w-4" />
                        )}
                        {isConsultationLoading ? "Processing..." : "Book - $99"}
                      </Button>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Not ready? Call {SITE_CONFIG.phone}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Hormone Mapping */}
                  <Card className="border border-gold/40 hover:border-gold transition-all bg-card/80 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gold text-white text-xs px-3 py-1 rounded-full font-lato">
                        Most Popular
                      </span>
                    </div>
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 mb-4">
                        <TestTube className="h-6 w-6 text-gold" />
                      </div>
                      <h3 className="font-cormorant text-xl text-foreground mb-2">
                        Hormone Mapping
                      </h3>
                      <p className="text-3xl font-cormorant text-foreground mb-2">$250</p>
                      <p className="text-sm text-muted-foreground mb-4 font-light">
                        Complete ZRT saliva panel + follow-up consultation with your hormone specialist after results return.
                      </p>
                      <Button 
                        onClick={handleMappingCheckout}
                        disabled={isMappingLoading}
                        className="w-full bg-gold hover:bg-gold/90 text-white border-gold"
                      >
                        {isMappingLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isMappingLoading ? "Processing..." : "Map Your Hormones — $250"}
                      </Button>
                    </CardContent>
                  </Card>

                </div>

                <p className="text-center text-sm text-muted-foreground mt-8 font-light">
                  All diagnostic services can be applied toward treatment enrollment within 60 days.
                </p>
              </div>
            </div>
          </section>
          <section className="section-spacing bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="text-center mb-12">
                <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                  Specialized Care
                </p>
                <h2 className="font-cormorant text-foreground mb-6">
                  Choose Your Path
                </h2>
              </div>

              <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                {/* Women's HRT Card */}
                <Link to="/hormones-women">
                  <Card className="h-full hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer border-2 border-feminine/30 hover:border-feminine group">
                    <CardContent className="p-10 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-feminine/10 group-hover:bg-feminine/20 transition-colors mb-6">
                        <Heart className="h-8 w-8 text-feminine" />
                      </div>
                      <h3 className="text-2xl font-cormorant mb-2 group-hover:text-feminine transition-colors">
                        Elevated+ for Her
                      </h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed font-light">
                        Menopause restoration, perimenopause support, and estrogen/progesterone optimization.
                      </p>
                      <Button 
                        className="w-full bg-feminine hover:bg-feminine-light text-feminine-foreground"
                      >
                        Explore Women's Protocols
                      </Button>
                    </CardContent>
                  </Card>
                </Link>

                {/* Men's TRT Card */}
                <Link to="/hormones-men">
                  <Card className="h-full hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer border-2 border-primary/30 hover:border-primary group">
                    <CardContent className="p-10 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mb-6">
                        <Shield className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-cormorant mb-2 group-hover:text-primary transition-colors">
                        Elevated+ for Him
                      </h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed font-light">
                        Testosterone optimization, androgen vitality, and performance restoration.
                      </p>
                      <Button 
                        className="w-full bg-primary hover:bg-primary-light text-primary-foreground"
                      >
                        Explore Men's Protocols
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="section-spacing bg-primary text-primary-foreground">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-sm tracking-[0.3em] uppercase text-primary-foreground/70 mb-4 font-lato font-light">
                  Begin Your Restoration
                </p>
                <h2 className="font-cormorant text-primary-foreground mb-6">
                  Your Biological Reset Awaits
                </h2>
                <p className="text-lg text-primary-foreground/90 mb-10 font-light leading-relaxed">
                  We will test your biology, understand your symptoms, and architect a protocol 
                  designed specifically for your unique hormonal landscape.
                </p>
                <Button 
                  size="lg"
                  variant="outline"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-primary-foreground"
                  onClick={() => setIsBookingOpen(true)}
                >
                  Apply for Consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <ConsultationModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      </div>
    </>
  );
};

export default Hormones;