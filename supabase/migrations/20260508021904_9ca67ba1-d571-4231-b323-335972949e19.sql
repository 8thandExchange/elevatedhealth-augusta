-- 1. Add 'provider' role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'provider';

-- 2. Provider directory RPC (security definer to read auth.users safely)
CREATE OR REPLACE FUNCTION public.get_providers_directory()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  email text,
  color text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  palette text[] := ARRAY['#0f1f3d','#7c5e3c','#4a4a4a','#8b6f47','#2c4858','#a87c4f','#5a4a3a','#3d5a6c'];
BEGIN
  -- Only staff/admin can call
  IF NOT (public.has_role(auth.uid(), 'admin'::app_role)
       OR public.has_role(auth.uid(), 'staff'::app_role)
       OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND role::text = 'provider')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT
    ur.user_id,
    COALESCE(
      NULLIF(au.raw_user_meta_data->>'full_name',''),
      NULLIF(au.raw_user_meta_data->>'name',''),
      split_part(au.email,'@',1)
    ) AS display_name,
    au.email::text,
    palette[((abs(hashtext(ur.user_id::text)) % array_length(palette,1)) + 1)] AS color
  FROM public.user_roles ur
  JOIN auth.users au ON au.id = ur.user_id
  WHERE ur.role::text = 'provider'
  ORDER BY display_name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_providers_directory() TO authenticated;

-- 3. Realtime publication
DO $$
BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='appointments';
  IF NOT FOUND THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments';
  END IF;
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='iv_drip_bookings';
  IF NOT FOUND THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.iv_drip_bookings';
  END IF;
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='consultation_bookings';
  IF NOT FOUND THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.consultation_bookings';
  END IF;
END $$;

ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.iv_drip_bookings REPLICA IDENTITY FULL;
ALTER TABLE public.consultation_bookings REPLICA IDENTITY FULL;