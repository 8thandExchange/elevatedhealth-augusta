-- Create chat_leads table to capture visitor information
CREATE TABLE public.chat_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  interest TEXT, -- 'hormone', 'weight_loss', 'ketamine', 'general'
  source TEXT DEFAULT 'chatbot',
  chat_summary TEXT,
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'converted', 'archived'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_leads ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (chatbot creates leads without auth)
CREATE POLICY "Allow public lead creation" ON public.chat_leads
  FOR INSERT WITH CHECK (true);

-- Allow admin/staff to view and manage leads
CREATE POLICY "Staff can view all leads" ON public.chat_leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff can update leads" ON public.chat_leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_chat_leads_updated_at
  BEFORE UPDATE ON public.chat_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();