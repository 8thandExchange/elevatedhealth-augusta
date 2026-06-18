import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertOctagon, Loader2, Phone } from "lucide-react";

type BlockSeverity = "hard" | "service_specific" | null;

type IntakeStatus = {
  first_name: string | null;
  selected_therapy_id: string | null;
  block_reasons: string[];
  block_severity: BlockSeverity;
  has_anaphylaxis_history: boolean;
};

const IVScreeningBlocked = () => {
  const { intake_id } = useParams<{ intake_id: string }>();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<IntakeStatus | null>(null);
  const [therapyName, setTherapyName] = useState<string>("your selected IV");
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

        const loadedStatus: IntakeStatus = {
          first_name: (data?.first_name as string | null) || null,
          selected_therapy_id: (data?.selected_therapy_id as string | null) || null,
          block_reasons: (data?.block_reasons as string[]) || [],
          block_severity: (data?.block_severity as BlockSeverity) || null,
          has_anaphylaxis_history: !!data?.has_anaphylaxis_history,
        };
        setStatus(loadedStatus);

        if (loadedStatus.selected_therapy_id) {
          const { data: therapy } = await supabase
            .from("iv_therapies")
            .select("name")
            .eq("id", loadedStatus.selected_therapy_id)
            .maybeSingle();
          if (therapy?.name) setTherapyName(therapy.name);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load screening details.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [intake_id]);

  const firstReason = useMemo(() => status?.block_reasons?.[0] || null, [status]);
  const blockCase = useMemo(() => {
    if (!status) return null;
    if (status.block_severity === "service_specific") return "service_specific";
    if (status.block_severity === "hard" && status.has_anaphylaxis_history) return "hard_anaphylaxis";
    return "hard_general";
  }, [status]);

  return (
    <div className="public-page-shell">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="py-10 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-primary" />
                </div>
              ) : error ? (
                <p className="text-destructive">{error}</p>
              ) : blockCase === "service_specific" ? (
                <>
                  <CardTitle className="font-playfair text-3xl flex items-center gap-2">
                    <AlertOctagon className="w-6 h-6 text-destructive" />
                    Let&apos;s find a better fit for you today.
                  </CardTitle>
                  <CardDescription className="font-jost">
                    Based on what you shared, {therapyName} isn&apos;t the right match. The good news — you can still
                    book one of our other IVs that doesn&apos;t include the flagged ingredient.
                  </CardDescription>
                  {firstReason && (
                    <div className="rounded-lg border border-accent/30 bg-accent/10 p-4 font-jost">
                      You indicated: {firstReason}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-1 gap-3">
                    <Button asChild>
                      <Link to="/book/iv">Browse other IVs</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to={`/book/consult/request?intake_id=${encodeURIComponent(intake_id || "")}`}>
                        Request a consult instead
                      </Link>
                    </Button>
                  </div>
                </>
              ) : blockCase === "hard_anaphylaxis" ? (
                <>
                  <CardTitle className="font-playfair text-3xl flex items-center gap-2">
                    <AlertOctagon className="w-6 h-6 text-destructive" />
                    Let&apos;s talk before we book anything.
                  </CardTitle>
                  <CardDescription className="font-jost">
                    Given your history of severe allergic reactions, please call us directly so we can plan the safest
                    approach together.
                  </CardDescription>
                  {firstReason && (
                    <div className="rounded-lg border border-accent/30 bg-accent/10 p-4 font-jost">
                      You indicated: {firstReason}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-1 gap-3">
                    <Button asChild>
                      <a href="tel:+17067603470">
                        <Phone className="w-4 h-4 mr-2" />
                        Call us: (706) 760-3470
                      </a>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/book/iv">Return to services</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <CardTitle className="font-playfair text-3xl flex items-center gap-2">
                    <AlertOctagon className="w-6 h-6 text-destructive" />
                    We can&apos;t book your IV today.
                  </CardTitle>
                  <CardDescription className="font-jost">
                    Thanks for sharing your medical history. Based on what you told us, we can&apos;t safely book IV
                    therapy without a physician evaluating you first. That doesn&apos;t mean IV is off the table — we just
                    want to design the right plan.
                  </CardDescription>
                  {firstReason && (
                    <div className="rounded-lg border border-accent/30 bg-accent/10 p-4 font-jost">
                      You indicated: {firstReason}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-1 gap-3">
                    <Button asChild>
                      <Link to={`/book/consult/request?intake_id=${encodeURIComponent(intake_id || "")}`}>
                        Yes, I&apos;d like to talk to a physician
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/book/iv">Not right now, return to menu</Link>
                    </Button>
                  </div>
                </>
              )}

              {status?.first_name && (
                <p className="font-jost text-sm text-muted-foreground">
                  We&apos;ll take good care of you, {status.first_name}.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IVScreeningBlocked;
