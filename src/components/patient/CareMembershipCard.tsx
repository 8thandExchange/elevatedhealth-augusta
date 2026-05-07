import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Syringe, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CareMembershipCardProps {
  patientId: string;
  tier?: string | null;
  status?: string | null;
}

const TIER_LABELS: Record<string, { name: string; price: string }> = {
  hormone: { name: "Hormone Care", price: "$149/mo" },
  hormone_injection: { name: "Hormone + Injection", price: "$249/mo" },
  peptide: { name: "Peptide Performance", price: "$299/mo" },
  full: { name: "Full Optimization", price: "$449/mo" },
};

export const CareMembershipCard = ({ patientId, tier, status }: CareMembershipCardProps) => {
  const [visitsThisMonth, setVisitsThisMonth] = useState<number>(0);
  const [lastVisit, setLastVisit] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const { data, count } = await supabase
        .from("membership_visit_log")
        .select("visit_date", { count: "exact" })
        .eq("patient_id", patientId)
        .gte("visit_date", start.toISOString())
        .order("visit_date", { ascending: false });
      setVisitsThisMonth(count ?? 0);
      setLastVisit(data?.[0]?.visit_date ?? null);
    };
    load();
  }, [patientId]);

  if (!tier || status !== "active") {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-cormorant text-xl flex items-center gap-2">
            <Crown className="w-5 h-5 text-muted-foreground" />
            Care Membership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Stay on protocol with unlimited in-clinic visits, supplies, and lab draws.
          </p>
          <a
            href="/care-membership"
            className="text-sm text-primary font-medium hover:underline"
          >
            Explore membership tiers →
          </a>
        </CardContent>
      </Card>
    );
  }

  const meta = TIER_LABELS[tier] ?? { name: tier, price: "" };

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="font-cormorant text-xl">{meta.name}</CardTitle>
              <p className="text-xs text-muted-foreground">Care Membership</p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1 text-xs uppercase tracking-wide text-muted-foreground">
              <Syringe className="w-3.5 h-3.5" /> Visits this month
            </div>
            <p className="text-2xl font-cormorant font-semibold text-foreground">{visitsThisMonth}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1 text-xs uppercase tracking-wide text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" /> Last visit
            </div>
            <p className="text-sm font-medium text-foreground">
              {lastVisit ? new Date(lastVisit).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Monthly rate</span>
          <span className="text-lg font-cormorant font-semibold text-primary">{meta.price}</span>
        </div>
        <p className="text-xs text-muted-foreground italic">
          Membership covers visits, supplies, and lab draws. Medication & lab fees billed separately at cost.
        </p>
      </CardContent>
    </Card>
  );
};

export default CareMembershipCard;
