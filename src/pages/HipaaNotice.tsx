import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const HipaaNotice = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background">
        <section className="max-w-3xl mx-auto py-12 px-6 text-foreground leading-relaxed">
          <h1 className="text-3xl font-semibold text-primary mb-6">
            HIPAA Notice of Privacy Practices
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Effective Date: October 2025
          </p>

          <p className="mb-4">
            This Notice describes how medical information about you may be used and disclosed and 
            how you can access this information. Please review it carefully.
          </p>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            Our Responsibilities
          </h2>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>Maintain the privacy and security of your Protected Health Information (PHI)</li>
            <li>Notify you of any breach that may have compromised your information</li>
            <li>Follow the duties and practices described in this Notice</li>
          </ul>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            How We May Use and Disclose PHI
          </h2>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>
              <strong>Treatment –</strong> coordinate or manage your healthcare
            </li>
            <li>
              <strong>Payment –</strong> bill and receive payment from insurance or third parties
            </li>
            <li>
              <strong>Healthcare operations –</strong> evaluate and improve our services
            </li>
            <li>
              <strong>As required by law –</strong> e.g., public-health reporting or legal processes
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            Your Rights
          </h2>
          <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>Obtain a copy of your medical record</li>
            <li>Request corrections or confidential communications</li>
            <li>Request restrictions on certain disclosures</li>
            <li>Receive a list of certain disclosures made about you</li>
            <li>Obtain a paper copy of this Notice at any time</li>
          </ul>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            Uses Requiring Authorization
          </h2>
          <p className="mb-4">
            We will obtain written authorization before using or disclosing your PHI for marketing, 
            sale of information, or any purpose not described above. You may revoke authorization in 
            writing at any time.
          </p>

          <h2 className="text-xl font-semibold text-primary mt-8 mb-2">
            Questions or Complaints
          </h2>
          <p className="leading-relaxed">
            Privacy Officer — Elevated Health Augusta<br />
            7013 Evans Town Center Blvd, Suite 203 • Evans, GA 30809<br />
            (706) 760-3470 •{" "}
            <a 
              href="mailto:care@elevatedhealthaugusta.com" 
              className="text-accent hover:underline"
            >
              care@elevatedhealthaugusta.com
            </a>
            <br />
            You may also contact the U.S. Department of Health and Human Services Office for Civil 
            Rights. You will not be retaliated against for filing a complaint.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HipaaNotice;
