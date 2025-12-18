-- Add new granular onboarding status values for tracking the 3-step journey
-- These align with the pricing page: Strategy Session → Diagnostic Labs → Treatment

-- First, let's add a comment documenting all valid onboarding_status values
COMMENT ON COLUMN patients.onboarding_status IS 'Patient journey status. Valid values:
Step 1 (Strategy Session):
- pending_invite: Initial state, no action taken
- account_created: Account exists, no consultation paid
- consultation_paid: $99 consultation paid, not scheduled
- consultation_scheduled: Consultation scheduled
- consultation_complete: Consultation done, ready for labs

Step 2 (Diagnostic Labs):
- labs_paid: Labs payment received
- kit_shipped: Kit mailed to patient
- sample_received: Lab received sample
- results_ready: Lab results available
- labs_reviewed: Provider reviewed results

Step 3 (Treatment):
- protocol_approved: Treatment plan approved
- pending_pharmacy_order: Awaiting pharmacy order
- treatment_active: Patient on active treatment

Special statuses:
- high_risk_review: Flagged for safety review
- rebooking_fee_required: Missed appointment
- subscription_canceled: Membership canceled';

-- No schema changes needed - onboarding_status is already a text field
-- The new values will be used by application code