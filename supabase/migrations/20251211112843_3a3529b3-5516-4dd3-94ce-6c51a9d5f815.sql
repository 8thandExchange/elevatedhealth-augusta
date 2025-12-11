-- Fix security issues: restrict protocols and clinic_settings to authenticated users

-- 1. Fix protocols table - restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view protocols" ON protocols;

CREATE POLICY "Authenticated users can view protocols"
  ON protocols FOR SELECT
  TO authenticated
  USING (true);

-- 2. Fix clinic_settings table - restrict to authenticated users only (contains EIN/NPI)
DROP POLICY IF EXISTS "Anyone can view clinic settings" ON clinic_settings;

CREATE POLICY "Authenticated users can view clinic settings"
  ON clinic_settings FOR SELECT
  TO authenticated
  USING (true);