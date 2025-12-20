import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, MapPin, Phone, Clock } from "lucide-react";
import { trackCTAClick } from "@/lib/analytics";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

interface ContactProps {
  onOpenBooking?: () => void;
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(20),
  message: z.string().trim().min(10, "Please include a brief message (10+ characters)").max(2000, "Message is too long"),
});

const Contact = ({ onOpenBooking }: ContactProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleBooking = () => {
    trackCTAClick('cta_request_access', 'booking_calendar');
    if (onOpenBooking) {
      onOpenBooking();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validated = contactSchema.parse(formData);
      
      // Store lead in database
      await supabase.from("chat_leads").insert({
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        chat_summary: validated.message,
        interest: "contact_form",
        source: "website_contact",
        status: "new"
      });

      // Send notification email via edge function
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: validated
      });

      if (error) {
        console.error("Email send error:", error);
        // Still show success since lead was stored
      }
      
      toast.success("Thank you! We'll be in touch within 24 hours.");
      setFormData({ name: "", email: "", phone: "", message: "" });
      trackCTAClick('contact_form_submit', 'contact_section');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Contact form error:", error);
        toast.error("Something went wrong. Please try again or call us.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-secondary scroll-mt-20">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
              Begin Your Restoration
            </p>
            <h2 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6">
              Contact Us
            </h2>
            <p className="font-lato text-lg text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
              We will test your biology, understand your history, and architect
              a personalized protocol designed specifically for you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left Column - Contact Form */}
            <div className="bg-background rounded-2xl p-8 lg:p-10 border border-border/50 shadow-sm">
              <h3 className="font-cormorant text-2xl text-foreground mb-6">
                Send Us a Message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="contact-name" className="font-lato text-sm text-foreground/80 mb-2 block">
                    Full Name *
                  </Label>
                  <Input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-background border-border/50 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email" className="font-lato text-sm text-foreground/80 mb-2 block">
                    Email Address *
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-background border-border/50 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-phone" className="font-lato text-sm text-foreground/80 mb-2 block">
                    Phone Number *
                  </Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="(706) 555-1234"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="bg-background border-border/50 focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-message" className="font-lato text-sm text-foreground/80 mb-2 block">
                    How can we help? *
                  </Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us about your health goals..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="bg-background border-border/50 focus:border-primary resize-none"
                  />
                </div>
                <Button 
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full font-lato tracking-wide text-base py-6"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border/30">
                <p className="text-sm text-muted-foreground font-lato text-center">
                  Prefer to schedule directly?{" "}
                  <button 
                    onClick={handleBooking}
                    className="text-primary hover:underline font-medium"
                  >
                    Book a consultation
                  </button>
                </p>
              </div>
            </div>

            {/* Right Column - Location Info & Map */}
            <div className="space-y-8">
              {/* Location Details */}
              <div className="bg-background rounded-2xl p-8 border border-border/50 shadow-sm">
                <h3 className="font-cormorant text-2xl text-foreground mb-6">
                  Visit Our Clinic
                </h3>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-lato font-medium text-foreground">Address</p>
                      <p className="font-lato text-muted-foreground font-light">
                        {SITE_CONFIG.address.line1}<br />
                        {SITE_CONFIG.address.cityStateZip}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-lato font-medium text-foreground">Phone</p>
                      <a 
                        href={`tel:${SITE_CONFIG.phoneRaw}`}
                        className="font-lato text-primary hover:underline"
                        onClick={() => trackCTAClick('cta_call', `tel:${SITE_CONFIG.phoneRaw}`)}
                      >
                        {SITE_CONFIG.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-lato font-medium text-foreground">Hours</p>
                      <p className="font-lato text-muted-foreground font-light">
                        Monday - Friday: 9am - 5pm<br />
                        Saturday: By appointment<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Map Embed */}
              <div className="rounded-2xl overflow-hidden border border-border/50 shadow-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3321.0!2d-82.1334!3d33.5234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88f9d1f1f1f1f1f1%3A0x1234567890abcdef!2s7013%20Evans%20Town%20Center%20Blvd%2C%20Evans%2C%20GA%2030809!5e0!3m2!1sen!2sus!4v1234567890"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Elevated Health Augusta Location"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>

              {/* Quick CTA */}
              <div className="text-center">
                <Button 
                  size="lg"
                  onClick={handleBooking}
                  className="font-lato tracking-wide text-base px-10 py-6"
                >
                  Book Your Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
