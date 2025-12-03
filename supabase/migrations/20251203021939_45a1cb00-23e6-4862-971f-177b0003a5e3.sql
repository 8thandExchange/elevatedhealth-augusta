-- Create patient_resources table
CREATE TABLE public.patient_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('injection_tutorials', 'nutrition_guides', 'stress_management')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'pdf')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.patient_resources ENABLE ROW LEVEL SECURITY;

-- Anyone can view resources (public page)
CREATE POLICY "Anyone can view resources"
ON public.patient_resources
FOR SELECT
USING (true);

-- Only admins/staff can manage resources
CREATE POLICY "Admins can manage resources"
ON public.patient_resources
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Create storage bucket for resource PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-resources', 'patient-resources', true);

-- Storage policies for the bucket
CREATE POLICY "Anyone can view resource files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'patient-resources');

CREATE POLICY "Admins can upload resource files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'patient-resources' AND (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff'))
));

CREATE POLICY "Admins can delete resource files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'patient-resources' AND (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff'))
));