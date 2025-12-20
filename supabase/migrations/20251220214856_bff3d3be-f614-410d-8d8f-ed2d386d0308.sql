-- Create provider-signatures storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('provider-signatures', 'provider-signatures', false);

-- RLS policy: Only authenticated staff/admins can view signatures
CREATE POLICY "Staff and admins can view signatures"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'provider-signatures' AND
  (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR
    public.has_role(auth.uid(), 'staff'::public.app_role)
  )
);

-- RLS policy: Only admins can upload signatures
CREATE POLICY "Admins can upload signatures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'provider-signatures' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- RLS policy: Only admins can update signatures
CREATE POLICY "Admins can update signatures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'provider-signatures' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- RLS policy: Only admins can delete signatures
CREATE POLICY "Admins can delete signatures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'provider-signatures' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);