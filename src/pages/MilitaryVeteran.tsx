import { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Copy, Send, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ReferralRequestModal } from "@/components/ReferralRequestModal";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Link } from "react-router-dom";

const MilitaryVeteran = () => {
  const {
    toast
  } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollToForm = () => {
    const element = document.getElementById("mv-widget");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };
  const tricareTemplate = `Hello,

I'm requesting a referral to Réveil for ketamine-assisted therapy evaluation.

Clinic Information:
${SITE_CONFIG.clinicName}
${SITE_CONFIG.address.full}
Phone: ${SITE_CONFIG.phone}

This clinic offers FDA-approved SPRAVATO® (esketamine) nasal spray for Treatment-Resistant Depression (TRD), as well as off-label IV ketamine therapy for qualifying conditions.

I believe this specialized treatment may be beneficial for my case, and I'd like to explore coverage options under my TRICARE plan.

Thank you for your assistance.`;
  const vaTemplate = `Hello,

I'm requesting authorization through VA Community Care for ketamine-assisted therapy evaluation at Réveil.

Clinic Information:
${SITE_CONFIG.clinicName}
${SITE_CONFIG.address.full}
Phone: ${SITE_CONFIG.phone}

This clinic provides evidence-based ketamine therapies including FDA-approved SPRAVATO® (esketamine) for Treatment-Resistant Depression and IV ketamine for qualifying mental health conditions.

As a Veteran enrolled in VA care, I'm interested in exploring whether this treatment is available through Community Care authorization.

Thank you for considering my request.`;
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `${type} referral template copied successfully.`
      });
    });
  };
  const advocacyItems = ["Dedicated TRICARE and VA benefit advocates on staff", "Support with referral documentation and prior authorization submissions", "Complimentary benefit verification to check coverage eligibility", "Guidance navigating military healthcare systems and Community Care networks"];

  // Schema for AEO
  const veteranSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Does TRICARE cover ketamine therapy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "TRICARE typically covers FDA-approved SPRAVATO® (esketamine) for treatment-resistant depression. Coverage varies by plan. IV ketamine may require prior authorization or referral. We help you navigate the process and verify your benefits before treatment."
        }
      },
      {
        "@type": "Question",
        "name": "Can Veterans get ketamine therapy through the VA?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Veterans enrolled in VA care may access ketamine therapy through VA Community Care. We help you request authorization and provide all documentation needed for your VA care team to approve treatment at Réveil."
        }
      },
      {
        "@type": "Question",
        "name": "How do I get a referral for ketamine therapy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Contact your primary care manager or mental health provider with our referral template. We provide pre-written messages for both TRICARE and VA requests. Our staff can also help you navigate the referral process and verify coverage."
        }
      }
    ]
  };

  return <div className="min-h-screen">
      <Helmet>
        <title>Veteran Mental Health Augusta | TRICARE & VA Ketamine Therapy | Réveil</title>
        <meta 
          name="description" 
          content="Ketamine therapy for Veterans in Augusta, GA. $149 consultation with free benefits verification. Chat with our Virtual Care Team 24/7. TRICARE and VA Community Care accepted." 
        />
        <meta 
          name="keywords" 
          content="TRICARE ketamine therapy, VA ketamine Augusta, veteran mental health Georgia, military PTSD treatment, Community Care ketamine" 
        />
        <link rel="canonical" href="https://reveil.health/military-veteran" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Veteran Mental Health | $149 Consultation + Free Benefits Verification | Réveil" />
        <meta property="og:description" content="Ketamine therapy for Veterans in Augusta, GA. $149 consultation with free benefits verification. Chat with our Virtual Care Team 24/7." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://reveil.health/military-veteran" />
        <meta property="og:image" content="https://reveil.health/og-image.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Veteran Ketamine Therapy | TRICARE & VA Accepted" />
        <meta name="twitter:description" content="$149 consultation with free benefits verification. Chat with our Virtual Care Team 24/7." />
        <meta name="twitter:image" content="https://reveil.health/og-image.jpg" />
        
        {/* Schema */}
        <script type="application/ld+json">
          {JSON.stringify(veteranSchema)}
        </script>
      </Helmet>
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section id="mv-hero" className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                Military & Veteran Care — You may be eligible for covered treatment
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 animate-fade-in-up" style={{
              animationDelay: "0.1s"
            }}>
                We help TRICARE beneficiaries and VA-enrolled Veterans check benefits, prepare 
                referral requests, and advocate for themselves.
              </p>
              <Button onClick={scrollToForm} size="lg" className="text-base md:text-lg px-8 py-6 animate-fade-in-up" style={{
              animationDelay: "0.2s"
            }}>
                Start Your Benefits Check
              </Button>
            </div>
          </div>
        </section>

        {/* Advocacy Section */}
        <section id="mv-advocacy" className="py-16 bg-background md:py-[15px]">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
                How We Support Military-Connected Patients
              </h2>
              <Card>
                <CardContent className="p-6 md:p-8">
                  <ul className="space-y-4">
                    {advocacyItems.map((item, index) => <li key={index} className="flex gap-3 items-start">
                        <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-base leading-relaxed">{item}</span>
                      </li>)}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* TRICARE Portal Section */}
        <section id="tricare-portal" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">TRICARE: Requesting a Referral</CardTitle>
                  <CardDescription className="text-base pt-2">
                    Use this template to request a referral from your TRICARE network provider. 
                    Simply copy and send to your primary care manager or mental health provider.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-4 md:p-6 mb-4">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                      {tricareTemplate}
                    </pre>
                  </div>
                  <Button onClick={() => copyToClipboard(tricareTemplate, "TRICARE")} variant="outline" className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copy TRICARE Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* VA Portal Section */}
        <section id="va-portal" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl">VA Community Care: Requesting Authorization</CardTitle>
                  <CardDescription className="text-base pt-2">
                    Use this template to request Community Care authorization from your VA care team. 
                    Submit through your VA provider or patient advocate.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-4 md:p-6 mb-4">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                      {vaTemplate}
                    </pre>
                  </div>
                  <Button onClick={() => copyToClipboard(vaTemplate, "VA")} variant="outline" className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copy VA Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Widget Section */}
        <section id="mv-widget" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Send Your Referral Request
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Complete the form below and we'll send your referral request to your provider and follow up within 1-2 business days.
              </p>
            </div>
            
            {/* Form Section */}
            <section id="mv-form" className="max-w-3xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Referral Request Form</CardTitle>
                  <CardDescription className="text-base">
                    All fields marked with * are required. This form is WCAG AA compliant and fully accessible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setIsModalOpen(true)} size="lg" className="w-full text-base md:text-lg gap-2">
                    <Send className="h-5 w-5" />
                    Complete Referral Request Form
                  </Button>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Your information is secure and will only be shared with your provider and our clinic team.
                  </p>
                </CardContent>
              </Card>
            </section>
          </div>
        </section>
      </main>

      <Footer />
      <ReferralRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>;
};
export default MilitaryVeteran;