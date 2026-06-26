import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import {
  CANCELLATION_NOTICE_HOURS,
  CARE_EMAIL,
  CLINICAL_CANCELLATION_SCENARIOS,
  IV_CANCELLATION_SCENARIOS,
  REFUND_PROCESSING_WINDOW,
  REFUND_REQUEST_STEPS,
  REBOOKING_FEE_DISPLAY,
} from "@/lib/cancellationPolicy";
import { CancellationPolicySummary } from "@/components/marketing/CancellationPolicySummary";

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
    <div className="public-page-shell">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto py-12 px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-playfair text-4xl lg:text-5xl font-light text-foreground mb-4">
              Terms of Service & Patient Agreement
            </h1>
            <p className="text-sm text-muted-foreground font-jost">
              Effective Date: December 2025 | Last Updated: December 2025
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar TOC */}
            <aside className="lg:w-64 flex-shrink-0">
              <nav className="lg:sticky lg:top-24">
                <p className="text-xs font-jost uppercase tracking-widest text-muted-foreground mb-4">
                  On This Page
                </p>
                <ul className="space-y-2">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={`text-sm font-jost text-left w-full py-1.5 px-3 rounded transition-colors ${
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
              <div className="prose prose-slate max-w-none font-jost text-foreground leading-relaxed">
                
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
                      Elevated Health Augusta provides <strong>cash-pay concierge wellness care</strong>, including hormone optimization, peptide therapy when prescribed, medical weight management, IV therapy, and related lab and telehealth services. We do <strong>NOT</strong> provide 
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
                          <strong>Recurring Subscription:</strong> ELEVATED program memberships (TRT, HRT, GLP-1, or ELEVATED IV) are recurring monthly
                          subscriptions. Payments are processed automatically via Stripe on the anniversary of your
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

                {/* Refund Policy */}
                <section id="refund" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Refund Policy
                  </h2>
                  <div className="bg-muted/30 border border-border rounded-lg p-6 space-y-6">
                    <p className="text-foreground/80">
                      We issue refunds when services have not been rendered and your cancellation meets the
                      notice window below. All refund requests are reviewed by our office team — refunds are
                      not automatic from the website.
                    </p>

                    <CancellationPolicySummary variant="refund-process" />

                    <ul className="space-y-4 text-foreground/80">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <div>
                          <strong>IV Lounge (prepaid online):</strong>
                          <p className="mt-1">
                            Full refund if you cancel with {CANCELLATION_NOTICE_HOURS}+ hours notice before
                            your scheduled slot. Less than {CANCELLATION_NOTICE_HOURS} hours or no-show:
                            payment is forfeited; {REBOOKING_FEE_DISPLAY} rebooking fee to schedule again.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <div>
                          <strong>Wellness Assessment &amp; labs:</strong>
                          <p className="mt-1">
                            Fees for completed visits and drawn labs are non-refundable. Unscheduled paid
                            consults may be refunded if you cancel before booking a slot and before clinical
                            work begins — contact us to confirm eligibility.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <div>
                          <strong>Membership fees:</strong>
                          <p className="mt-1">
                            Monthly membership fees are non-refundable after the billing cycle begins. Cancel
                            with 30 days written notice; you retain access through the paid period.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <div>
                          <strong>Prescriptions &amp; compounded medications:</strong>
                          <p className="mt-1">
                            Non-refundable once dispensed or shipped — medications cannot be returned per
                            pharmacy regulations.
                          </p>
                        </div>
                      </li>
                    </ul>
                    <p className="text-sm text-muted-foreground">
                      Approved refunds return to your original payment method within {REFUND_PROCESSING_WINDOW}.
                      Raise billing disputes with{" "}
                      <a href={`mailto:${CARE_EMAIL}`} className="text-primary hover:underline">
                        {CARE_EMAIL}
                      </a>{" "}
                      before initiating a chargeback.
                    </p>
                  </div>
                </section>

                {/* Cancellation Policy */}
                <section id="cancellation" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Cancellation &amp; No-Show Policy
                  </h2>
                  <div className="space-y-8">
                    <p className="text-foreground/80">
                      Last-minute cancellations and no-shows block other patients from care and leave clinical
                      staff idle. These rules apply to IV Lounge bookings, consult-gated visits, and follow-ups.
                    </p>

                    <div>
                      <h3 className="font-playfair text-xl text-foreground mb-4">IV Lounge</h3>
                      <div className="overflow-x-auto rounded-lg border border-border mb-4">
                        <table className="w-full text-sm font-jost">
                          <thead>
                            <tr className="border-b border-border bg-muted/40 text-left">
                              <th className="px-4 py-3 font-medium">If you…</th>
                              <th className="px-4 py-3 font-medium">What happens</th>
                            </tr>
                          </thead>
                          <tbody>
                            {IV_CANCELLATION_SCENARIOS.map((row) => (
                              <tr key={row.id} className="border-b border-border/60 last:border-0 align-top">
                                <td className="px-4 py-3 text-foreground/90">{row.situation}</td>
                                <td className="px-4 py-3 text-muted-foreground">{row.outcome}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-playfair text-xl text-foreground mb-4">Consults &amp; clinical visits</h3>
                      <div className="overflow-x-auto rounded-lg border border-border mb-4">
                        <table className="w-full text-sm font-jost">
                          <thead>
                            <tr className="border-b border-border bg-muted/40 text-left">
                              <th className="px-4 py-3 font-medium">If you…</th>
                              <th className="px-4 py-3 font-medium">What happens</th>
                            </tr>
                          </thead>
                          <tbody>
                            {CLINICAL_CANCELLATION_SCENARIOS.map((row) => (
                              <tr key={row.id} className="border-b border-border/60 last:border-0 align-top">
                                <td className="px-4 py-3 text-foreground/90">{row.situation}</td>
                                <td className="px-4 py-3 text-muted-foreground">{row.outcome}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-background border border-primary/30 rounded-lg p-4">
                      <p className="text-foreground font-medium font-jost">
                        To cancel or reschedule, contact us at least {CANCELLATION_NOTICE_HOURS} hours before
                        your appointment:{" "}
                        <a href={`tel:${SITE_CONFIG.phoneRaw}`} className="text-primary hover:underline">
                          {SITE_CONFIG.phone}
                        </a>{" "}
                        or{" "}
                        <a href={`mailto:${CARE_EMAIL}`} className="text-primary hover:underline">
                          {CARE_EMAIL}
                        </a>
                        .
                      </p>
                      <p className="text-muted-foreground text-sm mt-2 font-jost">
                        Late cancellations and no-shows incur a {REBOOKING_FEE_DISPLAY} rebooking fee (paid
                        before a new appointment is scheduled). Repeated no-shows may result in declined
                        future bookings.
                      </p>
                    </div>

                    <div>
                      <p className="font-jost font-medium text-foreground mb-2">Refund request process</p>
                      <ol className="list-decimal pl-5 space-y-2 text-sm font-jost text-muted-foreground">
                        {REFUND_REQUEST_STEPS.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </section>

                <section id="external" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    External Links
                  </h2>
                  <p className="text-foreground/80">
                    This site may contain links to third-party websites (such as LabCorp, Stripe, Doxy.me, 
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
