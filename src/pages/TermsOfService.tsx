import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <section className="max-w-3xl mx-auto py-12 px-6 text-foreground leading-relaxed">
          <h1 className="text-3xl font-semibold text-primary mb-6">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Effective Date: December 2025 | Last Updated: December 2025
          </p>

          <h2 className="text-xl font-semibold text-primary mb-2">
            Acceptance of Terms
          </h2>
          <p className="mb-4">
            By accessing or using this website and our services, you agree to these Terms of Service. 
            If you do not agree, please do not use this site or our services.
          </p>

          {/* Medical Disclaimer - CRITICAL */}
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6 my-8">
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-3">
              ⚠️ Medical Disclaimer
            </h2>
            <p className="text-red-700 dark:text-red-300 font-medium">
              Elevated Health Augusta provides wellness consulting, hormone optimization, ketamine therapy, 
              and medical weight loss services. <strong>We do not provide emergency medical care.</strong>
            </p>
            <p className="text-red-700 dark:text-red-300 font-medium mt-3">
              <strong>If you are experiencing a medical emergency, please call 911 immediately.</strong>
            </p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-3">
              If you are experiencing thoughts of self-harm or suicide, please contact the National Suicide 
              Prevention Lifeline at <strong>988</strong> or text HOME to <strong>741741</strong> (Crisis Text Line).
            </p>
          </div>

          <h2 className="text-xl font-semibold text-primary mb-2">
            Informational Purposes Only
          </h2>
          <p className="mb-4">
            All content on this website, including text, graphics, and images, is for educational 
            and informational purposes only and is not medical advice. Always seek the advice of a 
            qualified healthcare provider regarding any medical condition or treatment.
          </p>

          <h2 className="text-xl font-semibold text-primary mb-2">
            No Provider–Patient Relationship
          </h2>
          <p className="mb-4">
            Using this website, completing a form, or sending an email does not create a 
            physician–patient relationship with Elevated Health Augusta or its clinicians. A formal 
            patient relationship is only established after a consultation appointment and signed 
            consent forms.
          </p>

          {/* Subscription Policy */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-8">
            <h2 className="text-xl font-semibold text-primary mb-3">
              Subscription & Membership Policy
            </h2>
            <ul className="space-y-3 text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Billing:</strong> Memberships are billed monthly on the anniversary of your 
                  initial subscription date.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Cancellation:</strong> You may cancel your membership with 30 days written notice. 
                  Submit cancellation requests to{" "}
                  <a href="mailto:care@elevatedhealthaugusta.com" className="text-accent hover:underline">
                    care@elevatedhealthaugusta.com
                  </a>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Pausing:</strong> If you need to pause treatment temporarily, contact our care team 
                  to discuss options.
                </span>
              </li>
            </ul>
          </div>

          {/* Refund Policy */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6 my-8">
            <h2 className="text-xl font-semibold text-amber-700 dark:text-amber-400 mb-3">
              Refund Policy
            </h2>
            <ul className="space-y-3 text-amber-800 dark:text-amber-300">
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>
                  <strong>Diagnostic Fees ($299/$399):</strong> Hormone Mapping and Metabolic Mapping fees 
                  are non-refundable once the diagnostic kit has shipped. These fees cover the cost of 
                  laboratory testing and clinical review.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>
                  <strong>Membership Fees:</strong> Monthly membership fees are non-refundable after the 
                  billing cycle begins. If you cancel mid-cycle, you will retain access until the end of 
                  your current billing period.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>
                  <strong>Ketamine Sessions:</strong> Paid ketamine sessions are non-refundable within 48 hours 
                  of the scheduled appointment. Rescheduling is available with at least 48 hours notice.
                </span>
              </li>
            </ul>
          </div>

          <h2 className="text-xl font-semibold text-primary mb-2">
            External Links
          </h2>
          <p className="mb-4">
            This site may contain links to third-party websites (such as Osmind, Stripe, or educational 
            resources). We are not responsible for their content, privacy practices, or availability.
          </p>

          <h2 className="text-xl font-semibold text-primary mb-2">
            Limitation of Liability
          </h2>
          <p className="mb-4">
            Elevated Health Augusta is not liable for any damages resulting from use or inability 
            to use this site or linked materials. Our liability is limited to the amount paid for 
            services in the preceding 12 months.
          </p>

          <h2 className="text-xl font-semibold text-primary mb-2">
            Modifications
          </h2>
          <p className="mb-4">
            We may update these Terms from time to time. Updated versions will be posted with a 
            revised effective date. Your continued use of our services constitutes acceptance of 
            any changes.
          </p>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            Contact Us
          </h2>
          <p className="leading-relaxed">
            {SITE_CONFIG.clinicName}<br />
            {SITE_CONFIG.address.line1} • {SITE_CONFIG.address.cityStateZip}<br />
            {SITE_CONFIG.phone} •{" "}
            <a 
              href="mailto:care@elevatedhealthaugusta.com" 
              className="text-accent hover:underline"
            >
              care@elevatedhealthaugusta.com
            </a>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
