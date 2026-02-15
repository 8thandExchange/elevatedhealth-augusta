import { Phone, Shield, Check, FileText, DollarSign, CreditCard, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";

const steps = [
  {
    icon: FileText,
    title: "Receive Your Superbill",
    description: "After each visit, we generate a detailed superbill with CPT codes, ICD-10 diagnoses, provider NPI, and clinic Tax ID — everything your insurance needs.",
  },
  {
    icon: DollarSign,
    title: "Submit to Your Insurance",
    description: "Mail, fax, or upload your superbill through your insurance company's online portal. Include your member ID and group number.",
  },
  {
    icon: CreditCard,
    title: "Get Reimbursed",
    description: "Reimbursement typically arrives within 30–60 days. Out-of-network benefits often cover 50–80% of charges.",
  },
];

const coveredServices = [
  {
    plan: "Blue Cross Blue Shield",
    services: ["SPRAVATO® therapy (prior auth required)", "Office visits (E&M codes)", "Drug screening"],
  },
  {
    plan: "TRICARE",
    services: ["SPRAVATO® therapy (prior auth + REMS)", "Office visits", "Mental health evaluations"],
  },
  {
    plan: "VA (Veterans Affairs)",
    services: ["SPRAVATO® via Community Care (VACCN)", "Office visits with authorization", "Mental health services"],
  },
];

const faqs = [
  {
    q: "What is a superbill?",
    a: "A superbill is a detailed receipt that includes the specific medical codes (CPT and ICD-10) your insurance company needs to process a reimbursement claim. We generate these automatically after each visit.",
  },
  {
    q: "Can I use my HSA or FSA?",
    a: "Yes! All medical services at Elevated Health qualify for HSA and FSA reimbursement. Simply use your HSA/FSA card at checkout, or submit your superbill to your account administrator.",
  },
  {
    q: "Are hormone treatments covered?",
    a: "Compounded hormone creams are typically not covered by insurance. However, office visits related to hormone therapy may be covered. We provide superbills so you can submit for any reimbursable portions.",
  },
  {
    q: "Is IV Ketamine covered by insurance?",
    a: "IV Ketamine is an off-label use and is not covered by insurance. However, SPRAVATO® (esketamine nasal spray) IS FDA-approved and covered by BCBS, TRICARE, and VA for treatment-resistant depression.",
  },
  {
    q: "Do you offer payment plans?",
    a: "Yes! We offer financing through Affirm and Klarna for services not covered by insurance, plus our membership plans provide significant savings on ongoing treatment.",
  },
  {
    q: "What if my insurance denies the claim?",
    a: "We'll help you understand the denial and provide any additional documentation needed for an appeal. Many initial denials are overturned on appeal with proper documentation.",
  },
];

const InsuranceReimbursement = () => {
  const scrollToContact = () => {
    window.location.href = "/#contact";
  };

  return (
    <>
      <Helmet>
        <title>Insurance & Reimbursement Guide | Elevated Health Augusta</title>
        <meta
          name="description"
          content="Learn how to get reimbursed for mental health and hormone therapy services at Elevated Health Augusta. We accept BCBS, TRICARE, and VA insurance."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-20 lg:py-28 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-inter text-4xl md:text-5xl font-bold text-foreground mb-4">
              Insurance & Reimbursement
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We believe cost shouldn't be a barrier to better health. Here's how to maximize 
              your insurance benefits and get reimbursed for your care.
            </p>
          </div>
        </section>

        {/* In-Network Plans */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="text-3xl font-bold text-foreground text-center mb-4">
              We're In-Network With
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              For SPRAVATO® therapy and covered office visits, we bill these insurers directly — no superbill needed.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {coveredServices.map((plan) => (
                <Card key={plan.plan} className="border-border/50 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-3">{plan.plan}</h3>
                    <ul className="space-y-2">
                      {plan.services.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How Reimbursement Works */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="text-3xl font-bold text-foreground text-center mb-4">
              How Reimbursement Works
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              For services not directly billed to insurance, we make it easy to get reimbursed.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                      <Icon className="w-7 h-7 text-primary" />
                      <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HSA/FSA Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6 max-w-4xl">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8 md:p-10 text-center">
                <CreditCard className="w-10 h-10 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  HSA & FSA Accepted
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
                  All medical services at Elevated Health are eligible for Health Savings Account (HSA) and 
                  Flexible Spending Account (FSA) reimbursement — including consultations, lab panels, 
                  hormone therapy, ketamine treatments, and weight loss programs.
                </p>
                <p className="text-sm text-muted-foreground">
                  Use your HSA/FSA card directly at checkout, or submit your superbill for reimbursement.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-6 max-w-4xl">
            <h2 className="text-3xl font-bold text-foreground text-center mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                        <p className="text-sm text-muted-foreground">{faq.a}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Questions About Your Coverage?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our team will help you understand your benefits and maximize your reimbursement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={scrollToContact} className="gap-2">
                Contact Us
              </Button>
              <a href="tel:7067603470">
                <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                  <Phone className="w-5 h-5" />
                  (706) 760-3470
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default InsuranceReimbursement;
