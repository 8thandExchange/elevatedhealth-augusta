-- Add tracking columns for booking reminders
ALTER TABLE consultation_bookings 
ADD COLUMN IF NOT EXISTS calendar_booked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS booking_reminder_sent_at TIMESTAMPTZ;