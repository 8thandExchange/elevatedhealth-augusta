import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tier1IntakeBundle } from "@/components/consents/Tier1IntakeBundle";
import { dobMatches, phoneLastFour } from "@/lib/consents/dob-utils";
import { markTier1IntakeComplete } from "@/lib/consents/intake-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { patientNameEmailPhoneOrFilter } from "@/lib/patientSearch";

interface KioskPatient {
  id: string;
  full_name: string;
  dob: string | null;
  phone: string | null;
}

type KioskPhase = "auth" | "lookup" | "verify" | "handoff" | "intake" | "done";

export default function IntakeKiosk() {
  const [phase, setPhase] = useState<KioskPhase>("auth");
  const [staffUserId, setStaffUserId] = useState<string | null>(null);
  const [staffEmail, setStaffEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<KioskPatient[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<KioskPatient | null>(null);
  const [verifyDob, setVerifyDob] = useState("");
  const [verifyPhoneLast4, setVerifyPhoneLast4] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resetCountdown, setResetCountdown] = useState(30);

  useEffect(() => {
    checkStaffAuth();
  }, []);

  useEffect(() => {
    if (phase !== "done") return;
    setResetCountdown(30);
    const interval = setInterval(() => {
      setResetCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          resetToLookup();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const checkStaffAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPhase("auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const allowed = (roles ?? []).some(
      (r) => r.role === "admin" || r.role === "staff" || r.role === "provider",
    );
    if (!allowed) {
      setPhase("auth");
      return;
    }

    setStaffUserId(user.id);
    setStaffEmail(user.email ?? "Staff");
    setPhase("lookup");
  };

  const resetToLookup = () => {
    setSelected(null);
    setSearchTerm("");
    setSearchResults([]);
    setVerifyDob("");
    setVerifyPhoneLast4("");
    setVerifyError(null);
    setPhase("lookup");
  };

  const runSearch = async () => {
    const q = searchTerm.trim();
    if (q.length < 2) {
      toast.error("Enter at least 2 characters to search");
      return;
    }
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("id, full_name, dob, phone")
        .or(patientNameEmailPhoneOrFilter(q))
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      setSearchResults((data as KioskPatient[]) ?? []);
    } catch {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleVerifyPatient = () => {
    if (!selected) return;
    setVerifyError(null);

    const dobOk = selected.dob && dobMatches(selected.dob, verifyDob);
    const phoneOk =
      selected.phone &&
      verifyPhoneLast4.trim().length === 4 &&
      phoneLastFour(selected.phone) === verifyPhoneLast4.trim();

    if (!dobOk && !phoneOk) {
      setVerifyError("DOB or last 4 digits of phone must match the patient on file.");
      return;
    }

    setPhase("handoff");
  };

  const handleIntakeComplete = async () => {
    if (selected) {
      try {
        await markTier1IntakeComplete(selected.id);
      } catch {
        toast.warning("Consents saved; profile timestamp may need staff follow-up.");
      }
    }
    setPhase("done");
  };

  if (phase === "auth") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="font-playfair text-2xl font-light">Intake kiosk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Staff sign-in required. Use your clinic account at{" "}
              <a href="/admin/login" className="text-accent underline">
                admin login
              </a>
              , then return to this page.
            </p>
            <Button className="w-full" onClick={() => checkStaffAuth()}>
              Check access again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <h1 className="font-playfair text-3xl font-light">Thank you</h1>
        <p className="mt-4 text-xl text-muted-foreground">Please hand the iPad back to staff.</p>
        <p className="mt-8 text-sm text-muted-foreground">
          Returning to staff screen in {resetCountdown}s…
        </p>
      </div>
    );
  }

  if (phase === "intake" && selected && staffUserId && selected.dob) {
    return (
      <div className="min-h-screen bg-background px-4 py-6">
        <Tier1IntakeBundle
          patientId={selected.id}
          patientName={selected.full_name}
          patientDateOfBirth={selected.dob}
          mode="kiosk"
          staffWitnessUserId={staffUserId}
          staffDisplayName={staffEmail.split("@")[0]}
          staffTitle="Clinical staff"
          onAllConsentsComplete={() => handleIntakeComplete()}
          onAbort={resetToLookup}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="mx-auto max-w-xl space-y-6">
        <header>
          <h1 className="font-playfair text-2xl font-light">Front desk intake</h1>
          <p className="text-sm text-muted-foreground">Signed in as {staffEmail}</p>
        </header>

        {phase === "lookup" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Find patient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Name, email, or phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 text-base"
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                />
                <Button size="lg" onClick={runSearch} disabled={searching}>
                  {searching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search"}
                </Button>
              </div>
              <ul className="space-y-2">
                {searchResults.map((p) => (
                  <li key={p.id}>
                    <Button
                      variant={selected?.id === p.id ? "default" : "outline"}
                      className="h-12 w-full justify-start text-left text-base"
                      onClick={() => {
                        setSelected(p);
                        setPhase("verify");
                      }}
                    >
                      {p.full_name}
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {phase === "verify" && selected && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verify {selected.full_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Confirm identity with date of birth or last 4 digits of phone on file.
              </p>
              <div className="space-y-2">
                <Label>Date of birth</Label>
                <Input
                  type="date"
                  className="h-12"
                  value={verifyDob}
                  onChange={(e) => setVerifyDob(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Last 4 of phone</Label>
                <Input
                  className="h-12"
                  maxLength={4}
                  inputMode="numeric"
                  value={verifyPhoneLast4}
                  onChange={(e) => setVerifyPhoneLast4(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              {verifyError && (
                <Alert variant="destructive">
                  <AlertDescription>{verifyError}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPhase("lookup")}>
                  Back
                </Button>
                <Button className="flex-1" size="lg" onClick={handleVerifyPatient}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {phase === "handoff" && selected && (
          <Card>
            <CardContent className="space-y-6 pt-6">
              <p className="text-lg">
                Patient <strong>{selected.full_name}</strong> is here to complete intake. Hand the
                iPad to the patient when ready.
              </p>
              {!selected.dob && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Date of birth is missing on file. Update the patient record before intake.
                  </AlertDescription>
                </Alert>
              )}
              <Button
                size="lg"
                className="h-14 w-full text-lg"
                disabled={!selected.dob}
                onClick={() => setPhase("intake")}
              >
                Start intake for {selected.full_name}
              </Button>
              <Button variant="ghost" onClick={resetToLookup}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
