import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Calendar, Clock, Phone, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "@/lib/siteConfig";

const IV_BOOKING_URL = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ19EEeTvO7yEID4o83yxzNBnC197eJp72gl_oy1fbKMo59Xx0LW0pcLkbnm9VCHMdvWEEJ4OoaR?gv=true";

const IVPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const therapyName = searchParams.get("therapy") || "IV Therapy";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-8">
            {/* Success Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-cormorant font-semibold text-foreground mb-4">
                Payment Confirmed!
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Your <strong>{therapyName}</strong> has been paid. Now schedule your appointment below.
              </p>
            </div>

            {/* Booking Section */}
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="h-6 w-6 text-gold" />
                  <h2 className="text-xl font-semibold">Schedule Your IV Session</h2>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  Select a time that works best for you. Sessions typically last 45-60 minutes in our relaxing IV Lounge.
                </p>

                {/* Embedded Calendar */}
                <div className="rounded-lg overflow-hidden border mb-6">
                  <iframe
                    src={IV_BOOKING_URL}
                    style={{ border: 0, width: "100%", height: "500px" }}
                    title="Book IV Therapy Session"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Need help? Call us at {SITE_CONFIG.phone}</span>
                </div>
              </CardContent>
            </Card>

            {/* What to Expect */}
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">What to Expect</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <Clock className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Session Duration</p>
                      <p className="text-sm text-muted-foreground">45-60 minutes in our comfortable lounge</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Location</p>
                      <p className="text-sm text-muted-foreground">{SITE_CONFIG.address.full}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Tips:</strong> Arrive hydrated and have eaten a light meal. Wear comfortable clothing with easy arm access. Bring entertainment (phone, book) for your relaxation time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IVPaymentSuccess;
