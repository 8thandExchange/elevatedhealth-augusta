import { Shield, FileCheck, DollarSign, Phone, CheckCircle2, ArrowRight, CreditCard, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Insurance = () => {
  const insuranceLogos = [
    { name: "Blue Cross Blue Shield", featured: true },
    { name: "Aetna", featured: false },
    { name: "Cigna", featured: false },
    { name: "UnitedHealthcare", featured: false },
    { name: "TRICARE", featured: false },
    { name: "Medicare*", featured: false, note: "Spravato only" }
  ];

  const verificationSteps = [
    {
      number: "1",
      title: "Call or Submit Online",
      description: "Reach out to our team with your insurance information"
    },
    {
      number: "2",
      title: "We Verify Your Benefits",
      description: "We'll check your coverage and explain your out-of-pocket costs"
    },
    {
      number: "3",
      title: "Start Treatment",
      description: "Once verified, we'll schedule your first consultation"
    }
  ];

  const otherInsuranceProviders = [
    "Aetna",
    "Cigna", 
    "UnitedHealthcare",
    "Humana",
    "Medicare (select plans)",
    "TRICARE",
  ];

  const scrollToContact = () => {
    // Navigate to homepage if not already there
    if (window.location.pathname !== '/' && window.location.pathname !== '/index') {
      window.location.href = '/#contact';
    } else {
      const element = document.getElementById("contact");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <section id="insurance" className="py-24 bg-secondary/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6 text-primary">
              We Accept Most Major Plans
            </h2>
            <p className="font-inter text-xl text-muted-foreground max-w-3xl mx-auto">
              Making mental health care accessible through insurance coverage
            </p>
          </div>

          {/* Insurance Logos Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            {insuranceLogos.map((logo, index) => (
              <Card 
                key={index} 
                className={`p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-shadow ${
                  logo.featured ? 'border-2 border-accent' : ''
                }`}
              >
                <div className="w-full h-16 flex items-center justify-center mb-2">
                  <span className="font-inter font-semibold text-sm text-foreground">
                    {logo.name}
                  </span>
                </div>
                {logo.note && (
                  <p className="text-xs text-muted-foreground italic">{logo.note}</p>
                )}
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={scrollToContact}
              className="font-inter font-semibold uppercase bg-accent hover:bg-accent-light text-white px-12 py-6"
            >
              <Shield className="mr-2 h-5 w-5" />
              Verify My Coverage
            </Button>
            <p className="font-inter text-sm text-muted-foreground mt-6">
              Coverage varies by plan. We'll verify your benefits at no cost.
            </p>
          </div>

          {/* How to Verify Your Coverage */}
          <div className="mb-16">
            <Card className="p-8 md:p-12 border-accent/20">
              <h3 className="text-3xl font-bold mb-4 text-center text-foreground">
                How to Verify Your Coverage
              </h3>
              <p className="text-center text-muted-foreground mb-12 text-lg max-w-2xl mx-auto">
                We make insurance simple. Here's how to get started with your Blue Cross Blue Shield benefits:
              </p>
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {verificationSteps.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                        {step.number}
                      </div>
                      <h4 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h4>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                    {index < verificationSteps.length - 1 && (
                      <ArrowRight className="hidden md:block absolute top-8 -right-4 h-6 w-6 text-accent" />
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-lg">
                <p className="text-foreground font-semibold mb-2">
                  What to Have Ready:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    Your insurance card (front and back)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    Your date of birth and member ID
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    Any referral information from your primary care doctor (if required)
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          {/* Coverage vs. Cash-Pay Services */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center text-foreground">
              Understanding Coverage & Payment Options
            </h3>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="p-8 border-accent/20 bg-accent/5">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-12 w-12 text-accent" />
                  <Badge className="bg-accent text-accent-foreground">Insurance Covered</Badge>
                </div>
                <h4 className="text-2xl font-semibold mb-4 text-foreground">SPRAVATO® Therapy</h4>
                <p className="text-muted-foreground mb-6">
                  SPRAVATO® (intranasal esketamine) is FDA-approved and covered by most major insurance plans 
                  including Blue Cross Blue Shield, Aetna, Cigna, UnitedHealthcare, and others.
                </p>
                <div className="space-y-3">
                  {otherInsuranceProviders.map((provider, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                      <span className="text-foreground">{provider}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-6">
                  We handle all insurance verification and authorization paperwork for you.
                </p>
              </Card>

              <Card className="p-8 border-accent/20">
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="h-12 w-12 text-accent" />
                  <Badge variant="outline" className="border-accent/30">Self-Pay</Badge>
                </div>
                <h4 className="text-2xl font-semibold mb-4 text-foreground">Cash-Pay Services</h4>
                <p className="text-muted-foreground mb-6">
                  The following services are offered on a self-pay basis with transparent, upfront pricing:
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-foreground font-semibold">IV Ketamine Therapy</span>
                      <p className="text-sm text-muted-foreground">KETRA™ infusion treatments</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-foreground font-semibold">Hormone Replacement Therapy</span>
                      <p className="text-sm text-muted-foreground">Personalized HRT programs</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-foreground font-semibold">Medical Weight Loss</span>
                      <p className="text-sm text-muted-foreground">Comprehensive weight management</p>
                    </div>
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          {/* Financing Options */}
          <div className="mb-16">
            <Card className="p-8 md:p-12 border-accent/20 bg-gradient-subtle">
              <div className="text-center mb-8">
                <CreditCard className="h-16 w-16 text-accent mx-auto mb-4" />
                <h3 className="text-3xl font-bold mb-4 text-foreground">
                  Flexible Financing Options
                </h3>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  We believe cost should never be a barrier to transformative mental health care. 
                  That's why we offer multiple payment solutions to make treatment accessible.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card p-6 rounded-lg border border-accent/20">
                  <h4 className="font-semibold text-foreground mb-2">CareCredit</h4>
                  <p className="text-sm text-muted-foreground">
                    Healthcare financing with flexible payment plans and 0% interest options available
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border border-accent/20">
                  <h4 className="font-semibold text-foreground mb-2">HSA & FSA</h4>
                  <p className="text-sm text-muted-foreground">
                    Use your Health Savings or Flexible Spending Account for tax-advantaged payments
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg border border-accent/20">
                  <h4 className="font-semibold text-foreground mb-2">Payment Plans</h4>
                  <p className="text-sm text-muted-foreground">
                    Custom payment arrangements to fit your budget—ask us about options during consultation
                  </p>
                </div>
              </div>

              <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-lg">
                <p className="text-foreground font-semibold mb-2">
                  Transparent Pricing Promise
                </p>
                <p className="text-muted-foreground">
                  We provide clear, upfront pricing for all self-pay services before you commit. No hidden fees, 
                  no surprises. You'll know exactly what to expect before starting treatment.
                </p>
              </div>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center text-foreground">
              Common Insurance & Payment Questions
            </h3>
            <Card className="p-8 border-accent/20">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-accent">
                    Is Ketamine therapy covered by insurance?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    <p className="mb-4">
                      It depends on the type of ketamine therapy. <strong>SPRAVATO®</strong> (intranasal esketamine) 
                      is FDA-approved for treatment-resistant depression and is covered by most major insurance plans, 
                      including Blue Cross Blue Shield, Aetna, Cigna, UnitedHealthcare, and Medicare (select plans).
                    </p>
                    <p>
                      <strong>IV Ketamine therapy</strong> (KETRA™) is not FDA-approved for depression treatment and 
                      is typically offered on a self-pay basis. However, many patients find the transparent pricing 
                      and flexible payment options make it an accessible choice. We're happy to provide a superbill 
                      for potential out-of-network reimbursement.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-accent">
                    Can I use HSA or FSA?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    <p className="mb-4">
                      <strong>Yes!</strong> We accept both Health Savings Accounts (HSA) and Flexible Spending 
                      Accounts (FSA) for all of our services, including self-pay treatments like IV Ketamine 
                      therapy, Hormone Replacement Therapy, and Medical Weight Loss programs.
                    </p>
                    <p>
                      Using your HSA or FSA allows you to pay for treatment with pre-tax dollars, which can 
                      significantly reduce your out-of-pocket costs. We'll provide all necessary documentation 
                      for your records.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-accent">
                    Do you offer payment plans?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    <p className="mb-4">
                      <strong>Absolutely.</strong> We partner with <strong>CareCredit</strong>, a healthcare 
                      financing solution that offers flexible payment plans with low monthly payments. Many 
                      patients qualify for promotional financing with 0% interest if paid within the promotional period.
                    </p>
                    <p className="mb-4">
                      In addition to CareCredit, we also offer <strong>in-house payment arrangements</strong> on 
                      a case-by-case basis. Our goal is to make treatment accessible, so we encourage you to 
                      discuss your financial situation with our team during your consultation.
                    </p>
                    <p>
                      We're committed to working with you to find a payment solution that fits your budget—because 
                      transformative mental health care should be within reach for everyone.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-subtle rounded-2xl p-8 md:p-12 text-center border border-accent/20">
            <h3 className="text-3xl font-bold mb-4 text-foreground">Ready to Use Your Benefits?</h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our team handles the insurance paperwork so you can focus on getting better. 
              Let's verify your coverage and get you started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" onClick={scrollToContact} className="gap-2">
                <Shield className="h-5 w-5" />
                Verify My Insurance
              </Button>
              <a href="tel:7065509202">
                <Button variant="outline" size="xl" className="gap-2 border-2">
                  <Phone className="h-5 w-5" />
                  Call (706) 550-9202
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Insurance;
