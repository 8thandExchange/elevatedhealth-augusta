import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LAB_ORDER_STATUS_LABELS,
  LAB_PANEL_REQUISITION_KEY,
  labPanelNonMemberCents,
  labCheckoutTierForSlug,
} from "@/lib/labPanelMapping";
import { labMemberCents } from "@/lib/pricing";
import { markLabsReviewedForPatient } from "@/lib/labsWorkflow";
import type { LabTestRow } from "@/lib/labCatalogTypes";
import {
  buildPanelEconomicsForOrder,
  economicsSummaryLines,
  panelBillingContext,
} from "@/lib/labOrderEconomics";
import { formatCentsUsd } from "@/lib/labCatalogEconomics";
import { LABCORP_FLOW_HINT } from "@/lib/labcorpPortal";
import LabCorpPortalLink from "@/components/provider/LabCorpPortalLink";
import LabPanelPaymentLinkActions from "@/components/provider/LabPanelPaymentLinkActions";
import { sendLabPanelPaymentLink } from "@/lib/sendLabPanelPaymentLink";
import { Loader2, Mail, FlaskConical, AlertTriangle, CreditCard } from "lucide-react";
import { toast } from "sonner";

type LabPanel = Tables<"lab_panels"> & {
  included_in_program?: boolean;
  initial_paid_at_intake?: boolean;
  validity_days?: number;
};
type LabOrder = Tables<"lab_orders">;

type PatientLabContext = {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  isMember?: boolean;
  dob?: string | null;
  gender?: string | null;
  lab_path?: string | null;
  onboarding_status?: string | null;
};

interface LabOrderWorkflowProps {
  patient: PatientLabContext;
  providerName?: string;
  providerCredentials?: string;
  /** CDS / pathway suggested panel — pre-selects when staff has not chosen yet */
  recommendedPanelSlug?: string | null;
  onOrderUpdated?: () => void;
}

