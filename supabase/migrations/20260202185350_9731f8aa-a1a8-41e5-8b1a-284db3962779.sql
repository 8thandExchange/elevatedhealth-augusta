-- Add ZRT PDF parsing support fields
ALTER TABLE lab_results 
ADD COLUMN IF NOT EXISTS pg_e2_ratio NUMERIC,
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS parsed_from_pdf BOOLEAN DEFAULT FALSE;

-- Create lab-documents storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('lab-documents', 'lab-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Admins/staff can upload lab documents
CREATE POLICY "Staff can upload lab documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lab-documents' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'staff', 'business_admin')
  )
);

-- Storage policy: Admins/staff can view lab documents
CREATE POLICY "Staff can view lab documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'lab-documents' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'staff', 'business_admin')
  )
);