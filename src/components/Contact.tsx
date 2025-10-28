import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Simulate form submission
    toast({
      title: "Consultation Request Received!",
      description: "Thank you for reaching out. We'll contact you within 24 hours to schedule your consultation.",
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-24 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary-foreground">
              Schedule Your Consultation
            </h2>
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
                      <a 
                        href="mailto:info@elevatedhealthaugusta.com" 
                        className="text-accent hover:underline break-all"
                      >
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
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="p-8 lg:p-10 bg-card/95 backdrop-blur">
              <h3 className="text-2xl font-semibold mb-2 text-foreground">Request a Consultation</h3>
              <p className="text-muted-foreground mb-8">
                Fill out the form below and we'll reach out within 24 hours to schedule your appointment.
              </p>
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
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  <Calendar className="h-5 w-5" />
                  Book a Consultation
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
