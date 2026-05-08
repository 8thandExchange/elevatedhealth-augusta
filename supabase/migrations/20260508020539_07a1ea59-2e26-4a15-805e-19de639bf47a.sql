CREATE TABLE public.schedule_exceptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  exception_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  service_lines TEXT[] NOT NULL DEFAULT '{}',
  slot_minutes INTEGER NOT NULL DEFAULT 30,
  type TEXT NOT NULL DEFAULT 'addition' CHECK (type IN ('addition', 'removal')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_schedule_exceptions_provider_date ON public.schedule_exceptions(provider_id, exception_date);

ALTER TABLE public.schedule_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers manage own exceptions"
  ON public.schedule_exceptions
  FOR ALL
  USING (provider_id = auth.uid())
  WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Staff and admins manage all exceptions"
  ON public.schedule_exceptions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE TRIGGER update_schedule_exceptions_updated_at
  BEFORE UPDATE ON public.schedule_exceptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();