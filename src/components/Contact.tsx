import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_AREA_OPTIONS } from "@/lib/marketingPillars";
import { REFERRAL_SOURCE_OPTIONS } from "@/lib/referralSources";
import { ArrowRight, MapPin, Phone, Clock, CheckCircle2, Sparkles, Droplet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackCTAClick } from "@/lib/analytics";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useBooking } from "@/contexts/BookingContext";
import { consultGatedServicesCopy } from "@/lib/serviceConfig";
import { CORE_SERVICES } from "@/lib/stripeConfig";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { MARKETING_IMAGES, MARKETING_IMAGE_FRAMING } from "@/lib/marketingImages";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(20),
  area_of_interest: z.string().min(1, "Please select an area of interest"),
  message: z
    .string()
    .trim()
    .max(500, "Message is too long")
    .optional()
    .transform((v) => v ?? ""),
});

const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const WA_PRICE = CORE_SERVICES.wellnessAssessment.displayPrice;
const BOOK_WA_LABEL = `Book ${WA_PRICE} Wellness Assessment`;
const WA_CTA_HELPER = "Required first step for hormones, peptides, and weight loss.";

const Contact = ({ showCredibilityBar = false }: { showCredibilityBar?: boolean }) => {
  const { openBooking } = useBooking();
  const navigate = useNavigate();

  const goToIV = () => {
    trackCTAClick('cta_iv_lounge', 'contact_section');
    navigate('/iv-lounge');
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    area_of_interest: "",
    referral_source: "",
    referral_source_detail: "",
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
      const interestLabel =
        LEAD_AREA_OPTIONS.find((o) => o.value === validated.area_of_interest)?.label ??
        validated.area_of_interest;
      const summary =
        validated.message.trim().length > 0
          ? validated.message.trim()
          : `Lead interest: ${interestLabel}`;

      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: validated.name,
          email: validated.email,
          phone: validated.phone,
          area_of_interest: validated.area_of_interest,
          message: summary,
          referral_source: formData.referral_source || undefined,
          referral_source_detail: formData.referral_source_detail || undefined,
          _fax: honeypot,
        },
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
      setFormData({ name: "", email: "", phone: "", area_of_interest: "", referral_source: "", referral_source_detail: "", message: "" });
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
    <section id="contact" className="py-20 lg:py-28 bg-surface border-t border-border scroll-mt-20">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {showCredibilityBar && (
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-muted-foreground text-[11px] font-jost font-medium tracking-[2.5px] uppercase text-center mb-14 pb-14 border-b border-border">
              <span>Physician-owned · Evans, GA</span>
              <span className="text-accent/50 hidden sm:inline">·</span>
              <span>Cash-pay · Superbills available</span>
              <span className="text-accent/50 hidden sm:inline">·</span>
              <span>Klarna &amp; Affirm at checkout</span>
            </div>
          )}

          <div className="text-center mb-14">
            <p className="section-label mb-4">Get in Touch</p>
            <h2 className="font-playfair text-3xl sm:text-4xl lg:text-5xl text-foreground mb-6">
              Begin your <span className="italic">restoration.</span>
            </h2>
            <p className="font-jost font-light text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Questions before you book? Send a note — or schedule your $79 Wellness Assessment when you are ready.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
            <div className="bg-background border border-border rounded-sm p-8 lg:p-10 shadow-[var(--shadow-sm)]">
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
                  
                  <h3 className="font-playfair text-3xl text-foreground mb-3">
                    Thank You, {submittedName}!
                  </h3>
                  
                  <p className="font-jost text-muted-foreground font-light mb-6 max-w-sm leading-relaxed">
                    Your message has been received. A member of our care team will reach out within 24 hours.
                  </p>
                  
                  <div className="w-full space-y-4">
                    <div className="bg-secondary/50 rounded-xl p-4 border border-border/30">
                      <p className="font-jost text-sm text-foreground/80 mb-1">What happens next?</p>
                      <ul className="font-jost text-sm text-muted-foreground font-light space-y-2 text-left">
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
                          {BOOK_WA_LABEL} online when you are ready
                        </li>
                      </ul>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Button
                          onClick={handleBooking}
                          size="lg"
                          className="w-full rounded-sm font-jost tracking-wide"
                        >
                          {BOOK_WA_LABEL}
                        </Button>
                        <p className="text-xs font-jost text-muted-foreground leading-snug">
                          {WA_CTA_HELPER}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Button
                          onClick={goToIV}
                          size="lg"
                          variant="outline"
                          className="w-full rounded-sm font-jost tracking-wide"
                        >
                          <Droplet className="mr-2 h-4 w-4" /> Book IV Therapy
                        </Button>
                        <p className="text-xs font-jost text-muted-foreground leading-snug">
                          Walk-in friendly. No consult required.
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsSuccess(false);
                        setFormData({ name: "", email: "", phone: "", area_of_interest: "", referral_source: "", referral_source_detail: "", message: "" });
                      }}
                      className="font-jost text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              ) : (
                /* Contact Form */
                <>
                  <h3 className="font-playfair text-2xl text-foreground mb-6">
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
                      <Label htmlFor="contact-name" className="font-jost text-sm text-foreground/80 mb-2 block">
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
                      <Label htmlFor="contact-email" className="font-jost text-sm text-foreground/80 mb-2 block">
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
                      <Label htmlFor="contact-phone" className="font-jost text-sm text-foreground/80 mb-2 block">
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
                      <Label htmlFor="contact-interest" className="font-jost text-sm text-foreground/80 mb-2 block">
                        Area of interest *
                      </Label>
                      <Select
                        value={formData.area_of_interest}
                        onValueChange={(v) => setFormData({ ...formData, area_of_interest: v })}
                      >
                        <SelectTrigger id="contact-interest" className="bg-background border-border/50">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_AREA_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="contact-referral" className="font-jost text-sm text-foreground/80 mb-2 block">
                        How did you hear about us?
                      </Label>
                      <Select
                        value={formData.referral_source}
                        onValueChange={(v) => {
                          const opt = REFERRAL_SOURCE_OPTIONS.find((o) => o.value === v);
                          setFormData((prev) => ({
                            ...prev,
                            referral_source: v,
                            referral_source_detail: opt?.promptForDetail ? prev.referral_source_detail : "",
                          }));
                        }}
                      >
                        <SelectTrigger id="contact-referral" className="bg-background border-border/50">
                          <SelectValue placeholder="Select an option (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {REFERRAL_SOURCE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {REFERRAL_SOURCE_OPTIONS.find((o) => o.value === formData.referral_source)?.promptForDetail && (
                        <Input
                          id="contact-referral-detail"
                          value={formData.referral_source_detail}
                          onChange={(e) => setFormData({ ...formData, referral_source_detail: e.target.value })}
                          placeholder="Tell us more (optional)"
                          className="mt-2 bg-background border-border/50 focus:border-primary"
                        />
                      )}
                    </div>
                    <div>
                      <Label htmlFor="contact-message" className="font-jost text-sm text-foreground/80 mb-2 block">
                        Optional note
                      </Label>
                      <Textarea
                        id="contact-message"
                        placeholder="Best time to call or anything else we should know (no medical details needed)"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={3}
                        maxLength={500}
                        className="bg-background border-border/50 focus:border-primary resize-none"
                      />
                    </div>
                    <Button 
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full font-jost tracking-wide text-base py-6"
                    >
                      {isSubmitting ? (submitStatus || "Sending...") : "Send Message"}
                      {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                  </form>
                </>
              )}
            </div>

            {/* Right Column - clinic photo, location, map, booking */}
            <div className="space-y-5">
              <MarketingImage
                src={MARKETING_IMAGES.staffCaroline}
                alt="Caroline Marshall at Elevated Health Augusta in Evans, Georgia"
                className="aspect-[2/3] max-h-[420px] w-full border border-border rounded-sm shadow-[var(--shadow-sm)]"
                imgClassName={MARKETING_IMAGE_FRAMING.staffCaroline}
              />

              {/* Location Details */}
              <div className="bg-background border border-border rounded-sm p-8 shadow-[var(--shadow-sm)]">
                <h3 className="font-playfair text-2xl text-foreground mb-6">Visit Our Clinic</h3>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-jost font-medium text-foreground">Address</p>
                      <p className="font-jost text-muted-foreground font-light">
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
                      <p className="font-jost font-medium text-foreground">Phone</p>
                      <a 
                        href={`tel:${SITE_CONFIG.phoneRaw}`}
                        className="font-jost text-primary hover:underline"
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
                      <p className="font-jost font-medium text-foreground">Hours</p>
                      <p className="font-jost text-muted-foreground font-light">
                        Monday - Friday: 9am - 5pm<br />
                        Saturday: By appointment<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Map Embed */}
              <div className="rounded-sm overflow-hidden border border-border shadow-[var(--shadow-sm)]">
                <iframe
                  src="https://maps.google.com/maps?q=7013+Evans+Town+Center+Blvd,+Suite+203,+Evans,+GA+30809&t=&z=15&ie=UTF8&iwloc=&output=embed"
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

              {/* Quick CTA — single location, no duplicate left-column buttons */}
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-2">
                  <Button
                    onClick={handleBooking}
                    size="lg"
                    className="w-full rounded-sm font-jost tracking-wide"
                  >
                    {BOOK_WA_LABEL}
                  </Button>
                  <p className="text-xs font-jost text-muted-foreground leading-snug text-center sm:text-left">
                    {WA_CTA_HELPER}
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={goToIV}
                    size="lg"
                    variant="outline"
                    className="w-full rounded-sm font-jost tracking-wide"
                  >
                    <Droplet className="mr-2 h-4 w-4" /> Book IV Therapy
                  </Button>
                  <p className="text-xs font-jost text-muted-foreground leading-snug text-center sm:text-left">
                    Walk-in friendly. No consult required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
