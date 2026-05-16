import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { SUBSTANCE_ADDITION_TEMPLATES } from "@/data/consents/substance-addition-templates";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 25;

interface AckSummaryRow {
  substance_id: string;
  count: number;
  earliest: string | null;
  latest: string | null;
}

interface AckDetailRow {
  id: string;
  acknowledged_at: string;
  signed_typed_name: string;
  patient_id: string;
  patients: { full_name: string | null } | { full_name: string | null }[] | null;
}

export default function SubstanceAcknowledgmentsAdmin() {
  const navigate = useNavigate();
  const [accessChecked, setAccessChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<AckSummaryRow[]>([]);
  const [selectedSubstance, setSelectedSubstance] = useState<string | null>(null);
  const [detailRows, setDetailRows] = useState<AckDetailRow[]>([]);
  const [detailTotal, setDetailTotal] = useState(0);
  const [detailPage, setDetailPage] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);

  const templateIds = useMemo(() => SUBSTANCE_ADDITION_TEMPLATES.map((t) => t.substance_id), []);

  const refreshSummaries = useCallback(async () => {
    if (templateIds.length === 0) {
      setSummaries([]);
      return;
    }

    const { data, error } = await supabase
      .from("substance_addition_acknowledgments")
      .select("substance_id, acknowledged_at")
      .in("substance_id", templateIds);

    if (error) throw error;

    const bySub = new Map<string, { times: number[] }>();
    for (const id of templateIds) bySub.set(id, { times: [] });

    for (const row of data ?? []) {
      const sid = (row as { substance_id: string }).substance_id;
      const ts = new Date((row as { acknowledged_at: string }).acknowledged_at).getTime();
      if (!bySub.has(sid)) bySub.set(sid, { times: [] });
      bySub.get(sid)!.times.push(ts);
    }

    const next: AckSummaryRow[] = templateIds.map((substance_id) => {
      const times = bySub.get(substance_id)?.times ?? [];
      times.sort((a, b) => a - b);
      return {
        substance_id,
        count: times.length,
        earliest: times.length ? new Date(times[0]!).toISOString() : null,
        latest: times.length ? new Date(times[times.length - 1]!).toISOString() : null,
      };
    });

    setSummaries(next);
  }, [templateIds]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          navigate("/admin/login");
          return;
        }
        const { data: isBiz, error } = await supabase.rpc("has_business_admin_role", {
          _user_id: user.id,
        });
        if (error) throw error;
        if (!cancelled) {
          setAllowed(!!isBiz);
          setAccessChecked(true);
          if (!isBiz) {
            toast.error("Business admin access required.");
            navigate("/provider/dashboard");
            return;
          }
          await refreshSummaries();
        }
      } catch (e) {
        console.error(e);
        toast.error("Could not verify admin access.");
        navigate("/provider/dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, refreshSummaries]);

  useEffect(() => {
    if (!selectedSubstance) {
      setDetailRows([]);
      setDetailTotal(0);
      return;
    }

    let cancelled = false;
    void (async () => {
      setDetailLoading(true);
      try {
        const from = detailPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { count, error: countErr } = await supabase
          .from("substance_addition_acknowledgments")
          .select("id", { count: "exact", head: true })
          .eq("substance_id", selectedSubstance);

        if (countErr) throw countErr;

        const { data: rows, error } = await supabase
          .from("substance_addition_acknowledgments")
          .select("id, acknowledged_at, signed_typed_name, patient_id, patients(full_name)")
          .eq("substance_id", selectedSubstance)
          .order("acknowledged_at", { ascending: false })
          .range(from, to);

        if (error) throw error;
        if (!cancelled) {
          setDetailTotal(count ?? 0);
          setDetailRows((rows ?? []) as AckDetailRow[]);
        }
      } catch (e) {
        console.error(e);
        toast.error("Could not load acknowledgment detail.");
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedSubstance, detailPage]);

  useEffect(() => {
    setDetailPage(0);
  }, [selectedSubstance]);

  useEffect(() => {
    if (!selectedSubstance && templateIds.length > 0) {
      setSelectedSubstance(templateIds[0]!);
    }
  }, [templateIds, selectedSubstance]);

  const displayName = (substanceId: string) =>
    SUBSTANCE_ADDITION_TEMPLATES.find((t) => t.substance_id === substanceId)?.display_name ?? substanceId;

  if (!accessChecked || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        Loading…
      </div>
    );
  }

  if (!allowed) return null;

  const totalPages = Math.max(1, Math.ceil(detailTotal / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar title="Substance acknowledgments" subtitle="Audit · Business admin" />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link to="/admin/consent-versions" className="gap-2 flex items-center">
              <ArrowLeft className="h-4 w-4" />
              Consent versions
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-playfair text-xl">Registry overview</CardTitle>
            <CardDescription>
              Substances with code-defined acknowledgment templates. Counts reflect rows in{" "}
              <code className="text-xs">substance_addition_acknowledgments</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {templateIds.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No templates in <code className="text-xs">substance-addition-templates.ts</code> yet (expected for PR 6
                baseline).
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Substance</TableHead>
                    <TableHead className="text-right">Acknowledgments</TableHead>
                    <TableHead>Date range</TableHead>
                    <TableHead className="text-right">Open</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaries.map((s) => (
                    <TableRow key={s.substance_id}>
                      <TableCell className="font-medium">{displayName(s.substance_id)}</TableCell>
                      <TableCell className="text-right tabular-nums">{s.count}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {s.earliest && s.latest
                          ? `${format(new Date(s.earliest), "MMM d, yyyy")} – ${format(new Date(s.latest), "MMM d, yyyy")}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button type="button" variant="outline" size="sm" onClick={() => setSelectedSubstance(s.substance_id)}>
                          View patients
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {selectedSubstance && templateIds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-playfair text-lg">{displayName(selectedSubstance)}</CardTitle>
              <CardDescription>Signed acknowledgments (most recent first).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {detailLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Signed as</TableHead>
                      <TableHead>Acknowledged</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailRows.map((r) => {
                      const pj = Array.isArray(r.patients) ? r.patients[0] : r.patients;
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{pj?.full_name ?? r.patient_id}</TableCell>
                          <TableCell className="text-sm">{r.signed_typed_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(r.acknowledged_at), "MMM d, yyyy HH:mm")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  Page {detailPage + 1} of {totalPages} ({detailTotal} total)
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={detailPage <= 0 || detailLoading}
                    onClick={() => setDetailPage((p) => Math.max(0, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={detailPage >= totalPages - 1 || detailLoading}
                    onClick={() => setDetailPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
