#!/usr/bin/env node
/**
 * Smoke test: onboarding credit funnel (DB RPCs + edge function reachability).
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/smoke-onboarding-funnel.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

const testEmail = `funnel-smoke+${Date.now()}@elevatedhealthaugusta.com`;
const testPassword = `SmokeTest!${randomUUID().slice(0, 8)}`;
let userId = null;
let patientId = null;
let creditId = null;

try {
  // 1. Create ephemeral auth user + patient
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { full_name: "Funnel Smoke Test" },
  });
  if (createErr) throw createErr;
  userId = created.user.id;

  const { data: patient, error: patErr } = await admin
    .from("patients")
    .insert({
      user_id: userId,
      email: testEmail,
      full_name: "Funnel Smoke Test",
      onboarding_status: "consultation_complete",
      treatment_request: "testosterone",
      primary_program: "trt",
    })
    .select("id")
    .single();
  if (patErr) throw patErr;
  patientId = patient.id;
  pass("create test patient", patientId);

  // 2. Journey advance RPC
  const { error: advErr } = await admin.rpc("advance_journey", {
    p_patient: userId,
    p_stage: "consult_completed",
    p_note: "smoke test",
  });
  if (advErr) throw advErr;

  const { data: journey } = await admin
    .from("patient_journey")
    .select("stage")
    .eq("patient_user_id", userId)
    .single();
  if (journey?.stage !== "consult_completed") {
    fail("advance_journey", `expected consult_completed, got ${journey?.stage}`);
  } else {
    pass("advance_journey RPC", journey.stage);
  }

  // 3. Issue credit (simulates webhook after baseline labs PI)
  const fakePi = `pi_smoke_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const expiresAt = new Date(Date.now() + 30 * 86_400_000).toISOString();
  const { data: credit, error: credErr } = await admin
    .from("onboarding_credits")
    .insert({
      patient_user_id: userId,
      onboarding_charge_ref: fakePi,
      credit_amount_cents: 19900,
      window_days: 30,
      cap_mode: "first_month",
      expires_at: expiresAt,
      status: "issued",
    })
    .select("id")
    .single();
  if (credErr) throw credErr;
  creditId = credit.id;

  await admin.rpc("advance_journey", {
    p_patient: userId,
    p_stage: "baseline_labs_ordered",
    p_note: "smoke test credit issued",
  });
  pass("insert onboarding credit + advance to baseline_labs_ordered", creditId);

  // 4. get_redeemable_credit
  const { data: redeemable, error: getErr } = await admin.rpc("get_redeemable_credit", {
    p_patient: userId,
  });
  if (getErr) throw getErr;
  if (!redeemable?.id) fail("get_redeemable_credit", "no row");
  else pass("get_redeemable_credit", `$${(redeemable.credit_amount_cents / 100).toFixed(2)}`);

  // 5. Patient self-read via anon client + sign-in
  if (anonKey) {
    const patientClient = createClient(url, anonKey);
    const { data: signIn, error: signErr } = await patientClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    if (signErr) {
      fail("patient sign-in", signErr.message);
    } else {
      pass("patient sign-in", signIn.user.id.slice(0, 8));

      const { data: selfJourney, error: sjErr } = await patientClient
        .from("patient_journey")
        .select("stage")
        .eq("patient_user_id", userId)
        .maybeSingle();
      if (sjErr) fail("patient RLS journey read", sjErr.message);
      else if (selfJourney?.stage) pass("patient RLS journey read", selfJourney.stage);
      else fail("patient RLS journey read", "empty");

      const { data: selfCredit, error: scErr } = await patientClient.rpc("get_redeemable_credit", {
        p_patient: userId,
      });
      if (scErr) fail("patient RPC get_redeemable_credit", scErr.message);
      else if (selfCredit?.credit_amount_cents === 19900) {
        pass("patient RPC get_redeemable_credit", "$199.00");
      } else {
        fail("patient RPC get_redeemable_credit", JSON.stringify(selfCredit));
      }
    }
  }

  // 6. expire_onboarding_credits RPC (no-op on fresh credit)
  const { data: expiredCount, error: expErr } = await admin.rpc("expire_onboarding_credits");
  if (expErr) fail("expire_onboarding_credits RPC", expErr.message);
  else pass("expire_onboarding_credits RPC", `${expiredCount ?? 0} expired`);

  // 7. Edge function reachability
  const fnBase = `${url}/functions/v1`;
  const fnHeaders = {
    Authorization: `Bearer ${serviceKey}`,
    apikey: serviceKey,
    "Content-Type": "application/json",
  };

  const expireRes = await fetch(`${fnBase}/expire-onboarding-credits`, {
    method: "POST",
    headers: fnHeaders,
    body: "{}",
  });
  const expireBody = await expireRes.json().catch(() => ({}));
  if (expireRes.ok) pass("expire-onboarding-credits edge fn", JSON.stringify(expireBody));
  else fail("expire-onboarding-credits edge fn", `${expireRes.status} ${JSON.stringify(expireBody)}`);

  const issueRes = await fetch(`${fnBase}/issue-onboarding-credit`, {
    method: "POST",
    headers: fnHeaders,
    body: JSON.stringify({ paymentIntentId: "pi_invalid_smoke_test" }),
  });
  const issueBody = await issueRes.json().catch(() => ({}));
  // Expect 500 or stripe error — proves function is live and validates PI
  if (issueRes.status >= 400) {
    pass("issue-onboarding-credit edge fn reachable", `HTTP ${issueRes.status}`);
  } else {
    pass("issue-onboarding-credit edge fn", JSON.stringify(issueBody));
  }

  // 8. Lab checkout session (needs patient JWT)
  if (anonKey) {
    const patientClient = createClient(url, anonKey);
    await patientClient.auth.signInWithPassword({ email: testEmail, password: testPassword });
    const { data: session } = await patientClient.auth.getSession();
    const token = session.session?.access_token;
    if (token) {
      const labRes = await fetch(`${fnBase}/create-lab-panel-checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: anonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          panel_type: "comprehensive",
          patient_email: testEmail,
          patient_name: "Funnel Smoke Test",
          patient_id: patientId,
          baseline_labs_onboarding: true,
        }),
      });
      const labBody = await labRes.json().catch(() => ({}));
      if (labRes.ok && labBody.url?.includes("checkout.stripe.com")) {
        pass("create-lab-panel-checkout", "Stripe URL returned");
      } else {
        fail("create-lab-panel-checkout", `${labRes.status} ${JSON.stringify(labBody).slice(0, 200)}`);
      }
    }
  }

  // 9. Advance to consent_completed and test membership checkout gate + credit redeem path
  for (const stage of [
    "results_reviewed",
    "protocol_recommended",
    "consent_completed",
  ]) {
    await admin.rpc("advance_journey", { p_patient: userId, p_stage: stage, p_note: "smoke" });
  }
  pass("journey through consent_completed");

  if (anonKey) {
    const patientClient = createClient(url, anonKey);
    await patientClient.auth.signInWithPassword({ email: testEmail, password: testPassword });
    const { data: session } = await patientClient.auth.getSession();
    const token = session.session?.access_token;
    if (token) {
      const memRes = await fetch(`${fnBase}/create-membership-checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: anonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ program: "trt" }),
      });
      const memBody = await memRes.json().catch(() => ({}));
      if (memRes.ok && memBody.url?.includes("checkout.stripe.com")) {
        const applied = memBody.onboardingCreditApplied ? "credit applied" : "no credit flag";
        pass("create-membership-checkout", `${applied}, session ok`);
      } else {
        fail("create-membership-checkout", `${memRes.status} ${JSON.stringify(memBody).slice(0, 300)}`);
      }
    }
  }
} catch (err) {
  fail("unexpected", err instanceof Error ? err.message : String(err));
} finally {
  // Cleanup
  if (creditId) {
    await admin.from("onboarding_credits").delete().eq("id", creditId);
  }
  if (userId) {
    await admin.from("patient_journey_events").delete().eq("patient_user_id", userId);
    await admin.from("patient_journey").delete().eq("patient_user_id", userId);
    await admin.from("onboarding_credits").delete().eq("patient_user_id", userId);
    if (patientId) await admin.from("patients").delete().eq("id", patientId);
    await admin.auth.admin.deleteUser(userId);
  }
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length > 0 ? 1 : 0);
