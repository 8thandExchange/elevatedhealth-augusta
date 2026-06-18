-- Merge duplicate Roberta Marshall patients, fix Caroline provider identity,
-- and correct a mis-timed appointment caused by UTC slot generation.

DO $$
DECLARE
  primary_id uuid := '9a4045f3-35e6-445b-998e-82a02c08a62a';
  dup_id uuid := 'cb49dea5-db8e-4fab-8220-9d1977bfb3d9';
  caroline_clinic uuid := '6d3d8103-e937-4885-beee-297ab31033f7';
  caroline_icloud uuid := 'e6efa6fd-0766-4dbc-bd8f-5d9a73f88a5d';
BEGIN
  -- ── Roberta Marshall: merge knology (paid consult) into gmail (intake + appt) ──
  UPDATE public.appointments SET patient_id = primary_id WHERE patient_id = dup_id;
  UPDATE public.communication_logs SET patient_id = primary_id WHERE patient_id = dup_id;
  UPDATE public.consent_records SET patient_id = primary_id WHERE patient_id = dup_id;
  UPDATE public.intake_magic_links SET patient_id = primary_id WHERE patient_id = dup_id;
  UPDATE public.lab_orders SET patient_id = primary_id WHERE patient_id = dup_id;
  UPDATE public.eligibility_review_requests SET patient_id = primary_id WHERE patient_id = dup_id;

  UPDATE public.patients
  SET
    onboarding_status = 'consultation_paid',
    phone = '(706) 564-0643',
    primary_program = 'hormone'
  WHERE id = primary_id;

  UPDATE public.consultation_bookings
  SET customer_email = 'robbiemarshall810@gmail.com', customer_name = 'Roberta Marshall'
  WHERE id = 'dd4f02c9-08b7-4121-af1e-9668925d9eb3';

  UPDATE public.consultation_bookings
  SET status = 'cancelled'
  WHERE id = '394993d7-f5e5-4b40-b0e4-7826b8771643';

  -- UTC slot bug stored midnight Eastern; move to 10:00 AM Eastern same clinic day.
  UPDATE public.appointments
  SET scheduled_at = '2026-06-25T14:00:00.000Z'
  WHERE id = 'f1908520-6c8a-4c81-9866-758573dd185e';

  UPDATE public.patients
  SET
    is_archived = true,
    email = 'merged-' || dup_id::text || '@archived.elevatedhealth.local'
  WHERE id = dup_id;

  -- ── Caroline Marshall: correct display name + single provider calendar ──
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object('full_name', 'Caroline Marshall')
  WHERE id = caroline_clinic;

  DELETE FROM public.user_roles
  WHERE user_id = caroline_icloud AND role = 'provider'::public.app_role;

  UPDATE public.provider_schedules
  SET is_active = false
  WHERE provider_id = caroline_icloud;
END $$;
