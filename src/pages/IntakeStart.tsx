import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type StartState = "loading" | "error" | "redirecting";

export default function IntakeStart() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<StartState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("t");
    if (!token) {
      setState("error");
      setErrorMessage("This intake link is missing or invalid.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data: consumeData, error: consumeError } = await supabase.functions.invoke(
          "consume-intake-magic-link",
          { body: { token } },
        );

        if (cancelled) return;

        if (consumeError || consumeData?.error) {
          const reason = consumeData?.reason || consumeData?.error || consumeError?.message;
          if (reason === "expired") {
            setErrorMessage("This intake link has expired. Please contact the office for a new link.");
          } else if (reason === "revoked") {
            setErrorMessage("This intake link is no longer valid. Please contact the office.");
          } else {
            setErrorMessage("This intake link is invalid. Please contact the office for assistance.");
          }
          setState("error");
          return;
        }

        const targetPatientId = consumeData.patient_id as string;
        const tokenHash = consumeData.token_hash as string;

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          const { data: currentPatient } = await supabase
            .from("patients")
            .select("id")
            .eq("user_id", sessionData.session.user.id)
            .maybeSingle();

          if (currentPatient && currentPatient.id !== targetPatientId) {
            await supabase.auth.signOut();
          }
        }

        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          type: "email",
          token_hash: tokenHash,
        });

        if (verifyError || !verifyData.session) {
          throw new Error(verifyError?.message ?? "Could not sign you in. Please try the link again.");
        }

        setState("redirecting");
        navigate("/intake/consents", { replace: true });
      } catch (err) {
        if (cancelled) return;
        setState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Something went wrong. Please try again or call the office.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate]);

  if (state === "loading" || state === "redirecting") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">
          {state === "redirecting" ? "Signed in — opening your intake…" : "Verifying your secure link…"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="max-w-md space-y-6 text-center">
        <h1 className="font-playfair text-2xl font-light text-foreground">Intake link problem</h1>
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        <p className="text-sm text-muted-foreground">
          Contact us at{" "}
          <a href="tel:+17067603470" className="text-accent underline">
            (706) 760-3470
          </a>{" "}
          if you need a new link.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Return to homepage</Link>
        </Button>
      </div>
    </div>
  );
}
