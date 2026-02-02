-- Create function to sync consultation bookings to patients table
CREATE OR REPLACE FUNCTION public.sync_consultation_to_patient()
RETURNS TRIGGER AS $$
BEGIN
  -- When consultation is created, create a patient record if email doesn't exist
  INSERT INTO public.patients (
    full_name,
    email,
    phone,
    onboarding_status,
    consultation_booking_id,
    primary_program,
    created_at
  )
  VALUES (
    COALESCE(NEW.customer_name, 'Unknown'),
    NEW.customer_email,
    NEW.customer_phone,
    'consultation_pending',
    NEW.id,
    COALESCE(NEW.service_type, 'hormone'),
    NOW()
  )
  ON CONFLICT (email) 
  DO UPDATE SET
    consultation_booking_id = NEW.id,
    onboarding_status = CASE 
      WHEN public.patients.onboarding_status IS NULL 
           OR public.patients.onboarding_status = 'pending_invite' 
      THEN 'consultation_pending' 
      ELSE public.patients.onboarding_status 
    END,
    updated_at = NOW()
  WHERE public.patients.email = NEW.customer_email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on consultation_bookings
CREATE TRIGGER on_consultation_created
  AFTER INSERT ON public.consultation_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_consultation_to_patient();

-- Add unique constraint on email if not exists (needed for ON CONFLICT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'patients_email_unique'
  ) THEN
    ALTER TABLE public.patients ADD CONSTRAINT patients_email_unique UNIQUE (email);
  END IF;
EXCEPTION
  WHEN others THEN
    NULL; -- Ignore if constraint already exists or can't be added
END $$;

-- Backfill existing consultations to patients table
INSERT INTO public.patients (full_name, email, phone, onboarding_status, consultation_booking_id, primary_program, created_at)
SELECT 
  COALESCE(cb.customer_name, 'Unknown'),
  cb.customer_email,
  cb.customer_phone,
  CASE 
    WHEN cb.status = 'completed' THEN 'consultation_complete'
    WHEN cb.status IN ('converted_to_mapping', 'converted_to_patient') THEN 'invited'
    ELSE 'consultation_pending'
  END,
  cb.id,
  COALESCE(cb.service_type, 'hormone'),
  cb.created_at
FROM public.consultation_bookings cb
WHERE cb.customer_email IS NOT NULL
  AND cb.status NOT IN ('archived')
ON CONFLICT (email) 
DO UPDATE SET
  consultation_booking_id = EXCLUDED.consultation_booking_id,
  updated_at = NOW()
WHERE public.patients.consultation_booking_id IS NULL;