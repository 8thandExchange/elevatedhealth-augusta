import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";

const sections = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "medical-disclaimer", label: "Medical Disclaimer" },
  { id: "membership", label: "Membership & Billing" },
  { id: "refund", label: "Refund Policy" },
  { id: "cancellation", label: "Cancellation Policy" },
  { id: "external", label: "External Links" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "modifications", label: "Modifications" },
  { id: "contact", label: "Contact Us" },
];

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState("acceptance");

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
              Terms of Service & Patient Agreement
            </h1>
            <p className="text-sm text-muted-foreground font-lato">
              Effective Date: December 2025 | Last Updated: December 2025
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
                
                <section id="acceptance" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Acceptance of Terms
                  </h2>
                  <p className="text-foreground/80">
                    By accessing or using this website and our services, you agree to these Terms of Service. 
                    If you do not agree, please do not use this site or our services.
                  </p>
                </section>

                {/* Medical Disclaimer - CRITICAL */}
                <section id="medical-disclaimer" className="mb-12">
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <h2 className="font-playfair text-2xl font-light text-red-700 dark:text-red-400 mb-4">
                      Medical Disclaimer
                    </h2>
                    <p className="text-red-700 dark:text-red-300 mb-4">
                      Elevated Health Augusta provides <strong>functional medicine consulting, hormone optimization, 
                      ketamine therapy, and weight management services</strong>. We do <strong>NOT</strong> provide 
                      primary care or emergency medical services.
                    </p>
                    <p className="text-red-700 dark:text-red-300 font-semibold mb-4">
                      If you are experiencing a medical emergency, call 911 immediately.
                    </p>
                    <p className="text-red-700 dark:text-red-300 mb-4">
                      Our services are not a replacement for your Primary Care Physician (PCP). We work alongside 
                      your existing healthcare providers to optimize specific aspects of your wellness journey.
                    </p>
                    <div className="border-t border-red-200 dark:border-red-700 pt-4 mt-4">
                      <p className="text-red-600 dark:text-red-400 text-sm">
                        <strong>Mental Health Crisis:</strong> If you are experiencing thoughts of self-harm or suicide, 
                        please contact the National Suicide Prevention Lifeline at <strong>988</strong> or text HOME 
                        to <strong>741741</strong> (Crisis Text Line).
                      </p>
                    </div>
                  </div>
                </section>

                {/* Membership & Billing */}
                <section id="membership" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Membership & Billing
                  </h2>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <ul className="space-y-4 text-foreground/80">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>
                          <strong>Recurring Subscription:</strong> The Elevated Membership is a recurring monthly 
                          subscription. Payments are processed automatically via Stripe on the anniversary of your 
                          initial subscription date.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>
                          <strong>Cancellation:</strong> You may cancel your membership with <strong>30 days written 
                          notice</strong> via the Patient Portal or by emailing{" "}
                          <a href="mailto:care@elevatedhealthaugusta.com" className="text-accent hover:underline">
                            care@elevatedhealthaugusta.com
                          </a>.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>
                          <strong>No Prorated Refunds:</strong> Prorated refunds are not issued for partial months. 
                          If you cancel mid-cycle, you will retain access until the end of your current billing period.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>
                          <strong>Pausing:</strong> If you need to pause treatment temporarily, contact our care team 
                          to discuss available options.
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Refund Policy - Strict */}
                <section id="refund" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Refund Policy
                  </h2>
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                    <ul className="space-y-4 text-amber-800 dark:text-amber-300">
                      <li className="flex items-start gap-3">
                        <span className="font-bold mt-1">•</span>
                        <div>
                          <strong>Diagnostic Fees ($299/$399):</strong>
                          <p className="mt-1">
                            This fee covers the cost of your ZRT Laboratory Kit (Hormone Mapping or Metabolic Mapping) 
                            and the provider&#39;s analysis time. <strong>Once a kit has been shipped to your address, 
                            this fee is 100% Non-Refundable</strong>, regardless of whether you complete the test.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold mt-1">•</span>
                        <div>
                          <strong>Membership Fees:</strong>
                          <p className="mt-1">
                            Monthly membership fees are non-refundable after the billing cycle begins. If you cancel 
                            mid-cycle, you retain access until the end of your current billing period.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold mt-1">•</span>
                        <div>
                          <strong>Prescriptions:</strong>
                          <p className="mt-1">
                            Per federal regulations, prescription medications cannot be returned or refunded once 
                            dispensed by the pharmacy.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold mt-1">•</span>
                        <div>
                          <strong>Ketamine Sessions:</strong>
                          <p className="mt-1">
                            Paid ketamine sessions are non-refundable within 48 hours of the scheduled appointment. 
                            Rescheduling is available with at least 48 hours notice.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Cancellation Policy */}
                <section id="cancellation" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Cancellation & Rebooking Policy
                  </h2>
                  <div className="bg-muted/30 border border-border rounded-lg p-6">
                    <p className="text-foreground/80 mb-4">
                      We understand that schedules change. However, last-minute cancellations prevent other patients 
                      from receiving care.
                    </p>
                    <div className="bg-background border border-primary/30 rounded p-4">
                      <p className="text-foreground font-medium">
                        Appointments canceled or rescheduled with <strong>less than 24 hours notice</strong> will 
                        incur a <strong>$99 Rebooking Fee</strong>.
                      </p>
                      <p className="text-muted-foreground text-sm mt-2">
                        This fee must be paid before a new appointment can be scheduled.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="external" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    External Links
                  </h2>
                  <p className="text-foreground/80">
                    This site may contain links to third-party websites (such as Osmind, Stripe, ZRT Laboratory, 
                    or educational resources). We are not responsible for their content, privacy practices, or availability.
                  </p>
                </section>

                <section id="liability" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Limitation of Liability
                  </h2>
                  <p className="text-foreground/80">
                    Elevated Health Augusta is not liable for any damages resulting from use or inability to use 
                    this site or linked materials. Our liability is limited to the amount paid for services in 
                    the preceding 12 months.
                  </p>
                </section>

                <section id="modifications" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Modifications
                  </h2>
                  <p className="text-foreground/80">
                    We may update these Terms from time to time. Updated versions will be posted with a revised 
                    effective date. Your continued use of our services constitutes acceptance of any changes.
                  </p>
                </section>

                <section id="contact" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Contact Us
                  </h2>
                  <div className="bg-muted/30 border border-border rounded-lg p-6">
                    <p className="text-foreground/80 leading-relaxed">
                      <strong className="text-foreground">{SITE_CONFIG.clinicName}</strong><br />
                      {SITE_CONFIG.address.line1}<br />
                      {SITE_CONFIG.address.cityStateZip}<br />
                      {SITE_CONFIG.phone}<br />
                      <a 
                        href="mailto:care@elevatedhealthaugusta.com" 
                        className="text-accent hover:underline"
                      >
                        care@elevatedhealthaugusta.com
                      </a>
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

export default TermsOfService;
