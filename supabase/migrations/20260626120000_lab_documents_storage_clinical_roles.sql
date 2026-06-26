-- lab-documents bucket: align storage RLS with has_clinical_staff_access (include provider role).

DROP POLICY IF EXISTS "Staff can upload lab documents" ON storage.objects;
DROP POLICY IF EXISTS "Staff can view lab documents" ON storage.objects;
DROP POLICY IF EXISTS "Clinical staff can upload lab documents" ON storage.objects;
DROP POLICY IF EXISTS "Clinical staff can view lab documents" ON storage.objects;

CREATE POLICY "Clinical staff can upload lab documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lab-documents'
  AND public.has_clinical_staff_access(auth.uid())
);

CREATE POLICY "Clinical staff can view lab documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'lab-documents'
  AND public.has_clinical_staff_access(auth.uid())
);
