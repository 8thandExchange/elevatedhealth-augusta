-- SOAP notes: allow all clinical staff (incl. provider) without requiring a past visit.
-- Add templates for peptide, IV, metabolic, and general wellness service lines.

BEGIN;

DROP POLICY IF EXISTS "soap_notes_provider_select_own_treated" ON public.soap_notes;
DROP POLICY IF EXISTS "soap_notes_provider_insert_own_treated" ON public.soap_notes;
DROP POLICY IF EXISTS "soap_notes_provider_update_own_treated" ON public.soap_notes;

DROP POLICY IF EXISTS "Staff and admins can read SOAP notes" ON public.soap_notes;
CREATE POLICY "Clinical staff can read SOAP notes"
  ON public.soap_notes
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
  );

DROP POLICY IF EXISTS "Staff and admins can insert SOAP notes" ON public.soap_notes;
CREATE POLICY "Clinical staff can insert SOAP notes"
  ON public.soap_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
  );

DROP POLICY IF EXISTS "Staff and admins can update SOAP notes" ON public.soap_notes;
CREATE POLICY "Clinical staff can update SOAP notes"
  ON public.soap_notes
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
    OR public.has_role(auth.uid(), 'provider'::public.app_role)
  );

-- Seed templates for active EHA service lines (skip if name already exists).
INSERT INTO public.soap_templates (name, service_line, encounter_type, is_default, template_data)
SELECT v.name, v.service_line, v.encounter_type, true, v.template_data::jsonb
FROM (VALUES
  (
    'Peptide Initial Evaluation',
    'peptide',
    'initial',
    '{
      "subjective": {"chief_complaint": "", "goals": "", "prior_peptide_use": "", "current_medications": "", "contraindications_reviewed": "", "review_of_systems": ""},
      "objective": {"physical_exam": "", "lab_review": "", "weight": null, "blood_pressure": ""},
      "assessment": {"primary_diagnosis": "", "clinical_impression": "", "candidacy": ""},
      "plan": {"stack_or_peptide": "", "dosing": "", "consent_documented": "", "monitoring_schedule": "", "follow_up": ""}
    }'
  ),
  (
    'Peptide Follow-Up',
    'peptide',
    'follow_up',
    '{
      "subjective": {"symptom_changes": "", "side_effects": "", "adherence": "", "current_medications": ""},
      "objective": {"lab_review": "", "weight": null, "blood_pressure": ""},
      "assessment": {"treatment_response": "", "clinical_impression": ""},
      "plan": {"dose_adjustment": "", "protocol_changes": "", "lab_recheck_date": "", "follow_up": ""}
    }'
  ),
  (
    'IV Therapy Initial / Visit',
    'iv_therapy',
    'initial',
    '{
      "subjective": {"chief_complaint": "", "hydration_goals": "", "allergies_reviewed": "", "current_medications": ""},
      "objective": {"vitals_stable": true, "iv_access": "", "pre_infusion_assessment": ""},
      "assessment": {"clinical_impression": "", "protocol_appropriate": ""},
      "plan": {"iv_formula": "", "rate_and_volume": "", "post_infusion_instructions": "", "follow_up": ""}
    }'
  ),
  (
    'IV Therapy Follow-Up',
    'iv_therapy',
    'follow_up',
    '{
      "subjective": {"symptom_changes": "", "tolerance": "", "adverse_reactions": ""},
      "objective": {"vitals_stable": true, "exam_findings": ""},
      "assessment": {"treatment_response": "", "clinical_impression": ""},
      "plan": {"continue_protocol": true, "formula_adjustment": "", "follow_up": ""}
    }'
  ),
  (
    'Metabolic Recomposition Initial',
    'metabolic',
    'initial',
    '{
      "subjective": {"chief_complaint": "", "weight_history": "", "body_composition_goals": "", "exercise_habits": "", "current_medications": "", "review_of_systems": ""},
      "objective": {"weight": null, "bmi": null, "blood_pressure": "", "lab_review": "", "body_composition": ""},
      "assessment": {"primary_diagnosis": "", "metabolic_risk": "", "clinical_impression": ""},
      "plan": {"stack_phase": "", "medication_plan": "", "lifestyle_plan": "", "monitoring_schedule": "", "follow_up": ""}
    }'
  ),
  (
    'Metabolic Recomposition Follow-Up',
    'metabolic',
    'follow_up',
    '{
      "subjective": {"weight_change": "", "side_effects": "", "adherence": "", "energy_level": ""},
      "objective": {"weight": null, "bmi": null, "lab_review": ""},
      "assessment": {"treatment_response": "", "clinical_impression": ""},
      "plan": {"phase_adjustment": "", "dose_adjustment": "", "follow_up": ""}
    }'
  ),
  (
    'General Wellness Initial',
    'general',
    'initial',
    '{
      "subjective": {"chief_complaint": "", "goals": "", "current_medications": "", "review_of_systems": ""},
      "objective": {"physical_exam": "", "lab_review": "", "vitals": ""},
      "assessment": {"primary_diagnosis": "", "clinical_impression": ""},
      "plan": {"recommendations": "", "follow_up": ""}
    }'
  ),
  (
    'General Wellness Follow-Up',
    'general',
    'follow_up',
    '{
      "subjective": {"symptom_changes": "", "goal_progress": "", "current_medications": ""},
      "objective": {"exam_findings": "", "lab_review": ""},
      "assessment": {"clinical_impression": ""},
      "plan": {"plan_updates": "", "follow_up": ""}
    }'
  )
) AS v(name, service_line, encounter_type, template_data)
WHERE NOT EXISTS (
  SELECT 1 FROM public.soap_templates t
  WHERE t.service_line = v.service_line
    AND t.encounter_type = v.encounter_type
    AND t.is_default = true
);

COMMIT;
