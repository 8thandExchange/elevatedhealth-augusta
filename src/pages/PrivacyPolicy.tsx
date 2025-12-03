import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <section className="max-w-3xl mx-auto py-12 px-6 text-foreground leading-relaxed">
          <h1 className="text-3xl font-semibold text-primary mb-6">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Effective Date: December 2025 | Last Updated: December 2025
          </p>

          <p className="mb-4">
            Elevated Health Augusta ("we," "our," or "the Clinic") is committed to protecting your 
            privacy and the confidentiality of your health information. This Privacy Policy describes 
            how we collect, use, and safeguard information obtained through our website and services.
          </p>

          {/* HIPAA Notice */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-8">
            <h2 className="text-xl font-semibold text-primary mb-3">
              🔒 Protection of Health Information (HIPAA)
            </h2>
            <p className="mb-3">
              As a healthcare provider, Elevated Health Augusta is required to comply with the 
              Health Insurance Portability and Accountability Act (HIPAA) and protect your 
              Protected Health Information (PHI).
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>PHI</strong> includes any individually identifiable health information 
                  relating to your past, present, or future physical or mental health condition, 
                  treatment, or payment for healthcare services.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  We use PHI only for treatment, payment, and healthcare operations as permitted 
                  by law, or with your explicit written authorization.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  We maintain physical, electronic, and procedural safeguards to protect your PHI 
                  in accordance with federal and state regulations.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  You have the right to request access to, amendment of, or restrictions on the 
                  use of your PHI. Contact our Privacy Officer to exercise these rights.
                </span>
              </li>
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              For our complete Notice of Privacy Practices, please visit our{" "}
              <a href="/hipaa-notice" className="text-accent hover:underline">HIPAA Notice page</a>.
            </p>
          </div>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            Information We Collect
          </h2>
          <p className="mb-4">
            We collect information you voluntarily provide—such as your name, phone number, email, 
            date of birth, and health history—when you complete forms, request appointments, or 
            enroll in our services. We also automatically receive limited non-identifiable technical 
            data (browser type, pages visited, approximate location) for analytics and site improvement.
          </p>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            How We Use Information
          </h2>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>Provide medical care and coordinate your treatment</li>
            <li>Respond to your inquiries or schedule consultations</li>
            <li>Process payments and manage your account</li>
            <li>Send appointment reminders and treatment-related communications</li>
            <li>Improve website performance and user experience</li>
            <li>Comply with legal and regulatory requirements</li>
          </ul>
          <p className="mb-4">
            We <strong>do not sell or share</strong> your personal or health information with third 
            parties for marketing purposes.
          </p>

          {/* Payment Processing */}
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6 my-8">
            <h2 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-3">
              💳 Payment Processing & Security
            </h2>
            <p className="mb-3 text-green-800 dark:text-green-300">
              We use <strong>Stripe</strong>, a PCI-DSS Level 1 certified payment processor, to handle 
              all payment transactions securely.
            </p>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-300">
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>
                  <strong>We do not store credit card numbers</strong> or sensitive payment details on 
                  our servers. All payment data is encrypted and processed directly by Stripe.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>
                  We only retain transaction IDs and billing addresses necessary for record-keeping 
                  and customer service.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>
                  Stripe may collect additional information as described in their{" "}
                  <a 
                    href="https://stripe.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Privacy Policy
                  </a>.
                </span>
              </li>
            </ul>
          </div>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            Third-Party Services
          </h2>
          <p className="mb-4">
            We partner with trusted third-party services to provide our care:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li><strong>Osmind</strong> – Mental health platform for ketamine therapy coordination</li>
            <li><strong>ZRT Laboratory</strong> – Hormone and neurotransmitter testing</li>
            <li><strong>Formulation Compounding Center</strong> – Pharmacy services for compounded medications</li>
            <li><strong>Resend</strong> – Transactional email delivery</li>
          </ul>
          <p className="mb-4">
            These partners are bound by Business Associate Agreements (BAAs) requiring them to protect 
            your PHI in accordance with HIPAA regulations.
          </p>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            Cookies & Analytics
          </h2>
          <p className="mb-4">
            Our site may use cookies or analytics tools (e.g., Google Analytics) to understand usage 
            patterns and improve our services. These tools do not collect Protected Health Information 
            (PHI). You can disable cookies in your browser settings.
          </p>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            Data Security
          </h2>
          <p className="mb-4">
            We implement robust security measures including:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>HTTPS encryption for all data transmission</li>
            <li>Role-based access controls for staff</li>
            <li>Secure, encrypted database storage</li>
            <li>Regular security audits and monitoring</li>
          </ul>
          <p className="mb-4">
            No online transmission is 100% secure. Please avoid including sensitive medical details 
            in unsecured website forms or emails.
          </p>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            Your Rights
          </h2>
          <p className="mb-4">
            You have the right to:
          </p>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>Access your personal and health information</li>
            <li>Request corrections to inaccurate information</li>
            <li>Request deletion of your data (subject to legal retention requirements)</li>
            <li>Receive a copy of your health records</li>
            <li>Opt out of non-essential communications</li>
          </ul>
          <p className="mb-4">
            To exercise these rights, contact our Privacy Officer at{" "}
            <a 
              href="mailto:care@elevatedhealthaugusta.com" 
              className="text-accent hover:underline"
            >
              care@elevatedhealthaugusta.com
            </a>.
          </p>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            Contact Us
          </h2>
          <p className="leading-relaxed">
            {SITE_CONFIG.clinicName}<br />
            Privacy Officer<br />
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

export default PrivacyPolicy;
