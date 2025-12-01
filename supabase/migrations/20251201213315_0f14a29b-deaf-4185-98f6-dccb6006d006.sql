-- Allow authenticated users to create their own patient record
CREATE POLICY "Users can create their own patient record" 
ON public.patients 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());