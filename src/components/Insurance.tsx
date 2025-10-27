import { Shield, FileCheck, DollarSign, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Insurance = () => {
  const insuranceProviders = [
    "Blue Cross Blue Shield",
    "Aetna",
    "Cigna",
    "UnitedHealthcare",
    "Humana",
    "Medicare (select plans)",
  ];

  const paymentOptions = [
    {
      icon: Shield,
      title: "Insurance Coverage",
      description: "We accept most major insurance plans including Blue Cross Blue Shield",
    },
    {
      icon: FileCheck,
      title: "Pre-Authorization Support",
      description: "Our team helps navigate insurance approval and authorization processes",
    },
    {
      icon: DollarSign,
      title: "Flexible Payment Plans",
      description: "Self-pay options and payment plans available for qualifying patients",
    },
  ];

  return (
    <section id="insurance" className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              <span className="text-primary">Insurance</span> & Payment Options
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Making mental health care accessible with flexible insurance and payment solutions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {paymentOptions.map((option, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
                <option.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">{option.title}</h3>
                <p className="text-muted-foreground">{option.description}</p>
              </Card>
            ))}
          </div>

          <div className="bg-card rounded-2xl p-8 md:p-12 shadow-lg mb-12">
            <h3 className="text-2xl font-semibold mb-6 text-center text-foreground">
              Accepted Insurance Providers
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {insuranceProviders.map((provider, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-muted rounded-lg"
                >
                  <FileCheck className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-foreground font-medium">{provider}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-muted-foreground">
              Coverage varies by plan. Our team will verify your benefits and help maximize your coverage.
            </p>
          </div>

          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4">Questions About Coverage?</h3>
                <p className="text-xl opacity-90 mb-6">
                  Our insurance specialists are here to help you understand your benefits and payment options.
                </p>
                <ul className="space-y-3 opacity-90">
                  <li>✓ Free insurance verification</li>
                  <li>✓ Pre-authorization assistance</li>
                  <li>✓ Transparent pricing information</li>
                  <li>✓ Payment plan options available</li>
                </ul>
              </div>
              <div className="flex flex-col gap-4">
                <a href="tel:7065509202" className="w-full">
                  <Button variant="cta" size="xl" className="w-full gap-2">
                    <Phone className="h-5 w-5" />
                    Call for Verification
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full border-2 border-current"
                  onClick={() => {
                    const element = document.getElementById("contact");
                    if (element) element.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Request Information
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Insurance;
