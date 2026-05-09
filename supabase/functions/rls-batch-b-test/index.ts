// Ephemeral test harness for Batch B (R-5 + R-10) verification.
// Will be deleted immediately after the run.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SVC = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" };

async function call(path: string, opts: { token?: string; body?: unknown; headers?: Record<string,string>; method?: string } = {}) {
  const headers: Record<string,string> = { "Content-Type": "application/json", apikey: ANON, ...(opts.headers ?? {}) };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  const res = await fetch(`${URL}/functions/v1/${path}`, {
    method: opts.method ?? (opts.body ? "POST" : "GET"),
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text.slice(0, 500) };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const admin = createClient(URL, SVC);
  const results: Record<string, unknown> = {};
  const cleanup: Array<() => Promise<void>> = [];

  try {
    // ---- Provision test users ----
    const ts = Date.now();
    const mkUser = async (email: string, role?: string) => {
      const { data, error } = await admin.auth.admin.createUser({ email, password: "TestP@ss123!Strong", email_confirm: true });
      if (error || !data.user) throw new Error(`createUser ${email}: ${error?.message}`);
      const uid = data.user.id;
      cleanup.push(async () => { await admin.auth.admin.deleteUser(uid); });
      if (role) {
        await admin.from("user_roles").insert({ user_id: uid, role });
      }
      const sb = createClient(URL, ANON);
      const { data: sess, error: sErr } = await sb.auth.signInWithPassword({ email, password: "TestP@ss123!Strong" });
      if (sErr || !sess.session) throw new Error(`signIn ${email}: ${sErr?.message}`);
      return { uid, email, token: sess.session.access_token };
    };

    const patient = await mkUser(`rlsb-patient-${ts}@test.local`);
    const patient2 = await mkUser(`rlsb-patient2-${ts}@test.local`);
    const staff = await mkUser(`rlsb-staff-${ts}@test.local`, "staff");
    const adminU = await mkUser(`rlsb-admin-${ts}@test.local`, "admin");

    // Create patient rows
    const { data: pRow, error: pErr } = await admin.from("patients").insert({ user_id: patient.uid, full_name: "RLS Batch B Patient", email: patient.email, onboarding_status: "active" }).select("id").single();
    if (pErr) throw new Error(`patient row: ${pErr.message}`);
    cleanup.push(async () => { await admin.from("patients").delete().eq("id", pRow.id); });
    const { data: p2Row } = await admin.from("patients").insert({ user_id: patient2.uid, full_name: "RLS Batch B Patient2", email: patient2.email, onboarding_status: "active" }).select("id").single();
    cleanup.push(async () => { await admin.from("patients").delete().eq("id", p2Row!.id); });

    // Create symptom_logs for patient and patient2
    const { data: sLog, error: sErr } = await admin.from("symptom_logs").insert({ patient_id: pRow.id, raw_answers: { symptoms: { hot_flashes: 2, low_libido: 1 } }, date_logged: new Date().toISOString().slice(0,10) }).select("id").single();
    if (sErr) throw new Error(`symptom_log: ${sErr.message}`);
    cleanup.push(async () => { await admin.from("symptom_logs").delete().eq("id", sLog.id); });
    const { data: s2Log } = await admin.from("symptom_logs").insert({ patient_id: p2Row!.id, raw_answers: { symptoms: {} }, date_logged: new Date().toISOString().slice(0,10) }).select("id").single();
    cleanup.push(async () => { await admin.from("symptom_logs").delete().eq("id", s2Log!.id); });

    // Insert a self-view consultation booking for patient (Test 7)
    const { data: cb } = await admin.from("consultation_bookings").insert({ customer_email: patient.email, customer_name: "RLS Batch B", customer_phone: "5555550000", service_type: "hormone" }).select("id").single();
    if (cb) cleanup.push(async () => { await admin.from("consultation_bookings").delete().eq("id", cb.id); });

    // ============= TEST 1: send-rx-fax =============
    results.test1_anon = await call("send-rx-fax", { body: { order_id: "00000000-0000-0000-0000-000000000000" } });
    results.test1_patient = await call("send-rx-fax", { token: patient.token, body: { order_id: "00000000-0000-0000-0000-000000000000" } });
    results.test1_staff = await call("send-rx-fax", { token: staff.token, body: { order_id: "00000000-0000-0000-0000-000000000000" } });

    // ============= TEST 2: generate-consent-pdf =============
    results.test2_anon = await call("generate-consent-pdf", { body: { patientId: pRow.id } });
    results.test2_patient_own = await call("generate-consent-pdf", { token: patient.token, body: { patientId: pRow.id } });
    results.test2_patient_other = await call("generate-consent-pdf", { token: patient.token, body: { patientId: p2Row!.id } });
    results.test2_staff_any = await call("generate-consent-pdf", { token: staff.token, body: { patientId: pRow.id } });

    // ============= TEST 3: cron secret =============
    results.test3_no_secret = await call("send-intake-reminder", { body: {} });
    results.test3_with_secret = await call("send-intake-reminder", { body: {}, headers: CRON_SECRET ? { "X-Cron-Secret": CRON_SECRET } : {} });
    results.test3_secret_present_in_env = !!CRON_SECRET;

    // ============= TEST 4: request-hormone-review =============
    results.test4_anon = await call("request-hormone-review", { body: { symptom_log_id: sLog.id } });
    results.test4_patient_own = await call("request-hormone-review", { token: patient.token, body: { symptom_log_id: sLog.id } });
    results.test4_patient_other = await call("request-hormone-review", { token: patient.token, body: { symptom_log_id: s2Log!.id } });
    results.test4_malformed = await call("request-hormone-review", { token: patient.token, body: { symptom_log_id: "not-a-uuid" } });
    results.test4_extra_fields = await call("request-hormone-review", { token: patient.token, body: { symptom_log_id: sLog.id, evil: "payload" } });

    // Capture and clean any orders created by Test 4
    const { data: createdOrders } = await admin.from("orders").select("id").eq("patient_id", pRow.id);
    if (createdOrders) for (const o of createdOrders) {
      cleanup.push(async () => { await admin.from("orders").delete().eq("id", o.id); });
    }
    results.test4_orders_created_count = createdOrders?.length ?? 0;

    // ============= TEST 5: patient direct INSERT into orders =============
    const sbPatient = createClient(URL, ANON, { global: { headers: { Authorization: `Bearer ${patient.token}` } } });
    const { error: insErr } = await sbPatient.from("orders").insert({ patient_id: pRow.id, status: "pending_review", protocol_snapshot: { evil: true } });
    results.test5_direct_insert = { error_code: (insErr as any)?.code, error_message: insErr?.message ?? null, blocked: !!insErr };

    // ============= TEST 6: patient SELECT own orders =============
    const { data: ownOrders, error: selErr } = await sbPatient.from("orders").select("id, patient_id").eq("patient_id", pRow.id);
    results.test6_select_own = { count: ownOrders?.length ?? 0, error: selErr?.message ?? null };

    // ============= TEST 7: regression — patient consultation_bookings self-view =============
    const { data: ownCb, error: cbErr } = await sbPatient.from("consultation_bookings").select("id").eq("customer_email", patient.email);
    results.test7_self_view_bookings = { count: ownCb?.length ?? 0, error: cbErr?.message ?? null };

    return new Response(JSON.stringify({ ok: true, results }, null, 2), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e), partial: results }, null, 2), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  } finally {
    for (const fn of cleanup.reverse()) { try { await fn(); } catch (_) {} }
  }
});
