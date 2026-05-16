import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface VitalsRow {
  recorded_at: string;
  weight_lbs: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  bmi: number | null;
}

interface VitalsTrendProps {
  patientId: string;
}

export function VitalsTrend({ patientId }: VitalsTrendProps) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<VitalsRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const { data: encs, error: e0 } = await supabase
          .from("patient_encounters")
          .select("id")
          .eq("patient_id", patientId)
          .eq("status", "signed");
        if (e0) throw e0;
        const ids = (encs ?? []).map((e: { id: string }) => e.id);
        if (ids.length === 0) {
          if (!cancelled) setRows([]);
          return;
        }
        const { data, error } = await supabase
          .from("encounter_vitals")
          .select("recorded_at, weight_lbs, systolic_bp, diastolic_bp, bmi")
          .in("encounter_id", ids)
          .order("recorded_at", { ascending: true });
        if (error) throw error;
        if (!cancelled) setRows((data ?? []) as VitalsRow[]);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, patientId]);

  const chartData = rows.map((r) => ({
    t: format(new Date(r.recorded_at), "MMM d yy"),
    weight: r.weight_lbs != null ? Number(r.weight_lbs) : null,
    sys: r.systolic_bp,
    dia: r.diastolic_bp,
    bmi: r.bmi != null ? Number(r.bmi) : null,
  }));

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">Vitals trend</CardTitle>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
          {open ? "Hide" : "Show"} vitals trend
        </Button>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : chartData.length === 0 ? (
            <p className="text-xs text-muted-foreground">No signed encounter vitals yet.</p>
          ) : (
            <>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="weight" name="Weight (lb)" stroke="#B8956A" dot={false} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sys" name="Systolic" stroke="#2A2826" dot={false} connectNulls />
                    <Line type="monotone" dataKey="dia" name="Diastolic" stroke="#888" dot={false} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="bmi" name="BMI" stroke="#4a6fa5" dot={false} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
