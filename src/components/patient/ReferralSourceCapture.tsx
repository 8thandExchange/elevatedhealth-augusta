import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { REFERRAL_SOURCE_OPTIONS } from "@/lib/referralSources";
import { recordPatientReferral } from "@/lib/recordPatientReferral";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReferralSourceCaptureProps {
  onRecorded?: (display: string) => void;
  compact?: boolean;
}

export default function ReferralSourceCapture({ onRecorded, compact }: ReferralSourceCaptureProps) {
  const [referralSource, setReferralSource] = useState("");
  const [referralSourceDetail, setReferralSourceDetail] = useState("");
  const [saving, setSaving] = useState(false);

  const needsDetail = REFERRAL_SOURCE_OPTIONS.find((o) => o.value === referralSource)?.promptForDetail;

  const handleSubmit = async () => {
    if (!referralSource) {
      toast.error("Please select how you heard about us.");
      return;
    }
    setSaving(true);
    try {
      const result = await recordPatientReferral({
        referral_source: referralSource,
        referral_source_detail: referralSourceDetail || undefined,
      });
      toast.success("Thanks — we've saved that.");
      onRecorded?.(result.display);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save your response.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className={compact ? "border-dashed" : undefined}>
      <CardContent className={`space-y-4 ${compact ? "pt-6" : "pt-6"}`}>
        {!compact && (
          <p className="font-jost text-sm text-muted-foreground">
            One quick question we missed earlier — it helps us know what's working.
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="sched-referral">How did you hear about us?</Label>
          <Select
            value={referralSource}
            onValueChange={(v) => {
              const opt = REFERRAL_SOURCE_OPTIONS.find((o) => o.value === v);
              setReferralSource(v);
              setReferralSourceDetail(opt?.promptForDetail ? referralSourceDetail : "");
            }}
          >
            <SelectTrigger id="sched-referral">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {REFERRAL_SOURCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {needsDetail && (
            <Input
              value={referralSourceDetail}
              onChange={(e) => setReferralSourceDetail(e.target.value)}
              placeholder="Optional details"
            />
          )}
        </div>
        <Button type="button" onClick={() => void handleSubmit()} disabled={saving || !referralSource}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save
        </Button>
      </CardContent>
    </Card>
  );
}
