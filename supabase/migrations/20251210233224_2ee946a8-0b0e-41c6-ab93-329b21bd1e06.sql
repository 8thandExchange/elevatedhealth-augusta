-- Seed the master admin account role (if not exists)
INSERT INTO public.user_roles (user_id, role)
SELECT '31178dc3-3509-4cdd-8440-e75835bb1521', 'admin'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '31178dc3-3509-4cdd-8440-e75835bb1521'
);

-- Add protection policy to prevent deletion of master admin role
DROP POLICY IF EXISTS "Protect master admin role" ON public.user_roles;

CREATE POLICY "Protect master admin role"
ON public.user_roles
FOR DELETE
USING (
  NOT (user_id = '31178dc3-3509-4cdd-8440-e75835bb1521' AND role = 'admin'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role) = false
);