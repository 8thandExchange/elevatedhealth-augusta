import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";

const Accessibility = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Accessibility Statement | Elevated Health Augusta</title>
        <meta name="description" content="Our commitment to digital accessibility and providing an inclusive experience for all users." />
      </Helmet>
      
      <div className="public-page-shell">
      
        <Navbar />
      <main id="main-content" className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-playfair text-4xl md:text-5xl font-light text-foreground mb-4">
              Accessibility Statement
            </h1>
            <p className="text-muted-foreground font-jost">
              Last updated: December 2024
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            {/* Commitment */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-medium text-foreground mb-4">
                Our Commitment
              </h2>
              <p className="text-foreground/80 font-jost leading-relaxed mb-4">
                Elevated Health Augusta is committed to ensuring digital accessibility for people with 
                disabilities. We are continually improving the user experience for everyone and applying 
                the relevant accessibility standards to ensure we provide equal access to all users.
              </p>
              <p className="text-foreground/80 font-jost leading-relaxed">
                We believe that healthcare information and services should be accessible to everyone, 
                regardless of ability. Our goal is to make our website and patient portal usable by 
                as many people as possible.
              </p>
            </section>

            {/* Standards */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-medium text-foreground mb-4">
                Conformance Status
              </h2>
              <p className="text-foreground/80 font-jost leading-relaxed mb-4">
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. 
                These guidelines explain how to make web content more accessible for people with disabilities 
                and more user-friendly for everyone.
              </p>
              <p className="text-foreground/80 font-jost leading-relaxed">
                Our ongoing accessibility efforts include:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-foreground/80 font-jost">
                <li>Keyboard navigation support throughout the website</li>
                <li>Clear and consistent navigation structure</li>
                <li>Text alternatives for non-text content</li>
                <li>Sufficient color contrast ratios</li>
                <li>Resizable text without loss of functionality</li>
                <li>Form labels and error identification</li>
                <li>Skip navigation links for screen reader users</li>
                <li>ARIA labels for interactive elements</li>
              </ul>
            </section>

            {/* Assistive Technologies */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-medium text-foreground mb-4">
                Compatibility with Assistive Technologies
              </h2>
              <p className="text-foreground/80 font-jost leading-relaxed">
                Our website is designed to be compatible with the following assistive technologies:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-foreground/80 font-jost">
                <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
                <li>Screen magnification software</li>
                <li>Speech recognition software</li>
                <li>Keyboard-only navigation</li>
              </ul>
            </section>

            {/* Known Limitations */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-medium text-foreground mb-4">
                Known Limitations
              </h2>
              <p className="text-foreground/80 font-jost leading-relaxed mb-4">
                While we strive to ensure accessibility of our website, there may be some limitations. 
                We are actively working to identify and remediate any accessibility barriers. 
                Known limitations include:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-foreground/80 font-jost">
                <li>Some older PDF documents may not be fully accessible</li>
                <li>Third-party content or integrations may have varying levels of accessibility</li>
                <li>Some complex interactive features may require additional testing</li>
              </ul>
            </section>

            {/* Feedback */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-medium text-foreground mb-4">
                Feedback & Contact
              </h2>
              <p className="text-foreground/80 font-jost leading-relaxed mb-4">
                We welcome your feedback on the accessibility of our website. If you encounter any 
                accessibility barriers or have suggestions for improvement, please contact us:
              </p>
              <div className="bg-secondary/30 rounded-lg p-6 mt-4">
                <p className="text-foreground font-jost mb-2">
                  <strong>Email:</strong>{" "}
                  <a 
                    href="mailto:accessibility@elevatedhealthaugusta.com" 
                    className="text-primary hover:underline"
                  >
                    accessibility@elevatedhealthaugusta.com
                  </a>
                </p>
                <p className="text-foreground font-jost mb-2">
                  <strong>Phone:</strong>{" "}
                  <a href="tel:+17068840901" className="text-primary hover:underline">
                    (706) 884-0901
                  </a>
                </p>
                <p className="text-foreground font-jost">
                  <strong>Address:</strong> 1258 Broad Street, Augusta, GA 30901
                </p>
              </div>
              <p className="text-foreground/80 font-jost leading-relaxed mt-4">
                We try to respond to accessibility feedback within 2 business days and will work 
                with you to resolve any issues.
              </p>
            </section>

            {/* Assessment */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-medium text-foreground mb-4">
                Assessment & Remediation
              </h2>
              <p className="text-foreground/80 font-jost leading-relaxed">
                We assess the accessibility of our website through a combination of automated testing 
                tools, manual testing, and user feedback. When we identify accessibility issues, we 
                prioritize remediation based on the impact to users and work to resolve issues as 
                quickly as possible.
              </p>
            </section>
          </div>
        </div>
      </main>

        <Footer />

      </div>
    </>
  );
};

export default Accessibility;
