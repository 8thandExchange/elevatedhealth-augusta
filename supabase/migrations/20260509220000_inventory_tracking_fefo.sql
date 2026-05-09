-- ============================================================================
-- Inventory tracking with FEFO (First-Expiry-First-Out) for compounded
-- medications and clinic supplies.
--
-- Three tables:
--   inventory_skus            — catalog of items the clinic stocks
--   inventory_lots            — physical stock with lot numbers + expirations
--   inventory_dispensations   — IMMUTABLE audit trail of withdrawals
--
-- Helper functions:
--   dispense_from_lot()           — sole sanctioned write path for dispensations
--   get_active_lot_for_sku()      — FEFO lookup
--   get_inventory_status()        — JSON status summary per SKU
--   expire_inventory_lots()       — sweep: marks past-date lots expired
--                                    (intended for nightly schedule once
--                                    pg_cron / Supabase Scheduled Functions
--                                    are wired up; safe to invoke manually)
--
-- DEVIATIONS FROM ORIGINAL SPEC (called out for follow-up):
--   1. There is no public.fcc_catalog table in this codebase. The FCC
--      formulary lives client-side in src/lib/fccFormulary.ts. We use
--      inventory_skus.fcc_catalog_sku (text) holding the FCC vendor SKU code
--      (e.g. '3502') instead of a uuid FK. Switch to a real FK when the FCC
--      catalog is moved into Postgres.
--   2. pg_cron is not available in standard Supabase projects. The
--      expire_inventory_lots() function is callable manually today and is
--      ready to plug into a Supabase Scheduled Function. The spec's nightly
--      trigger is therefore deferred to follow-up infrastructure work.
--
-- NOTE: distinct from public.protocols (legacy compounded-medication
-- dispensing recipes) and public.medications (per-patient prescriptions).
-- Inventory is the on-hand-stock subsystem; legacy systems are unchanged.
-- ============================================================================

-- pgcrypto is used by gen_random_uuid(); already enabled by earlier migrations
-- but kept idempotent here.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. ENUMS  (kept as text + CHECK to avoid Postgres enum migration friction)
-- ============================================================================

-- inventory_skus.category check values:
--   'compounded_medication' | 'iv_supply' | 'medical_supply' |
--   'peptide' | 'consumable'
-- inventory_lots.status check values:
--   'active' | 'depleted' | 'expired' | 'recalled'
-- inventory_dispensations.transaction_type check values:
--   'patient_dose' | 'waste' | 'correction' | 'transfer' | 'expired_disposal'

-- ============================================================================
-- 2. TABLE: inventory_skus
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.inventory_skus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_code text NOT NULL UNIQUE,
  fcc_catalog_sku text,
  display_name text NOT NULL,
  category text NOT NULL CHECK (
    category IN ('compounded_medication', 'iv_supply', 'medical_supply', 'peptide', 'consumable')
  ),
  default_unit text NOT NULL,
  default_quantity_per_unit numeric NOT NULL DEFAULT 1,
  reorder_threshold integer NOT NULL DEFAULT 5,
  reorder_target integer NOT NULL DEFAULT 20,
  vendor text NOT NULL CHECK (
    vendor IN ('fcc', 'henry_schein', 'empower', 'stericycle', 'other')
  ),
  is_controlled_substance boolean NOT NULL DEFAULT false,
  controlled_schedule text CHECK (controlled_schedule IS NULL OR controlled_schedule IN ('II', 'III', 'IV', 'V')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_skus_category ON public.inventory_skus(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_inventory_skus_vendor ON public.inventory_skus(vendor) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_inventory_skus_controlled ON public.inventory_skus(is_controlled_substance) WHERE is_active = true;

CREATE TRIGGER trg_inventory_skus_updated_at
  BEFORE UPDATE ON public.inventory_skus
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.inventory_skus IS
  'Catalog of items the clinic stocks (one row per product/strength/form). Physical stock is in inventory_lots.';
COMMENT ON COLUMN public.inventory_skus.fcc_catalog_sku IS
  'FCC vendor SKU code (e.g. ''3502''). Joins out to src/lib/fccFormulary.ts. Will become a uuid FK if the FCC catalog is ever moved into the database.';

-- ============================================================================
-- 3. TABLE: inventory_lots
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.inventory_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id uuid NOT NULL REFERENCES public.inventory_skus(id) ON DELETE RESTRICT,
  lot_number text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  expiration_date date NOT NULL,
  quantity_received numeric NOT NULL CHECK (quantity_received >= 0),
  quantity_remaining numeric NOT NULL CHECK (quantity_remaining >= 0),
  unit text NOT NULL,
  cost_per_unit_cents integer,
  vendor_invoice_number text,
  vendor_lot_metadata jsonb,
  storage_location text,
  status text NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'depleted', 'expired', 'recalled')
  ),
  received_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_lots_fefo
  ON public.inventory_lots(sku_id, expiration_date)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_inventory_lots_status
  ON public.inventory_lots(status);

