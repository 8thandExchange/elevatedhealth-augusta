import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReconsentSigningCard } from "@/components/consents/ReconsentSigningCard";
import { supabase } from "@/integrations/supabase/client";

export default function PatientReconsent() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const requestId = params.get("request_id");
  const [patient, setPatient] = useState<{ id: string; full_name: string } | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!uid) {
        setLoadingPatient(false);
        return;
      }
      const { data } = await supabase.from("patients").select("id, full_name").eq("user_id", uid).maybeSingle();
      if (!cancelled && data) setPatient(data as { id: string; full_name: string });
      if (!cancelled) setLoadingPatient(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!requestId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto max-w-lg px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair">Updated consent required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">This link is missing a request reference.</p>
              <Button type="button" variant="outline" onClick={() => navigate("/patient/dashboard")}>
                Back to dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (loadingPatient || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{loadingPatient ? "Loading…" : "Please sign in as the patient to continue."}</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto max-w-lg px-4 py-16 text-center space-y-6">
          <h1 className="font-playfair text-2xl font-light">Thanks — you&apos;re all set</h1>
          <p className="text-muted-foreground text-sm">
            Your updated consent is on file. Current treatment is not interrupted; your next prescription may proceed
            normally once clinical staff refreshes your chart.
          </p>
          <Button type="button" onClick={() => navigate("/patient/dashboard")}>
            Return to dashboard
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div>
          <h1 className="font-playfair text-3xl font-light text-foreground">Sign updated consent</h1>
          <p className="text-sm text-muted-foreground mt-2">
            We&apos;ve updated the legal language for one of your agreements. Please review and sign the current version.
          </p>
        </div>
        <ReconsentSigningCard
          requestId={requestId}
          patientId={patient.id}
          patientName={patient.full_name}
          variant="patient_remote"
          onComplete={() => setDone(true)}
        />
      </main>
    </div>
  );
}
