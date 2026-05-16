import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSubstanceAdditionTemplate } from "@/data/consents/substance-addition-templates";
import { SubstanceAcknowledgmentCapture } from "@/components/consents/SubstanceAcknowledgmentCapture";
import { supabase } from "@/integrations/supabase/client";

export default function PatientSubstanceAcknowledgment() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const substanceId = params.get("substance");
  const template = substanceId ? getSubstanceAdditionTemplate(substanceId) : undefined;

  const [patient, setPatient] = useState<{ id: string; full_name: string } | null>(null);
  const [parentRecordId, setParentRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!template) {
        setLoading(false);
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      if (!uid) {
        setGateError("Please sign in to continue.");
        setLoading(false);
        return;
      }
      const { data: prow } = await supabase.from("patients").select("id, full_name").eq("user_id", uid).maybeSingle();
      if (!prow) {
        setGateError("Patient profile not found.");
        setLoading(false);
        return;
      }

      const nowIso = new Date().toISOString();
      const { data: rp } = await supabase
        .from("consent_records")
        .select("id, expires_at")
        .eq("patient_id", prow.id)
        .eq("consent_type", "research_peptide")
        .is("revoked_at", null)
        .gt("expires_at", nowIso)
        .order("signed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (!rp) {
        setGateError("You need an active Research Peptide consent before acknowledging new substances.");
        setPatient(prow as { id: string; full_name: string });
        setLoading(false);
        return;
      }

      setPatient(prow as { id: string; full_name: string });
      setParentRecordId((rp as { id: string }).id);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [template]);

  if (!substanceId || !template) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto max-w-lg px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair">Substance acknowledgment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Invalid or unsupported substance.</p>
              <Button type="button" variant="outline" onClick={() => navigate("/patient/dashboard")}>
                Back to dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (gateError && !parentRecordId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto max-w-lg px-4 py-12 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair">Research peptide consent needed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{gateError}</p>
              <Button type="button" onClick={() => navigate("/intake/treatment-consents?types=research_peptide")}>
                Complete treatment consents
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/patient/dashboard")}>
                Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!patient || !parentRecordId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{gateError ?? "Unable to load patient."}</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto max-w-lg px-4 py-16 text-center space-y-6">
          <h1 className="font-playfair text-2xl font-light">Acknowledgment saved</h1>
          <p className="text-muted-foreground text-sm">Your chart is updated. You can close this window.</p>
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
          <h1 className="font-playfair text-3xl font-light">Substance acknowledgment</h1>
          <p className="text-sm text-muted-foreground mt-2">{template.display_name}</p>
        </div>
        <SubstanceAcknowledgmentCapture
          substanceId={substanceId}
          patientId={patient.id}
          patientName={patient.full_name}
          parentConsentRecordId={parentRecordId}
          variant="patient_remote"
          onComplete={() => setDone(true)}
        />
      </main>
    </div>
  );
}
