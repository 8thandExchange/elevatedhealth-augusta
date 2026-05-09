import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";

type ClinicalProtocol = Tables<"clinical_protocols">;
type ClinicalProtocolVersion = Tables<"clinical_protocol_versions">;

type Row = ClinicalProtocol & { version?: ClinicalProtocolVersion | null };

const CATEGORY_LABEL: Record<string, string> = {
  iv: "IV",
  hormone: "Hormone",
  peptide: "Peptide",
  weight_loss: "Weight loss",
  monitoring: "Monitoring",
};

export default function ClinicalProtocolLibrary() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState("");

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not signed in");
        setRows([]);
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const admin = roles?.some((r) => r.role === "admin") ?? false;
      setIsAdmin(admin);

      const { data: protocols, error: pErr } = await supabase
        .from("clinical_protocols")
        .select("*")
        .order("title", { ascending: true });
      if (pErr) throw pErr;

      const ids = (protocols ?? [])
        .map((p) => p.current_version_id)
        .filter((id): id is string => !!id);
      let versions: ClinicalProtocolVersion[] = [];
      if (ids.length) {
        const { data: vData, error: vErr } = await supabase
          .from("clinical_protocol_versions")
          .select("*")
          .in("id", ids);
        if (vErr) throw vErr;
        versions = (vData ?? []) as ClinicalProtocolVersion[];
      }
      const vById = new Map(versions.map((v) => [v.id, v]));

      const merged: Row[] = (protocols ?? []).map((p) => ({
        ...p,
        version: p.current_version_id ? vById.get(p.current_version_id) ?? null : null,
      }));

      setRows(merged);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load clinical protocols");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      const st = r.version?.status;
      if (!isAdmin && st !== "signed") return false;
      if (status !== "all" && st !== status) return false;
      if (serviceFilter.trim()) {
        const q = serviceFilter.trim().toLowerCase();
        if (!r.service_type?.some((s) => s.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [rows, category, status, serviceFilter, isAdmin]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Standing orders</p>
          <h1 className="font-playfair text-3xl text-foreground flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-accent" />
            Clinical protocols
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-jost">
            Physician-signed SOPs for Caroline and the care team. Drafts and pending reviews are visible to admins only.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/provider/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-playfair text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="iv">IV</SelectItem>
                <SelectItem value="hormone">Hormone</SelectItem>
                <SelectItem value="peptide">Peptide</SelectItem>
                <SelectItem value="weight_loss">Weight loss</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Version status</Label>
            <Select value={status} onValueChange={setStatus} disabled={!isAdmin}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_signature">Pending signature</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Service type contains</Label>
            <Input
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              placeholder="e.g. iv_lounge"
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm font-jost">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Services</th>
              <th className="p-3 font-medium">Ver.</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border/60 hover:bg-muted/30">
                <td className="p-3">
                  <Link
                    to={`/clinical-protocols/${r.slug}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {r.title}
                  </Link>
                </td>
                <td className="p-3">{CATEGORY_LABEL[r.category] ?? r.category}</td>
                <td className="p-3 text-muted-foreground">
                  {(r.service_type ?? []).join(", ") || "—"}
                </td>
                <td className="p-3">{r.version?.version_number ?? "—"}</td>
                <td className="p-3">
                  {r.version?.status ? (
                    <Badge variant={r.version.status === "signed" ? "default" : "secondary"}>
                      {r.version.status}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-3 text-muted-foreground">
                  {r.version?.updated_at
                    ? new Date(r.version.updated_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No protocols match these filters. If the database was just migrated, apply the seed migration in Supabase
                  and refresh.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
