import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SlotPicker, { type SlotPickerHandle } from "@/components/booking/SlotPicker";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PATIENT_SELF_SERVICE_PROVIDER_ID } from "@/lib/patientBookingConfig";
import { CancellationPolicySummary } from "@/components/marketing/CancellationPolicySummary";

const ALLOWED_RESULTS = new Set(["cleared", "warned_acknowledged", "overridden"]);

const IVSlotSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const intakeId = searchParams.get("intake_id") || "";
  const serviceId = searchParams.get("serviceId") || "";
  const [therapyIdForCheckout, setTherapyIdForCheckout] = useState("");
  const [guardLoading, setGuardLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const slotPickerRef = useRef<SlotPickerHandle>(null);

  useEffect(() => {
    const guard = async () => {
      if (!serviceId) {
        navigate("/book/iv", { replace: true });
        return;
      }
      if (!intakeId) {
        navigate(`/book/iv/screening?serviceId=${encodeURIComponent(serviceId)}`, { replace: true });
        return;
      }
      try {
        const { data, error } = await supabase.functions.invoke("get-iv-screening-status", {
          body: { intake_id: intakeId },
        });
        if (error) throw error;
        const result = data?.screening_result as string | undefined;
        if (!result || !ALLOWED_RESULTS.has(result)) {
          navigate(`/book/iv/screening?serviceId=${encodeURIComponent(serviceId)}`, { replace: true });
          return;
        }
        setTherapyIdForCheckout(serviceId);
      } catch {
        navigate(`/book/iv/screening?serviceId=${encodeURIComponent(serviceId)}`, { replace: true });
        return;
      } finally {
        setGuardLoading(false);
      }
    };
    void guard();
  }, [intakeId, navigate, serviceId]);

  const handleConfirm = async ({ slot }: { slot: { slot_token: string; start: string } }) => {
    if (!serviceId || !intakeId || !therapyIdForCheckout) return;
    setCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-iv-drip-checkout", {
        body: {
          therapy_id: therapyIdForCheckout,
          intake_id: intakeId,
          slot_token: slot.slot_token,
          success_query: {
            intake_id: intakeId,
            service_id: serviceId,
          },
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("Missing Stripe checkout URL.");
      window.location.href = data.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start checkout.");
      await slotPickerRef.current?.reload();
    } finally {
      setCheckingOut(false);
    }
  };

  if (guardLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <h1 className="font-playfair text-3xl">Select your appointment slot</h1>
                <p className="font-jost text-muted-foreground">
                  Choose a calendar slot first. Payment is completed immediately after you confirm.
                </p>
              </div>
              <CancellationPolicySummary variant="iv-compact" className="mb-2" />
              <SlotPicker
                ref={slotPickerRef}
                serviceLine="iv"
                durationMinutes={60}
                providerId={PATIENT_SELF_SERVICE_PROVIDER_ID}
                onConfirm={handleConfirm}
                confirmLabel={checkingOut ? "Redirecting to payment..." : "Confirm slot & continue to payment"}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(`/book/iv/screening?serviceId=${encodeURIComponent(serviceId)}`)}
                >
                  Back to screening
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IVSlotSelection;
