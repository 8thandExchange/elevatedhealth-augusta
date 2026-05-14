-- Workstream G: prevent duplicate consultation_bookings for the same Stripe Checkout session.
-- 1) Remove duplicate rows (keep earliest created_at, then smallest id).
-- 2) Add UNIQUE on stripe_session_id (NULLs allowed multiple times per PG rules).

DO $$
BEGIN
  DELETE FROM public.consultation_bookings c
  WHERE c.stripe_session_id IS NOT NULL
    AND c.id NOT IN (
      SELECT DISTINCT ON (stripe_session_id) id
      FROM public.consultation_bookings
      WHERE stripe_session_id IS NOT NULL
      ORDER BY stripe_session_id, created_at ASC NULLS LAST, id ASC
    );
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'consultation_bookings_stripe_session_id_unique'
  ) THEN
    ALTER TABLE public.consultation_bookings
      ADD CONSTRAINT consultation_bookings_stripe_session_id_unique
      UNIQUE (stripe_session_id);
  END IF;
END $$;
