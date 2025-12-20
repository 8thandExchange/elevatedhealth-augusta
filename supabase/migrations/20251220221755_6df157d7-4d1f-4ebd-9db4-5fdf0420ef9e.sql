-- Drop the existing RESTRICTIVE policy
DROP POLICY IF EXISTS "Allow public lead creation" ON public.chat_leads;

-- Create a new PERMISSIVE policy for public lead creation
CREATE POLICY "Allow public lead creation"
ON public.chat_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);