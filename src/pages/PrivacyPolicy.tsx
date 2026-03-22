import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { Shield, Lock, MessageSquare, Database } from "lucide-react";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "hipaa", label: "HIPAA Compliance" },
  { id: "phi", label: "Protected Health Information" },
  { id: "collection", label: "Information We Collect" },
  { id: "usage", label: "How We Use Information" },
  { id: "payment", label: "Payment Security" },
  { id: "partners", label: "Third-Party Partners" },
  { id: "communications", label: "Communications" },
  { id: "security", label: "Data Security" },
  { id: "rights", label: "Your Rights" },
  { id: "contact", label: "Contact Us" },
];

const PrivacyPolicy = () => {
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
              Privacy Policy & HIPAA Compliance
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
                
                <section id="overview" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Overview
                  </h2>
                  <p className="text-foreground/80">
                    Réveil (&quot;we,&quot; &quot;our,&quot; or &quot;the Clinic&quot;) is committed to protecting your 
                    privacy and the confidentiality of your health information. This Privacy Policy describes 
                    how we collect, use, and safeguard information obtained through our website and services.
                  </p>
                </section>

                {/* HIPAA Compliance - Featured */}
                <section id="hipaa" className="mb-12">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="h-6 w-6 text-primary" />
                      <h2 className="font-playfair text-2xl font-light text-primary m-0">
                        HIPAA Compliance
                      </h2>
                    </div>
                    <p className="text-foreground/80 mb-4">
                      As a healthcare provider, Réveil is required to comply with the 
                      <strong> Health Insurance Portability and Accountability Act (HIPAA)</strong> and protect 
                      your Protected Health Information (PHI).
                    </p>
                    <p className="text-foreground/80">
                      We are committed to protecting your medical information in accordance with HIPAA standards. 
                      Your health data is stored in encrypted, HIPAA-compliant databases and is only shared with 
                      your care team and necessary partners to facilitate your treatment.
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">
                      For our complete Notice of Privacy Practices, please visit our{" "}
                      <a href="/hipaa-notice" className="text-accent hover:underline">HIPAA Notice page</a>.
                    </p>
                  </div>
                </section>

                {/* PHI Section */}
                <section id="phi" className="mb-12">
                  <div className="flex items-center gap-3 mb-4">
                    <Database className="h-5 w-5 text-primary" />
                    <h2 className="font-playfair text-2xl font-light text-foreground m-0">
                      Protected Health Information (PHI)
                    </h2>
                  </div>
                  <div className="bg-muted/30 border border-border rounded-lg p-6">
                    <ul className="space-y-3 text-foreground/80">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>
                          <strong>PHI</strong> includes any individually identifiable health information 
                          relating to your past, present, or future physical or mental health condition, 
                          treatment, or payment for healthcare services.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>
                          We use PHI only for <strong>treatment, payment, and healthcare operations</strong> as 
                          permitted by law, or with your explicit written authorization.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>
                          We maintain physical, electronic, and procedural safeguards to protect your PHI 
                          in accordance with federal and state regulations.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>
                          You have the right to request access to, amendment of, or restrictions on the 
                          use of your PHI. Contact our Privacy Officer to exercise these rights.
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>

                <section id="collection" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Information We Collect
                  </h2>
                  <p className="text-foreground/80 mb-4">
                    We collect information you voluntarily provide—such as your name, phone number, email, 
                    date of birth, and health history—when you complete forms, request appointments, or 
                    enroll in our services.
                  </p>
                  <p className="text-foreground/80">
                    We also automatically receive limited non-identifiable technical data (browser type, 
                    pages visited, approximate location) for analytics and site improvement.
                  </p>
                </section>

                <section id="usage" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    How We Use Information
                  </h2>
                  <ul className="list-disc ml-6 mb-4 space-y-2 text-foreground/80">
                    <li>Provide medical care and coordinate your treatment</li>
                    <li>Respond to your inquiries or schedule consultations</li>
                    <li>Process payments and manage your account</li>
                    <li>Send appointment reminders and treatment-related communications</li>
                    <li>Improve website performance and user experience</li>
                    <li>Comply with legal and regulatory requirements</li>
                  </ul>
                  <p className="text-foreground/80 font-medium">
                    We <strong>do not sell or share</strong> your personal or health information with third 
                    parties for marketing purposes.
                  </p>
                </section>

                {/* Payment Security - Featured */}
                <section id="payment" className="mb-12">
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Lock className="h-6 w-6 text-green-700 dark:text-green-400" />
                      <h2 className="font-playfair text-2xl font-light text-green-700 dark:text-green-400 m-0">
                        Payment Processing & Security
                      </h2>
                    </div>
                    <p className="mb-4 text-green-800 dark:text-green-300">
                      We use <strong>Stripe</strong>, a PCI-DSS Level 1 certified payment processor, to handle 
                      all payment transactions securely.
                    </p>
                    <ul className="space-y-3 text-green-800 dark:text-green-300">
                      <li className="flex items-start gap-3">
                        <span className="font-bold mt-1">•</span>
                        <span>
                          <strong>We do not store credit card numbers</strong> or sensitive payment details on 
                          our servers. All payment data is encrypted and processed directly by Stripe.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold mt-1">•</span>
                        <span>
                          We use <strong>bank-level encryption</strong> for all payment processing. Réveil 
                          does not store your full credit card number on our servers.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold mt-1">•</span>
                        <span>
                          We only retain transaction IDs and billing addresses necessary for record-keeping 
                          and customer service.
                        </span>
                      </li>
                    </ul>
                    <p className="mt-4 text-sm text-green-700 dark:text-green-400">
                      Stripe may collect additional information as described in their{" "}
                      <a 
                        href="https://stripe.com/privacy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:no-underline"
                      >
                        Privacy Policy
                      </a>.
                    </p>
                  </div>
                </section>

                <section id="partners" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Third-Party Partners
                  </h2>
                  <p className="text-foreground/80 mb-4">
                    We partner with trusted third-party services to provide your care:
                  </p>
                  <ul className="space-y-2 text-foreground/80 mb-4">
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span><strong>Osmind</strong> – Mental health platform for ketamine therapy coordination</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span><strong>ZRT Laboratory</strong> – Hormone, metabolic, and neurotransmitter testing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span><strong>Formulation Compounding Center</strong> – Pharmacy services for compounded medications</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary font-bold mt-1">•</span>
                      <span><strong>Resend</strong> – Transactional email delivery</span>
                    </li>
                  </ul>
                  <p className="text-foreground/80 font-medium">
                    These partners are bound by <strong>Business Associate Agreements (BAAs)</strong> requiring 
                    them to protect your PHI in accordance with HIPAA regulations.
                  </p>
                </section>

                {/* Communications */}
                <section id="communications" className="mb-12">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h2 className="font-playfair text-2xl font-light text-foreground m-0">
                      Communications Consent
                    </h2>
                  </div>
                  <div className="bg-muted/30 border border-border rounded-lg p-6">
                    <p className="text-foreground/80 mb-4">
                      By providing your phone number, you consent to receive SMS appointment reminders and 
                      secure link notifications regarding your care.
                    </p>
                    <p className="text-foreground/80">
                      You may opt-out of SMS communications at any time by replying STOP, though this may delay 
                      your treatment notifications. Essential communications regarding your care, billing, 
                      or legal matters may still be sent via email.
                    </p>
                  </div>
                </section>

                <section id="security" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Data Security
                  </h2>
                  <p className="text-foreground/80 mb-4">
                    We implement robust security measures including:
                  </p>
                  <ul className="list-disc ml-6 mb-4 space-y-2 text-foreground/80">
                    <li>HTTPS encryption for all data transmission</li>
                    <li>Role-based access controls for staff</li>
                    <li>Secure, encrypted database storage</li>
                    <li>Regular security audits and monitoring</li>
                    <li>Multi-factor authentication for administrative access</li>
                  </ul>
                  <p className="text-muted-foreground text-sm">
                    No online transmission is 100% secure. Please avoid including sensitive medical details 
                    in unsecured website forms or emails.
                  </p>
                </section>

                <section id="rights" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Your Rights
                  </h2>
                  <p className="text-foreground/80 mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc ml-6 mb-4 space-y-2 text-foreground/80">
                    <li>Access your personal and health information</li>
                    <li>Request corrections to inaccurate information</li>
                    <li>Request deletion of your data (subject to legal retention requirements)</li>
                    <li>Receive a copy of your health records</li>
                    <li>Opt out of non-essential communications</li>
                    <li>File a complaint if you believe your privacy rights have been violated</li>
                  </ul>
                  <p className="text-foreground/80">
                    To exercise these rights, contact our Privacy Officer at{" "}
                    <a 
                      href="mailto:care@reveil.health" 
                      className="text-accent hover:underline"
                    >
                      care@reveil.health
                    </a>.
                  </p>
                </section>

                <section id="contact" className="mb-12">
                  <h2 className="font-playfair text-2xl font-light text-foreground mb-4">
                    Contact Us
                  </h2>
                  <div className="bg-muted/30 border border-border rounded-lg p-6">
                    <p className="text-foreground/80 leading-relaxed">
                      <strong className="text-foreground">{SITE_CONFIG.clinicName}</strong><br />
                      Privacy Officer<br />
                      {SITE_CONFIG.address.line1}<br />
                      {SITE_CONFIG.address.cityStateZip}<br />
                      {SITE_CONFIG.phone}<br />
                      <a 
                        href="mailto:care@reveil.health" 
                        className="text-accent hover:underline"
                      >
                        care@reveil.health
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

export default PrivacyPolicy;
