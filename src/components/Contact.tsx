import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, MapPin, Phone, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { trackCTAClick } from "@/lib/analytics";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useBooking } from "@/contexts/BookingContext";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(20),
  message: z.string().trim().min(10, "Please include a brief message (10+ characters)").max(2000, "Message is too long"),
});

const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const Contact = () => {
  const { openBooking } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");

  // Clear honeypot on mount in case browser autofilled before React took control
  useEffect(() => {
    setHoneypot("");
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleBooking = () => {
    trackCTAClick('cta_request_access', 'booking_calendar');
    openBooking();
  };

  const [submitStatus, setSubmitStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("Validating...");
    console.log("[Contact Form] Starting submission...", formData);

    try {
      const validated = contactSchema.parse(formData);
      console.log("[Contact Form] Validation passed:", validated);
      
      setSubmitStatus("Sending your message...");
      
      // Send everything to edge function which handles DB insert + email
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: { ...validated, _fax: honeypot }
      });

      if (error) {
        console.error("[Contact Form] Edge function error:", error);
        throw new Error(error.message || "Failed to send message. Please try again.");
      }

      if (!data?.success) {
        console.error("[Contact Form] Edge function returned failure:", data);
        throw new Error(data?.message || "Failed to send message. Please try again.");
      }
      
      console.log("[Contact Form] Submission successful:", data);
      
      setSubmittedName(validated.name.split(" ")[0]);
      setIsSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
      trackCTAClick('contact_form_submit', 'contact_section');
      console.log("[Contact Form] Submission complete!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("[Contact Form] Validation error:", error.errors);
        toast.error(error.errors[0].message);
      } else {
        console.error("[Contact Form] Submission error:", error);
        toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again or call us.");
      }
    } finally {
      setIsSubmitting(false);
      setSubmitStatus("");
    }
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-card scroll-mt-20 relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4 font-inter font-semibold">
              05 — Begin Your Restoration
            </p>
            <h2 className="font-inter font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-6">
              Contact Us
            </h2>
            <p className="font-lato text-lg text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
              We will test your biology, understand your history, and architect
              a personalized protocol designed specifically for you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left Column - Contact Form or Success State */}
            <div className="bg-background rounded-2xl p-8 lg:p-10 border border-border/50 shadow-sm">
              {isSuccess ? (
                /* Success State with Animation */
                <div className="flex flex-col items-center justify-center text-center py-8 animate-fade-in">
                  {/* Animated checkmark circle */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-scale-in">
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                    </div>
                    {/* Sparkle accents */}
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-accent animate-pulse" />
                    <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-accent/70 animate-pulse" style={{ animationDelay: '0.3s' }} />
                  </div>
                  
                  <h3 className="font-cormorant text-3xl text-foreground mb-3">
                    Thank You, {submittedName}!
                  </h3>
                  
                  <p className="font-lato text-muted-foreground font-light mb-6 max-w-sm leading-relaxed">
                    Your message has been received. A member of our care team will reach out within 24 hours.
                  </p>
                  
                  <div className="w-full space-y-4">
                    <div className="bg-secondary/50 rounded-xl p-4 border border-border/30">
                      <p className="font-lato text-sm text-foreground/80 mb-1">What happens next?</p>
                      <ul className="font-lato text-sm text-muted-foreground font-light space-y-2 text-left">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          We'll review your message and health goals
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          A care coordinator will call or email you
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          We'll help you schedule a consultation
                        </li>
                      </ul>
                    </div>
                    
                    <Button 
                      onClick={handleBooking}
                      size="lg"
                      className="w-full font-lato tracking-wide text-base py-6"
                    >
                      Skip Ahead — Book Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    
                    <button
                      onClick={() => {
                        setIsSuccess(false);
                        setFormData({ name: "", email: "", phone: "", message: "" });
                      }}
                      className="font-lato text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              ) : (
                /* Contact Form */
                <>
                  <h3 className="font-cormorant text-2xl text-foreground mb-6">
                    Send Us a Message
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Honeypot field - hidden from humans, bots will fill it */}
                    <div className="absolute -left-[9999px]" aria-hidden="true">
                      <input
                        type="text"
                        name="company_fax"
                        id="company_fax_field"
                        tabIndex={-1}
                        autoComplete="new-password"
                        data-lpignore="true"
                        data-form-type="other"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                      />
                    </div>
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
                        onChange={handlePhoneChange}
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
                      {isSubmitting ? (submitStatus || "Sending...") : "Send Message"}
                      {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
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
                </>
              )}
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
                  title="Réveil Location"
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
