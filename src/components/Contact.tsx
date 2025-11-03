import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().regex(/^[0-9+\(\)\-\s]+$/, "Phone number can only contain numbers and +()-").max(20, "Phone number must be less than 20 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters")
});

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with zod schema
    try {
      const validatedData = contactSchema.parse(formData);
      setIsSubmitting(true);

      // Call edge function to send email
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: validatedData
      });

      if (error) {
        console.error('Error sending contact form:', error);
        throw new Error(error.message || 'Failed to send message');
      }

      // Success
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you within 24 hours. If urgent, please call us at (706) 550-9202."
      });
      
      setFormData({
        name: "",
        email: "",
        phone: "",
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
          description: "There was a problem sending your message. Please call us directly at (706) 550-9202.",
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

  return (
    <section id="contact" className="py-24 bg-primary scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary-foreground">HAVE MORE QUESTIONS?</h2>
            <p className="text-xl text-primary-foreground/90">
              Take the first step toward better mental health. We're here to help.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Information & Map */}
            <div className="space-y-6">
              <Card className="p-8 bg-card/95 backdrop-blur">
                <h3 className="text-2xl font-semibold mb-6 text-foreground">Visit Our Clinic</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground mb-1">Address</div>
                      <p className="text-muted-foreground leading-relaxed">
                        7013 Evans Town Center Blvd<br />
                        Suite 203<br />
                        Evans, GA 30809
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground mb-1">Phone</div>
                      <a href="tel:7065509202" className="text-accent hover:underline text-lg">
                        (706) 550-9202
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground mb-1">Email</div>
                      <a href="mailto:info@elevatedhealthaugusta.com" className="text-accent hover:underline break-all">
                        info@elevatedhealthaugusta.com
                      </a>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Google Map */}
              <Card className="overflow-hidden bg-card/95 backdrop-blur">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4425.244485599479!2d-82.13130772336089!3d33.54224307335318!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88f9d5933e578cdb%3A0xb308850117ee3e28!2sElevated%20Health%20Augusta!5e1!3m2!1sen!2sus!4v1761609985448!5m2!1sen!2sus"
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Elevated Health Augusta Location"
                />
                <div className="p-4 border-t border-border flex justify-end">
                  <a href="https://www.google.com/maps/search/?api=1&query=Elevated%20Health%20Augusta%2C%20Evans%2C%20GA" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">Open in Google Maps</Button>
                  </a>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="p-8 lg:p-10 bg-card/95 backdrop-blur">
              <h3 className="text-2xl font-semibold mb-2 text-foreground">We're Here to Help</h3>
              <p className="text-muted-foreground mb-8">Fill out the form below and we'll reach out within 24 hours to answer your questions.</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="border-2 focus:border-accent focus:ring-accent"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="border-2 focus:border-accent focus:ring-accent"
                    maxLength={255}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(706) 555-0123"
                    className="border-2 focus:border-accent focus:ring-accent"
                    maxLength={20}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                    Tell Us About Your Needs <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Share what brings you here and how we can help..."
                    rows={5}
                    className="border-2 focus:border-accent focus:ring-accent resize-none"
                    maxLength={2000}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-2 flex items-start gap-2">
                    <span className="flex-shrink-0">🔒</span>
                    <span><strong>Privacy Notice:</strong> Please do not share any sensitive medical or personal health information in this form. This form is intended for general inquiries only. Our care team will reach out to discuss your needs securely.</span>
                  </p>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                  disabled={isSubmitting}
                >
                  <Calendar className="h-5 w-5" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  By submitting this form, you agree to our privacy policy. We'll never share your information.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
