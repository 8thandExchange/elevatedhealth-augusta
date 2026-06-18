import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const IVScreeningWarnings = () => {
  const navigate = useNavigate();
  const { intake_id } = useParams<{ intake_id: string }>();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("serviceId") || "";
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [warnReasons, setWarnReasons] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!intake_id) {
        setError("Missing intake id.");
        setLoading(false);
        return;
      }
      try {
        const { data, error: invokeErr } = await supabase.functions.invoke("get-iv-screening-status", {
          body: { intake_id },
        });
        if (invokeErr) throw invokeErr;
        setWarnReasons((data?.warn_reasons as string[]) || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load warning details.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [intake_id]);

  const handleContinue = async () => {
    if (!intake_id) return;
    if (!acknowledged) {
      toast.error("Please acknowledge the warnings before continuing.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: invokeErr } = await supabase.functions.invoke("acknowledge-iv-warnings", {
        body: { intake_id },
      });
      if (invokeErr) throw invokeErr;
      navigate(`/book/iv/slots?intake_id=${encodeURIComponent(intake_id)}&serviceId=${encodeURIComponent(serviceId)}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not proceed right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="public-page-shell">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-3xl flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                Please review these warnings
              </CardTitle>
              <CardDescription className="font-jost">
                Your screening flagged caution items. You may continue only after acknowledgment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="py-10 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-primary" />
                </div>
              ) : error ? (
                <p className="text-destructive">{error}</p>
              ) : (
                <>
                  <div className="rounded-lg border border-amber-400/40 bg-amber-50/40 dark:bg-amber-950/20 p-4">
                    <p className="font-jost font-semibold mb-2">Warning details</p>
                    <ul className="list-disc pl-5 space-y-2">
                      {warnReasons.map((reason, idx) => (
                        <li key={`${reason}-${idx}`} className="font-jost text-sm">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="font-jost text-sm font-semibold">
                    Please discuss these items with your primary physician before proceeding.
                  </p>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="ack-warnings"
                      checked={acknowledged}
                      onCheckedChange={(checked) => setAcknowledged(checked === true)}
                    />
                    <Label htmlFor="ack-warnings" className="font-jost leading-relaxed">
                      I have read and understand these warnings and choose to proceed.
                    </Label>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleContinue} disabled={submitting}>
                      {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Continue to calendar
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IVScreeningWarnings;
