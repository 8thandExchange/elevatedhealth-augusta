import { useState } from "react";
import { dobMatches } from "@/lib/consents/dob-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface DobVerificationProps {
  expectedDob: string;
  maxAttempts?: number;
  onVerified: () => void;
  onLocked: () => void;
  /** Larger touch targets for iPad kiosk */
  kioskMode?: boolean;
}

export function DobVerification({
  expectedDob,
  maxAttempts = 3,
  onVerified,
  onLocked,
  kioskMode = false,
}: DobVerificationProps) {
  const [entered, setEntered] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;

    if (dobMatches(expectedDob, entered)) {
      setError(null);
      onVerified();
      return;
    }

    const next = attempts + 1;
    setAttempts(next);
    if (next >= maxAttempts) {
      setLocked(true);
      setError("Please request staff assistance.");
      onLocked();
      return;
    }

    setError(
      "Date of birth does not match our records. Please check your entry or speak with staff.",
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
      <div>
        <h2 className={`font-playfair font-light text-foreground ${kioskMode ? "text-3xl" : "text-2xl"}`}>
          Confirm your date of birth
        </h2>
        <p className="mt-2 text-muted-foreground">
          Please confirm your date of birth to begin signing required consents.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dob-verify" className={kioskMode ? "text-base" : undefined}>
          Date of birth
        </Label>
        <Input
          id="dob-verify"
          type="date"
          value={entered}
          onChange={(e) => setEntered(e.target.value)}
          disabled={locked}
          required
          className={kioskMode ? "h-14 text-lg" : undefined}
        />
      </div>

      {error && (
        <Alert variant={locked ? "destructive" : "default"}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!locked && (
        <Button
          type="submit"
          size={kioskMode ? "lg" : "default"}
          className={kioskMode ? "h-14 w-full text-lg" : "w-full"}
        >
          Continue
        </Button>
      )}
    </form>
  );
}
