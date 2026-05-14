import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CORE_SERVICES } from "@/lib/stripeConfig";

const PRICE_CONSULT = CORE_SERVICES.wellnessAssessment.displayPrice;

type QA = { q: string; a: string };

const section = (title: string, id: string, items: QA[]) => (
  <section key={id} id={id} className="scroll-mt-28">
    <h2 className="font-playfair text-2xl md:text-3xl text-foreground mb-6 italic">
      {title}
    </h2>
    <Accordion type="multiple" className="space-y-2">
      {items.map((item, i) => (
        <AccordionItem
          key={`${id}-${i}`}
          value={`${id}-${i}`}
          className="border border-border/60 rounded-lg px-4 bg-card"
        >
          <AccordionTrigger className="font-jost text-left text-foreground hover:no-underline py-4">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="font-jost text-muted-foreground text-sm leading-relaxed pb-4">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </section>
);

const FAQ = () => {
  const about: QA[] = [
    {
      q: "Who is Elevated Health Augusta?",
      a: "We are a physician-owned, cash-pay concierge wellness clinic in Evans, Georgia (Augusta metro). We focus on IV therapy, hormone optimization, peptide protocols, and medical weight loss — with transparent pricing and in-person care at 7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809.",
    },
    {
      q: "How do I reach you?",
      a: "Call (706) 760-3470 or visit elevatedhealthaugusta.com. Hours vary by clinical schedule; the fastest way to get on the calendar is to book a Wellness Assessment online.",
    },
  ];

  const assessment: QA[] = [
    {
      q: "What is included in the Wellness Assessment?",
      a: `Your ${PRICE_CONSULT} Wellness Assessment is an in-person visit with our clinical team. We review goals and history, and your provider orders LabCorp blood draws in-office when panels are indicated. This visit is how we determine whether an ELEVATED program (TRT, HRT, GLP-1, or WELLNESS) is appropriate for you.`,
    },
    {
      q: `Why is the Wellness Assessment ${PRICE_CONSULT} upfront?`,
      a: `The ${PRICE_CONSULT} fee covers dedicated clinician time and the operational cost of onboarding. When you enroll in a qualifying program, we credit this ${PRICE_CONSULT} toward your first program invoice — it is not a separate “credit” balance you carry unless you enroll.`,
    },
    {
      q: "What happens during the visit?",
      a: "Expect about 30 minutes with the team: vitals and history, goal setting, and next-step planning. If labs are ordered, we coordinate draws in-clinic through LabCorp client billing.",
    },
    {
      q: "What should I bring?",
      a: "Government-issued ID, insurance card if you want a superbill for out-of-network reimbursement (we do not bill insurance), a list of medications and supplements, and prior lab results if you have them.",
    },
  ];

  const programs: QA[] = [
    {
      q: "What do ELEVATED programs include?",
      a: "Programs bundle prescribed therapy where clinically appropriate, follow-up visits per protocol, quarterly labs and review for enrolled members, and secure messaging. Exact inclusions depend on whether you are on TRT, HRT, GLP-1, or the WELLNESS track.",
    },
    {
      q: "How do TRT, HRT, GLP-1, and WELLNESS differ?",
      a: "TRT (men) and HRT (women) focus on hormone optimization with LabCorp monitoring. GLP-1 is physician-supervised medical weight loss with compounded semaglutide or tirzepatide when appropriate. WELLNESS bundles non-Rx-forward benefits like IV lounge access and member discounts on eligible à la carte services.",
    },
    {
      q: "What is the member discount on à la carte services?",
      a: "Elevated Membership includes 20% off eligible à la carte add-ons where pricing allows. Your clinician will confirm what applies to your plan.",
    },
  ];

  const pricing: QA[] = [
    {
      q: "Do you take insurance?",
      a: "We are cash-pay and do not bill insurance. We can provide a superbill for you to submit to your plan for possible out-of-network reimbursement — coverage is never guaranteed.",
    },
    {
      q: "Can I use HSA or FSA?",
      a: "Many patients use HSA/FSA cards for eligible services, but eligibility depends on your plan administrator. We recommend confirming with them before paying.",
    },
    {
      q: "Do you offer financing?",
      a: "Yes — Affirm and Klarna are available where supported at checkout. Terms are set by the financing partner.",
    },
    {
      q: "What is your refund policy?",
      a: "Program fees follow the membership and clinical policies you agree to at enrollment. Unused retail items may be returnable per clinic policy; medications you have received are generally not refundable. Ask our team for specifics before checkout.",
    },
  ];

  const process: QA[] = [
    {
      q: "How does treatment onboarding work?",
      a: "Book a Wellness Assessment → in-person visit and labs if ordered → provider review → program recommendation → membership and therapy start when you enroll. You will always know pricing before you commit to a program.",
    },
    {
      q: "Where are labs drawn?",
      a: "LabCorp draws are performed in our Evans clinic when your provider orders a panel — no separate LabCorp account is required for client-billed panels we coordinate.",
    },
    {
      q: "Are follow-ups telehealth or in person?",
      a: "Many follow-ups can be done via Doxy.me telehealth when clinically appropriate. Some visits, IV therapies, and phlebotomy require in-person attendance.",
    },
  ];

  const pharmacy: QA[] = [
    {
      q: "Where do medications come from?",
      a: "Compounded medications are prepared by our 503A compounding pharmacy partner under patient-specific prescriptions. Retail-brand medications may be sent to a standard pharmacy when clinically indicated.",
    },
    {
      q: "Brand vs compounded — how do you decide?",
      a: "We prioritize safety, availability, and regulatory posture. When FDA-approved products are in shortage or clinically equivalent compounded options are appropriate, your provider discusses trade-offs with you.",
    },
    {
      q: "Is medication shipped or picked up?",
      a: "Depends on therapy. Many peptides and hormones ship cold-chain to the clinic or your home per pharmacy policy; IV therapies are administered in the IV Lounge.",
    },
  ];

  const peptides: QA[] = [
    {
      q: "Are peptides FDA-approved?",
      a: "Most peptide therapies used in wellness contexts are not FDA-approved for the advertised indication. They are prescribed off-label when clinically appropriate after assessment, labs, and informed consent.",
    },
    {
      q: "Why is informed consent required?",
      a: "Because benefits and risks, regulatory status, and monitoring expectations must be clear before therapy begins. You will review and sign consent documents specific to your protocol.",
    },
    {
      q: "Do you still use BPC-157 or TB-500?",
      a: "Our menu follows current compounding policy and partner availability. Some legacy peptides are discontinued or replaced. Ask your provider during the Wellness Assessment — we do not give dosing or suitability advice over email.",
    },
  ];

  const membership: QA[] = [
    {
      q: "How does membership renew?",
      a: "Elevated Membership renews monthly until you cancel according to the notice window in your membership agreement.",
    },
    {
      q: "What is the cancellation policy?",
      a: "We require written notice at least 30 days before your next billing date to avoid the upcoming renewal. Exact language appears in your membership checkout agreement.",
    },
    {
      q: "Can I pause instead of canceling?",
      a: "Pauses may be available for travel or medical reasons. Coordinate with the office team — pausing is not automatic.",
    },
    {
      q: "Can I switch programs later?",
      a: "Yes, when clinically appropriate. Your provider will reassess labs and symptoms before moving you between TRT, HRT, GLP-1, or WELLNESS tracks.",
    },
  ];

  const other: QA[] = [
    {
      q: "Do you treat patients outside Georgia?",
      a: "Our medical director is licensed in Georgia. Establishing care generally requires you to be physically present for initial visits and most in-clinic services.",
    },
    {
      q: "What if I have an emergency?",
      a: "Call 911 for medical emergencies or 988 for the Suicide & Crisis Lifeline. Elevated Health Augusta is not an emergency clinic and does not provide after-hours emergency coverage.",
    },
    {
      q: "How soon can I be seen?",
      a: "Most new patients are offered a same-week Wellness Assessment slot, subject to availability.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Frequently Asked Questions | Elevated Health Augusta</title>
        <meta
          name="description"
          content="Answers about the Wellness Assessment, ELEVATED programs, membership, peptides, labs, and cash-pay pricing at Elevated Health Augusta in Evans, GA."
        />
      </Helmet>
      <Navbar />

      <main id="main-content" className="pt-28 pb-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-xs tracking-[0.25em] uppercase text-accent font-jost mb-3">
            Patient resources
          </p>
          <h1 className="font-playfair text-4xl md:text-5xl text-foreground mb-4 italic">
            Frequently asked questions
          </h1>
          <p className="font-jost text-muted-foreground text-lg leading-relaxed mb-12">
            Straight answers about how Elevated Health Augusta works — from the ${PRICE_CONSULT} Wellness Assessment to membership and pharmacy logistics.
          </p>

          <div className="space-y-16">
            {section("A. About Elevated Health Augusta", "about", about)}
            {section("B. The Wellness Assessment", "assessment", assessment)}
            {section("C. The ELEVATED programs", "programs", programs)}
            {section("D. Pricing and payment", "pricing", pricing)}
            {section("E. Treatment process", "process", process)}
            {section("F. Medications and pharmacy", "pharmacy", pharmacy)}
            {section("G. Peptide therapy", "peptides", peptides)}
            {section("H. Membership logistics", "membership", membership)}
            {section("I. Other common questions", "other", other)}
          </div>

          <div className="sticky bottom-4 z-20 mt-16 rounded-2xl border border-accent/30 bg-card/95 backdrop-blur p-5 shadow-lg">
            <p className="font-jost text-sm text-muted-foreground mb-3">
              Still have questions? The next best step is a Wellness Assessment with our clinical team.
            </p>
            <Button asChild className="w-full sm:w-auto" size="lg">
              <Link to="/consult">Book a Wellness Assessment</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
