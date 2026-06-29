# EHA Funnel Rebuild: Labs-First Sequence + Onboarding Credit

## What changed and why

Old order: consult, pick membership, pay (labs bundled into the monthly), treat.

That is backward for hormone optimization. The baseline panel is the basis for
the prescription, so the diagnostic draw has to come before the thing the
membership sells. Membership-then-labs-then-script also reads as pay-to-prescribe
under scrutiny. Decoupling qualification from treatment is the cleaner clinical
and compliance posture, and it lines up with the pre-prescription consent gates
already live in production.

New order:

1. Consult ($79 / $99, already priced)
2. Baseline labs, paid as one fixed onboarding charge, drawn by LabCorp
3. Results review with the provider, who recommends a protocol or says the
   patient is not a candidate
4. Consent gates fire here, on the specific recommended protocol, before any
   payment for treatment
5. Membership enrollment, made with the patient's actual numbers in hand. The
   onboarding charge is credited toward the first month, capped at first month,
   if they enroll inside the window
6. Treatment begins
7. Monitoring labs stay inside the membership as recurring value

The value prop survives intact. Baseline labs move to onboarding where they
clinically belong. Monitoring labs (8 to 12 weeks, then periodic) stay in the
membership and remain a legitimate reason to keep paying.

## The credit, precisely

The credit is not "refund the itemized lab line." It is "credit the fixed
onboarding charge toward membership." That structure sidesteps LabCorp client-bill
contract language about waiving or discounting the patient-billed lab amount, and
it is far easier to enforce and explain.

- The credit amount equals what the patient actually paid for the baseline
  bundle. It is read from Stripe at issuance, never hardcoded.
- It is capped at the first month's membership price (cap_mode = first_month). If
  the bundle retails above one month, the credit zeroes month one and the
  remainder is forfeited, not rolled forward. Cleanest to enforce and explain.
- It is only redeemable inside a window (default 30 days) from the baseline-labs
  payment.
- It is single-use and cannot be double-claimed.

### Money reality to confirm before going live

On a client-bill account EHA owes LabCorp wholesale regardless of what the
patient-facing price does. The moment the onboarding charge is credited toward
membership, the labs become a customer-acquisition cost: zero net lab revenue
plus the wholesale draw on every enroller. That is defensible, but the number has
to be seen first. It lives in the LabCorp pricing worksheet Kristen is building.

The credit amount and the worksheet are the same decision. The system reads the
credit from the actual charge, so the lever you are really setting is the
onboarding charge price itself, set high enough (per the worksheet margin) that
crediting it does not put you underwater on every signup. Do not finalize that
price from a guess.

## State machine

`patient_journey` holds one forward-only row per patient. Transitions are written
through `advance_journey(patient, stage)`, which never regresses and writes an
audit row to `patient_journey_events`.

```
consult_booked -> consult_completed -> baseline_labs_ordered
  -> baseline_labs_collected -> baseline_labs_resulted -> results_reviewed
  -> protocol_recommended ----\
                               -> consent_completed -> membership_enrolled -> active
  -> not_a_candidate (terminal off-ramp)
```

`protocol_recommended` and `not_a_candidate` share an ordinal: a fork after
review. Enrollment is gated behind `consent_completed` in `canEnroll()`.

## Consent gate repositioning

This is a behavioral change to verify against the live consent system. The
pre-prescription gates previously sat after enrollment. They now fire after
results review and before enrollment, on the specific recommended protocol
(hormone therapy, GLP-1, off-label, peptides as applicable). Consent stays
decoupled from payment, so the patient consents informed and uncoerced, then
enrolls, then the prescription is written. The paired Cursor prompt repositions
the gate trigger after a read-only probe of the existing gate code.

## Data model

`onboarding_credits`
- credit_amount_cents: read from Stripe at issuance
- window_days, cap_mode: policy snapshot at issuance for auditability
- status: issued / redeemed / expired / void (text + CHECK, per EHA convention)
- unique on onboarding_charge_ref (idempotent issuance against double webhooks)
- partial unique on patient_user_id where status = issued (one live credit each)
- partial unique on stripe_coupon_id

Helper functions (all security definer, per EHA convention):
- `get_redeemable_credit(patient)`: read-only eligibility for the enroll UI
- `redeem_onboarding_credit(...)`: atomic claim, guards status AND window in one
  UPDATE so a race resolves to a single winner
- `void_credit_redemption(credit_id)`: rollback if the subscription fails to
  create after the credit was claimed
- `expire_onboarding_credits()`: housekeeping sweep, not load-bearing

## Edge functions

- `issue-onboarding-credit`: re-verifies the charge against Stripe (status
  succeeded, metadata.eha_purpose = baseline_labs_onboarding), reads the paid
  amount and patient id from metadata, issues idempotently, advances the journey.
  Wire it into the existing Stripe webhook on payment_intent.succeeded.
- `redeem-onboarding-credit`: validates, computes the capped amount, creates a
  one-time coupon, atomically claims the credit, returns couponId for the app to
  apply at subscription creation. Cleans up the coupon if it loses the race.
- `expire-onboarding-credits`: calls the sweep RPC. Schedule via pg_cron.

### Redemption sequence (does not burn the credit on a failed enrollment)

1. App calls redeem with patient + chosen plan first-month price.
2. Redeem returns { redeemable, couponId, appliedAmountCents }.
3. App creates the subscription WITH couponId.
4. On failure, app calls void to roll the credit back to issued.

## Checkout metadata contract

The baseline-labs checkout must set, on the PaymentIntent:
- `metadata.eha_purpose = "baseline_labs_onboarding"`
- `metadata.eha_patient_user_id = <auth.users.id>`

Issuance keys off these. No metadata, no credit.

## Compliance flags

1. Set the onboarding charge price from the LabCorp worksheet margin, not a
   guess. The credit equals that charge. Crediting an underpriced charge loses
   money on every signup.
2. Verify the LabCorp client-bill agreement permits crediting the onboarding
   charge toward membership. Structuring as a fixed onboarding charge (not an
   itemized lab refund) is the safer reading, but confirm the contract language.
   Owner: Kristen / Troy.
3. Anti-kickback / beneficiary-inducement: EHA is cash-pay with no insurance or
   federal-program billing, so the federal rules that make "free labs if you
   enroll" risky for insurance practices do not reach this. No action beyond the
   LabCorp contract check above.
4. Consent gates now fire pre-enrollment. Verify against the live consent system
   before launch.
5. This is a payment-flow change touching Stripe. Exercise it in Stripe test mode
   first. Stripe live-mode verification is already on the pre-launch checklist.

## Decisions that are Troy's, not mine

- The onboarding charge price (from the worksheet margin)
- The credit window length (default 30 days)
- Whether to cap at first month (default) or allow spread/rollover
- Whether to eat LabCorp wholesale as full CAC or partially recover it
