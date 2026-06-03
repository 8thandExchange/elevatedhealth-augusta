-- DB invariant: patient-servable catalog rows must be legally approved before is_active=true.

CREATE OR REPLACE FUNCTION public.enforce_approved_before_active()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_active = true AND COALESCE(NEW.legal_review_status, '') <> 'approved' THEN
    RAISE EXCEPTION
      'consent_versions: is_active=true requires legal_review_status=approved (consent_type=%, version_label=%)',
      NEW.consent_type, NEW.version_label;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_approved_before_active ON public.consent_versions;
CREATE TRIGGER trg_enforce_approved_before_active
  BEFORE INSERT OR UPDATE ON public.consent_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_approved_before_active();
