import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Shield, Lock, FileCheck, Eye, Bell, Phone, Users, Clipboard } from "lucide-react";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "responsibilities", label: "Our Responsibilities" },
  { id: "usage", label: "How We Use PHI" },
  { id: "disclosures", label: "Required Disclosures" },
  { id: "rights", label: "Your Rights" },
  { id: "authorization", label: "Uses Requiring Authorization" },
  { id: "complaints", label: "Questions & Complaints" },
];

const HipaaNotice = () => {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => ({
        id: s.id,
        element: document.getElementById(s.id)
      }));

      for (const section of sectionElements) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom > 150) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto py-12 px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-playfair text-4xl lg:text-5xl font-light text-foreground mb-4">
              HIPAA Notice of Privacy Practices
            </h1>
            <p className="text-sm text-muted-foreground font-lato">
              Effective Date: October 2025 | Last Updated: December 2025
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar TOC */}
            <aside className="lg:w-64 flex-shrink-0">
              <nav className="lg:sticky lg:top-24">
                <p className="text-xs font-lato uppercase tracking-widest text-muted-foreground mb-4">
                  On This Page
                </p>
                <ul className="space-y-2">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={`text-sm font-lato text-left w-full py-1.5 px-3 rounded transition-colors ${
                          activeSection === section.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {section.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Main Content */}
            <article className="flex-1 max-w-3xl">
              <div className="prose prose-slate max-w-none font-lato text-foreground leading-relaxed">
                
                <section id="overview" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Overview
                  </h2>
                  <p className="text-foreground/80">
                    This Notice describes how medical information about you may be used and disclosed and 
                    how you can access this information. <strong>Please review it carefully.</strong>
                  </p>
                  <p className="text-foreground/80 mt-4">
                    {SITE_CONFIG.clinicName} is required by law to maintain the privacy of your Protected 
                    Health Information (PHI), to provide you with this Notice of our legal duties and 
                    privacy practices, and to notify you in the event of a breach of your unsecured PHI.
                  </p>
                </section>

                {/* Our Responsibilities - Featured */}
                <section id="responsibilities" className="mb-12">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="h-6 w-6 text-primary" />
                      <h2 className="font-playfair text-2xl font-light text-primary m-0">
                        Our Responsibilities
                      </h2>
                    </div>
                    <ul className="space-y-3 text-foreground/80">
                      <li className="flex items-start gap-3">
                        <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Maintain Privacy & Security</strong> – We are required to maintain 
                          the privacy and security of your Protected Health Information (PHI).
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Bell className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Breach Notification</strong> – We will notify you promptly if a breach 
                          occurs that may have compromised the privacy or security of your information.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <FileCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Follow This Notice</strong> – We are required to abide by the terms 
                          of this Notice currently in effect.
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* How We Use PHI */}
                <section id="usage" className="mb-12">
                  <div className="flex items-center gap-3 mb-4">
                    <Clipboard className="h-5 w-5 text-primary" />
                    <h2 className="font-playfair text-2xl font-light text-foreground m-0">
                      How We May Use and Disclose PHI
                    </h2>
                  </div>
                  <div className="bg-muted/30 border border-border rounded-lg p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 bg-background rounded-lg border border-border">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          Treatment
                        </h4>
                        <p className="text-sm text-foreground/80">
                          To coordinate or manage your healthcare and related services with doctors, 
                          nurses, technicians, pharmacies, and other healthcare providers.
                        </p>
                      </div>
                      <div className="p-4 bg-background rounded-lg border border-border">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-primary" />
                          Payment
                        </h4>
                        <p className="text-sm text-foreground/80">
                          To bill and receive payment from you, your insurance company, or third-party 
                          payers for the treatment and services you receive.
                        </p>
                      </div>
                      <div className="p-4 bg-background rounded-lg border border-border">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          Healthcare Operations
                        </h4>
                        <p className="text-sm text-foreground/80">
                          To support business activities including quality assessment, employee review, 
                          training, licensing, and business planning.
                        </p>
                      </div>
                      <div className="p-4 bg-background rounded-lg border border-border">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Bell className="h-4 w-4 text-primary" />
                          Appointment Reminders
                        </h4>
                        <p className="text-sm text-foreground/80">
                          To contact you with appointment reminders, treatment-related information, 
                          or recommendations for alternative treatments.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Required Disclosures */}
                <section id="disclosures" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Required & Permitted Disclosures
                  </h2>
                  <p className="text-foreground/80 mb-4">
                    We may also use or disclose your PHI without your authorization in the following situations:
                  </p>
                  <ul className="space-y-2 text-foreground/80">
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span><strong>As Required by Law</strong> – When required by federal, state, or local law</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span><strong>Public Health Activities</strong> – To prevent disease, injury, or disability; report vital statistics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span><strong>Health Oversight</strong> – To a health oversight agency for activities authorized by law</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span><strong>Legal Proceedings</strong> – In response to a court order or administrative tribunal</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span><strong>Law Enforcement</strong> – To report certain types of wounds, injuries, or crimes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span><strong>Serious Threat to Health or Safety</strong> – To prevent or lessen a serious and imminent threat</span>
                    </li>
                  </ul>
                </section>

                {/* Your Rights - Featured */}
                <section id="rights" className="mb-12">
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Eye className="h-6 w-6 text-green-700 dark:text-green-400" />
                      <h2 className="font-playfair text-2xl font-light text-green-700 dark:text-green-400 m-0">
                        Your Rights
                      </h2>
                    </div>
                    <p className="mb-4 text-green-800 dark:text-green-300">
                      You have the following rights regarding your Protected Health Information:
                    </p>
                    <ul className="space-y-3 text-green-800 dark:text-green-300">
                      <li className="flex items-start gap-3">
                        <span className="font-bold mt-1">•</span>
                        <span><strong>Right to Inspect and Copy</strong> – Obtain a copy of your medical record</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold mt-1">•</span>
                        <span><strong>Right to Amend</strong> – Request corrections to your medical record if you believe it is incorrect</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold mt-1">•</span>
                        <span><strong>Right to Confidential Communications</strong> – Request that we communicate with you in a specific way or at a specific location</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold mt-1">•</span>
                        <span><strong>Right to Request Restrictions</strong> – Request restrictions on certain uses and disclosures of your PHI</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold mt-1">•</span>
                        <span><strong>Right to Accounting of Disclosures</strong> – Request a list of certain disclosures we have made of your PHI</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold mt-1">•</span>
                        <span><strong>Right to a Paper Copy</strong> – Obtain a paper copy of this Notice at any time</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Uses Requiring Authorization */}
                <section id="authorization" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Uses Requiring Your Written Authorization
                  </h2>
                  <p className="text-foreground/80 mb-4">
                    We will obtain your written authorization before using or disclosing your PHI for:
                  </p>
                  <ul className="list-disc ml-6 mb-4 space-y-2 text-foreground/80">
                    <li>Marketing purposes</li>
                    <li>Sale of your health information</li>
                    <li>Most uses of psychotherapy notes (if applicable)</li>
                    <li>Any purpose not described in this Notice</li>
                  </ul>
                  <p className="text-foreground/80 font-medium">
                    You may revoke your authorization in writing at any time. Your revocation will not 
                    affect any uses or disclosures already made in reliance on your prior authorization.
                  </p>
                </section>

                {/* Contact Section */}
                <section id="complaints" className="mb-12">
                  <div className="flex items-center gap-3 mb-4">
                    <Phone className="h-5 w-5 text-primary" />
                    <h2 className="font-playfair text-2xl font-light text-foreground m-0">
                      Questions or Complaints
                    </h2>
                  </div>
                  <div className="bg-muted/30 border border-border rounded-lg p-6">
                    <p className="text-foreground/80 mb-4">
                      If you have questions about this Notice or wish to file a complaint about our 
                      privacy practices, please contact our Privacy Officer:
                    </p>
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <p className="font-semibold text-foreground">Privacy Officer</p>
                      <p className="text-foreground/80">{SITE_CONFIG.clinicName}</p>
                      <p className="text-foreground/80">{SITE_CONFIG.address.line1}</p>
                      <p className="text-foreground/80">{SITE_CONFIG.address.cityStateZip}</p>
                      <p className="text-foreground/80 mt-2">{SITE_CONFIG.phone}</p>
                      <a 
                        href="mailto:care@reveil.health" 
                        className="text-accent hover:underline"
                      >
                        care@reveil.health
                      </a>
                    </div>
                    <p className="text-foreground/80 mt-4">
                      You may also file a complaint with the U.S. Department of Health and Human Services 
                      Office for Civil Rights by sending a letter to 200 Independence Avenue, S.W., 
                      Washington, D.C. 20201, calling 1-877-696-6775, or visiting{" "}
                      <a 
                        href="https://www.hhs.gov/ocr/privacy/hipaa/complaints/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        www.hhs.gov/ocr/privacy/hipaa/complaints
                      </a>.
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                      <strong>You will not be retaliated against for filing a complaint.</strong>
                    </p>
                  </div>
                </section>

              </div>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HipaaNotice;
