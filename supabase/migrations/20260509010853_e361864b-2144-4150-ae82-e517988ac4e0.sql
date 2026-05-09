-- Clinical SOP / standing-orders system (distinct from legacy public.protocols)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.clinical_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('iv','hormone','peptide','weight_loss','monitoring')),
  service_type text[] NOT NULL DEFAULT '{}',
  current_version_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clinical_protocol_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id uuid NOT NULL REFERENCES public.clinical_protocols(id) ON DELETE CASCADE,
  version_number integer NOT NULL CHECK (version_number > 0),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','pending_signature','signed','retired')),
  body_markdown text NOT NULL,
  body_structured jsonb NOT NULL DEFAULT '{}'::jsonb,
  authored_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  signed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  signed_at timestamptz,
  signature_hash text,
  notes_for_reviewer jsonb NOT NULL DEFAULT '[]'::jsonb,
  retired_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (protocol_id, version_number),
  CONSTRAINT signed_fields_consistent CHECK (
    (status = 'signed'  AND signed_by IS NOT NULL AND signed_at IS NOT NULL AND signature_hash IS NOT NULL)
    OR (status <> 'signed')
  )
);

ALTER TABLE public.clinical_protocols
  ADD CONSTRAINT clinical_protocols_current_version_fkey
  FOREIGN KEY (current_version_id)
  REFERENCES public.clinical_protocol_versions(id)
  ON DELETE SET NULL
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS public.clinical_protocol_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_version_id uuid NOT NULL
    REFERENCES public.clinical_protocol_versions(id) ON DELETE RESTRICT,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
  executed_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  appointment_id uuid,
  executed_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  adverse_event_flagged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinical_protocols_active_category
  ON public.clinical_protocols(is_active, category);
CREATE INDEX IF NOT EXISTS idx_clinical_protocols_service_type
  ON public.clinical_protocols USING gin (service_type);
CREATE INDEX IF NOT EXISTS idx_cp_versions_protocol
  ON public.clinical_protocol_versions(protocol_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_cp_versions_status
  ON public.clinical_protocol_versions(status);
CREATE INDEX IF NOT EXISTS idx_cp_executions_patient
  ON public.clinical_protocol_executions(patient_id, executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_cp_executions_version
  ON public.clinical_protocol_executions(protocol_version_id);
CREATE INDEX IF NOT EXISTS idx_cp_executions_adverse
  ON public.clinical_protocol_executions(adverse_event_flagged)
  WHERE adverse_event_flagged = true;

DROP TRIGGER IF EXISTS trg_clinical_protocols_updated_at ON public.clinical_protocols;
CREATE TRIGGER trg_clinical_protocols_updated_at
  BEFORE UPDATE ON public.clinical_protocols
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_clinical_protocol_versions_updated_at ON public.clinical_protocol_versions;
CREATE TRIGGER trg_clinical_protocol_versions_updated_at
  BEFORE UPDATE ON public.clinical_protocol_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.clinical_protocols           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_protocol_versions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_protocol_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view active clinical protocols" ON public.clinical_protocols;
CREATE POLICY "Authenticated can view active clinical protocols"
  ON public.clinical_protocols FOR SELECT
  TO authenticated
  USING (
    is_active = true
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
  );

DROP POLICY IF EXISTS "Admin and staff manage clinical protocols" ON public.clinical_protocols;
CREATE POLICY "Admin and staff manage clinical protocols"
  ON public.clinical_protocols FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

DROP POLICY IF EXISTS "Staff can view signed protocol versions" ON public.clinical_protocol_versions;
CREATE POLICY "Staff can view signed protocol versions"
  ON public.clinical_protocol_versions FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR (status = 'signed' AND has_role(auth.uid(), 'staff'::app_role))
  );

DROP POLICY IF EXISTS "Admin can insert protocol versions" ON public.clinical_protocol_versions;
CREATE POLICY "Admin can insert protocol versions"
  ON public.clinical_protocol_versions FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admin can update protocol versions" ON public.clinical_protocol_versions;
CREATE POLICY "Admin can update protocol versions"
  ON public.clinical_protocol_versions FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    AND (status <> 'signed' OR signed_by = auth.uid())
  );

DROP POLICY IF EXISTS "Admin can delete protocol versions" ON public.clinical_protocol_versions;
CREATE POLICY "Admin can delete protocol versions"
  ON public.clinical_protocol_versions FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Staff can log their own protocol executions" ON public.clinical_protocol_executions;
CREATE POLICY "Staff can log their own protocol executions"
  ON public.clinical_protocol_executions FOR INSERT
  TO authenticated
  WITH CHECK (
    executed_by = auth.uid()
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
  );

DROP POLICY IF EXISTS "Staff can view their own protocol executions" ON public.clinical_protocol_executions;
CREATE POLICY "Staff can view their own protocol executions"
  ON public.clinical_protocol_executions FOR SELECT
  TO authenticated
  USING (
    executed_by = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Admin can manage all protocol executions" ON public.clinical_protocol_executions;
CREATE POLICY "Admin can manage all protocol executions"
  ON public.clinical_protocol_executions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.sign_clinical_protocol_version(version_id uuid)
RETURNS public.clinical_protocol_versions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_version public.clinical_protocol_versions%ROWTYPE;
  v_now timestamptz := now();
  v_hash text;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'sign_clinical_protocol_version requires an authenticated caller';
  END IF;

  IF NOT public.has_role(v_caller, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admin role may sign clinical protocol versions';
  END IF;

  SELECT * INTO v_version
    FROM public.clinical_protocol_versions
    WHERE id = version_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Clinical protocol version % not found', version_id;
  END IF;

  IF v_version.status NOT IN ('draft', 'pending_signature') THEN
    RAISE EXCEPTION 'Cannot sign version in status %', v_version.status;
  END IF;

  v_hash := encode(
    digest(
      v_version.body_markdown || '|' || v_caller::text || '|' || v_now::text,
      'sha256'
    ),
    'hex'
  );

  UPDATE public.clinical_protocol_versions
    SET status = 'signed',
        signed_by = v_caller,
        signed_at = v_now,
        signature_hash = v_hash,
        updated_at = v_now
    WHERE id = version_id
    RETURNING * INTO v_version;

  UPDATE public.clinical_protocols
    SET current_version_id = v_version.id,
        updated_at = v_now
    WHERE id = v_version.protocol_id;

  RETURN v_version;
END;
$$;

REVOKE ALL ON FUNCTION public.sign_clinical_protocol_version(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sign_clinical_protocol_version(uuid) TO authenticated;

COMMENT ON FUNCTION public.sign_clinical_protocol_version(uuid) IS
  'Signs a draft or pending_signature clinical protocol version. Requires admin role. '
  'Sets status=signed, signed_by/at, signature_hash (sha256 of body_markdown|signer|timestamp), '
  'and points the parent clinical_protocols.current_version_id at the freshly signed row.';