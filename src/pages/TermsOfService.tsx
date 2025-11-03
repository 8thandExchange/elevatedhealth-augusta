import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
            Terms of Use &amp; Website Disclaimer
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Effective Date: October 2025
          </p>

          <h2 className="text-xl font-semibold text-primary mb-2">
            Acceptance of Terms
          </h2>
          <p className="mb-4">
            By accessing or using this website, you agree to these Terms of Use. If you do not 
            agree, please do not use this site.
          </p>

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
            physician–patient relationship with Elevated Health Augusta or its clinicians.
          </p>

          <h2 className="text-xl font-semibold text-primary mb-2">
            External Links
          </h2>
          <p className="mb-4">
            This site may contain links to third-party websites. We are not responsible for their 
            content or privacy practices.
          </p>

          <h2 className="text-xl font-semibold text-primary mb-2">
            Limitation of Liability
          </h2>
          <p className="mb-4">
            Elevated Health Augusta is not liable for any damages resulting from use or inability 
            to use this site or linked materials.
          </p>

          <h2 className="text-xl font-semibold text-primary mb-2">
            Modifications
          </h2>
          <p className="mb-4">
            We may update these Terms from time to time. Updated versions will be posted with a 
            revised effective date.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
