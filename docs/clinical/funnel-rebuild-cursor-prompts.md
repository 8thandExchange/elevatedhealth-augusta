# Cursor prompts: EHA funnel rebuild

Run these in order. Each starts with a read-only probe so the agent reconciles
with the real schema and code before writing anything. Drop the four new files
(migration, three edge functions, _shared helpers, and `src/config/onboardingCredit.ts`)
into the repo first, then run these prompts for the edits to existing code.

---

## Prompt 1: staff/admin RLS read policy (reconcile with existing role helper)

```
Read-only first: search the repo and the Supabase schema for the existing role
helper used in other RLS policies (likely a security definer function such as
has_role, current_user_has_role, is_admin, or a profiles/staff role lookup). Do
NOT write SQL until you have found the exact name and signature actually in use.
List what you found.

Then add a migration that grants SELECT on public.onboarding_credits,
public.patient_journey, and public.patient_journey_events to admin, business_admin,
and provider roles using that existing helper. Match the style of the other RLS
policies already in the repo. Do not modify the patient-self policies already
present. Output the migration as a new timestamped .sql file. Remind me at the end
that this migration must be applied manually after publish.
```

---

## Prompt 2: baseline-labs checkout metadata

```
Read-only first: find where the baseline labs / onboarding charge is created as a
Stripe Checkout Session or PaymentIntent. Show me the file and the current
session/intent creation call. If baseline labs are not yet a distinct charge,
say so and show me the closest existing consult or product checkout instead.

Then modify that charge creation so the PaymentIntent carries:
  metadata.eha_purpose = "baseline_labs_onboarding"
  metadata.eha_patient_user_id = <the authenticated patient's auth.users id>
If it is a Checkout Session, set payment_intent_data.metadata with the same keys
so the metadata lands on the PaymentIntent. Do not change amounts or anything
else. Show me the diff.
```

---

## Prompt 3: wire issuance into the existing Stripe webhook

```
Read-only first: find the existing Stripe webhook edge function in
supabase/functions. Show me how it verifies the signature and how it switches on
event types. Confirm whether payment_intent.succeeded is already handled.

Then, in that webhook, on payment_intent.succeeded, if
metadata.eha_purpose === "baseline_labs_onboarding", invoke the new
issue-onboarding-credit function (server-to-server, service role) with
{ paymentIntentId: event.data.object.id }. Keep it idempotent and do not block or
throw on the existing handling for other event types. Show me the diff. Remind me
that issue-onboarding-credit is a NEW function and must be deployed manually with
`supabase functions deploy issue-onboarding-credit --no-verify-jwt`, and that the
webhook function itself must be redeployed.
```

---

## Prompt 4: reposition the pre-prescription consent gates

```
Read-only first: find the pre-prescription consent gate logic (the consent system
is already live: ten consent docs, magic-link delivery, pre-prescription gates,
provider dashboard). Show me exactly where the gates currently fire relative to
membership enrollment. Identify the component/route that triggers them.

Then reposition the gates so that for a recommended protocol they fire after the
results-review step and before membership enrollment, keyed to the specific
protocol recommended (hormone therapy, GLP-1, off-label, peptides as applicable).
On successful consent, call advance_journey(patient, 'consent_completed'). Do not
duplicate consent records or change the consent documents themselves. Gate the
enrollment route behind canEnroll() from src/config/onboardingCredit.ts. Show me
the diff and list every place the old post-enrollment gate trigger was removed.
```

---

## Prompt 5: enrollment flow applies the credit

```
Read-only first: find the membership enrollment code that creates the Stripe
subscription. Show me the subscription creation call and how the chosen plan's
first-month price is known at that point.

Then, immediately before creating the subscription:
  1. Call redeem-onboarding-credit with
     { patientUserId, firstMonthPriceCents: <chosen plan first month price in cents> }.
  2. If it returns redeemable:true, pass the returned couponId into the
     subscription creation (Stripe `coupon` or `discounts[0].coupon`).
  3. Create the subscription. If creation fails, call void-onboarding-credit
     rollback (RPC void_credit_redemption + delete coupon) so the credit returns
     to issued.
  4. On success, call advance_journey(patient, 'membership_enrolled'), then
     'active' once the first invoice is paid.
Surface the applied credit in the UI before the patient confirms, using
formatCreditCents from src/config/onboardingCredit.ts, so they see the labs being
credited against month one. Show me the diff. Remind me redeem-onboarding-credit
is a NEW function needing manual deploy.
```

---

## Prompt 6: reorder the booking funnel UI

```
Read-only first: find the current booking flow that goes consult -> pick
membership -> pay. Show me the step components and the router for that flow.

Then reorder it to: consult -> baseline labs (onboarding charge) -> results
review (provider-gated) -> consent -> enroll. Drive step visibility off the
patient_journey stage (read via get_redeemable_credit's sibling: select stage from
patient_journey for the current patient) and JOURNEY_ORDER from
src/config/onboardingCredit.ts. The enroll step must show the pending onboarding
credit and the net first-month total. Patients in not_a_candidate get a clear
off-ramp, not the enroll step. Keep the existing navy palette (#00477E / #A4A4A1 /
white). Show me the diff and a short list of any old steps you removed or merged.
```

---

## After all prompts

```
Run a typecheck and report the raw output (do not summarize):
  npx tsc --noEmit

Then list, as a checklist, every manual step still required:
  - apply the new migration(s) manually after publish
  - deploy each NEW edge function manually:
      supabase functions deploy issue-onboarding-credit --no-verify-jwt
      supabase functions deploy redeem-onboarding-credit --no-verify-jwt
      supabase functions deploy expire-onboarding-credits --no-verify-jwt
  - redeploy the modified Stripe webhook function
  - set edge env: ONBOARDING_CREDIT_WINDOW_DAYS, ONBOARDING_CREDIT_CAP_MODE
  - confirm all functions show in the Supabase dashboard /functions before testing
  - exercise the whole flow in Stripe TEST mode before live
```
