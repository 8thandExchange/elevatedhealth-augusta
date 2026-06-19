-- SECURITY (HIPAA): remove the leftover world-readable storage policy on
-- patient-documents.
--
-- Migration 20251206100114 created "Anyone can view patient documents" with
-- USING (bucket_id = 'patient-documents'), granting SELECT to anon +
-- authenticated. The next-day fix (20251207123227) made the bucket private and
-- added scoped patient/staff policies, but it DROPped a different set of policy
-- names and never removed the open one. Because permissive RLS policies are
-- OR'd together, that open policy still authorizes any caller (anon key
-- included) to read every object in the bucket via the Storage API — i.e.
-- cross-patient PHI exposure (LabCorp requisitions, uploaded documents).
--
-- Dropping it leaves the correct scoped policies in place:
--   "Patients can view their own documents"  (own folder only)
--   "Staff can view all patient documents"   (admin/staff)
--   "Staff can upload patient documents"     (admin/staff)
--   "Staff can delete patient documents"     (admin/staff)

DROP POLICY IF EXISTS "Anyone can view patient documents" ON storage.objects;
