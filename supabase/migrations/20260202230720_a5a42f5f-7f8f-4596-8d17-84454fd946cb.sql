-- Add DELETE RLS policy for consultation_bookings
CREATE POLICY "Staff and admins can delete bookings"
  ON public.consultation_bookings
  FOR DELETE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'staff'::app_role)
  );