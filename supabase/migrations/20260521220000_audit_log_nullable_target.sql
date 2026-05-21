-- Allow audit_log entries without a target user (e.g., patient-initiated 
-- status changes via edge functions running with service_role and no auth.uid()).
-- The action column still describes what happened, and old_role/new_role 
-- capture the state transition.
ALTER TABLE public.audit_log
  ALTER COLUMN target_user_id DROP NOT NULL;
