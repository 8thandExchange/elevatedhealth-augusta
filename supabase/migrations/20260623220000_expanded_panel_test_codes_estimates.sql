-- Set correct LabCorp order codes for the 4 Expanded-panel tests that were not
-- on the 2026-06-22 client sheet, plus conservative client-rate cost ESTIMATES
-- so the margin tool can compute Expanded instead of flagging it unpriced.
-- Codes are confirmed from labcorp.com; costs are estimates pending the account
-- rep adding these to the client fee schedule. Replace with the quoted client
-- rate once received.
DO $$
BEGIN
  UPDATE public.lab_tests t
  SET labcorp_test_code = v.code,
      eha_cost_cents = v.est_cost,
      updated_at = now(),
      internal_notes = COALESCE(NULLIF(t.internal_notes,''), '')
        || ' [' || v.note || ']'
  FROM (VALUES
    ('Fasting Insulin','004333',1200,'ESTIMATE client ~$12; OnDemand retail ~$89; confirm client rate w/ LabCorp rep'),
    ('Apolipoprotein B','167015',1600,'ESTIMATE client ~$16; OnDemand retail $69; confirm client rate w/ LabCorp rep'),
    ('Lipoprotein (a)','120188',1600,'ESTIMATE client ~$16; OnDemand retail $49; confirm client rate w/ LabCorp rep'),
    ('Leptin','146712',4500,'ESTIMATE client ~$45 (frozen send-out ELISA); OnDemand retail $79; confirm client rate w/ LabCorp rep')
  ) AS v(name, code, est_cost, note)
  WHERE t.name = v.name;
END $$;
