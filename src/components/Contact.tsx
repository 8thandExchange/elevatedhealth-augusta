import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

const consultationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(20, "Phone number must be less than 20 characters").regex(/^[0-9+\(\)\-\s]+$/, "Phone number can only contain numbers and +()-"),
  interest: z.enum(["ketamine", "weightloss", "hormones"], { required_error: "Please select an area of interest" })
});

interface ContactProps {
  onOpenBooking?: () => void;
}

const Contact = ({ onOpenBooking }: ContactProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    interest: "" as "" | "ketamine" | "weightloss" | "hormones"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = consultationSchema.parse(formData);
      setIsSubmitting(true);

      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: validatedData.name,
          email: "consultation@request.com",
          phone: validatedData.phone,
          preferredContact: "call",
          serviceInterest: validatedData.interest,
          message: `Consultation request for ${validatedData.interest}`
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to send request');
      }

      toast({
        title: "Request Received",
        description: "We'll be in touch within 24 hours to schedule your consultation."
      });
      
      setFormData({
        name: "",
        phone: "",
        interest: ""
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Please check your information",
          description: firstError.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Unable to send request",
          description: "Please call us directly at (706) 760-3470.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-secondary scroll-mt-20">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-lg mx-auto text-center">
          {/* Section Header */}
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 font-lato font-light">
            Get Started
          </p>
          <h2 className="font-playfair text-4xl sm:text-5xl text-foreground mb-4">
            Request Consultation
          </h2>
          <p className="font-lato text-muted-foreground font-light mb-12">
            Begin your wellness journey with a complimentary consultation
          </p>

          {/* Form Card */}
          <div className="bg-background border border-primary/30 p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name */}
              <div className="text-left">
                <Label htmlFor="name" className="font-lato text-sm tracking-wide text-muted-foreground mb-2 block">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="font-lato bg-transparent border-0 border-b border-border rounded-none px-0 focus:ring-0 focus:border-primary placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Phone */}
              <div className="text-left">
                <Label htmlFor="phone" className="font-lato text-sm tracking-wide text-muted-foreground mb-2 block">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(706) 555-1234"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="font-lato bg-transparent border-0 border-b border-border rounded-none px-0 focus:ring-0 focus:border-primary placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Area of Interest */}
              <div className="text-left">
                <Label className="font-lato text-sm tracking-wide text-muted-foreground mb-4 block">
                  Area of Interest
                </Label>
                <RadioGroup
                  value={formData.interest}
                  onValueChange={(value) => setFormData({ ...formData, interest: value as "ketamine" | "weightloss" | "hormones" })}
                  className="flex flex-col sm:flex-row gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ketamine" id="interest-ketamine" className="border-primary/50 text-primary" />
                    <Label htmlFor="interest-ketamine" className="font-lato font-light cursor-pointer text-foreground">
                      Ketamine
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weightloss" id="interest-weightloss" className="border-primary/50 text-primary" />
                    <Label htmlFor="interest-weightloss" className="font-lato font-light cursor-pointer text-foreground">
                      Weight Loss
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hormones" id="interest-hormones" className="border-primary/50 text-primary" />
                    <Label htmlFor="interest-hormones" className="font-lato font-light cursor-pointer text-foreground">
                      Hormones
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-lato tracking-wide py-6 mt-4"
              >
                {isSubmitting ? "Sending..." : "Request Access"}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            {/* Phone Alternative */}
            <p className="mt-8 text-sm text-muted-foreground font-lato">
              Prefer to call? <a href="tel:+17067603470" className="text-primary hover:underline">(706) 760-3470</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
