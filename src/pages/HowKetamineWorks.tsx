import { Helmet } from "react-helmet";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { trackCTAClick } from "@/lib/analytics";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { useBooking } from "@/contexts/BookingContext";

const HowKetamineWorks = () => {
  const { openBooking } = useBooking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const handleBooking = () => {
    trackCTAClick('how_ketamine_works_book', 'payment_modal');
    openBooking();
  };

  const handleCall = () => {
    trackCTAClick('how_ketamine_works_call', 'tel:+17064267383');
    window.location.href = 'tel:+17064267383';
  };


  return (
    <>
      <Helmet>
        <title>How Ketamine Works | Réveil</title>
        <meta 
          name="description" 
          content="How ketamine works for depression, PTSD, and anxiety. $149 consultation credited toward treatment. Chat with our Virtual Care Team 24/7. Evidence-based explainers backed by Yale research." 
        />
        <meta property="og:title" content="How Ketamine Works | Réveil" />
        <meta property="og:description" content="Evidence-based ketamine therapy explained with medical illustrations and research-backed data." />
        <link rel="canonical" href="https://www.reveil.health/how-ketamine-works" />
        
        {/* Schema.org structured data for medical content */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "name": "How Ketamine Works",
            "description": "Evidence-based explanation of ketamine therapy mechanism of action for treating depression, PTSD, and anxiety",
            "medicalAudience": [{
              "@type": "MedicalAudience",
              "audienceType": "Patient"
            }],
            "about": {
              "@type": "MedicalTherapy",
              "name": "Ketamine Therapy",
              "relevantSpecialty": {
                "@type": "MedicalSpecialty",
                "name": "Psychiatry"
              }
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative bg-primary text-primary-foreground py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                How Ketamine Works
              </h1>
              <p className="font-inter text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto">
                Rapid, research-backed relief in 45 minutes. Explore the science behind ketamine therapy.
              </p>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  src="https://www.youtube.com/embed/nW21-AYY_fs"
                  title="How Ketamine Works - Réveil"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  loading="lazy"
                />
              </div>

              {/* Research Citation */}
              <div className="mt-12 p-6 bg-secondary/30 rounded-lg border border-border">
                <p className="font-inter text-sm text-muted-foreground text-center">
                  <strong className="text-foreground">Research-Backed:</strong> Data from Yale School of Medicine (2023), 
                  National Institute of Mental Health, and peer-reviewed journals. Ketamine therapy has shown 70%+ response 
                  rates for treatment-resistant depression in clinical trials.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer Section */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Ready to Start Your Healing Journey?
              </h2>
              <p className="font-inter text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Book a $149 consultation to discuss your treatment options with our board-certified providers. The fee is credited toward your treatment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  onClick={handleBooking}
                  className="w-full sm:w-auto text-lg px-8 py-6"
                >
                  Book Your Consultation
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleCall}
                  className="w-full sm:w-auto text-lg px-8 py-6"
                >
                  Call Us (706) 426-7383
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HowKetamineWorks;
