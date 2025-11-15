import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
            Effective Date: October 2025 | Last Updated: October 2025
          </p>

          <p className="mb-4">
            Elevated Health Augusta ("we," "our," or "the Clinic") operates this website to provide 
            information about our services and allow visitors to request contact from our care team.
          </p>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            Information We Collect
          </h2>
          <p className="mb-4">
            We collect information you voluntarily provide—such as your name, phone number, and 
            email—when you complete a contact form or request an appointment. We also automatically 
            receive limited non-identifiable technical data (browser type, pages visited, approximate 
            location) for analytics and site improvement.
          </p>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            How We Use Information
          </h2>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>Respond to your inquiries or schedule consultations</li>
            <li>Send limited administrative or educational messages</li>
            <li>Improve website performance and user experience</li>
          </ul>
          <p className="mb-4">
            We <strong>do not sell or share</strong> visitor information with third parties for 
            marketing purposes.
          </p>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            Cookies & Analytics
          </h2>
          <p className="mb-4">
            Our site may use cookies or analytics tools (e.g., Google Analytics) to understand usage. 
            These tools do not collect Protected Health Information (PHI).
          </p>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            Data Security
          </h2>
          <p className="mb-4">
            We use HTTPS encryption and restrict access to authorized personnel. No online transmission 
            is 100% secure; please avoid including medical details in website forms.
          </p>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            Your Choices
          </h2>
          <p className="mb-4">
            You may request deletion or correction of your information by emailing{" "}
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
            Elevated Health Augusta<br />
            7013 Evans Town Center Blvd, Suite 203 • Evans, GA 30809<br />
            (706) 760-3470 •{" "}
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
