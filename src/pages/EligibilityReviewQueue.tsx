/**
 * /admin/eligibility-reviews
 *
 * Clinical review queue of patients flagged by SafetyGate during intake.
 * Each row corresponds to an eligibility_review_requests record.
 *
 * One-click resolutions:
 *   - Mark Contacted   → status='contacted', stamps reviewed_by + reviewed_at
 *   - Schedule Consult → opens StaffBookingModal seeded with patient context
 *                        (when patient_id is known); on success links the
 *                        resulting consultation_bookings row back to the
 *                        review and flips status='scheduled'.
 *   - Decline / Refer  → status='declined' or 'referred_out' + freeform note
 *
 * Staff + admin can read & update; patient role cannot.
 */
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2,
  Phone,
  Mail,
  ShieldAlert,
  CalendarPlus,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import StaffBookingModal from "@/components/booking/StaffBookingModal";

type Status = "pending" | "contacted" | "scheduled" | "declined" | "referred_out";
type Window = "morning" | "afternoon" | "evening" | "no_preference";

interface ReviewRow {
  id: string;
  patient_id: string | null;
  patient_name: string;
  patient_email: string | null;
  preferred_phone: string;
  preferred_callback_window: Window;
  flag_reasons: string[] | unknown;
  treatment_type: string | null;
  status: Status;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  notes: string | null;
  resolved_booking_id: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_LABEL: Record<Status, string> = {
  pending: "Pending",
  contacted: "Contacted",
  scheduled: "Scheduled",
  declined: "Declined",
  referred_out: "Referred out",
};

const STATUS_VARIANT: Record<Status, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "destructive",
  contacted: "secondary",
  scheduled: "default",
  declined: "outline",
  referred_out: "outline",
};

const WINDOW_LABEL: Record<Window, string> = {
  morning: "Mornings",
  afternoon: "Afternoons",
  evening: "Evenings",
  no_preference: "Anytime",
};

