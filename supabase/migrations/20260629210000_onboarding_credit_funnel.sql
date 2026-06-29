-- ============================================================================
-- EHA Funnel Rebuild: labs-first sequence + onboarding credit
-- Project: jiiparpfkjytdcuelcns (us-east-1)
--
-- New order of operations:
--   consult -> baseline labs (one-time onboarding charge) -> results review
--   -> consent gates -> membership enrollment (onboarding charge credited,
--   capped at first month, inside a window) -> treatment -> monitoring labs
--   stay inside the membership.
--
-- Conventions followed (per EHA):
--   - status fields are text + CHECK, never Postgres enum
--   - role-derived access via security definer helpers
--   - audit trail on state transitions
--   - this migration references NO unconfirmed helper functions, so it applies
--     cleanly on its own. Staff/admin RLS read policy is added separately by the
--     paired Cursor prompt using the repo's existing role helper.
--
-- REMINDER (permanent EHA gotcha): Lovable/Vercel does NOT auto-apply Supabase
-- migrations on publish. After publishing the PR, apply this file manually.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Patient journey state machine
-- ----------------------------------------------------------------------------

create table if not exists public.patient_journey (
  id                uuid primary key default gen_random_uuid(),
  patient_user_id   uuid not null,
  stage             text not null default 'consult_booked'
    check (stage in (
      'consult_booked',
      'consult_completed',
      'baseline_labs_ordered',
      'baseline_labs_collected',
      'baseline_labs_resulted',
      'results_reviewed',
      'protocol_recommended',
      'not_a_candidate',
      'consent_completed',
      'membership_enrolled',
      'active'
    )),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- one active journey row per patient (required for advance_journey upsert)
create unique index if not exists patient_journey_patient_uidx
  on public.patient_journey (patient_user_id);

create table if not exists public.patient_journey_events (
  id                uuid primary key default gen_random_uuid(),
  patient_user_id   uuid not null,
  stage             text not null,
  note              text,
  created_at        timestamptz not null default now()
);

create index if not exists patient_journey_events_patient_idx
  on public.patient_journey_events (patient_user_id, created_at desc);

-- Forward-only stage advance with audit. Never regresses an existing journey.
-- protocol_recommended and not_a_candidate share an ordinal (a fork after review).
create or replace function public.advance_journey(p_patient uuid, p_stage text, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order   int;
  v_current int;
  ordinals  jsonb := '{
    "consult_booked":10,
    "consult_completed":20,
    "baseline_labs_ordered":30,
    "baseline_labs_collected":40,
    "baseline_labs_resulted":50,
    "results_reviewed":60,
    "protocol_recommended":70,
    "not_a_candidate":70,
    "consent_completed":80,
    "membership_enrolled":90,
    "active":100
  }'::jsonb;
begin
  if not (ordinals ? p_stage) then
    raise exception 'unknown_journey_stage:%', p_stage using errcode = 'P0001';
  end if;

  insert into public.patient_journey (patient_user_id, stage)
  values (p_patient, p_stage)
  on conflict (patient_user_id) do nothing;

  v_order := (ordinals ->> p_stage)::int;
  select (ordinals ->> stage)::int
    into v_current
    from public.patient_journey
   where patient_user_id = p_patient;

  if v_order > coalesce(v_current, 0) then
    update public.patient_journey
       set stage = p_stage, updated_at = now()
     where patient_user_id = p_patient;

    insert into public.patient_journey_events (patient_user_id, stage, note)
    values (p_patient, p_stage, p_note);
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. Onboarding credits
-- ----------------------------------------------------------------------------
-- credit_amount_cents is the amount actually paid for the baseline lab bundle
-- (read from Stripe at issuance, never guessed). cap_mode controls how much of
-- it can be applied at enrollment.
-- ----------------------------------------------------------------------------

create table if not exists public.onboarding_credits (
  id                    uuid primary key default gen_random_uuid(),
  patient_user_id       uuid not null,
  stripe_customer_id    text,
  onboarding_charge_ref text not null,            -- Stripe payment_intent id for the baseline labs
  credit_amount_cents   integer not null check (credit_amount_cents >= 0),
  window_days           integer not null check (window_days > 0),
  cap_mode              text not null default 'first_month'
    check (cap_mode in ('first_month', 'uncapped', 'spread')),
  issued_at             timestamptz not null default now(),
  expires_at            timestamptz not null,
  redeemed_at           timestamptz,
  redeemed_against_ref  text,                      -- Stripe subscription/invoice id
  applied_amount_cents  integer check (applied_amount_cents >= 0),
  stripe_coupon_id      text,
  status                text not null default 'issued'
    check (status in ('issued', 'redeemed', 'expired', 'void')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Idempotent issuance: one credit per onboarding charge (webhooks fire twice).
create unique index if not exists onboarding_credits_charge_uidx
  on public.onboarding_credits (onboarding_charge_ref);

-- At most one live (issued) credit per patient at a time.
create unique index if not exists onboarding_credits_one_live_per_patient_uidx
  on public.onboarding_credits (patient_user_id)
  where status = 'issued';

create unique index if not exists onboarding_credits_coupon_uidx
  on public.onboarding_credits (stripe_coupon_id)
  where stripe_coupon_id is not null;

create index if not exists onboarding_credits_patient_idx
  on public.onboarding_credits (patient_user_id, status);

-- Read-only eligibility probe used by the enrollment UI and redeem function.
create or replace function public.get_redeemable_credit(p_patient uuid)
returns public.onboarding_credits
language sql
stable
security definer
set search_path = public
as $$
  select *
    from public.onboarding_credits
   where patient_user_id = p_patient
     and status = 'issued'
     and now() < expires_at
   order by issued_at desc
   limit 1;
$$;

-- Atomic redemption. Guards status AND window in one UPDATE, so a race between
-- two enrollment attempts can only let one win. Raises if not redeemable.
create or replace function public.redeem_onboarding_credit(
  p_credit_id    uuid,
  p_applied_cents integer,
  p_coupon_id    text,
  p_against_ref  text default null
)
returns public.onboarding_credits
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.onboarding_credits;
begin
  update public.onboarding_credits
     set status               = 'redeemed',
         redeemed_at          = now(),
         applied_amount_cents = p_applied_cents,
         stripe_coupon_id     = p_coupon_id,
         redeemed_against_ref = p_against_ref,
         updated_at           = now()
   where id = p_credit_id
     and status = 'issued'
     and now() < expires_at
  returning * into v_row;

  if not found then
    raise exception 'credit_not_redeemable' using errcode = 'P0001';
  end if;

  return v_row;
end;
$$;

-- Roll a redemption back if the subscription it was attached to failed to create.
-- Returns to 'issued' if still in window, otherwise 'expired'.
create or replace function public.void_credit_redemption(p_credit_id uuid)
returns public.onboarding_credits
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.onboarding_credits;
begin
  update public.onboarding_credits
     set status               = case when now() < expires_at then 'issued' else 'expired' end,
         redeemed_at          = null,
         applied_amount_cents = null,
         stripe_coupon_id     = null,
         redeemed_against_ref = null,
         updated_at           = now()
   where id = p_credit_id
     and status = 'redeemed'
  returning * into v_row;

  if not found then
    raise exception 'credit_not_voidable' using errcode = 'P0001';
  end if;

  return v_row;
end;
$$;

-- Housekeeping sweep. Not required for correctness (get_redeemable_credit and
-- redeem_onboarding_credit both enforce the window live), only for accurate
-- status reporting. Safe to schedule or call ad hoc.
create or replace function public.expire_onboarding_credits()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  update public.onboarding_credits
     set status = 'expired', updated_at = now()
   where status = 'issued'
     and now() >= expires_at;
  get diagnostics n = row_count;
  return n;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. RLS
-- ----------------------------------------------------------------------------
-- Edge functions use the service role key, which bypasses RLS, so issuance and
-- redemption work regardless of the policies below. These policies only govern
-- in-app reads. Patient-self read is defined here. Staff/admin read is added by
-- the paired Cursor prompt using the repo's existing role helper (not referenced
-- here, so this migration cannot fail on a missing function).
-- ----------------------------------------------------------------------------

alter table public.patient_journey        enable row level security;
alter table public.patient_journey_events enable row level security;
alter table public.onboarding_credits     enable row level security;

drop policy if exists onboarding_credits_self_read on public.onboarding_credits;
create policy onboarding_credits_self_read
  on public.onboarding_credits
  for select
  using (auth.uid() = patient_user_id);

drop policy if exists patient_journey_self_read on public.patient_journey;
create policy patient_journey_self_read
  on public.patient_journey
  for select
  using (auth.uid() = patient_user_id);

drop policy if exists patient_journey_events_self_read on public.patient_journey_events;
create policy patient_journey_events_self_read
  on public.patient_journey_events
  for select
  using (auth.uid() = patient_user_id);

-- ----------------------------------------------------------------------------
-- 4. Optional scheduled expiry (enable after confirming pg_cron is available)
-- ----------------------------------------------------------------------------
-- create extension if not exists pg_cron;
-- select cron.schedule(
--   'expire-onboarding-credits-hourly',
--   '17 * * * *',
--   $$ select public.expire_onboarding_credits(); $$
-- );