export default function LabOrderWorkflow({
  patient,
  providerName = "Elevated Health Provider",
  providerCredentials = "MD",
  recommendedPanelSlug,
  onOrderUpdated,
}: LabOrderWorkflowProps) {
  const [panels, setPanels] = useState<LabPanel[]>([]);
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [panelTests, setPanelTests] = useState<LabTestRow[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [loading, setLoading] = useState(true);
  const [panelSlug, setPanelSlug] = useState("");
  const [reason, setReason] = useState("");
  const [creating, setCreating] = useState(false);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: panelRows }, { data: orderRows }] = await Promise.all([
      supabase.from("lab_panels").select("*").eq("is_active", true).order("display_order"),
      supabase.from("lab_orders").select("*").eq("patient_id", patient.id).order("ordered_at", { ascending: false }),
    ]);
    const panelList = (panelRows ?? []) as LabPanel[];
    setPanels(panelList);
    setOrders((orderRows ?? []) as LabOrder[]);
    if (
      recommendedPanelSlug &&
      panelList.some((p) => p.slug === recommendedPanelSlug)
    ) {
      setPanelSlug((prev) => prev || recommendedPanelSlug);
    }
    setLoading(false);
  }, [patient.id, recommendedPanelSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedPanel = panels.find((p) => p.slug === panelSlug);

  const loadPanelTests = useCallback(async (panel: LabPanel | undefined) => {
    if (!panel) {
      setPanelTests([]);
      return;
    }
    setLoadingTests(true);
    try {
      const { data: joins, error: joinErr } = await supabase
        .from("panel_tests")
        .select("test_id")
        .eq("panel_id", panel.id);
      if (joinErr) throw joinErr;
      const testIds = (joins ?? []).map((j) => j.test_id);
      if (testIds.length === 0) {
        setPanelTests([]);
        return;
      }
      const { data: tests, error: testErr } = await supabase
        .from("lab_tests")
        .select("id, code, name, eha_cost_cents, non_member_price_cents")
        .in("id", testIds);
      if (testErr) throw testErr;
      setPanelTests((tests ?? []) as LabTestRow[]);
    } catch (e) {
      console.warn("panel test economics load:", e);
      setPanelTests([]);
    } finally {
      setLoadingTests(false);
    }
  }, []);

  useEffect(() => {
    void loadPanelTests(selectedPanel);
  }, [selectedPanel, loadPanelTests]);

  const panelEconomics = useMemo(() => {
    if (!selectedPanel || panelTests.length === 0) return null;
    return buildPanelEconomicsForOrder(
      selectedPanel.slug,
      selectedPanel.name,
      panelTests.map((t) => ({
        id: t.id,
        code: t.code,
        name: t.name,
        eha_cost_cents: t.eha_cost_cents ?? null,
        non_member_price_cents: t.non_member_price_cents,
      })),
    );
  }, [selectedPanel, panelTests]);

  const billingContext = selectedPanel
    ? panelBillingContext({
        included_in_program: selectedPanel.included_in_program ?? true,
        initial_paid_at_intake: selectedPanel.initial_paid_at_intake ?? true,
        validity_days: selectedPanel.validity_days ?? 90,
      })
    : null;
  const requisitionKey: string | null =
    selectedPanel?.labcorp_requisition_key ??
    LAB_PANEL_REQUISITION_KEY[panelSlug] ??
    null;

  const createOrder = async () => {
    if (!panelSlug) {
      toast.error("Select a lab panel");
      return;
    }
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("lab_orders").insert({
      patient_id: patient.id,
      panel_slug: panelSlug,
      requisition_key: requisitionKey,
      clinical_reason: reason.trim() || null,
      status: "ordered",
      ordered_by: user?.id ?? null,
    });
    setCreating(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Lab order recorded");
    setPanelSlug("");
    setReason("");
    void load();
    onOrderUpdated?.();
  };

  const collectPaymentForOrder = async (order: LabOrder, panelName: string) => {
    const method = patient.phone ? "sms" : "email";
    setPayingOrderId(order.id);
    try {
      const result = await sendLabPanelPaymentLink({
        panelSlug: order.panel_slug,
        panelName,
        patientId: patient.id,
        patientName: patient.full_name,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        isMember: patient.isMember,
        method,
      });
      if (result.smsManualFallback) {
        toast.warning(result.deliveryNote ?? "Payment link copied — paste into Messages for the patient.");
      } else {
        toast.success(
          method === "sms" ? "Payment link texted to patient" : "Payment link emailed to patient",
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send payment link");
    } finally {
      setPayingOrderId(null);
    }
  };

  const emailRequisition = async (order: LabOrder) => {
    const key = order.requisition_key as keyof typeof LAB_PANEL_REQUISITION_KEY | string | null;
    if (!key || !["mens_safety", "thyroid", "safety_cmp"].includes(key)) {
      toast.error("This panel needs a PDF requisition upload — no auto-email template yet.");
      return;
    }
    setEmailingId(order.id);
    try {
      const { error } = await supabase.functions.invoke("send-labcorp-requisition", {
        body: {
          patientName: patient.full_name,
          patientDob: patient.dob,
          gender: patient.gender || "unknown",
          panelType: key,
          reason: order.clinical_reason || "Medical necessity",
          providerName,
          providerCredentials,
        },
      });
      if (error) throw error;
      await supabase
        .from("lab_orders")
        .update({ status: "requisition_sent" })
        .eq("id", order.id);
      await supabase
        .from("patients")
        .update({ onboarding_status: "awaiting_blood_work" })
        .eq("id", patient.id);
      toast.success("Requisition emailed to office");
      void load();
      onOrderUpdated?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send requisition");
    } finally {
      setEmailingId(null);
    }
  };

  const advanceStatus = async (order: LabOrder, status: LabOrder["status"]) => {
    const { error } = await supabase.from("lab_orders").update({ status }).eq("id", order.id);
    if (error) toast.error(error.message);
    else {
      if (status === "results_pending") {
        await supabase.from("patients").update({ onboarding_status: "labs_in_progress" }).eq("id", patient.id);
      }
      if (status === "results_received") {
        await supabase.from("patients").update({ onboarding_status: "results_ready" }).eq("id", patient.id);
      }
      if (status === "reviewed") {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase
          .from("lab_orders")
          .update({ reviewed_at: new Date().toISOString(), reviewed_by: user?.id ?? null })
          .eq("id", order.id);
        await markLabsReviewedForPatient(patient.id);
      }
      void load();
      onOrderUpdated?.();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          <h3 className="font-playfair text-lg">Lab orders (LabCorp)</h3>
          {patient.lab_path === "labcorp" && (
            <Badge variant="destructive" className="text-xs">LabCorp path</Badge>
          )}
        </div>
        <LabCorpPortalLink className="self-start" />
      </div>
      <p className="text-xs text-muted-foreground">{LABCORP_FLOW_HINT}</p>
      <p className="text-xs text-muted-foreground">
        Order from the catalog, email requisition when a template exists, then advance status through draw → results → review.
        Panels without a template: use PDF upload in the patient chart or LabCorp Link.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Panel</Label>
          <Select value={panelSlug} onValueChange={setPanelSlug}>
            <SelectTrigger>
              <SelectValue placeholder="Select lab panel" />
            </SelectTrigger>
            <SelectContent>
              {panels.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.name} — ${(labPanelNonMemberCents(p.slug) / 100).toFixed(0)} ({labCheckoutTierForSlug(p.slug)}) / ${(labMemberCents(labPanelNonMemberCents(p.slug)) / 100).toFixed(0)} member
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Clinical reason</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Why this panel was ordered" />
        </div>
      </div>
      {selectedPanel && (
        <p className="text-xs text-muted-foreground">{selectedPanel.description}</p>
      )}

      {selectedPanel && billingContext && (
        <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2 text-xs font-jost">
          <p className="font-medium text-foreground">Billing context (staff)</p>
          <ul className="text-muted-foreground space-y-1 list-disc list-inside">
            <li>{billingContext.intakeLabel}</li>
            <li>{billingContext.programLabel}</li>
            <li>{billingContext.validityLabel}</li>
          </ul>
        </div>
      )}

      {selectedPanel && panelEconomics && (
        <div className="rounded-md border border-border p-3 space-y-2 text-xs font-jost">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-foreground">Panel economics (internal)</p>
            <Link to="/lab-catalog" className="text-accent underline text-[11px]">
              Lab catalog
            </Link>
          </div>
          {loadingTests ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <ul className="text-muted-foreground space-y-1">
              {economicsSummaryLines(panelEconomics).map((line) => (
                <li key={line}>{line}</li>
              ))}
              <li className="text-[11px] pt-1">
                {panelTests.length} analytes · member charge{" "}
                {formatCentsUsd(labMemberCents(panelEconomics.patientChargeCents))}
              </li>
            </ul>
          )}
          {!panelEconomics.marginIsFinal && (
            <Alert className="py-2 border-amber-500/40 bg-amber-500/5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-xs ml-2">
                {panelEconomics.missingPriceCount} analyte(s) missing EHA cost — margin is not
                final. Update costs in{" "}
                <Link to="/lab-catalog" className="text-accent underline">
                  Lab catalog
                </Link>
                .
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {recommendedPanelSlug && panelSlug === recommendedPanelSlug && (
        <p className="text-xs text-accent">
          Pre-selected from clinical pathway / CDS recommendation ({recommendedPanelSlug}).
        </p>
      )}
      {requisitionKey ? (
        <p className="text-xs text-green-700 dark:text-green-400">Auto-email requisition available ({requisitionKey}).</p>
      ) : panelSlug ? (
        <p className="text-xs text-amber-700 dark:text-amber-400">No email template — upload PDF requisition after ordering.</p>
      ) : null}
      {selectedPanel && (
        <LabPanelPaymentLinkActions
          panelSlug={selectedPanel.slug}
          panelName={selectedPanel.name}
          patientId={patient.id}
          patientName={patient.full_name}
          patientEmail={patient.email}
          patientPhone={patient.phone}
          isMember={patient.isMember}
        />
      )}
      <Button size="sm" onClick={() => void createOrder()} disabled={creating}>
        {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
        Record lab order
      </Button>

      {orders.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Panel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ordered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => {
              const panelName = panels.find((p) => p.slug === o.panel_slug)?.name ?? o.panel_slug;
              return (
                <TableRow key={o.id}>
                  <TableCell className="text-sm">{panelName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{LAB_ORDER_STATUS_LABELS[o.status] ?? o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(o.ordered_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {!["reviewed", "cancelled"].includes(o.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={payingOrderId === o.id || !patient.email}
                        onClick={() => void collectPaymentForOrder(o, panelName)}
                      >
                        {payingOrderId === o.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <CreditCard className="h-3 w-3 mr-1" />
                        )}
                        Collect payment
                      </Button>
                    )}
                    {o.requisition_key && o.status === "ordered" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={emailingId === o.id}
                        onClick={() => void emailRequisition(o)}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Email req.
                      </Button>
                    )}
                    {o.status === "requisition_sent" && (
                      <Button variant="ghost" size="sm" onClick={() => void advanceStatus(o, "awaiting_draw")}>
                        At draw
                      </Button>
                    )}
                    {o.status === "awaiting_draw" && (
                      <Button variant="ghost" size="sm" onClick={() => void advanceStatus(o, "results_pending")}>
                        Drawn
                      </Button>
                    )}
                    {o.status === "results_pending" && (
                      <Button variant="ghost" size="sm" onClick={() => void advanceStatus(o, "results_received")}>
                        Results in
                      </Button>
                    )}
                    {o.status === "results_received" && (
                      <Button variant="ghost" size="sm" onClick={() => void advanceStatus(o, "reviewed")}>
                        Mark reviewed
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
