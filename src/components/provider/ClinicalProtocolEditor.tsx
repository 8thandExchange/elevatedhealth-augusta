import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type ClinicalProtocol = Tables<"clinical_protocols">;
type ClinicalProtocolVersion = Tables<"clinical_protocol_versions">;

export default function ClinicalProtocolEditor() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [protocol, setProtocol] = useState<ClinicalProtocol | null>(null);
  const [version, setVersion] = useState<ClinicalProtocolVersion | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [structuredJson, setStructuredJson] = useState("");

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin/login");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const admin = roles?.some((r) => r.role === "admin") ?? false;
      setIsAdmin(admin);
      if (!admin) {
        toast.error("Only admins can edit clinical protocols");
        navigate(`/clinical-protocols/${slug}`);
        return;
      }

      const { data: p, error: pErr } = await supabase
        .from("clinical_protocols")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!p || !p.current_version_id) {
        setProtocol(null);
        setVersion(null);
        return;
      }
      setProtocol(p);

      const { data: v, error: vErr } = await supabase
        .from("clinical_protocol_versions")
        .select("*")
        .eq("id", p.current_version_id)
        .maybeSingle();
      if (vErr) throw vErr;
      if (!v) {
        setVersion(null);
        return;
      }
      setVersion(v as ClinicalProtocolVersion);
      setMarkdown(v.body_markdown ?? "");
      setStructuredJson(JSON.stringify(v.body_structured ?? {}, null, 2));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load editor");
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveDraft = async () => {
    if (!version) return;
    if (version.status === "signed") {
      toast.error("Signed versions are immutable.");
      return;
    }
    let parsed: Json = {};
    try {
      parsed = JSON.parse(structuredJson || "{}") as Json;
    } catch {
      toast.error("Structured JSON is invalid");
      return;
    }
    const { error } = await supabase
      .from("clinical_protocol_versions")
      .update({
        body_markdown: markdown,
        body_structured: parsed,
        status: "draft",
      })
      .eq("id", version.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Draft saved");
    void load();
  };

  const submitForSignature = async () => {
    if (!version) return;
    if (version.status === "signed") return;
    let parsed: Json = {};
    try {
      parsed = JSON.parse(structuredJson || "{}") as Json;
    } catch {
      toast.error("Structured JSON is invalid");
      return;
    }
    const { error } = await supabase
      .from("clinical_protocol_versions")
      .update({
        body_markdown: markdown,
        body_structured: parsed,
        status: "pending_signature",
      })
      .eq("id", version.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Submitted for signature");
    navigate(`/clinical-protocols/${slug}`);
  };

  const signNow = async () => {
    if (!version) return;
    const { error } = await supabase
      .rpc("sign_clinical_protocol_version", {
        version_id: version.id,
      })
      .maybeSingle();
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed");
    navigate(`/clinical-protocols/${slug}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin || !protocol || !version) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground font-jost mb-4">Unable to load editor.</p>
        <Button asChild variant="outline">
          <Link to="/clinical-protocols">Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6 font-jost">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
            <Link to={`/clinical-protocols/${slug}`}>← Back to protocol</Link>
          </Button>
          <h1 className="font-playfair text-2xl text-foreground">Edit {protocol.title}</h1>
          <p className="text-sm text-muted-foreground">
            Version {version.version_number} — {version.status}. Resolve reviewer checklist on the detail page before signing.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-playfair text-lg">Reviewer checklist</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Check off items on the detail screen. Signing via RPC still requires all reviewer notes resolved when using the detail
          page flow; the button below calls the same RPC for convenience after checklist is complete.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-playfair text-lg">Markdown body</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea rows={16} value={markdown} onChange={(e) => setMarkdown(e.target.value)} className="font-mono text-sm" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-playfair text-lg">Structured JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea rows={18} value={structuredJson} onChange={(e) => setStructuredJson(e.target.value)} className="font-mono text-sm" />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => void saveDraft()} disabled={version.status === "signed"}>
          Save as draft
        </Button>
        <Button onClick={() => void submitForSignature()} disabled={version.status === "signed"}>
          Submit for signature
        </Button>
        <Button variant="outline" onClick={() => void signNow()} disabled={version.status === "signed"}>
          Sign this version (RPC)
        </Button>
      </div>
    </div>
  );
}
