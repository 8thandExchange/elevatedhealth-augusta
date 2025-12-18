-- Add followup_sent_at column to consultation_bookings for $99 call follow-up tracking
ALTER TABLE public.consultation_bookings 
ADD COLUMN IF NOT EXISTS followup_sent_at TIMESTAMP WITH TIME ZONE;

-- Add comment
COMMENT ON COLUMN public.consultation_bookings.followup_sent_at IS 'Timestamp when 48-hour followup alert was sent to provider for consultations without kit purchase';