CREATE INDEX IF NOT EXISTS idx_inventory_lots_expiration
  ON public.inventory_lots(expiration_date)
  WHERE status = 'active';

CREATE TRIGGER trg_inventory_lots_updated_at
  BEFORE UPDATE ON public.inventory_lots
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.inventory_lots IS
  'Physical stock by lot. quantity_remaining is decremented exclusively by dispense_from_lot(); direct UPDATE of quantity_remaining is blocked at the policy level.';

-- ============================================================================
-- 4. TABLE: inventory_dispensations  (IMMUTABLE audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.inventory_dispensations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid NOT NULL REFERENCES public.inventory_lots(id) ON DELETE RESTRICT,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  appointment_id uuid,
  protocol_execution_id uuid REFERENCES public.clinical_protocol_executions(id) ON DELETE SET NULL,
  transaction_type text NOT NULL CHECK (
    transaction_type IN ('patient_dose', 'waste', 'correction', 'transfer', 'expired_disposal')
  ),
  quantity_dispensed numeric NOT NULL,
  unit text NOT NULL,
  dispensed_by uuid NOT NULL REFERENCES auth.users(id),
  dispensed_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_dispensations_lot
  ON public.inventory_dispensations(lot_id, dispensed_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_dispensations_patient
  ON public.inventory_dispensations(patient_id, dispensed_at DESC)
  WHERE patient_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_dispensations_type
  ON public.inventory_dispensations(transaction_type, dispensed_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_dispensations_dispensed_by
  ON public.inventory_dispensations(dispensed_by, dispensed_at DESC);

COMMENT ON TABLE public.inventory_dispensations IS
  'Immutable audit trail. Every withdrawal from a lot writes one row. Corrections are new rows with negative quantity (transaction_type = ''correction''). Direct INSERT/UPDATE/DELETE are blocked; use dispense_from_lot().';

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

ALTER TABLE public.inventory_skus           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_lots           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_dispensations  ENABLE ROW LEVEL SECURITY;

-- inventory_skus -------------------------------------------------------------
CREATE POLICY "Authenticated can read SKU catalog"
  ON public.inventory_skus FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage SKU catalog"
  ON public.inventory_skus FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- inventory_lots ------------------------------------------------------------
CREATE POLICY "Staff and admins can read lots"
  ON public.inventory_lots FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Staff and admins can receive lots"
  ON public.inventory_lots FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
  );

-- UPDATE: staff/admin may change ONLY storage_location and status. Mutations
-- to quantity_remaining (and other fields) are constrained at the application
-- layer and via dispense_from_lot(). Postgres does not allow per-column RLS,
-- so we permit UPDATE here and depend on:
--   (a) a BEFORE UPDATE trigger that rejects quantity_remaining changes
--       outside of SECURITY DEFINER paths, and
--   (b) all UI-level writes going through narrow update payloads.
CREATE POLICY "Staff and admins can update lot bookkeeping"
  ON public.inventory_lots FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'staff'::app_role)
  );

CREATE POLICY "Admins can delete unused lots"
  ON public.inventory_lots FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND NOT EXISTS (
      SELECT 1 FROM public.inventory_dispensations d WHERE d.lot_id = inventory_lots.id
    )
  );

-- inventory_dispensations: SELECT is admin-full / staff-self.
-- INSERT is blocked at the policy layer; dispense_from_lot() runs SECURITY DEFINER.
-- UPDATE and DELETE are blocked for everyone (no policies → denied with RLS on).
CREATE POLICY "Admins can read all dispensations"
  ON public.inventory_dispensations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can read their own dispensations"
  ON public.inventory_dispensations FOR SELECT
  USING (
    public.has_role(auth.uid(), 'staff'::app_role)
    AND dispensed_by = auth.uid()
  );

-- (No INSERT / UPDATE / DELETE policies — everything goes through
-- dispense_from_lot() under SECURITY DEFINER.)

-- ============================================================================
-- 6. TRIGGER: protect inventory_lots.quantity_remaining from direct UPDATE
-- ============================================================================
-- Block direct mutation of quantity_remaining unless the caller is
-- dispense_from_lot() (which is SECURITY DEFINER and sets a session GUC).