const flagsArray = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const EligibilityReviewQueue = () => {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Status | "all">("pending");
  const [bookingModalRow, setBookingModalRow] = useState<ReviewRow | null>(null);
  const [bookingModalPatient, setBookingModalPatient] = useState<{
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    primary_program: string | null;
  } | null>(null);
  const [closeoutRow, setCloseoutRow] = useState<{ row: ReviewRow; outcome: "declined" | "referred_out" } | null>(null);
  const [closeoutNote, setCloseoutNote] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("eligibility_review_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Couldn't load eligibility queue.");
      console.error(error);
      setRows([]);
    } else {
      setRows((data || []) as unknown as ReviewRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (cancelled) return;
      setIsAdmin((roles || []).some((r) => r.role === "admin"));
    })();
    refresh();
    return () => { cancelled = true; };
  }, []);

  const counts = useMemo(() => {
    const c: Record<Status | "all", number> = {
      all: rows.length,
      pending: 0,
      contacted: 0,
      scheduled: 0,
      declined: 0,
      referred_out: 0,
    };
    for (const r of rows) c[r.status]++;
    return c;
  }, [rows]);

  const filtered = useMemo(
    () => (activeTab === "all" ? rows : rows.filter((r) => r.status === activeTab)),
    [rows, activeTab],
  );

  const stampReviewer = async (id: string, patch: Partial<ReviewRow>) => {
    setSavingId(id);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const update = {
      ...patch,
      reviewed_by_user_id: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    } as Record<string, unknown>;
    const { error } = await supabase
      .from("eligibility_review_requests")
      .update(update)
      .eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error("Update failed.");
      console.error(error);
      return;
    }
    refresh();
  };

  const handleMarkContacted = (row: ReviewRow) =>
    stampReviewer(row.id, { status: "contacted" });

  const handleCloseout = async () => {
    if (!closeoutRow) return;
    await stampReviewer(closeoutRow.row.id, {
      status: closeoutRow.outcome,
      notes: closeoutNote || null,
    });
    setCloseoutRow(null);
    setCloseoutNote("");
  };

  const handleBookingComplete = async (reviewId: string, bookingId?: string | null) => {
    await stampReviewer(reviewId, {
      status: "scheduled",
      ...(bookingId ? { resolved_booking_id: bookingId } : {}),
    });
  };

  const openBookingModal = async (row: ReviewRow) => {
    setBookingModalRow(row);
    if (row.patient_id) {
      const { data } = await supabase
        .from("patients")
        .select("id, full_name, email, phone, primary_program")
        .eq("id", row.patient_id)
        .maybeSingle();
      if (data) setBookingModalPatient(data);
      else setBookingModalPatient(null);
    } else {
      setBookingModalPatient(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Eligibility Review Queue | Elevated Health Augusta</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
        <div className="flex items-start gap-3 mb-6">
          <ShieldAlert className="w-6 h-6 text-amber-700 flex-shrink-0 mt-1" />
          <div>
            <h1 className="font-playfair text-2xl text-foreground">Eligibility Reviews</h1>
            <p className="font-jost text-sm text-muted-foreground mt-1">
              Patients whose intake tripped the safety gate. Target turnaround: 1 business day.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Status | "all")}>
          <TabsList className="mb-4 flex-wrap">
            <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
            <TabsTrigger value="contacted">Contacted ({counts.contacted})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({counts.scheduled})</TabsTrigger>
            <TabsTrigger value="declined">Declined ({counts.declined})</TabsTrigger>
            <TabsTrigger value="referred_out">Referred ({counts.referred_out})</TabsTrigger>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3">
            {loading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto" />
                </CardContent>
              </Card>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground font-jost">
                  Nothing here. {activeTab === "pending" ? "No outstanding reviews." : ""}
                </CardContent>
              </Card>
            ) : (
              filtered.map((row) => {
                const flags = flagsArray(row.flag_reasons);
                const ageHuman = formatDistanceToNow(new Date(row.created_at), { addSuffix: true });
                const isResolved = row.status !== "pending" && row.status !== "contacted";
                return (
                  <Card key={row.id} className={row.status === "pending" ? "border-amber-300/60" : undefined}>
                    <CardContent className="p-5 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-jost font-medium text-foreground text-lg">
                              {row.patient_name}
                            </h3>
                            <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge>
                          </div>
                          <p className="font-jost text-xs text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Submitted {format(new Date(row.created_at), "MMM d, h:mm a")} · {ageHuman}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`tel:${row.preferred_phone.replace(/\D/g, "")}`}
                            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                          >
                            <Phone className="w-4 h-4" /> {row.preferred_phone}
                          </a>
                          {row.patient_email && (
                            <a
                              href={`mailto:${row.patient_email}`}
                              className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                            >
                              <Mail className="w-4 h-4" /> {row.patient_email}
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="font-jost text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            Treatment requested
                          </p>
                          <p className="font-jost text-foreground">{row.treatment_type || "—"}</p>
                        </div>
                        <div>
                          <p className="font-jost text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            Best time to call
                          </p>
                          <p className="font-jost text-foreground">{WINDOW_LABEL[row.preferred_callback_window]}</p>
                        </div>
                      </div>

                      <div>
                        <p className="font-jost text-xs uppercase tracking-wider text-muted-foreground mb-2">
                          Flags
                        </p>
                        {flags.length === 0 ? (
                          <p className="font-jost text-sm text-muted-foreground italic">
                            No specific flags recorded
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {flags.map((f) => (
                              <Badge key={f} variant="secondary" className="font-normal">
                                {f}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {row.notes && (
                        <div className="bg-muted/40 rounded-md p-3 border border-border">
                          <p className="font-jost text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            Notes
                          </p>
                          <p className="font-jost text-sm text-foreground whitespace-pre-line">{row.notes}</p>
                        </div>
                      )}

                      {row.resolved_booking_id && (
                        <p className="font-jost text-xs text-muted-foreground inline-flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Linked booking: {row.resolved_booking_id.slice(0, 8).toUpperCase()}
                        </p>
                      )}

                      {!isResolved && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                          {row.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkContacted(row)}
                              disabled={savingId === row.id}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark contacted
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => openBookingModal(row)}
                            disabled={savingId === row.id}
                          >
                            <CalendarPlus className="w-4 h-4 mr-2" />
                            Schedule consult
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCloseoutNote("");
                              setCloseoutRow({ row, outcome: "referred_out" });
                            }}
                            disabled={savingId === row.id}
                          >
                            Refer out
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCloseoutNote("");
                              setCloseoutRow({ row, outcome: "declined" });
                            }}
                            disabled={savingId === row.id}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      {bookingModalRow && (
        <StaffBookingModal
          open={!!bookingModalRow}
          onOpenChange={(open) => {
            if (!open) {
              setBookingModalRow(null);
              setBookingModalPatient(null);
              refresh();
            }
          }}
          isAdmin={isAdmin}
          initialPatient={bookingModalPatient}
          onBookingComplete={({ bookingId }) => {
            if (bookingModalRow) {
              handleBookingComplete(bookingModalRow.id, bookingId);
            }
          }}
        />
      )}

      <Dialog open={!!closeoutRow} onOpenChange={(open) => !open && setCloseoutRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {closeoutRow?.outcome === "declined" ? "Decline review" : "Refer out"}
            </DialogTitle>
            <DialogDescription>
              {closeoutRow?.outcome === "declined"
                ? "Mark this patient as not appropriate for our services. Add a brief note for the chart."
                : "Mark this patient as referred to another provider. Add a brief note for the chart."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={closeoutNote}
            onChange={(e) => setCloseoutNote(e.target.value)}
            placeholder={
              closeoutRow?.outcome === "declined"
                ? "e.g. Active pregnancy — declined HRT, advised to follow up post-partum."
                : "e.g. Referred to PCP for blood-pressure stabilization before pursuing TRT."
            }
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseoutRow(null)}>
              Cancel
            </Button>
            <Button onClick={handleCloseout}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EligibilityReviewQueue;
