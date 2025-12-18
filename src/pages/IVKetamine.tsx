import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Link } from "react-router-dom";

const IVKetamine = () => {
  const safetyItems = [
    "Comprehensive screening including cardiovascular history, current medications, and substance-use assessment",
    "Continuous vitals monitoring throughout your infusion session",
    "Integration visits to support your treatment journey and discuss progress",
    "Coordination with your primary care provider and mental health professionals"
  ];

  // Structured data for AEO
  const ivKetamineSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "name": "IV Ketamine Therapy",
    "procedureType": "Therapeutic",
    "description": "IV ketamine infusion therapy for treatment-resistant depression, anxiety, and PTSD. Administered under medical supervision at Elevated Health Augusta.",
    "howPerformed": "Intravenous infusion administered over 40-60 minutes in a monitored clinical setting",
    "preparation": "Medical screening, medication review, and baseline vitals assessment",
    "followup": "Integration sessions and ongoing provider coordination",
    "provider": {
      "@type": "MedicalClinic",
      "name": SITE_CONFIG.clinicName,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": SITE_CONFIG.address.line1,
        "addressLocality": "Evans",
        "addressRegion": "GA",
        "postalCode": "30809"
      },
      "telephone": SITE_CONFIG.phone
    }
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>IV Ketamine Therapy Augusta GA | Treatment-Resistant Depression | Elevated Health</title>
        <meta 
          name="description" 
          content="IV ketamine infusion therapy in Augusta, GA for treatment-resistant depression, anxiety, and PTSD. $400/session with continuous monitoring. BCBS, TRICARE accepted." 
        />
        <meta 
          name="keywords" 
          content="IV ketamine Augusta, ketamine infusion therapy Georgia, treatment-resistant depression Augusta, ketamine for anxiety, ketamine for PTSD" 
        />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/iv-ketamine" />
        
        {/* Open Graph */}
        <meta property="og:title" content="IV Ketamine Therapy | Elevated Health Augusta" />
        <meta property="og:description" content="IV ketamine infusion therapy for treatment-resistant depression, anxiety, and PTSD. Professional monitoring in Augusta, GA." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elevatedhealthaugusta.com/iv-ketamine" />
        
        {/* Schema */}
        <script type="application/ld+json">
          {JSON.stringify(ivKetamineSchema)}
        </script>
      </Helmet>

      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section id="iv-intro" className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                IV Ketamine Therapy
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                For adults who haven't found relief with standard treatments, IV ketamine—delivered 
                in a monitored clinic—may help reset stuck mood pathways.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="text-base md:text-lg px-8 py-6">
                  <a href={SITE_CONFIG.bookingLinks.ketamine} target="_blank" rel="noopener noreferrer">
                    Book a Consultation
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base md:text-lg px-8 py-6">
                  <Link to="/ketamine">
                    Learn More About Ketamine
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* What is IV Ketamine - AEO Optimized */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
                What is IV Ketamine Therapy?
              </h2>
              {/* Featured snippet optimized paragraph */}
              <div className="bg-muted/30 p-6 rounded-lg mb-8">
                <p className="text-lg leading-relaxed">
                  <strong>IV ketamine therapy</strong> is a medical treatment where low-dose ketamine is administered 
                  intravenously over 40-60 minutes under physician supervision. It works by promoting 
                  neuroplasticity and resetting neural pathways, often providing relief within hours 
                  rather than weeks. Studies show up to 70% of patients with treatment-resistant 
                  depression experience significant improvement.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3">Conditions Treated</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Treatment-resistant depression</li>
                      <li>• Anxiety disorders</li>
                      <li>• PTSD and trauma</li>
                      <li>• Chronic pain conditions</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3">Treatment Protocol</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• 6 sessions over 2-3 weeks (initial)</li>
                      <li>• 40-60 minute infusion time</li>
                      <li>• $400 per session / $2,200 for 6</li>
                      <li>• Maintenance as needed</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Section */}
        <section id="iv-safety" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                Safety & Monitoring
              </h2>
              <Card>
                <CardContent className="p-6 md:p-8">
                  <p className="text-muted-foreground mb-6">
                    Your safety is our top priority. Every IV ketamine session includes:
                  </p>
                  <ul className="space-y-4">
                    {safetyItems.map((item, index) => (
                      <li key={index} className="flex gap-3 items-start">
                        <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Related Services */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                Related Services
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Link to="/spravato" className="group">
                  <Card className="h-full hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary">SPRAVATO®</h3>
                      <p className="text-sm text-muted-foreground">FDA-approved esketamine nasal spray, often covered by insurance</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/ketamine" className="group">
                  <Card className="h-full hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary">Ketamine Overview</h3>
                      <p className="text-sm text-muted-foreground">Compare all ketamine treatment options available</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/military-veteran" className="group">
                  <Card className="h-full hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary">Veterans & TRICARE</h3>
                      <p className="text-sm text-muted-foreground">Coverage options for military members</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="iv-cta" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Ready to Explore IV Ketamine?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Schedule a consultation to discuss your treatment options and determine if 
                IV ketamine therapy is right for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-base md:text-lg px-8 py-6">
                  <a href={SITE_CONFIG.bookingLinks.ketamine} target="_blank" rel="noopener noreferrer">
                    Book Your Consultation
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base md:text-lg px-8 py-6">
                  <a href={`tel:${SITE_CONFIG.phoneRaw}`}>
                    Call {SITE_CONFIG.phone}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default IVKetamine;