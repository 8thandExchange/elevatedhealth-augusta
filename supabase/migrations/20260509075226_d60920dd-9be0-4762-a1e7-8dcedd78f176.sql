ALTER FUNCTION public.touch_updated_at() SET search_path = public, pg_temp;
DROP POLICY IF EXISTS "Staff and admins can view all patients" ON public.patients;