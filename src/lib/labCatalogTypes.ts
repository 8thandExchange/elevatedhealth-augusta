/** Extended lab_tests row after migration 20260616190000 */
import type { Tables } from "@/integrations/supabase/types";

export type LabTestRow = Tables<"lab_tests"> & {
  also_called?: string | null;
  what_it_checks?: string | null;
  when_we_order_it?: string | null;
  specimen_or_tube?: string | null;
  labcorp_test_code?: string | null;
  cpt_or_order_code?: string | null;
  eha_cost_cents?: number | null;
  labcorp_bundle_notes?: string | null;
  internal_notes?: string | null;
};

export type LabPanelRow = Tables<"lab_panels">;

export type PanelTestJoin = {
  panel_id: string;
  test_id: string;
  display_order: number;
  lab_panels: LabPanelRow;
};

export const LAB_TEST_EDIT_FIELDS = [
  "labcorp_test_code",
  "cpt_or_order_code",
  "eha_cost_cents",
  "non_member_price_cents",
  "labcorp_bundle_notes",
  "internal_notes",
] as const;
