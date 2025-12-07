-- Fix patient-documents bucket to be private (critical HIPAA fix)
UPDATE storage.buckets 
SET public = false 
WHERE id = 'patient-documents';

-- Drop any existing policies on storage.objects for patient-documents to avoid conflicts
DROP POLICY IF EXISTS "Patients can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Staff can view all patient documents" ON storage.objects;
DROP POLICY IF EXISTS "Staff can upload patient documents" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete patient documents" ON storage.objects;

-- Recreate proper RLS policies for patient-documents storage bucket
CREATE POLICY "Patients can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'patient-documents' 
  AND auth.uid() IN (
    SELECT p.user_id FROM patients p 
    WHERE p.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Staff can view all patient documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'patient-documents'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
);

CREATE POLICY "Staff can upload patient documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'patient-documents'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
);

CREATE POLICY "Staff can delete patient documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'patient-documents'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
);