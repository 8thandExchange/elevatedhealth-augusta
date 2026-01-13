import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Shield, Clock, DollarSign } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Link } from "react-router-dom";
import { useBooking } from "@/contexts/BookingContext";

const Spravato = () => {
  const { openBooking } = useBooking();
  const benefits = [
    "FDA-approved for treatment-resistant depression (TRD)",
    "Used with an oral antidepressant for comprehensive treatment",
    "Self-administered nasal spray under medical supervision",
    "Minimum 2-hour observation period following each dose",
    "REMS-certified clinic ensuring highest safety standards"
  ];

  // Structured data for AEO
  const spravatSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "name": "SPRAVATO® (Esketamine) Nasal Spray",
    "procedureType": "Therapeutic",
    "description": "FDA-approved esketamine nasal spray for treatment-resistant depression. Self-administered under medical supervision at a REMS-certified clinic.",
    "drug": {
      "@type": "Drug",
      "name": "SPRAVATO",
      "activeIngredient": "esketamine",
      "prescriptionStatus": "PrescriptionOnly",
      "manufacturer": {
        "@type": "Organization",
        "name": "Janssen Pharmaceuticals"
      }
    },
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is SPRAVATO covered by insurance?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, SPRAVATO® is typically covered by most major insurance plans including Blue Cross Blue Shield, TRICARE, and many others. Coverage often results in $0-50 copays. We verify your benefits before treatment begins."
        }
      },
      {
        "@type": "Question",
        "name": "How is SPRAVATO different from IV ketamine?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SPRAVATO® is FDA-approved esketamine nasal spray, while IV ketamine is administered intravenously. SPRAVATO is more likely to be covered by insurance and is self-administered under supervision. IV ketamine allows more precise dosing but is typically out-of-pocket."
        }
      },
      {
        "@type": "Question",
        "name": "How long does a SPRAVATO session take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SPRAVATO® sessions require a minimum 2-hour monitoring period after administration. The nasal spray itself takes about 5 minutes. Plan for approximately 2.5 hours total for each visit."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>SPRAVATO® (Esketamine) Augusta GA | Insurance-Covered Ketamine | Elevated Health</title>
        <meta 
          name="description" 
          content="SPRAVATO® esketamine nasal spray in Augusta, GA. $99 consultation to verify insurance coverage. Chat with our Virtual Care Team 24/7. Often $0-50 copays with BCBS, TRICARE." 
        />
        <meta 
          name="keywords" 
          content="SPRAVATO Augusta, esketamine Georgia, insurance covered ketamine, treatment-resistant depression, REMS certified clinic" 
        />
        <link rel="canonical" href="https://elevatedhealthaugusta.com/spravato" />
        
        {/* Open Graph */}
        <meta property="og:title" content="SPRAVATO® Augusta | $99 Consultation to Verify Insurance | Elevated Health" />
        <meta property="og:description" content="SPRAVATO® esketamine nasal spray in Augusta, GA. $99 consultation to verify insurance coverage. Chat with our Virtual Care Team 24/7." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://elevatedhealthaugusta.com/spravato" />
        <meta property="og:image" content="https://elevatedhealthaugusta.com/og-image.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SPRAVATO® Augusta | Often $0-50 Copays" />
        <meta name="twitter:description" content="$99 consultation to verify insurance coverage. Chat with our Virtual Care Team 24/7. BCBS, TRICARE accepted." />
        <meta name="twitter:image" content="https://elevatedhealthaugusta.com/og-image.jpg" />
        
        {/* Schema */}
        <script type="application/ld+json">
          {JSON.stringify(spravatSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-6">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Often Covered by Insurance</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                SPRAVATO® Nasal Spray
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed animate-fade-in-up mb-8" style={{ animationDelay: "0.1s" }}>
                An FDA-approved esketamine nasal spray for adults with treatment-resistant depression, 
                administered safely in our certified clinic with comprehensive monitoring.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="text-base md:text-lg px-8 py-6" onClick={openBooking}>
                  Check Your Coverage
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base md:text-lg px-8 py-6">
                  <Link to="/ketamine">
                    Compare All Options
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits Cards */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                Why Choose SPRAVATO®?
              </h2>
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <DollarSign className="h-10 w-10 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Insurance Coverage</h3>
                    <p className="text-sm text-muted-foreground">Often $0-50 copay with BCBS, TRICARE, and major insurers</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-6">
                    <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">FDA Approved</h3>
                    <p className="text-sm text-muted-foreground">Rigorous clinical trials proven effective for TRD</p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-6">
                    <Clock className="h-10 w-10 text-gold mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Fast-Acting</h3>
                    <p className="text-sm text-muted-foreground">Many patients notice improvement within 24 hours</p>
                  </CardContent>
                </Card>
              </div>

              {/* AEO Optimized Content */}
              <div className="bg-muted/30 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-semibold mb-4">What is SPRAVATO®?</h3>
                <p className="text-lg leading-relaxed">
                  <strong>SPRAVATO®</strong> (esketamine) is an FDA-approved nasal spray prescribed with an oral 
                  antidepressant for adults with treatment-resistant depression who have tried at least two 
                  other antidepressant medications without adequate relief. It's administered under medical 
                  supervision at certified healthcare facilities and is often covered by insurance with 
                  copays as low as $0-50.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What to Expect */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                What to Expect
              </h2>
              <Card>
                <CardContent className="p-6 md:p-8">
                  <p className="text-muted-foreground mb-6">
                    SPRAVATO® is designed for patients who have tried other antidepressants without success:
                  </p>
                  <ul className="space-y-4">
                    {benefits.map((item, index) => (
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
                <Link to="/iv-ketamine" className="group">
                  <Card className="h-full hover:border-primary transition-colors">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary">IV Ketamine</h3>
                      <p className="text-sm text-muted-foreground">Traditional infusion therapy with precise dosing control</p>
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
                      <p className="text-sm text-muted-foreground">TRICARE typically covers SPRAVATO®</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Is SPRAVATO® Right for You?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Schedule a consultation to learn if SPRAVATO® could be part of your treatment plan 
                and verify your insurance coverage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-base md:text-lg px-8 py-6" onClick={openBooking}>
                  Book Your Consultation
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

export default Spravato;