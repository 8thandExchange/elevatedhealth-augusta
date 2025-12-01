import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { trackCTAClick } from "@/lib/analytics";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().regex(/^[0-9+\(\)\-\s]+$/, "Phone number can only contain numbers and +()-").max(20, "Phone number must be less than 20 characters"),
  preferredContact: z.enum(["call", "text", "email"]),
  serviceInterest: z.enum(["ketamine", "weightloss", "hormones"]).optional(),
  insurance: z.array(z.string()).optional(),
  message: z.string().trim().max(2000, "Message must be less than 2000 characters").optional()
});

interface ContactProps {
  onOpenBooking?: () => void;
}

const Contact = ({ onOpenBooking }: ContactProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredContact: "email" as "call" | "text" | "email",
    serviceInterest: "" as "" | "ketamine" | "weightloss" | "hormones",
    insurance: [] as string[],
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = contactSchema.parse(formData);
      setIsSubmitting(true);

      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: validatedData
      });

      if (error) {
        console.error('Error sending contact form:', error);
        throw new Error(error.message || 'Failed to send message');
      }

      toast({
        title: "Thank You!",
        description: "We've received your message and will reach out within 1 hour during business hours."
      });
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        preferredContact: "email",
        serviceInterest: "",
        insurance: [],
        message: ""
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error Sending Message",
          description: "Please call us directly at (706) 760-3470.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleInsuranceChange = (value: string, checked: boolean) => {
    setFormData({
      ...formData,
      insurance: checked
        ? [...formData.insurance, value]
        : formData.insurance.filter((item) => item !== value)
    });
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-background scroll-mt-20">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 font-inter font-light">
              Get in Touch
            </p>
            <h2 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl font-light mb-6 text-foreground">
              Begin Your Journey
            </h2>
            <p className="font-inter text-lg text-muted-foreground font-light max-w-xl mx-auto">
              Schedule your complimentary consultation or send us a message
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            {/* Contact Form */}
            <Card className="p-8 lg:p-10 bg-card border-border/50 shadow-md">
              <h3 className="font-cormorant text-2xl font-light mb-8 text-foreground">Send Us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="font-inter">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="font-inter"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="font-inter">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="font-inter"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="font-inter">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(706) 555-1234"
                    value={formData.phone}
                    onChange={handleChange}
                    className="font-inter"
                  />
                </div>

                <div>
                  <Label className="font-inter mb-3 block">Which service are you interested in? (optional)</Label>
                  <RadioGroup
                    value={formData.serviceInterest}
                    onValueChange={(value) => setFormData({ ...formData, serviceInterest: value as "ketamine" | "weightloss" | "hormones" })}
                    className="space-y-3 rounded-lg bg-muted/30 p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="ketamine" id="service-ketamine" />
                      <Label htmlFor="service-ketamine" className="font-inter cursor-pointer font-normal">
                        Ketamine Therapy
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="weightloss" id="service-weightloss" />
                      <Label htmlFor="service-weightloss" className="font-inter cursor-pointer font-normal">
                        Medical Weight Loss
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="hormones" id="service-hormones" />
                      <Label htmlFor="service-hormones" className="font-inter cursor-pointer font-normal">
                        Hormone Replacement
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="font-inter mb-3 block">Do you have one of our covered plans? (optional)</Label>
                  <div className="space-y-3 rounded-lg bg-muted/30 p-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="insurance-bcbs"
                        checked={formData.insurance.includes("bcbs")}
                        onCheckedChange={(checked) => handleInsuranceChange("bcbs", checked as boolean)}
                      />
                      <Label htmlFor="insurance-bcbs" className="font-inter cursor-pointer font-normal">
                        Blue Cross Blue Shield
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="insurance-tricare"
                        checked={formData.insurance.includes("tricare")}
                        onCheckedChange={(checked) => handleInsuranceChange("tricare", checked as boolean)}
                      />
                      <Label htmlFor="insurance-tricare" className="font-inter cursor-pointer font-normal">
                        TRICARE
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="insurance-va"
                        checked={formData.insurance.includes("va")}
                        onCheckedChange={(checked) => handleInsuranceChange("va", checked as boolean)}
                      />
                      <Label htmlFor="insurance-va" className="font-inter cursor-pointer font-normal">
                        VA (Veterans Affairs)
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground italic mt-2">
                      We'll confirm eligibility during your consultation – no upfront verification needed
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="font-inter mb-3 block">Preferred Contact Method</Label>
                  <RadioGroup
                    value={formData.preferredContact}
                    onValueChange={(value) => setFormData({ ...formData, preferredContact: value as "call" | "text" | "email" })}
                    className="flex flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="call" id="call" />
                      <Label htmlFor="call" className="font-inter cursor-pointer">Call</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="text" id="text" />
                      <Label htmlFor="text" className="font-inter cursor-pointer">Text</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email-contact" />
                      <Label htmlFor="email-contact" className="font-inter cursor-pointer">Email</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="message" className="font-inter">Message (optional)</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help..."
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="font-inter resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-inter font-semibold uppercase bg-accent hover:bg-accent-light text-white py-6"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>

                {onOpenBooking && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-center text-sm text-muted-foreground mb-3">
                      Or schedule your free consultation directly
                    </p>
                    <Button
                      type="button"
                      onClick={() => {
                        trackCTAClick('book_consultation', 'contact_form');
                        onOpenBooking();
                      }}
                      className="w-full font-inter font-semibold uppercase bg-primary hover:bg-primary-light text-white py-6"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Book Consultation
                    </Button>
                  </div>
                )}
                
                <div className="text-center text-sm text-muted-foreground mt-4">
                  <p className="mb-1">Prefer to talk?</p>
                  <a href="tel:+17067603470" className="text-accent hover:underline font-semibold inline-flex items-center gap-1 justify-center">
                    <Phone className="h-4 w-4" />
                    Call (706) 760-3470
                  </a>
                </div>
              </form>

              {/* Clinic Info */}
              <div className="mt-8 pt-8 border-t border-border space-y-3 font-inter text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <a href="tel:7067603470" className="hover:text-accent">
                    (706) 760-3470
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Mon–Fri 9AM–5PM</span>
                </div>
              </div>
            </Card>

          </div>

          {/* HIPAA Notice */}
          <div className="mt-8 text-center">
            <p className="font-inter text-sm text-muted-foreground">
              <strong>Privacy Notice:</strong> Please do not include personal medical information in your message. 
              All communications are HIPAA-compliant and encrypted.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
