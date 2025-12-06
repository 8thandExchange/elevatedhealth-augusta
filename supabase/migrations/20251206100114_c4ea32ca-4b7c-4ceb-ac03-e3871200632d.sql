-- Create patient_documents table for storing uploaded documents
CREATE TABLE public.patient_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;

-- Patients can view their own documents
CREATE POLICY "Patients can view their own documents"
ON public.patient_documents
FOR SELECT
USING (patient_id IN (
  SELECT id FROM public.patients WHERE user_id = auth.uid()
));

-- Staff and admins can manage all documents
CREATE POLICY "Staff and admins can manage documents"
ON public.patient_documents
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Create storage bucket for patient documents
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-documents', 'patient-documents', true);

-- Storage policies for patient-documents bucket
CREATE POLICY "Staff can upload patient documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'patient-documents' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
);

CREATE POLICY "Anyone can view patient documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'patient-documents');

CREATE POLICY "Staff can delete patient documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'patient-documents' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
);

-- Add awaiting_blood_work to valid onboarding statuses (for reference)
COMMENT ON TABLE public.patient_documents IS 'Stores uploaded patient documents like Labcorp requisitions';