CREATE OR REPLACE FUNCTION public.protect_inventory_lot_quantity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.quantity_remaining IS DISTINCT FROM OLD.quantity_remaining THEN
    IF coalesce(current_setting('app.dispense_in_progress', true), '') <> 'true' THEN
      RAISE EXCEPTION 'inventory_lots.quantity_remaining can only be modified via dispense_from_lot()';
    END IF;
  END IF;

  -- quantity_received is also immutable post-receipt
  IF NEW.quantity_received IS DISTINCT FROM OLD.quantity_received THEN
    RAISE EXCEPTION 'inventory_lots.quantity_received is immutable after receipt';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_inventory_lot_quantity ON public.inventory_lots;
CREATE TRIGGER trg_protect_inventory_lot_quantity
  BEFORE UPDATE ON public.inventory_lots
  FOR EACH ROW EXECUTE FUNCTION public.protect_inventory_lot_quantity();

-- ============================================================================
-- 7. HELPER FUNCTION: get_active_lot_for_sku()  — FEFO lookup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_active_lot_for_sku(p_sku_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT id
  FROM public.inventory_lots
  WHERE sku_id = p_sku_id
    AND status = 'active'
    AND quantity_remaining > 0
  ORDER BY expiration_date ASC, received_at ASC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_active_lot_for_sku(uuid) TO authenticated;

COMMENT ON FUNCTION public.get_active_lot_for_sku(uuid) IS
  'FEFO: returns the active lot id with the soonest expiration_date for the given SKU, or NULL if none.';

-- ============================================================================
-- 8. HELPER FUNCTION: get_inventory_status()
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_inventory_status(p_sku_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_total numeric := 0;
  v_lots integer := 0;
  v_earliest date;
  v_threshold integer;
  v_status text;
  v_expiring_soon boolean := false;
BEGIN
  SELECT
    coalesce(sum(quantity_remaining), 0),
    count(*),
    min(expiration_date),
    bool_or(expiration_date <= (current_date + INTERVAL '30 days')::date)
  INTO v_total, v_lots, v_earliest, v_expiring_soon
  FROM public.inventory_lots
  WHERE sku_id = p_sku_id
    AND status = 'active'
    AND quantity_remaining > 0;

  SELECT reorder_threshold INTO v_threshold
  FROM public.inventory_skus WHERE id = p_sku_id;

  IF v_threshold IS NULL THEN
    v_threshold := 5;
  END IF;

  IF v_total <= 0 THEN
    v_status := 'out_of_stock';
  ELSIF v_total <= v_threshold THEN
    v_status := 'reorder_now';
  ELSIF v_total <= (v_threshold * 1.3) THEN
    v_status := 'reorder_soon';
  ELSE
    v_status := 'ok';
  END IF;

  RETURN jsonb_build_object(
    'total_quantity', v_total,
    'lot_count', v_lots,
    'earliest_expiration', v_earliest,
    'reorder_status', v_status,
    'has_expiring_soon', coalesce(v_expiring_soon, false)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_inventory_status(uuid) TO authenticated;

-- ============================================================================
-- 9. HELPER FUNCTION: dispense_from_lot()  — sole sanctioned write path
-- ============================================================================

CREATE OR REPLACE FUNCTION public.dispense_from_lot(
  p_lot_id uuid,
  p_quantity numeric,
  p_transaction_type text,
  p_patient_id uuid DEFAULT NULL,
  p_appointment_id uuid DEFAULT NULL,
  p_protocol_execution_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_lot public.inventory_lots%ROWTYPE;
  v_dispensation_id uuid;
  v_new_remaining numeric;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'dispense_from_lot requires an authenticated caller';
  END IF;

  IF NOT (
    public.has_role(v_caller, 'admin'::app_role)
    OR public.has_role(v_caller, 'staff'::app_role)
  ) THEN
    RAISE EXCEPTION 'Only staff or admin may dispense inventory';
  END IF;

  IF p_transaction_type NOT IN
       ('patient_dose', 'waste', 'correction', 'transfer', 'expired_disposal') THEN
    RAISE EXCEPTION 'Invalid transaction_type %', p_transaction_type;
  END IF;

  IF p_transaction_type IN ('waste', 'correction', 'expired_disposal')
     AND (p_reason IS NULL OR length(btrim(p_reason)) = 0) THEN
    RAISE EXCEPTION 'reason is required for transaction_type %', p_transaction_type;
  END IF;

  IF p_quantity = 0 THEN
    RAISE EXCEPTION 'quantity_dispensed cannot be zero';
  END IF;

  IF p_quantity < 0 AND p_transaction_type <> 'correction' THEN
    RAISE EXCEPTION 'Only ''correction'' may have negative quantity';
  END IF;

  SELECT * INTO v_lot
  FROM public.inventory_lots
  WHERE id = p_lot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory lot % not found', p_lot_id;
  END IF;

  IF v_lot.status <> 'active' AND p_transaction_type NOT IN ('correction', 'expired_disposal') THEN
    RAISE EXCEPTION 'Cannot dispense from lot in status %', v_lot.status;
  END IF;

  IF p_quantity > 0 AND v_lot.quantity_remaining < p_quantity THEN
    RAISE EXCEPTION 'Insufficient quantity_remaining: have %, requested %',
      v_lot.quantity_remaining, p_quantity;
  END IF;

  v_new_remaining := v_lot.quantity_remaining - p_quantity;
  IF v_new_remaining < 0 THEN
    v_new_remaining := 0;
  END IF;

  -- Mark this transaction as a sanctioned mutation so the protect trigger
  -- allows the quantity_remaining change.
  PERFORM set_config('app.dispense_in_progress', 'true', true);

  INSERT INTO public.inventory_dispensations (
    lot_id,
    patient_id,
    appointment_id,
    protocol_execution_id,
    transaction_type,
    quantity_dispensed,
    unit,
    dispensed_by,
    notes,
    reason
  )
  VALUES (
    p_lot_id,
    p_patient_id,
    p_appointment_id,
    p_protocol_execution_id,
    p_transaction_type,
    p_quantity,
    v_lot.unit,
    v_caller,
    p_notes,
    p_reason
  )
  RETURNING id INTO v_dispensation_id;

  UPDATE public.inventory_lots
  SET quantity_remaining = v_new_remaining,
      status = CASE
        WHEN v_new_remaining = 0 AND status = 'active' THEN 'depleted'
        ELSE status
      END,
      updated_at = now()
  WHERE id = p_lot_id;

  PERFORM set_config('app.dispense_in_progress', 'false', true);

  RETURN v_dispensation_id;
END;
$$;

REVOKE ALL ON FUNCTION public.dispense_from_lot(
  uuid, numeric, text, uuid, uuid, uuid, text, text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.dispense_from_lot(
  uuid, numeric, text, uuid, uuid, uuid, text, text
) TO authenticated;

COMMENT ON FUNCTION public.dispense_from_lot(uuid, numeric, text, uuid, uuid, uuid, text, text) IS
  'Sole sanctioned write path for inventory_dispensations. Locks the lot, validates role and reason, inserts the audit row, and decrements quantity_remaining. Sets lot.status = ''depleted'' when remaining hits zero.';

-- ============================================================================
-- 10. HELPER FUNCTION: expire_inventory_lots()
-- ============================================================================
-- Marks any active lot whose expiration_date is in the past as 'expired'.
-- Returns the number of lots expired by this call.
--
-- Today: callable from an admin button in the Inventory Dashboard.
-- Future: wire to a Supabase Scheduled Function (pg_cron not enabled here).

CREATE OR REPLACE FUNCTION public.expire_inventory_lots()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_count integer;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'expire_inventory_lots requires an authenticated caller';
  END IF;

  IF NOT (
    public.has_role(v_caller, 'admin'::app_role)
    OR public.has_role(v_caller, 'staff'::app_role)
  ) THEN
    RAISE EXCEPTION 'Only staff or admin may run the expiration sweep';
  END IF;

  PERFORM set_config('app.dispense_in_progress', 'true', true);

  UPDATE public.inventory_lots
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'active'
    AND expiration_date < current_date;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  PERFORM set_config('app.dispense_in_progress', 'false', true);

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_inventory_lots() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_inventory_lots() TO authenticated;

COMMENT ON FUNCTION public.expire_inventory_lots() IS
  'Sweeps active lots whose expiration_date is past and marks them expired. Returns the number of rows updated. Run from the Inventory Dashboard or schedule via Supabase Scheduled Functions.';

-- ============================================================================
-- 11. VERIFICATION QUERIES (run after migration applies)
-- ============================================================================
-- SELECT
--   (SELECT count(*) FROM public.inventory_skus)            AS sku_rows,
--   (SELECT count(*) FROM public.inventory_lots)            AS lot_rows,
--   (SELECT count(*) FROM public.inventory_dispensations)   AS dispensation_rows;
--
-- SELECT proname, prosecdef
-- FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public'
--   AND p.proname IN (
--     'dispense_from_lot',
--     'get_active_lot_for_sku',
--     'get_inventory_status',
--     'expire_inventory_lots',
--     'protect_inventory_lot_quantity'
--   )
-- ORDER BY proname;
--
-- -- Confirm RLS is on:
-- SELECT relname, relrowsecurity
-- FROM pg_class WHERE relname IN (
--   'inventory_skus','inventory_lots','inventory_dispensations'
-- );
