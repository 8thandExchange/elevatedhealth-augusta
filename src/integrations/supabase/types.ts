export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activation_links: {
        Row: {
          activated_at: string | null
          addon_tier: string
          base_membership: string
          created_at: string
          id: string
          patient_email: string
          patient_id: string | null
          patient_name: string
          patient_phone: string | null
          sent_at: string
          status: string
          stripe_checkout_url: string
          total_monthly: number
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          addon_tier?: string
          base_membership?: string
          created_at?: string
          id?: string
          patient_email: string
          patient_id?: string | null
          patient_name: string
          patient_phone?: string | null
          sent_at?: string
          status?: string
          stripe_checkout_url: string
          total_monthly: number
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          addon_tier?: string
          base_membership?: string
          created_at?: string
          id?: string
          patient_email?: string
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string | null
          sent_at?: string
          status?: string
          stripe_checkout_url?: string
          total_monthly?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activation_links_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_type: string
          booked_by_user_id: string | null
          booking_source: string
          check_in_at: string | null
          check_out_at: string | null
          consultation_booking_id: string | null
          created_at: string
          duration_minutes: number
          id: string
          intake_reminder_sent_at: string | null
          is_telehealth: boolean | null
          iv_drip_booking_id: string | null
          notes: string | null
          patient_id: string
          pre_visit_summary: string | null
          provider_id: string | null
          reason: string | null
          reminder_2h_sent_at: string | null
          reminder_sent_at: string | null
          room: string | null
          room_id: string | null
          scheduled_at: string
          service_line: string
          status: string
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          appointment_type?: string
          booked_by_user_id?: string | null
          booking_source?: string
          check_in_at?: string | null
          check_out_at?: string | null
          consultation_booking_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          intake_reminder_sent_at?: string | null
          is_telehealth?: boolean | null
          iv_drip_booking_id?: string | null
          notes?: string | null
          patient_id: string
          pre_visit_summary?: string | null
          provider_id?: string | null
          reason?: string | null
          reminder_2h_sent_at?: string | null
          reminder_sent_at?: string | null
          room?: string | null
          room_id?: string | null
          scheduled_at: string
          service_line?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          appointment_type?: string
          booked_by_user_id?: string | null
          booking_source?: string
          check_in_at?: string | null
          check_out_at?: string | null
          consultation_booking_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          intake_reminder_sent_at?: string | null
          is_telehealth?: boolean | null
          iv_drip_booking_id?: string | null
          notes?: string | null
          patient_id?: string
          pre_visit_summary?: string | null
          provider_id?: string | null
          reason?: string | null
          reminder_2h_sent_at?: string | null
          reminder_sent_at?: string | null
          room?: string | null
          room_id?: string | null
          scheduled_at?: string
          service_line?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_utilization"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          id: string
          new_role: string | null
          occurred_at: string
          old_role: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          id?: string
          new_role?: string | null
          occurred_at?: string
          old_role?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          id?: string
          new_role?: string | null
          occurred_at?: string
          old_role?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      booking_limits: {
        Row: {
          active: boolean
          applies_to_room_types: string[] | null
          created_at: string
          day_of_week: number | null
          effective_from: string | null
          effective_until: string | null
          end_time: string | null
          id: string
          max_concurrent: number
          name: string
          service_line: string | null
          start_time: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          applies_to_room_types?: string[] | null
          created_at?: string
          day_of_week?: number | null
          effective_from?: string | null
          effective_until?: string | null
          end_time?: string | null
          id?: string
          max_concurrent: number
          name: string
          service_line?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          applies_to_room_types?: string[] | null
          created_at?: string
          day_of_week?: number | null
          effective_from?: string | null
          effective_until?: string | null
          end_time?: string | null
          id?: string
          max_concurrent?: number
          name?: string
          service_line?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      catalog_reconciliation_log: {
        Row: {
          created_at: string
          id: string
          issue_type: string
          notes: string | null
          service_id: string | null
          service_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_type: string
          notes?: string | null
          service_id?: string | null
          service_name: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_type?: string
          notes?: string | null
          service_id?: string | null
          service_name?: string
        }
        Relationships: []
      }
      cds_assessment_results: {
        Row: {
          assessment_id: string
          blocked_reason: string | null
          candidate_id: string | null
          candidate_key: string
          display_name: string
          engine_version: string | null
          gate_state: string
          id: string
          metadata: Json
          rank_score: number | null
          regulatory_status: string
          requires_labs: boolean
          surfaced_at: string
        }
        Insert: {
          assessment_id: string
          blocked_reason?: string | null
          candidate_id?: string | null
          candidate_key: string
          display_name: string
          engine_version?: string | null
          gate_state: string
          id?: string
          metadata?: Json
          rank_score?: number | null
          regulatory_status: string
          requires_labs?: boolean
          surfaced_at?: string
        }
        Update: {
          assessment_id?: string
          blocked_reason?: string | null
          candidate_id?: string | null
          candidate_key?: string
          display_name?: string
          engine_version?: string | null
          gate_state?: string
          id?: string
          metadata?: Json
          rank_score?: number | null
          regulatory_status?: string
          requires_labs?: boolean
          surfaced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cds_assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "cds_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cds_assessment_results_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "cds_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      cds_assessments: {
        Row: {
          created_at: string
          created_by: string | null
          encounter_id: string | null
          goal_key: string | null
          id: string
          intake_metadata: Json
          notes: string | null
          pathway_id: string | null
          patient_id: string
          source: string
          status: string
          symptoms_selected: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          encounter_id?: string | null
          goal_key?: string | null
          id?: string
          intake_metadata?: Json
          notes?: string | null
          pathway_id?: string | null
          patient_id: string
          source?: string
          status?: string
          symptoms_selected?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          encounter_id?: string | null
          goal_key?: string | null
          id?: string
          intake_metadata?: Json
          notes?: string | null
          pathway_id?: string | null
          patient_id?: string
          source?: string
          status?: string
          symptoms_selected?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cds_assessments_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "patient_encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cds_assessments_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "cds_pathways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cds_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      cds_candidates: {
        Row: {
          active: boolean
          candidate_key: string
          clinical_rationale: string | null
          contraindication_tags: string[]
          created_at: string
          display_name: string
          id: string
          is_sample: boolean
          pathway_id: string | null
          rank_weight: number
          regulatory_status: string
          required_consent_types: string[]
          required_lab_slugs: string[]
          requires_labs: boolean
          signed_off_at: string | null
          signed_off_by: string | null
          therapy_ref_id: string | null
          therapy_ref_type: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          candidate_key: string
          clinical_rationale?: string | null
          contraindication_tags?: string[]
          created_at?: string
          display_name: string
          id?: string
          is_sample?: boolean
          pathway_id?: string | null
          rank_weight?: number
          regulatory_status: string
          required_consent_types?: string[]
          required_lab_slugs?: string[]
          requires_labs?: boolean
          signed_off_at?: string | null
          signed_off_by?: string | null
          therapy_ref_id?: string | null
          therapy_ref_type?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          candidate_key?: string
          clinical_rationale?: string | null
          contraindication_tags?: string[]
          created_at?: string
          display_name?: string
          id?: string
          is_sample?: boolean
          pathway_id?: string | null
          rank_weight?: number
          regulatory_status?: string
          required_consent_types?: string[]
          required_lab_slugs?: string[]
          requires_labs?: boolean
          signed_off_at?: string | null
          signed_off_by?: string | null
          therapy_ref_id?: string | null
          therapy_ref_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cds_candidates_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "cds_pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      cds_pathway_lab_triggers: {
        Row: {
          analyte_key: string
          comparator: string
          created_at: string
          id: string
          is_sample: boolean
          pathway_id: string
          threshold_high: number | null
          threshold_low: number | null
          unit: string | null
        }
        Insert: {
          analyte_key: string
          comparator: string
          created_at?: string
          id?: string
          is_sample?: boolean
          pathway_id: string
          threshold_high?: number | null
          threshold_low?: number | null
          unit?: string | null
        }
        Update: {
          analyte_key?: string
          comparator?: string
          created_at?: string
          id?: string
          is_sample?: boolean
          pathway_id?: string
          threshold_high?: number | null
          threshold_low?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cds_pathway_lab_triggers_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "cds_pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      cds_pathway_symptoms: {
        Row: {
          created_at: string
          id: string
          is_sample: boolean
          pathway_id: string
          symptom_key: string
          symptom_label: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_sample?: boolean
          pathway_id: string
          symptom_key: string
          symptom_label: string
          weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_sample?: boolean
          pathway_id?: string
          symptom_key?: string
          symptom_label?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "cds_pathway_symptoms_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "cds_pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      cds_pathways: {
        Row: {
          active: boolean
          authored_by: string | null
          created_at: string
          description: string | null
          elevated_program_key: string | null
          goal_key: string
          id: string
          is_sample: boolean
          name: string
          recommended_lab_slug: string | null
          signed_off_at: string | null
          signed_off_by: string | null
          slug: string
          staff_redirect_notes: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          authored_by?: string | null
          created_at?: string
          description?: string | null
          elevated_program_key?: string | null
          goal_key: string
          id?: string
          is_sample?: boolean
          name: string
          recommended_lab_slug?: string | null
          signed_off_at?: string | null
          signed_off_by?: string | null
          slug: string
          staff_redirect_notes?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          authored_by?: string | null
          created_at?: string
          description?: string | null
          elevated_program_key?: string | null
          goal_key?: string
          id?: string
          is_sample?: boolean
          name?: string
          recommended_lab_slug?: string | null
          signed_off_at?: string | null
          signed_off_by?: string | null
          slug?: string
          staff_redirect_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cds_provider_review: {
        Row: {
          assessment_id: string
          created_at: string
          decision: string
          id: string
          modified_payload: Json | null
          notes: string | null
          prescriber_id: string
          updated_at: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          decision: string
          id?: string
          modified_payload?: Json | null
          notes?: string | null
          prescriber_id: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          decision?: string
          id?: string
          modified_payload?: Json | null
          notes?: string | null
          prescriber_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cds_provider_review_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: true
            referencedRelation: "cds_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_leads: {
        Row: {
          chat_summary: string | null
          created_at: string
          email: string | null
          id: string
          interest: string | null
          name: string | null
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          chat_summary?: string | null
          created_at?: string
          email?: string | null
          id?: string
          interest?: string | null
          name?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          chat_summary?: string | null
          created_at?: string
          email?: string | null
          id?: string
          interest?: string | null
          name?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clinic_formulary: {
        Row: {
          alternate_supplier: string | null
          alternate_supplier_cost_cents: number | null
          billing_unit: string
          category: string
          client_price_cents: number | null
          client_price_member_cents: number | null
          created_at: string
          display_name: string
          dose_notes: string | null
          dose_strength: string | null
          fulfillment_pharmacy_slug: string | null
          id: string
          internal_notes: string | null
          inventory_sku_id: string | null
          is_active: boolean
          item_code: string
          iv_addon_id: string | null
          sort_order: number
          stripe_price_id: string | null
          supplier: string
          supplier_cost_cents: number | null
          supplier_cost_unit: string | null
          supplier_sku: string | null
          tracks_inventory: boolean
          updated_at: string
        }
        Insert: {
          alternate_supplier?: string | null
          alternate_supplier_cost_cents?: number | null
          billing_unit?: string
          category: string
          client_price_cents?: number | null
          client_price_member_cents?: number | null
          created_at?: string
          display_name: string
          dose_notes?: string | null
          dose_strength?: string | null
          fulfillment_pharmacy_slug?: string | null
          id?: string
          internal_notes?: string | null
          inventory_sku_id?: string | null
          is_active?: boolean
          item_code: string
          iv_addon_id?: string | null
          sort_order?: number
          stripe_price_id?: string | null
          supplier: string
          supplier_cost_cents?: number | null
          supplier_cost_unit?: string | null
          supplier_sku?: string | null
          tracks_inventory?: boolean
          updated_at?: string
        }
        Update: {
          alternate_supplier?: string | null
          alternate_supplier_cost_cents?: number | null
          billing_unit?: string
          category?: string
          client_price_cents?: number | null
          client_price_member_cents?: number | null
          created_at?: string
          display_name?: string
          dose_notes?: string | null
          dose_strength?: string | null
          fulfillment_pharmacy_slug?: string | null
          id?: string
          internal_notes?: string | null
          inventory_sku_id?: string | null
          is_active?: boolean
          item_code?: string
          iv_addon_id?: string | null
          sort_order?: number
          stripe_price_id?: string | null
          supplier?: string
          supplier_cost_cents?: number | null
          supplier_cost_unit?: string | null
          supplier_sku?: string | null
          tracks_inventory?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_formulary_inventory_sku_id_fkey"
            columns: ["inventory_sku_id"]
            isOneToOne: false
            referencedRelation: "inventory_skus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_formulary_iv_addon_id_fkey"
            columns: ["iv_addon_id"]
            isOneToOne: false
            referencedRelation: "iv_addons"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      clinical_formulary_items: {
        Row: {
          active: boolean
          category: string
          clinic_cost_cents: number | null
          clinical_status: string
          consent_type: string | null
          created_at: string
          display_name: string
          dosage_form: string | null
          id: string
          inventory_required: boolean
          lab_panel: string | null
          last_reviewed_at: string | null
          member_price_cents: number | null
          patient_price_cents: number | null
          provider_algorithm: Json | null
          public_description: string
          public_status: string
          regulatory_notes: string | null
          requires_consent: boolean
          requires_labs: boolean
          requires_provider_signoff: boolean
          reviewed_by: string | null
          route: string | null
          slug: string
          staff_description: string
          supplier: string | null
          supplier_sku: string | null
          supply_checklist_key: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          clinic_cost_cents?: number | null
          clinical_status?: string
          consent_type?: string | null
          created_at?: string
          display_name: string
          dosage_form?: string | null
          id?: string
          inventory_required?: boolean
          lab_panel?: string | null
          last_reviewed_at?: string | null
          member_price_cents?: number | null
          patient_price_cents?: number | null
          provider_algorithm?: Json | null
          public_description?: string
          public_status?: string
          regulatory_notes?: string | null
          requires_consent?: boolean
          requires_labs?: boolean
          requires_provider_signoff?: boolean
          reviewed_by?: string | null
          route?: string | null
          slug: string
          staff_description?: string
          supplier?: string | null
          supplier_sku?: string | null
          supply_checklist_key?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          clinic_cost_cents?: number | null
          clinical_status?: string
          consent_type?: string | null
          created_at?: string
          display_name?: string
          dosage_form?: string | null
          id?: string
          inventory_required?: boolean
          lab_panel?: string | null
          last_reviewed_at?: string | null
          member_price_cents?: number | null
          patient_price_cents?: number | null
          provider_algorithm?: Json | null
          public_description?: string
          public_status?: string
          regulatory_notes?: string | null
          requires_consent?: boolean
          requires_labs?: boolean
          requires_provider_signoff?: boolean
          reviewed_by?: string | null
          route?: string | null
          slug?: string
          staff_description?: string
          supplier?: string | null
          supplier_sku?: string | null
          supply_checklist_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clinical_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_private: boolean | null
          note_type: string
          patient_id: string | null
          provider_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          note_type?: string
          patient_id?: string | null
          provider_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          note_type?: string
          patient_id?: string | null
          provider_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_policy_items: {
        Row: {
          active: boolean
          allowed_vendor_slugs: string[]
          category: string | null
          contraindication_tags: string[]
          created_at: string
          display_name: string
          eha_status: string
          id: string
          is_sample: boolean
          item_key: string
          last_reviewed_at: string | null
          monitoring_lab_slugs: string[]
          next_review_at: string | null
          notes: string | null
          policy_owner: string | null
          regulatory_tier: string
          required_consents: string[]
          required_lab_slugs: string[]
          signed_off_at: string | null
          signed_off_by: string | null
          signed_protocol_version_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          allowed_vendor_slugs?: string[]
          category?: string | null
          contraindication_tags?: string[]
          created_at?: string
          display_name: string
          eha_status: string
          id?: string
          is_sample?: boolean
          item_key: string
          last_reviewed_at?: string | null
          monitoring_lab_slugs?: string[]
          next_review_at?: string | null
          notes?: string | null
          policy_owner?: string | null
          regulatory_tier: string
          required_consents?: string[]
          required_lab_slugs?: string[]
          signed_off_at?: string | null
          signed_off_by?: string | null
          signed_protocol_version_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          allowed_vendor_slugs?: string[]
          category?: string | null
          contraindication_tags?: string[]
          created_at?: string
          display_name?: string
          eha_status?: string
          id?: string
          is_sample?: boolean
          item_key?: string
          last_reviewed_at?: string | null
          monitoring_lab_slugs?: string[]
          next_review_at?: string | null
          notes?: string | null
          policy_owner?: string | null
          regulatory_tier?: string
          required_consents?: string[]
          required_lab_slugs?: string[]
          signed_off_at?: string | null
          signed_off_by?: string | null
          signed_protocol_version_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_policy_items_signed_protocol_version_id_fkey"
            columns: ["signed_protocol_version_id"]
            isOneToOne: false
            referencedRelation: "clinical_protocol_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_protocol_executions: {
        Row: {
          adverse_event_flagged: boolean
          appointment_id: string | null
          created_at: string
          executed_at: string
          executed_by: string
          id: string
          notes: string | null
          patient_id: string
          protocol_version_id: string
        }
        Insert: {
          adverse_event_flagged?: boolean
          appointment_id?: string | null
          created_at?: string
          executed_at?: string
          executed_by: string
          id?: string
          notes?: string | null
          patient_id: string
          protocol_version_id: string
        }
        Update: {
          adverse_event_flagged?: boolean
          appointment_id?: string | null
          created_at?: string
          executed_at?: string
          executed_by?: string
          id?: string
          notes?: string | null
          patient_id?: string
          protocol_version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_protocol_executions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_protocol_executions_protocol_version_id_fkey"
            columns: ["protocol_version_id"]
            isOneToOne: false
            referencedRelation: "clinical_protocol_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_protocol_versions: {
        Row: {
          authored_by: string | null
          body_markdown: string
          body_structured: Json
          created_at: string
          id: string
          notes_for_reviewer: Json
          protocol_id: string
          retired_at: string | null
          signature_hash: string | null
          signed_at: string | null
          signed_by: string | null
          status: string
          updated_at: string
          version_number: number
        }
        Insert: {
          authored_by?: string | null
          body_markdown: string
          body_structured?: Json
          created_at?: string
          id?: string
          notes_for_reviewer?: Json
          protocol_id: string
          retired_at?: string | null
          signature_hash?: string | null
          signed_at?: string | null
          signed_by?: string | null
          status?: string
          updated_at?: string
          version_number: number
        }
        Update: {
          authored_by?: string | null
          body_markdown?: string
          body_structured?: Json
          created_at?: string
          id?: string
          notes_for_reviewer?: Json
          protocol_id?: string
          retired_at?: string | null
          signature_hash?: string | null
          signed_at?: string | null
          signed_by?: string | null
          status?: string
          updated_at?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "clinical_protocol_versions_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "clinical_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_protocols: {
        Row: {
          category: string
          created_at: string
          current_version_id: string | null
          id: string
          is_active: boolean
          service_type: string[]
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          current_version_id?: string | null
          id?: string
          is_active?: boolean
          service_type?: string[]
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          current_version_id?: string | null
          id?: string
          is_active?: boolean
          service_type?: string[]
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_protocols_current_version_fkey"
            columns: ["current_version_id"]
            isOneToOne: false
            referencedRelation: "clinical_protocol_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_logs: {
        Row: {
          body_preview: string | null
          delivery_method: string
          id: string
          patient_id: string
          sent_at: string
          sent_by: string | null
          status: string
          subject: string | null
          template_key: string | null
        }
        Insert: {
          body_preview?: string | null
          delivery_method?: string
          id?: string
          patient_id: string
          sent_at?: string
          sent_by?: string | null
          status?: string
          subject?: string | null
          template_key?: string | null
        }
        Update: {
          body_preview?: string | null
          delivery_method?: string
          id?: string
          patient_id?: string
          sent_at?: string
          sent_by?: string | null
          status?: string
          subject?: string | null
          template_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_acknowledgments: {
        Row: {
          acknowledged_at: string
          acknowledged_ip: string
          acknowledged_user_agent: string
          acknowledgment_text: string
          acknowledgment_type: string
          created_at: string
          id: string
          parent_consent_record_id: string
          patient_id: string
          substance_added: string | null
        }
        Insert: {
          acknowledged_at?: string
          acknowledged_ip: string
          acknowledged_user_agent: string
          acknowledgment_text: string
          acknowledgment_type: string
          created_at?: string
          id?: string
          parent_consent_record_id: string
          patient_id: string
          substance_added?: string | null
        }
        Update: {
          acknowledged_at?: string
          acknowledged_ip?: string
          acknowledged_user_agent?: string
          acknowledgment_text?: string
          acknowledgment_type?: string
          created_at?: string
          id?: string
          parent_consent_record_id?: string
          patient_id?: string
          substance_added?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_acknowledgments_parent_consent_record_id_fkey"
            columns: ["parent_consent_record_id"]
            isOneToOne: false
            referencedRelation: "consent_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_acknowledgments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_expiration_reminders_sent: {
        Row: {
          channels_delivered: string[]
          consent_record_id: string
          id: string
          reminder_window: string
          sent_at: string
        }
        Insert: {
          channels_delivered?: string[]
          consent_record_id: string
          id?: string
          reminder_window: string
          sent_at?: string
        }
        Update: {
          channels_delivered?: string[]
          consent_record_id?: string
          id?: string
          reminder_window?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_expiration_reminders_sent_consent_record_id_fkey"
            columns: ["consent_record_id"]
            isOneToOne: false
            referencedRelation: "consent_records"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_overrides: {
        Row: {
          consent_record_id: string
          created_at: string
          id: string
          override_reason: string
          override_reason_category: string
          patient_id: string
          patient_identity_verification_method: string
          staff_attestation: string
          staff_member_user_id: string
          witness_staff_user_id: string | null
        }
        Insert: {
          consent_record_id: string
          created_at?: string
          id?: string
          override_reason: string
          override_reason_category: string
          patient_id: string
          patient_identity_verification_method: string
          staff_attestation: string
          staff_member_user_id: string
          witness_staff_user_id?: string | null
        }
        Update: {
          consent_record_id?: string
          created_at?: string
          id?: string
          override_reason?: string
          override_reason_category?: string
          patient_id?: string
          patient_identity_verification_method?: string
          staff_attestation?: string
          staff_member_user_id?: string
          witness_staff_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_overrides_consent_record_id_fkey"
            columns: ["consent_record_id"]
            isOneToOne: false
            referencedRelation: "consent_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_overrides_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_reconsent_reminders_sent: {
        Row: {
          channels_delivered: string[]
          id: string
          reconsent_request_id: string
          reminder_window: string
          sent_at: string
        }
        Insert: {
          channels_delivered?: string[]
          id?: string
          reconsent_request_id: string
          reminder_window: string
          sent_at?: string
        }
        Update: {
          channels_delivered?: string[]
          id?: string
          reconsent_request_id?: string
          reminder_window?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_reconsent_reminders_sent_reconsent_request_id_fkey"
            columns: ["reconsent_request_id"]
            isOneToOne: false
            referencedRelation: "consent_reconsent_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_reconsent_requests: {
        Row: {
          consent_type: string
          fulfilled_at: string | null
          fulfilled_consent_record_id: string | null
          id: string
          new_version_id: string
          patient_id: string
          prior_consent_record_id: string
          prior_version_id: string
          reconsent_deadline: string
          reminders_sent_at: Json
          triggered_at: string
        }
        Insert: {
          consent_type: string
          fulfilled_at?: string | null
          fulfilled_consent_record_id?: string | null
          id?: string
          new_version_id: string
          patient_id: string
          prior_consent_record_id: string
          prior_version_id: string
          reconsent_deadline: string
          reminders_sent_at?: Json
          triggered_at?: string
        }
        Update: {
          consent_type?: string
          fulfilled_at?: string | null
          fulfilled_consent_record_id?: string | null
          id?: string
          new_version_id?: string
          patient_id?: string
          prior_consent_record_id?: string
          prior_version_id?: string
          reconsent_deadline?: string
          reminders_sent_at?: Json
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_reconsent_requests_fulfilled_consent_record_id_fkey"
            columns: ["fulfilled_consent_record_id"]
            isOneToOne: false
            referencedRelation: "consent_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_reconsent_requests_new_version_id_fkey"
            columns: ["new_version_id"]
            isOneToOne: false
            referencedRelation: "consent_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_reconsent_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_reconsent_requests_prior_consent_record_id_fkey"
            columns: ["prior_consent_record_id"]
            isOneToOne: false
            referencedRelation: "consent_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_reconsent_requests_prior_version_id_fkey"
            columns: ["prior_version_id"]
            isOneToOne: false
            referencedRelation: "consent_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          consent_type: string
          consent_version_id: string
          created_at: string
          document_text_hash: string
          expires_at: string
          id: string
          patient_id: string
          pdf_storage_path: string | null
          revoked_at: string | null
          section_attestations: Json | null
          signed_at: string
          signed_ip: string
          signed_session_id: string | null
          signed_typed_name: string
          signed_user_agent: string
          signing_method: string
          staff_witness_user_id: string | null
          superseded_by_consent_id: string | null
          updated_at: string
        }
        Insert: {
          consent_type: string
          consent_version_id: string
          created_at?: string
          document_text_hash: string
          expires_at: string
          id?: string
          patient_id: string
          pdf_storage_path?: string | null
          revoked_at?: string | null
          section_attestations?: Json | null
          signed_at?: string
          signed_ip: string
          signed_session_id?: string | null
          signed_typed_name: string
          signed_user_agent: string
          signing_method?: string
          staff_witness_user_id?: string | null
          superseded_by_consent_id?: string | null
          updated_at?: string
        }
        Update: {
          consent_type?: string
          consent_version_id?: string
          created_at?: string
          document_text_hash?: string
          expires_at?: string
          id?: string
          patient_id?: string
          pdf_storage_path?: string | null
          revoked_at?: string | null
          section_attestations?: Json | null
          signed_at?: string
          signed_ip?: string
          signed_session_id?: string | null
          signed_typed_name?: string
          signed_user_agent?: string
          signing_method?: string
          staff_witness_user_id?: string | null
          superseded_by_consent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_consent_version_id_fkey"
            columns: ["consent_version_id"]
            isOneToOne: false
            referencedRelation: "consent_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_records_superseded_by_consent_id_fkey"
            columns: ["superseded_by_consent_id"]
            isOneToOne: false
            referencedRelation: "consent_records"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_versions: {
        Row: {
          body_hash: string
          body_markdown: string
          changelog_notes: string | null
          consent_type: string
          created_at: string
          effective_from: string
          effective_to: string | null
          force_re_consent_required: boolean
          id: string
          is_active: boolean
          legal_review_notes: string | null
          legal_review_status: string | null
          title: string
          updated_at: string
          version_label: string
        }
        Insert: {
          body_hash: string
          body_markdown: string
          changelog_notes?: string | null
          consent_type: string
          created_at?: string
          effective_from: string
          effective_to?: string | null
          force_re_consent_required?: boolean
          id?: string
          is_active?: boolean
          legal_review_notes?: string | null
          legal_review_status?: string | null
          title: string
          updated_at?: string
          version_label: string
        }
        Update: {
          body_hash?: string
          body_markdown?: string
          changelog_notes?: string | null
          consent_type?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          force_re_consent_required?: boolean
          id?: string
          is_active?: boolean
          legal_review_notes?: string | null
          legal_review_status?: string | null
          title?: string
          updated_at?: string
          version_label?: string
        }
        Relationships: []
      }
      consult_prequal_sessions: {
        Row: {
          block_reasons: string[] | null
          checkout_token: string | null
          checkout_token_expires_at: string | null
          consent_payload: Json | null
          consents_completed_at: string | null
          consumed_at: string | null
          created_at: string
          dob: string
          email: string
          full_name: string
          gender: string | null
          id: string
          patient_id: string | null
          phone: string | null
          screening_answers: Json
          screening_result: string
          stripe_session_id: string | null
          updated_at: string
          visit_reasons: string[]
        }
        Insert: {
          block_reasons?: string[] | null
          checkout_token?: string | null
          checkout_token_expires_at?: string | null
          consent_payload?: Json | null
          consents_completed_at?: string | null
          consumed_at?: string | null
          created_at?: string
          dob: string
          email: string
          full_name: string
          gender?: string | null
          id?: string
          patient_id?: string | null
          phone?: string | null
          screening_answers?: Json
          screening_result: string
          stripe_session_id?: string | null
          updated_at?: string
          visit_reasons?: string[]
        }
        Update: {
          block_reasons?: string[] | null
          checkout_token?: string | null
          checkout_token_expires_at?: string | null
          consent_payload?: Json | null
          consents_completed_at?: string | null
          consumed_at?: string | null
          created_at?: string
          dob?: string
          email?: string
          full_name?: string
          gender?: string | null
          id?: string
          patient_id?: string | null
          phone?: string | null
          screening_answers?: Json
          screening_result?: string
          stripe_session_id?: string | null
          updated_at?: string
          visit_reasons?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "consult_prequal_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_bookings: {
        Row: {
          amount_paid: number | null
          booked_by_user_id: string | null
          booked_for: string | null
          booking_reminder_sent_at: string | null
          booking_source: string
          calendar_booked_at: string | null
          created_at: string
          credit_code: string | null
          credit_used_at: string | null
          customer_email: string
          customer_name: string | null
          customer_phone: string | null
          follow_up_date: string | null
          followup_sent_at: string | null
          id: string
          notes: string | null
          service_type: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          booked_by_user_id?: string | null
          booked_for?: string | null
          booking_reminder_sent_at?: string | null
          booking_source?: string
          calendar_booked_at?: string | null
          created_at?: string
          credit_code?: string | null
          credit_used_at?: string | null
          customer_email: string
          customer_name?: string | null
          customer_phone?: string | null
          follow_up_date?: string | null
          followup_sent_at?: string | null
          id?: string
          notes?: string | null
          service_type?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          booked_by_user_id?: string | null
          booked_for?: string | null
          booking_reminder_sent_at?: string | null
          booking_source?: string
          calendar_booked_at?: string | null
          created_at?: string
          credit_code?: string | null
          credit_used_at?: string | null
          customer_email?: string
          customer_name?: string | null
          customer_phone?: string | null
          follow_up_date?: string | null
          followup_sent_at?: string | null
          id?: string
          notes?: string | null
          service_type?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean | null
          last_message_at: string | null
          patient_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          patient_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          patient_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      cpt_codes: {
        Row: {
          code: string
          created_at: string | null
          default_charge: number | null
          description: string
          id: string
          panel_group: string | null
          quantity: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          default_charge?: number | null
          description: string
          id?: string
          panel_group?: string | null
          quantity?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          default_charge?: number | null
          description?: string
          id?: string
          panel_group?: string | null
          quantity?: number | null
        }
        Relationships: []
      }
      elevated_architecture_payments: {
        Row: {
          amount_paid: number | null
          created_at: string
          customer_email: string
          customer_name: string | null
          id: string
          kit_status: string
          patient_id: string | null
          payment_status: string
          results_ready_at: string | null
          sample_received_at: string | null
          shipped_at: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          customer_email: string
          customer_name?: string | null
          id?: string
          kit_status?: string
          patient_id?: string | null
          payment_status?: string
          results_ready_at?: string | null
          sample_received_at?: string | null
          shipped_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          customer_email?: string
          customer_name?: string | null
          id?: string
          kit_status?: string
          patient_id?: string | null
          payment_status?: string
          results_ready_at?: string | null
          sample_received_at?: string | null
          shipped_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "elevated_architecture_payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      eligibility_review_requests: {
        Row: {
          created_at: string
          flag_reasons: Json
          id: string
          intake_id: string | null
          notes: string | null
          patient_email: string | null
          patient_id: string | null
          patient_name: string
          preferred_callback_window: Database["public"]["Enums"]["callback_window"]
          preferred_phone: string
          resolved_booking_id: string | null
          reviewed_at: string | null
          reviewed_by_user_id: string | null
          status: Database["public"]["Enums"]["eligibility_review_status"]
          treatment_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          flag_reasons?: Json
          id?: string
          intake_id?: string | null
          notes?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name: string
          preferred_callback_window?: Database["public"]["Enums"]["callback_window"]
          preferred_phone: string
          resolved_booking_id?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          status?: Database["public"]["Enums"]["eligibility_review_status"]
          treatment_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          flag_reasons?: Json
          id?: string
          intake_id?: string | null
          notes?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string
          preferred_callback_window?: Database["public"]["Enums"]["callback_window"]
          preferred_phone?: string
          resolved_booking_id?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          status?: Database["public"]["Enums"]["eligibility_review_status"]
          treatment_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eligibility_review_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eligibility_review_requests_resolved_booking_id_fkey"
            columns: ["resolved_booking_id"]
            isOneToOne: false
            referencedRelation: "consultation_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string
          category: string
          created_at: string
          id: string
          is_active: boolean | null
          merge_fields: string[] | null
          name: string
          sms_text: string | null
          subject: string
          template_key: string
          updated_at: string
        }
        Insert: {
          body_html: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          merge_fields?: string[] | null
          name: string
          sms_text?: string | null
          subject: string
          template_key: string
          updated_at?: string
        }
        Update: {
          body_html?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          merge_fields?: string[] | null
          name?: string
          sms_text?: string | null
          subject?: string
          template_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      encounter_attachments: {
        Row: {
          attachment_type: string
          description: string | null
          encounter_id: string | null
          file_name: string
          file_size_bytes: number | null
          id: string
          lab_collection_date: string | null
          mime_type: string | null
          patient_id: string
          storage_path: string
          uploaded_at: string
          uploaded_by_user_id: string
        }
        Insert: {
          attachment_type: string
          description?: string | null
          encounter_id?: string | null
          file_name: string
          file_size_bytes?: number | null
          id?: string
          lab_collection_date?: string | null
          mime_type?: string | null
          patient_id: string
          storage_path: string
          uploaded_at?: string
          uploaded_by_user_id: string
        }
        Update: {
          attachment_type?: string
          description?: string | null
          encounter_id?: string | null
          file_name?: string
          file_size_bytes?: number | null
          id?: string
          lab_collection_date?: string | null
          mime_type?: string | null
          patient_id?: string
          storage_path?: string
          uploaded_at?: string
          uploaded_by_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "encounter_attachments_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "patient_encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encounter_attachments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      encounter_audit_log: {
        Row: {
          action: string
          action_details: Json
          encounter_id: string
          id: string
          ip_address: string | null
          occurred_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          action_details?: Json
          encounter_id: string
          id?: string
          ip_address?: string | null
          occurred_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          action_details?: Json
          encounter_id?: string
          id?: string
          ip_address?: string | null
          occurred_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "encounter_audit_log_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "patient_encounters"
            referencedColumns: ["id"]
          },
        ]
      }
      encounter_forms: {
        Row: {
          check_number: string | null
          cpt_codes: Json
          created_at: string
          date_of_service: string
          follow_up_date: string | null
          id: string
          insurance_type: string | null
          notes: string | null
          patient_id: string | null
          payment_amount: number | null
          payment_method: string | null
          provider_id: string | null
          provider_name: string | null
          sent_to_office_manager_at: string | null
          service_type: string
          total_charges: number | null
        }
        Insert: {
          check_number?: string | null
          cpt_codes?: Json
          created_at?: string
          date_of_service?: string
          follow_up_date?: string | null
          id?: string
          insurance_type?: string | null
          notes?: string | null
          patient_id?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          provider_id?: string | null
          provider_name?: string | null
          sent_to_office_manager_at?: string | null
          service_type: string
          total_charges?: number | null
        }
        Update: {
          check_number?: string | null
          cpt_codes?: Json
          created_at?: string
          date_of_service?: string
          follow_up_date?: string | null
          id?: string
          insurance_type?: string | null
          notes?: string | null
          patient_id?: string | null
          payment_amount?: number | null
          payment_method?: string | null
          provider_id?: string | null
          provider_name?: string | null
          sent_to_office_manager_at?: string | null
          service_type?: string
          total_charges?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "encounter_forms_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      encounter_vitals: {
        Row: {
          bmi: number | null
          diastolic_bp: number | null
          encounter_id: string
          heart_rate: number | null
          height_inches: number | null
          id: string
          recorded_at: string
          recorded_by_user_id: string
          respiratory_rate: number | null
          spo2_pct: number | null
          systolic_bp: number | null
          temperature_f: number | null
          weight_lbs: number | null
        }
        Insert: {
          bmi?: number | null
          diastolic_bp?: number | null
          encounter_id: string
          heart_rate?: number | null
          height_inches?: number | null
          id?: string
          recorded_at?: string
          recorded_by_user_id: string
          respiratory_rate?: number | null
          spo2_pct?: number | null
          systolic_bp?: number | null
          temperature_f?: number | null
          weight_lbs?: number | null
        }
        Update: {
          bmi?: number | null
          diastolic_bp?: number | null
          encounter_id?: string
          heart_rate?: number | null
          height_inches?: number | null
          id?: string
          recorded_at?: string
          recorded_by_user_id?: string
          respiratory_rate?: number | null
          spo2_pct?: number | null
          systolic_bp?: number | null
          temperature_f?: number | null
          weight_lbs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "encounter_vitals_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "patient_encounters"
            referencedColumns: ["id"]
          },
        ]
      }
      formulary_change_log: {
        Row: {
          change_note: string | null
          changed_at: string
          changed_by: string | null
          field_name: string
          formulary_id: string
          id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          change_note?: string | null
          changed_at?: string
          changed_by?: string | null
          field_name: string
          formulary_id: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          change_note?: string | null
          changed_at?: string
          changed_by?: string | null
          field_name?: string
          formulary_id?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formulary_change_log_formulary_id_fkey"
            columns: ["formulary_id"]
            isOneToOne: false
            referencedRelation: "clinic_formulary"
            referencedColumns: ["id"]
          },
        ]
      }
      gfe_clearances: {
        Row: {
          approved_at: string | null
          clearance_source: Database["public"]["Enums"]["gfe_clearance_source"]
          consultation_booking_id: string | null
          created_at: string
          exam_name: string | null
          expires_at: string | null
          id: string
          meeting_url: string | null
          notes: string | null
          patient_id: string
          pdf_storage_path: string | null
          provider_name: string | null
          qualiphy_exam_id: number | null
          qualiphy_meeting_uuid: string | null
          qualiphy_patient_exam_id: string | null
          sent_at: string | null
          sent_by: string | null
          service_category: Database["public"]["Enums"]["gfe_service_category"]
          status: Database["public"]["Enums"]["gfe_clearance_status"]
          updated_at: string
          webhook_payload: Json | null
        }
        Insert: {
          approved_at?: string | null
          clearance_source?: Database["public"]["Enums"]["gfe_clearance_source"]
          consultation_booking_id?: string | null
          created_at?: string
          exam_name?: string | null
          expires_at?: string | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          patient_id: string
          pdf_storage_path?: string | null
          provider_name?: string | null
          qualiphy_exam_id?: number | null
          qualiphy_meeting_uuid?: string | null
          qualiphy_patient_exam_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          service_category?: Database["public"]["Enums"]["gfe_service_category"]
          status?: Database["public"]["Enums"]["gfe_clearance_status"]
          updated_at?: string
          webhook_payload?: Json | null
        }
        Update: {
          approved_at?: string | null
          clearance_source?: Database["public"]["Enums"]["gfe_clearance_source"]
          consultation_booking_id?: string | null
          created_at?: string
          exam_name?: string | null
          expires_at?: string | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          patient_id?: string
          pdf_storage_path?: string | null
          provider_name?: string | null
          qualiphy_exam_id?: number | null
          qualiphy_meeting_uuid?: string | null
          qualiphy_patient_exam_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          service_category?: Database["public"]["Enums"]["gfe_service_category"]
          status?: Database["public"]["Enums"]["gfe_clearance_status"]
          updated_at?: string
          webhook_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "gfe_clearances_consultation_booking_id_fkey"
            columns: ["consultation_booking_id"]
            isOneToOne: false
            referencedRelation: "consultation_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gfe_clearances_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      hormone_mapping_payments: {
        Row: {
          amount_paid: number | null
          created_at: string
          customer_email: string
          id: string
          kit_shipped_at: string | null
          lab_review_scheduled_at: string | null
          patient_id: string | null
          payment_status: string
          results_ready_at: string | null
          sample_received_at: string | null
          shipped_at: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          tracking_number: string | null
          updated_at: string
          zrt_kit_status: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          customer_email: string
          id?: string
          kit_shipped_at?: string | null
          lab_review_scheduled_at?: string | null
          patient_id?: string | null
          payment_status?: string
          results_ready_at?: string | null
          sample_received_at?: string | null
          shipped_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
          zrt_kit_status?: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          customer_email?: string
          id?: string
          kit_shipped_at?: string | null
          lab_review_scheduled_at?: string | null
          patient_id?: string | null
          payment_status?: string
          results_ready_at?: string | null
          sample_received_at?: string | null
          shipped_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
          zrt_kit_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "hormone_mapping_payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      hrt_quiz_submissions: {
        Row: {
          age_range: string
          assigned_to: string | null
          completed_at: string | null
          contacted_at: string | null
          created_at: string
          current_medications: string | null
          email: string
          gender: string
          id: string
          insurance: string
          medical_conditions: string | null
          name: string
          notes: string | null
          past_hrt: string
          past_hrt_details: string | null
          phone: string
          primary_goal: string
          scheduled_at: string | null
          status: Database["public"]["Enums"]["submission_status"]
          symptom_duration: string
          symptoms: string[]
          updated_at: string
        }
        Insert: {
          age_range: string
          assigned_to?: string | null
          completed_at?: string | null
          contacted_at?: string | null
          created_at?: string
          current_medications?: string | null
          email: string
          gender: string
          id?: string
          insurance: string
          medical_conditions?: string | null
          name: string
          notes?: string | null
          past_hrt: string
          past_hrt_details?: string | null
          phone: string
          primary_goal: string
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          symptom_duration: string
          symptoms: string[]
          updated_at?: string
        }
        Update: {
          age_range?: string
          assigned_to?: string | null
          completed_at?: string | null
          contacted_at?: string | null
          created_at?: string
          current_medications?: string | null
          email?: string
          gender?: string
          id?: string
          insurance?: string
          medical_conditions?: string | null
          name?: string
          notes?: string | null
          past_hrt?: string
          past_hrt_details?: string | null
          phone?: string
          primary_goal?: string
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          symptom_duration?: string
          symptoms?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      icd10_codes: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          description: string
          id: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          description: string
          id?: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          description?: string
          id?: string
        }
        Relationships: []
      }
      intake_magic_links: {
        Row: {
          booking_id: string | null
          created_at: string
          email_address: string | null
          expires_at: string
          first_used_at: string | null
          id: string
          last_used_at: string | null
          patient_id: string
          pending_consent_types: string[] | null
          pending_reconsent_request_id: string | null
          pending_substance_id: string | null
          phone_number: string | null
          reminder_sent_at: string | null
          revoked_at: string | null
          token: string
          use_count: number
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          email_address?: string | null
          expires_at: string
          first_used_at?: string | null
          id?: string
          last_used_at?: string | null
          patient_id: string
          pending_consent_types?: string[] | null
          pending_reconsent_request_id?: string | null
          pending_substance_id?: string | null
          phone_number?: string | null
          reminder_sent_at?: string | null
          revoked_at?: string | null
          token: string
          use_count?: number
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          email_address?: string | null
          expires_at?: string
          first_used_at?: string | null
          id?: string
          last_used_at?: string | null
          patient_id?: string
          pending_consent_types?: string[] | null
          pending_reconsent_request_id?: string | null
          pending_substance_id?: string | null
          phone_number?: string | null
          reminder_sent_at?: string | null
          revoked_at?: string | null
          token?: string
          use_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "intake_magic_links_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_magic_links_pending_reconsent_request_id_fkey"
            columns: ["pending_reconsent_request_id"]
            isOneToOne: false
            referencedRelation: "consent_reconsent_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_dispensations: {
        Row: {
          appointment_id: string | null
          created_at: string
          dispensed_at: string
          dispensed_by: string
          id: string
          lot_id: string
          notes: string | null
          patient_id: string | null
          protocol_execution_id: string | null
          quantity_dispensed: number
          reason: string | null
          transaction_type: string
          unit: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          dispensed_at?: string
          dispensed_by: string
          id?: string
          lot_id: string
          notes?: string | null
          patient_id?: string | null
          protocol_execution_id?: string | null
          quantity_dispensed: number
          reason?: string | null
          transaction_type: string
          unit: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          dispensed_at?: string
          dispensed_by?: string
          id?: string
          lot_id?: string
          notes?: string | null
          patient_id?: string | null
          protocol_execution_id?: string | null
          quantity_dispensed?: number
          reason?: string | null
          transaction_type?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_dispensations_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "inventory_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_dispensations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_dispensations_protocol_execution_id_fkey"
            columns: ["protocol_execution_id"]
            isOneToOne: false
            referencedRelation: "clinical_protocol_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_lots: {
        Row: {
          cost_per_unit_cents: number | null
          created_at: string
          expiration_date: string
          id: string
          lot_number: string
          quantity_received: number
          quantity_remaining: number
          received_at: string
          received_by: string | null
          sku_id: string
          status: string
          storage_location: string | null
          unit: string
          updated_at: string
          vendor_invoice_number: string | null
          vendor_lot_metadata: Json | null
        }
        Insert: {
          cost_per_unit_cents?: number | null
          created_at?: string
          expiration_date: string
          id?: string
          lot_number: string
          quantity_received: number
          quantity_remaining: number
          received_at?: string
          received_by?: string | null
          sku_id: string
          status?: string
          storage_location?: string | null
          unit: string
          updated_at?: string
          vendor_invoice_number?: string | null
          vendor_lot_metadata?: Json | null
        }
        Update: {
          cost_per_unit_cents?: number | null
          created_at?: string
          expiration_date?: string
          id?: string
          lot_number?: string
          quantity_received?: number
          quantity_remaining?: number
          received_at?: string
          received_by?: string | null
          sku_id?: string
          status?: string
          storage_location?: string | null
          unit?: string
          updated_at?: string
          vendor_invoice_number?: string | null
          vendor_lot_metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_lots_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "inventory_skus"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_skus: {
        Row: {
          category: string
          controlled_schedule: string | null
          created_at: string
          default_quantity_per_unit: number
          default_unit: string
          display_name: string
          fcc_catalog_sku: string | null
          id: string
          is_active: boolean
          is_controlled_substance: boolean
          reorder_target: number
          reorder_threshold: number
          sku_code: string
          updated_at: string
          vendor: string
        }
        Insert: {
          category: string
          controlled_schedule?: string | null
          created_at?: string
          default_quantity_per_unit?: number
          default_unit: string
          display_name: string
          fcc_catalog_sku?: string | null
          id?: string
          is_active?: boolean
          is_controlled_substance?: boolean
          reorder_target?: number
          reorder_threshold?: number
          sku_code: string
          updated_at?: string
          vendor: string
        }
        Update: {
          category?: string
          controlled_schedule?: string | null
          created_at?: string
          default_quantity_per_unit?: number
          default_unit?: string
          display_name?: string
          fcc_catalog_sku?: string | null
          id?: string
          is_active?: boolean
          is_controlled_substance?: boolean
          reorder_target?: number
          reorder_threshold?: number
          sku_code?: string
          updated_at?: string
          vendor?: string
        }
        Relationships: []
      }
      iv_addons: {
        Row: {
          benefits: string[] | null
          best_for: string[] | null
          contraindicates_sesame_allergy: boolean
          created_at: string | null
          description: string | null
          detailed_description: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          requires_g6pd_clearance: boolean
          stripe_price_id: string | null
        }
        Insert: {
          benefits?: string[] | null
          best_for?: string[] | null
          contraindicates_sesame_allergy?: boolean
          created_at?: string | null
          description?: string | null
          detailed_description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number
          requires_g6pd_clearance?: boolean
          stripe_price_id?: string | null
        }
        Update: {
          benefits?: string[] | null
          best_for?: string[] | null
          contraindicates_sesame_allergy?: boolean
          created_at?: string | null
          description?: string | null
          detailed_description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          requires_g6pd_clearance?: boolean
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      iv_drip_bookings: {
        Row: {
          addon_ids: string[] | null
          amount_paid: number | null
          appointment_id: string | null
          booked_by_user_id: string | null
          booking_source: string
          created_at: string
          customer_email: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          payment_status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          therapy_id: string | null
          therapy_name: string | null
          updated_at: string
        }
        Insert: {
          addon_ids?: string[] | null
          amount_paid?: number | null
          appointment_id?: string | null
          booked_by_user_id?: string | null
          booking_source?: string
          created_at?: string
          customer_email: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          payment_status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          therapy_id?: string | null
          therapy_name?: string | null
          updated_at?: string
        }
        Update: {
          addon_ids?: string[] | null
          amount_paid?: number | null
          appointment_id?: string | null
          booked_by_user_id?: string | null
          booking_source?: string
          created_at?: string
          customer_email?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          payment_status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          therapy_id?: string | null
          therapy_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      iv_intake_responses: {
        Row: {
          acknowledged_disclaimer: boolean
          acknowledged_warnings: boolean
          appointment_id: string | null
          block_reasons: string[]
          block_severity: string | null
          clinician_override_at: string | null
          clinician_override_by: string | null
          clinician_override_reason: string | null
          created_at: string
          current_medications: string | null
          currently_breastfeeding: boolean
          date_of_birth: string | null
          email: string
          first_name: string | null
          follow_up_assigned_to: string | null
          follow_up_notes: string | null
          follow_up_status: string
          has_anaphylaxis_history: boolean
          has_chf: boolean
          has_ckd: boolean
          has_diabetes: boolean
          has_esrd: boolean
          has_g6pd_deficiency: boolean
          has_hypertension_uncontrolled: boolean
          has_iv_allergies: boolean
          has_sesame_allergy: boolean
          has_thyroid_disorder: boolean
          id: string
          is_pregnant: boolean
          iv_allergies_text: string | null
          known_allergies: string | null
          last_name: string | null
          on_anticoagulants: boolean
          patient_id: string | null
          patient_notified_email_sent_at: string | null
          phone: string | null
          recent_surgeries: string | null
          safety_consult_appointment_id: string | null
          screening_result: string
          selected_therapy_id: string | null
          staff_notified_email_sent_at: string | null
          updated_at: string
          warn_reasons: string[]
        }
        Insert: {
          acknowledged_disclaimer?: boolean
          acknowledged_warnings?: boolean
          appointment_id?: string | null
          block_reasons?: string[]
          block_severity?: string | null
          clinician_override_at?: string | null
          clinician_override_by?: string | null
          clinician_override_reason?: string | null
          created_at?: string
          current_medications?: string | null
          currently_breastfeeding?: boolean
          date_of_birth?: string | null
          email: string
          first_name?: string | null
          follow_up_assigned_to?: string | null
          follow_up_notes?: string | null
          follow_up_status?: string
          has_anaphylaxis_history?: boolean
          has_chf?: boolean
          has_ckd?: boolean
          has_diabetes?: boolean
          has_esrd?: boolean
          has_g6pd_deficiency?: boolean
          has_hypertension_uncontrolled?: boolean
          has_iv_allergies?: boolean
          has_sesame_allergy?: boolean
          has_thyroid_disorder?: boolean
          id?: string
          is_pregnant?: boolean
          iv_allergies_text?: string | null
          known_allergies?: string | null
          last_name?: string | null
          on_anticoagulants?: boolean
          patient_id?: string | null
          patient_notified_email_sent_at?: string | null
          phone?: string | null
          recent_surgeries?: string | null
          safety_consult_appointment_id?: string | null
          screening_result: string
          selected_therapy_id?: string | null
          staff_notified_email_sent_at?: string | null
          updated_at?: string
          warn_reasons?: string[]
        }
        Update: {
          acknowledged_disclaimer?: boolean
          acknowledged_warnings?: boolean
          appointment_id?: string | null
          block_reasons?: string[]
          block_severity?: string | null
          clinician_override_at?: string | null
          clinician_override_by?: string | null
          clinician_override_reason?: string | null
          created_at?: string
          current_medications?: string | null
          currently_breastfeeding?: boolean
          date_of_birth?: string | null
          email?: string
          first_name?: string | null
          follow_up_assigned_to?: string | null
          follow_up_notes?: string | null
          follow_up_status?: string
          has_anaphylaxis_history?: boolean
          has_chf?: boolean
          has_ckd?: boolean
          has_diabetes?: boolean
          has_esrd?: boolean
          has_g6pd_deficiency?: boolean
          has_hypertension_uncontrolled?: boolean
          has_iv_allergies?: boolean
          has_sesame_allergy?: boolean
          has_thyroid_disorder?: boolean
          id?: string
          is_pregnant?: boolean
          iv_allergies_text?: string | null
          known_allergies?: string | null
          last_name?: string | null
          on_anticoagulants?: boolean
          patient_id?: string | null
          patient_notified_email_sent_at?: string | null
          phone?: string | null
          recent_surgeries?: string | null
          safety_consult_appointment_id?: string | null
          screening_result?: string
          selected_therapy_id?: string | null
          staff_notified_email_sent_at?: string | null
          updated_at?: string
          warn_reasons?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "iv_intake_responses_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iv_intake_responses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iv_intake_responses_safety_consult_appointment_id_fkey"
            columns: ["safety_consult_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iv_intake_responses_selected_therapy_id_fkey"
            columns: ["selected_therapy_id"]
            isOneToOne: false
            referencedRelation: "iv_therapies"
            referencedColumns: ["id"]
          },
        ]
      }
      iv_therapies: {
        Row: {
          category: string
          contraindicates_sesame_allergy: boolean
          created_at: string | null
          description: string | null
          feelings: string[] | null
          icon_name: string | null
          id: string
          ingredients: string[] | null
          is_active: boolean | null
          name: string
          price: number
          requires_g6pd_clearance: boolean
          sort_order: number | null
          stripe_price_id: string | null
        }
        Insert: {
          category: string
          contraindicates_sesame_allergy?: boolean
          created_at?: string | null
          description?: string | null
          feelings?: string[] | null
          icon_name?: string | null
          id?: string
          ingredients?: string[] | null
          is_active?: boolean | null
          name: string
          price: number
          requires_g6pd_clearance?: boolean
          sort_order?: number | null
          stripe_price_id?: string | null
        }
        Update: {
          category?: string
          contraindicates_sesame_allergy?: boolean
          created_at?: string | null
          description?: string | null
          feelings?: string[] | null
          icon_name?: string | null
          id?: string
          ingredients?: string[] | null
          is_active?: boolean | null
          name?: string
          price?: number
          requires_g6pd_clearance?: boolean
          sort_order?: number | null
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      lab_orders: {
        Row: {
          clinical_reason: string | null
          created_at: string
          document_url: string | null
          id: string
          notes: string | null
          ordered_at: string
          ordered_by: string | null
          panel_slug: string
          patient_id: string
          requisition_key: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          clinical_reason?: string | null
          created_at?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          ordered_at?: string
          ordered_by?: string | null
          panel_slug: string
          patient_id: string
          requisition_key?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          clinical_reason?: string | null
          created_at?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          ordered_at?: string
          ordered_by?: string | null
          panel_slug?: string
          patient_id?: string
          requisition_key?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_panels: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          included_in_program: boolean
          initial_paid_at_intake: boolean
          is_active: boolean
          labcorp_requisition_key: string | null
          member_price_cents: number
          name: string
          non_member_price_cents: number
          sex_specific: string | null
          slug: string
          updated_at: string
          validity_days: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          included_in_program?: boolean
          initial_paid_at_intake?: boolean
          is_active?: boolean
          labcorp_requisition_key?: string | null
          member_price_cents: number
          name: string
          non_member_price_cents: number
          sex_specific?: string | null
          slug: string
          updated_at?: string
          validity_days?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          included_in_program?: boolean
          initial_paid_at_intake?: boolean
          is_active?: boolean
          labcorp_requisition_key?: string | null
          member_price_cents?: number
          name?: string
          non_member_price_cents?: number
          sex_specific?: string | null
          slug?: string
          updated_at?: string
          validity_days?: number
        }
        Relationships: []
      }
      lab_results: {
        Row: {
          a1c: number | null
          alt: number | null
          arsenic: number | null
          ast: number | null
          cadmium: number | null
          clinical_story: string | null
          collection_date: string
          copper: number | null
          correlation_alert: string | null
          cortisol_evening: number | null
          cortisol_morning: number | null
          cortisol_night: number | null
          cortisol_noon: number | null
          created_at: string
          created_by: string | null
          dhea_s: number | null
          dopamine: number | null
          epinephrine: number | null
          estradiol_e2: number | null
          fasting_insulin: number | null
          free_t3: number | null
          free_t4: number | null
          gaba: number | null
          glutamate: number | null
          hdl: number | null
          hematocrit: number | null
          id: string
          iodine: number | null
          kit_type: string | null
          lab_order_id: string | null
          lab_source: string | null
          ldl: number | null
          lead_level: number | null
          magnesium: number | null
          mercury: number | null
          norepinephrine: number | null
          notes: string | null
          parsed_from_pdf: boolean | null
          patient_id: string
          pdf_url: string | null
          pg_e2_ratio: number | null
          progesterone_pg: number | null
          psa: number | null
          selenium: number | null
          serotonin: number | null
          testosterone_t: number | null
          tpo_antibodies: number | null
          treatment_plan: Json | null
          triglycerides: number | null
          tsh: number | null
          vitamin_d: number | null
          zinc: number | null
        }
        Insert: {
          a1c?: number | null
          alt?: number | null
          arsenic?: number | null
          ast?: number | null
          cadmium?: number | null
          clinical_story?: string | null
          collection_date: string
          copper?: number | null
          correlation_alert?: string | null
          cortisol_evening?: number | null
          cortisol_morning?: number | null
          cortisol_night?: number | null
          cortisol_noon?: number | null
          created_at?: string
          created_by?: string | null
          dhea_s?: number | null
          dopamine?: number | null
          epinephrine?: number | null
          estradiol_e2?: number | null
          fasting_insulin?: number | null
          free_t3?: number | null
          free_t4?: number | null
          gaba?: number | null
          glutamate?: number | null
          hdl?: number | null
          hematocrit?: number | null
          id?: string
          iodine?: number | null
          kit_type?: string | null
          lab_order_id?: string | null
          lab_source?: string | null
          ldl?: number | null
          lead_level?: number | null
          magnesium?: number | null
          mercury?: number | null
          norepinephrine?: number | null
          notes?: string | null
          parsed_from_pdf?: boolean | null
          patient_id: string
          pdf_url?: string | null
          pg_e2_ratio?: number | null
          progesterone_pg?: number | null
          psa?: number | null
          selenium?: number | null
          serotonin?: number | null
          testosterone_t?: number | null
          tpo_antibodies?: number | null
          treatment_plan?: Json | null
          triglycerides?: number | null
          tsh?: number | null
          vitamin_d?: number | null
          zinc?: number | null
        }
        Update: {
          a1c?: number | null
          alt?: number | null
          arsenic?: number | null
          ast?: number | null
          cadmium?: number | null
          clinical_story?: string | null
          collection_date?: string
          copper?: number | null
          correlation_alert?: string | null
          cortisol_evening?: number | null
          cortisol_morning?: number | null
          cortisol_night?: number | null
          cortisol_noon?: number | null
          created_at?: string
          created_by?: string | null
          dhea_s?: number | null
          dopamine?: number | null
          epinephrine?: number | null
          estradiol_e2?: number | null
          fasting_insulin?: number | null
          free_t3?: number | null
          free_t4?: number | null
          gaba?: number | null
          glutamate?: number | null
          hdl?: number | null
          hematocrit?: number | null
          id?: string
          iodine?: number | null
          kit_type?: string | null
          lab_order_id?: string | null
          lab_source?: string | null
          ldl?: number | null
          lead_level?: number | null
          magnesium?: number | null
          mercury?: number | null
          norepinephrine?: number | null
          notes?: string | null
          parsed_from_pdf?: boolean | null
          patient_id?: string
          pdf_url?: string | null
          pg_e2_ratio?: number | null
          progesterone_pg?: number | null
          psa?: number | null
          selenium?: number | null
          serotonin?: number | null
          testosterone_t?: number | null
          tpo_antibodies?: number | null
          treatment_plan?: Json | null
          triglycerides?: number | null
          tsh?: number | null
          vitamin_d?: number | null
          zinc?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_lab_order_id_fkey"
            columns: ["lab_order_id"]
            isOneToOne: false
            referencedRelation: "lab_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_tests: {
        Row: {
          also_called: string | null
          category: string | null
          code: string
          cpt_or_order_code: string | null
          created_at: string
          description: string | null
          display_order: number
          eha_cost_cents: number | null
          id: string
          internal_notes: string | null
          is_active: boolean
          labcorp_bundle_notes: string | null
          labcorp_test_code: string | null
          member_price_cents: number
          name: string
          non_member_price_cents: number
          specimen_or_tube: string | null
          updated_at: string
          what_it_checks: string | null
          when_we_order_it: string | null
        }
        Insert: {
          also_called?: string | null
          category?: string | null
          code: string
          cpt_or_order_code?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          eha_cost_cents?: number | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          labcorp_bundle_notes?: string | null
          labcorp_test_code?: string | null
          member_price_cents: number
          name: string
          non_member_price_cents: number
          specimen_or_tube?: string | null
          updated_at?: string
          what_it_checks?: string | null
          when_we_order_it?: string | null
        }
        Update: {
          also_called?: string | null
          category?: string | null
          code?: string
          cpt_or_order_code?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          eha_cost_cents?: number | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          labcorp_bundle_notes?: string | null
          labcorp_test_code?: string | null
          member_price_cents?: number
          name?: string
          non_member_price_cents?: number
          specimen_or_tube?: string | null
          updated_at?: string
          what_it_checks?: string | null
          when_we_order_it?: string | null
        }
        Relationships: []
      }
      marketing_referrals: {
        Row: {
          channel: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          id: string
          patient_id: string | null
          referral_source: string
          referral_source_detail: string | null
        }
        Insert: {
          channel: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          patient_id?: string | null
          referral_source: string
          referral_source_detail?: string | null
        }
        Update: {
          channel?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          patient_id?: string | null
          referral_source?: string
          referral_source_detail?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_referrals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          end_date: string | null
          frequency: string
          generic_name: string | null
          id: string
          is_prn: boolean | null
          last_refill_date: string | null
          medication_name: string
          next_refill_date: string | null
          notes: string | null
          patient_id: string
          pharmacy: string | null
          prescribed_by: string | null
          refills_remaining: number | null
          route: string
          service_line: string | null
          side_effects: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date?: string | null
          frequency?: string
          generic_name?: string | null
          id?: string
          is_prn?: boolean | null
          last_refill_date?: string | null
          medication_name: string
          next_refill_date?: string | null
          notes?: string | null
          patient_id: string
          pharmacy?: string | null
          prescribed_by?: string | null
          refills_remaining?: number | null
          route?: string
          service_line?: string | null
          side_effects?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          generic_name?: string | null
          id?: string
          is_prn?: boolean | null
          last_refill_date?: string | null
          medication_name?: string
          next_refill_date?: string | null
          notes?: string | null
          patient_id?: string
          pharmacy?: string | null
          prescribed_by?: string | null
          refills_remaining?: number | null
          route?: string
          service_line?: string | null
          side_effects?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_visit_log: {
        Row: {
          administered_by: string | null
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          service: string
          supplies_used: Json | null
          visit_date: string
        }
        Insert: {
          administered_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          service: string
          supplies_used?: Json | null
          visit_date?: string
        }
        Update: {
          administered_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          service?: string
          supplies_used?: Json | null
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_visit_log_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
          sender_role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
          sender_role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      metabolic_payments: {
        Row: {
          amount_paid: number | null
          created_at: string
          customer_email: string
          customer_name: string | null
          id: string
          kit_status: string
          patient_id: string | null
          payment_status: string
          results_ready_at: string | null
          sample_received_at: string | null
          shipped_at: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          customer_email: string
          customer_name?: string | null
          id?: string
          kit_status?: string
          patient_id?: string | null
          payment_status?: string
          results_ready_at?: string | null
          sample_received_at?: string | null
          shipped_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          customer_email?: string
          customer_name?: string | null
          id?: string
          kit_status?: string
          patient_id?: string | null
          payment_status?: string
          results_ready_at?: string | null
          sample_received_at?: string | null
          shipped_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "metabolic_payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      neurotransmitter_payments: {
        Row: {
          amount_paid: number | null
          created_at: string
          customer_email: string
          id: string
          kit_status: string
          patient_id: string | null
          payment_status: string
          results_ready_at: string | null
          sample_received_at: string | null
          shipped_at: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          customer_email: string
          id?: string
          kit_status?: string
          patient_id?: string | null
          payment_status?: string
          results_ready_at?: string | null
          sample_received_at?: string | null
          shipped_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          customer_email?: string
          id?: string
          kit_status?: string
          patient_id?: string | null
          payment_status?: string
          results_ready_at?: string | null
          sample_received_at?: string | null
          shipped_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "neurotransmitter_payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_failures: {
        Row: {
          attempted_at: string
          email_type: string
          error_message: string
          id: string
          intake_id: string | null
        }
        Insert: {
          attempted_at?: string
          email_type: string
          error_message: string
          id?: string
          intake_id?: string | null
        }
        Update: {
          attempted_at?: string
          email_type?: string
          error_message?: string
          id?: string
          intake_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_failures_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "iv_intake_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_credits: {
        Row: {
          applied_amount_cents: number | null
          cap_mode: string
          created_at: string
          credit_amount_cents: number
          expires_at: string
          id: string
          issued_at: string
          onboarding_charge_ref: string
          patient_user_id: string
          redeemed_against_ref: string | null
          redeemed_at: string | null
          status: string
          stripe_coupon_id: string | null
          stripe_customer_id: string | null
          updated_at: string
          window_days: number
        }
        Insert: {
          applied_amount_cents?: number | null
          cap_mode?: string
          created_at?: string
          credit_amount_cents: number
          expires_at: string
          id?: string
          issued_at?: string
          onboarding_charge_ref: string
          patient_user_id: string
          redeemed_against_ref?: string | null
          redeemed_at?: string | null
          status?: string
          stripe_coupon_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          window_days: number
        }
        Update: {
          applied_amount_cents?: number | null
          cap_mode?: string
          created_at?: string
          credit_amount_cents?: number
          expires_at?: string
          id?: string
          issued_at?: string
          onboarding_charge_ref?: string
          patient_user_id?: string
          redeemed_against_ref?: string | null
          redeemed_at?: string | null
          status?: string
          stripe_coupon_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          window_days?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          fax_destination: string | null
          fax_error: string | null
          fax_id: string | null
          fax_sent_at: string | null
          fax_status: string | null
          id: string
          patient_id: string
          pharmacy_id: string | null
          portal_opened_at: string | null
          portal_submitted_at: string | null
          protocol_snapshot: Json | null
          status: Database["public"]["Enums"]["order_status"] | null
          submission_method: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fax_destination?: string | null
          fax_error?: string | null
          fax_id?: string | null
          fax_sent_at?: string | null
          fax_status?: string | null
          id?: string
          patient_id: string
          pharmacy_id?: string | null
          portal_opened_at?: string | null
          portal_submitted_at?: string | null
          protocol_snapshot?: Json | null
          status?: Database["public"]["Enums"]["order_status"] | null
          submission_method?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fax_destination?: string | null
          fax_error?: string | null
          fax_id?: string | null
          fax_sent_at?: string | null
          fax_status?: string | null
          id?: string
          patient_id?: string
          pharmacy_id?: string | null
          portal_opened_at?: string | null
          portal_submitted_at?: string | null
          protocol_snapshot?: Json | null
          status?: Database["public"]["Enums"]["order_status"] | null
          submission_method?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_tests: {
        Row: {
          created_at: string
          default_rule: string
          display_order: number
          id: string
          panel_id: string
          test_id: string
        }
        Insert: {
          created_at?: string
          default_rule?: string
          display_order?: number
          id?: string
          panel_id: string
          test_id: string
        }
        Update: {
          created_at?: string
          default_rule?: string
          display_order?: number
          id?: string
          panel_id?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "panel_tests_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "lab_panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_tests_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "lab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_allergies: {
        Row: {
          active: boolean
          allergen: string
          id: string
          noted_at: string
          noted_by_user_id: string
          noted_date: string | null
          patient_id: string
          reaction: string | null
          severity: string | null
        }
        Insert: {
          active?: boolean
          allergen: string
          id?: string
          noted_at?: string
          noted_by_user_id: string
          noted_date?: string | null
          patient_id: string
          reaction?: string | null
          severity?: string | null
        }
        Update: {
          active?: boolean
          allergen?: string
          id?: string
          noted_at?: string
          noted_by_user_id?: string
          noted_date?: string | null
          patient_id?: string
          reaction?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_allergies_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_current_medications: {
        Row: {
          active: boolean
          added_at: string
          added_by_user_id: string
          dose: string | null
          end_date: string | null
          frequency: string | null
          id: string
          is_eha_prescribed: boolean
          medication_name: string
          notes: string | null
          patient_id: string
          prescribed_by: string | null
          route: string | null
          start_date: string | null
        }
        Insert: {
          active?: boolean
          added_at?: string
          added_by_user_id: string
          dose?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_eha_prescribed?: boolean
          medication_name: string
          notes?: string | null
          patient_id: string
          prescribed_by?: string | null
          route?: string | null
          start_date?: string | null
        }
        Update: {
          active?: boolean
          added_at?: string
          added_by_user_id?: string
          dose?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_eha_prescribed?: boolean
          medication_name?: string
          notes?: string | null
          patient_id?: string
          prescribed_by?: string | null
          route?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_current_medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_url: string
          id: string
          notes: string | null
          patient_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_url: string
          id?: string
          notes?: string | null
          patient_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_url?: string
          id?: string
          notes?: string | null
          patient_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_encounters: {
        Row: {
          amends_encounter_id: string | null
          assessment: string | null
          chief_complaint: string | null
          created_at: string
          created_by_user_id: string
          encounter_date: string
          encounter_type: string
          follow_up_plan: string | null
          id: string
          internal_notes: string | null
          last_edited_at: string | null
          last_edited_by_user_id: string | null
          medications_prescribed: string | null
          objective: string | null
          patient_id: string
          plan: string | null
          signed_at: string | null
          signed_by_user_id: string | null
          signed_ip_address: string | null
          status: string
          subjective: string | null
        }
        Insert: {
          amends_encounter_id?: string | null
          assessment?: string | null
          chief_complaint?: string | null
          created_at?: string
          created_by_user_id: string
          encounter_date?: string
          encounter_type: string
          follow_up_plan?: string | null
          id?: string
          internal_notes?: string | null
          last_edited_at?: string | null
          last_edited_by_user_id?: string | null
          medications_prescribed?: string | null
          objective?: string | null
          patient_id: string
          plan?: string | null
          signed_at?: string | null
          signed_by_user_id?: string | null
          signed_ip_address?: string | null
          status?: string
          subjective?: string | null
        }
        Update: {
          amends_encounter_id?: string | null
          assessment?: string | null
          chief_complaint?: string | null
          created_at?: string
          created_by_user_id?: string
          encounter_date?: string
          encounter_type?: string
          follow_up_plan?: string | null
          id?: string
          internal_notes?: string | null
          last_edited_at?: string | null
          last_edited_by_user_id?: string | null
          medications_prescribed?: string | null
          objective?: string | null
          patient_id?: string
          plan?: string | null
          signed_at?: string | null
          signed_by_user_id?: string | null
          signed_ip_address?: string | null
          status?: string
          subjective?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_encounters_amends_encounter_id_fkey"
            columns: ["amends_encounter_id"]
            isOneToOne: false
            referencedRelation: "patient_encounters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_encounters_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_journey: {
        Row: {
          created_at: string
          id: string
          patient_user_id: string
          stage: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          patient_user_id: string
          stage?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          patient_user_id?: string
          stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_journey_events: {
        Row: {
          created_at: string
          id: string
          note: string | null
          patient_user_id: string
          stage: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          patient_user_id: string
          stage: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          patient_user_id?: string
          stage?: string
        }
        Relationships: []
      }
      patient_problem_list: {
        Row: {
          icd10_code: string | null
          id: string
          noted_at: string
          noted_by_user_id: string
          onset_date: string | null
          patient_id: string
          problem: string
          resolved_date: string | null
          status: string
        }
        Insert: {
          icd10_code?: string | null
          id?: string
          noted_at?: string
          noted_by_user_id: string
          onset_date?: string | null
          patient_id: string
          problem: string
          resolved_date?: string | null
          status?: string
        }
        Update: {
          icd10_code?: string | null
          id?: string
          noted_at?: string
          noted_by_user_id?: string
          onset_date?: string | null
          patient_id?: string
          problem?: string
          resolved_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_problem_list_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_protocol_assignments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          protocol_id: string
          protocol_version_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          protocol_id: string
          protocol_version_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          protocol_id?: string
          protocol_version_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_protocol_assignments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_protocol_assignments_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "clinical_protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_protocol_assignments_protocol_version_id_fkey"
            columns: ["protocol_version_id"]
            isOneToOne: false
            referencedRelation: "clinical_protocol_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_resources: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          resource_type: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          resource_type: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          resource_type?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          allergies: string | null
          avatar_url: string | null
          care_membership_started_at: string | null
          care_membership_status: string | null
          care_membership_tier: string | null
          city: string | null
          consent_completed_at: string | null
          consent_method: string | null
          consent_sent_at: string | null
          consent_signature: string | null
          consent_signature_date: string | null
          consultation_booking_id: string | null
          created_at: string | null
          current_protocol: string | null
          dob: string | null
          elevated_membership_paused_until: string | null
          elevated_membership_started_at: string | null
          elevated_membership_status: string | null
          elevated_program: string | null
          elevated_program_addon: string | null
          email: string | null
          full_name: string
          gender: string | null
          id: string
          insurance_card_back_url: string | null
          insurance_card_front_url: string | null
          insurance_group_number: string | null
          insurance_member_id: string | null
          insurance_plan_name: string | null
          insurance_type: string | null
          intake_completed: boolean | null
          intake_consents_completed_at: string | null
          intake_link_email_opt_out: boolean
          intake_link_sms_opt_out: boolean
          intake_token: string | null
          intake_token_expires_at: string | null
          invited_at: string | null
          invited_by: string | null
          is_archived: boolean | null
          lab_panel_recommendation: Json | null
          lab_path: string | null
          mapping_completed: boolean | null
          medical_history: Json | null
          membership_renewal_date: string | null
          membership_tier: string | null
          onboarding_status: string | null
          phone: string | null
          primary_program: string | null
          referral_source: string | null
          referral_source_detail: string | null
          risk_status: string | null
          safety_flags: Json | null
          service_interests: Json | null
          state: string | null
          street_address: string | null
          stripe_subscription_id: string | null
          treatment_request: string | null
          updated_at: string | null
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          allergies?: string | null
          avatar_url?: string | null
          care_membership_started_at?: string | null
          care_membership_status?: string | null
          care_membership_tier?: string | null
          city?: string | null
          consent_completed_at?: string | null
          consent_method?: string | null
          consent_sent_at?: string | null
          consent_signature?: string | null
          consent_signature_date?: string | null
          consultation_booking_id?: string | null
          created_at?: string | null
          current_protocol?: string | null
          dob?: string | null
          elevated_membership_paused_until?: string | null
          elevated_membership_started_at?: string | null
          elevated_membership_status?: string | null
          elevated_program?: string | null
          elevated_program_addon?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          insurance_card_back_url?: string | null
          insurance_card_front_url?: string | null
          insurance_group_number?: string | null
          insurance_member_id?: string | null
          insurance_plan_name?: string | null
          insurance_type?: string | null
          intake_completed?: boolean | null
          intake_consents_completed_at?: string | null
          intake_link_email_opt_out?: boolean
          intake_link_sms_opt_out?: boolean
          intake_token?: string | null
          intake_token_expires_at?: string | null
          invited_at?: string | null
          invited_by?: string | null
          is_archived?: boolean | null
          lab_panel_recommendation?: Json | null
          lab_path?: string | null
          mapping_completed?: boolean | null
          medical_history?: Json | null
          membership_renewal_date?: string | null
          membership_tier?: string | null
          onboarding_status?: string | null
          phone?: string | null
          primary_program?: string | null
          referral_source?: string | null
          referral_source_detail?: string | null
          risk_status?: string | null
          safety_flags?: Json | null
          service_interests?: Json | null
          state?: string | null
          street_address?: string | null
          stripe_subscription_id?: string | null
          treatment_request?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          allergies?: string | null
          avatar_url?: string | null
          care_membership_started_at?: string | null
          care_membership_status?: string | null
          care_membership_tier?: string | null
          city?: string | null
          consent_completed_at?: string | null
          consent_method?: string | null
          consent_sent_at?: string | null
          consent_signature?: string | null
          consent_signature_date?: string | null
          consultation_booking_id?: string | null
          created_at?: string | null
          current_protocol?: string | null
          dob?: string | null
          elevated_membership_paused_until?: string | null
          elevated_membership_started_at?: string | null
          elevated_membership_status?: string | null
          elevated_program?: string | null
          elevated_program_addon?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          insurance_card_back_url?: string | null
          insurance_card_front_url?: string | null
          insurance_group_number?: string | null
          insurance_member_id?: string | null
          insurance_plan_name?: string | null
          insurance_type?: string | null
          intake_completed?: boolean | null
          intake_consents_completed_at?: string | null
          intake_link_email_opt_out?: boolean
          intake_link_sms_opt_out?: boolean
          intake_token?: string | null
          intake_token_expires_at?: string | null
          invited_at?: string | null
          invited_by?: string | null
          is_archived?: boolean | null
          lab_panel_recommendation?: Json | null
          lab_path?: string | null
          mapping_completed?: boolean | null
          medical_history?: Json | null
          membership_renewal_date?: string | null
          membership_tier?: string | null
          onboarding_status?: string | null
          phone?: string | null
          primary_program?: string | null
          referral_source?: string | null
          referral_source_detail?: string | null
          risk_status?: string | null
          safety_flags?: Json | null
          service_interests?: Json | null
          state?: string | null
          street_address?: string | null
          stripe_subscription_id?: string | null
          treatment_request?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_consultation_booking_id_fkey"
            columns: ["consultation_booking_id"]
            isOneToOne: false
            referencedRelation: "consultation_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacies: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          default_for_categories: string[] | null
          display_name: string
          fax_number: string | null
          fulfillment_method: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone_number: string | null
          portal_url: string | null
          slug: string
          sort_order: number
          state: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          default_for_categories?: string[] | null
          display_name: string
          fax_number?: string | null
          fulfillment_method: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone_number?: string | null
          portal_url?: string | null
          slug: string
          sort_order?: number
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          default_for_categories?: string[] | null
          display_name?: string
          fax_number?: string | null
          fulfillment_method?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone_number?: string | null
          portal_url?: string | null
          slug?: string
          sort_order?: number
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: []
      }
      protocols: {
        Row: {
          created_at: string | null
          dispenser_type: string | null
          id: string
          instructions: string | null
          name: string
          primary_compound: string | null
        }
        Insert: {
          created_at?: string | null
          dispenser_type?: string | null
          id?: string
          instructions?: string | null
          name: string
          primary_compound?: string | null
        }
        Update: {
          created_at?: string | null
          dispenser_type?: string | null
          id?: string
          instructions?: string | null
          name?: string
          primary_compound?: string | null
        }
        Relationships: []
      }
      provider_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          location: string | null
          provider_id: string
          service_lines: string[]
          slot_minutes: number
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          location?: string | null
          provider_id: string
          service_lines?: string[]
          slot_minutes?: number
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          location?: string | null
          provider_id?: string
          service_lines?: string[]
          slot_minutes?: number
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      qualiphy_webhook_events: {
        Row: {
          event_type: number | null
          id: string
          idempotency_key: string
          patient_exam_id: string | null
          payload: Json
          processed_at: string
        }
        Insert: {
          event_type?: number | null
          id?: string
          idempotency_key: string
          patient_exam_id?: string | null
          payload: Json
          processed_at?: string
        }
        Update: {
          event_type?: number | null
          id?: string
          idempotency_key?: string
          patient_exam_id?: string | null
          payload?: Json
          processed_at?: string
        }
        Relationships: []
      }
      room_blackouts: {
        Row: {
          created_at: string
          created_by: string | null
          end_at: string
          id: string
          reason: string | null
          recurrence_pattern: Json | null
          recurring: boolean
          room_id: string
          start_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_at: string
          id?: string
          reason?: string | null
          recurrence_pattern?: Json | null
          recurring?: boolean
          room_id: string
          start_at: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_at?: string
          id?: string
          reason?: string | null
          recurrence_pattern?: Json | null
          recurring?: boolean
          room_id?: string
          start_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_blackouts_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_blackouts_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_utilization"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          allowed_service_lines: string[]
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          is_flex: boolean
          max_concurrent_appointments: number
          name: string
          notes: string | null
          type: string
          updated_at: string
        }
        Insert: {
          allowed_service_lines?: string[]
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_flex?: boolean
          max_concurrent_appointments?: number
          name: string
          notes?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          allowed_service_lines?: string[]
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_flex?: boolean
          max_concurrent_appointments?: number
          name?: string
          notes?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      schedule_blocks: {
        Row: {
          created_at: string
          end_at: string
          id: string
          provider_id: string
          reason: string | null
          start_at: string
        }
        Insert: {
          created_at?: string
          end_at: string
          id?: string
          provider_id: string
          reason?: string | null
          start_at: string
        }
        Update: {
          created_at?: string
          end_at?: string
          id?: string
          provider_id?: string
          reason?: string | null
          start_at?: string
        }
        Relationships: []
      }
      schedule_exceptions: {
        Row: {
          created_at: string
          end_time: string
          exception_date: string
          id: string
          provider_id: string
          reason: string | null
          service_lines: string[]
          slot_minutes: number
          start_time: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          exception_date: string
          id?: string
          provider_id: string
          reason?: string | null
          service_lines?: string[]
          slot_minutes?: number
          start_time: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          exception_date?: string
          id?: string
          provider_id?: string
          reason?: string | null
          service_lines?: string[]
          slot_minutes?: number
          start_time?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      slot_token_redemptions: {
        Row: {
          booking_function: string
          booking_ref: string | null
          jti: string
          redeemed_at: string
          token_exp: string
        }
        Insert: {
          booking_function: string
          booking_ref?: string | null
          jti: string
          redeemed_at?: string
          token_exp: string
        }
        Update: {
          booking_function?: string
          booking_ref?: string | null
          jti?: string
          redeemed_at?: string
          token_exp?: string
        }
        Relationships: []
      }
      sms_messages: {
        Row: {
          body: string
          created_at: string
          delivery_status: string | null
          direction: string
          from_number: string
          id: string
          is_read: boolean
          patient_id: string | null
          sent_by: string | null
          source_function: string | null
          to_number: string
          twilio_sid: string | null
        }
        Insert: {
          body: string
          created_at?: string
          delivery_status?: string | null
          direction: string
          from_number: string
          id?: string
          is_read?: boolean
          patient_id?: string | null
          sent_by?: string | null
          source_function?: string | null
          to_number: string
          twilio_sid?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          delivery_status?: string | null
          direction?: string
          from_number?: string
          id?: string
          is_read?: boolean
          patient_id?: string | null
          sent_by?: string | null
          source_function?: string | null
          to_number?: string
          twilio_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      soap_notes: {
        Row: {
          assessment: Json
          cpt_codes: string[] | null
          created_at: string
          encounter_date: string
          encounter_type: string
          icd10_codes: string[] | null
          id: string
          linked_lab_result_id: string | null
          objective: Json
          patient_id: string
          plan: Json
          provider_id: string
          service_line: string
          signed_at: string | null
          status: string
          subjective: Json
          updated_at: string
          vitals: Json | null
        }
        Insert: {
          assessment?: Json
          cpt_codes?: string[] | null
          created_at?: string
          encounter_date?: string
          encounter_type?: string
          icd10_codes?: string[] | null
          id?: string
          linked_lab_result_id?: string | null
          objective?: Json
          patient_id: string
          plan?: Json
          provider_id: string
          service_line?: string
          signed_at?: string | null
          status?: string
          subjective?: Json
          updated_at?: string
          vitals?: Json | null
        }
        Update: {
          assessment?: Json
          cpt_codes?: string[] | null
          created_at?: string
          encounter_date?: string
          encounter_type?: string
          icd10_codes?: string[] | null
          id?: string
          linked_lab_result_id?: string | null
          objective?: Json
          patient_id?: string
          plan?: Json
          provider_id?: string
          service_line?: string
          signed_at?: string | null
          status?: string
          subjective?: Json
          updated_at?: string
          vitals?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "soap_notes_linked_lab_result_id_fkey"
            columns: ["linked_lab_result_id"]
            isOneToOne: false
            referencedRelation: "lab_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soap_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      soap_templates: {
        Row: {
          created_at: string
          created_by: string | null
          encounter_type: string
          id: string
          is_default: boolean | null
          name: string
          service_line: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          encounter_type?: string
          id?: string
          is_default?: boolean | null
          name: string
          service_line: string
          template_data?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          encounter_type?: string
          id?: string
          is_default?: boolean | null
          name?: string
          service_line?: string
          template_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      substance_addition_acknowledgments: {
        Row: {
          acknowledged_at: string
          acknowledgment_body_hash: string
          acknowledgment_body_markdown: string
          capture_metadata: Json
          id: string
          parent_consent_record_id: string
          patient_id: string
          signed_typed_name: string
          signing_method: string
          staff_witness_user_id: string | null
          substance_added_date: string
          substance_display_name: string
          substance_id: string
        }
        Insert: {
          acknowledged_at?: string
          acknowledgment_body_hash: string
          acknowledgment_body_markdown: string
          capture_metadata?: Json
          id?: string
          parent_consent_record_id: string
          patient_id: string
          signed_typed_name: string
          signing_method?: string
          staff_witness_user_id?: string | null
          substance_added_date: string
          substance_display_name: string
          substance_id: string
        }
        Update: {
          acknowledged_at?: string
          acknowledgment_body_hash?: string
          acknowledgment_body_markdown?: string
          capture_metadata?: Json
          id?: string
          parent_consent_record_id?: string
          patient_id?: string
          signed_typed_name?: string
          signing_method?: string
          staff_witness_user_id?: string | null
          substance_added_date?: string
          substance_display_name?: string
          substance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "substance_addition_acknowledgment_parent_consent_record_id_fkey"
            columns: ["parent_consent_record_id"]
            isOneToOne: false
            referencedRelation: "consent_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substance_addition_acknowledgments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      superbills: {
        Row: {
          cpt_codes: Json
          created_at: string | null
          created_by: string | null
          date_of_service: string
          diagnosis_codes: string[]
          id: string
          notes: string | null
          patient_id: string
          total_charge: number
        }
        Insert: {
          cpt_codes: Json
          created_at?: string | null
          created_by?: string | null
          date_of_service: string
          diagnosis_codes: string[]
          id?: string
          notes?: string | null
          patient_id: string
          total_charge: number
        }
        Update: {
          cpt_codes?: Json
          created_at?: string | null
          created_by?: string | null
          date_of_service?: string
          diagnosis_codes?: string[]
          id?: string
          notes?: string | null
          patient_id?: string
          total_charge?: number
        }
        Relationships: [
          {
            foreignKeyName: "superbills_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_logs: {
        Row: {
          androgen_score: number | null
          cortisol_score: number | null
          created_at: string | null
          date_logged: string | null
          estrogen_score: number | null
          id: string
          patient_id: string
          progesterone_score: number | null
          raw_answers: Json | null
        }
        Insert: {
          androgen_score?: number | null
          cortisol_score?: number | null
          created_at?: string | null
          date_logged?: string | null
          estrogen_score?: number | null
          id?: string
          patient_id: string
          progesterone_score?: number | null
          raw_answers?: Json | null
        }
        Update: {
          androgen_score?: number | null
          cortisol_score?: number | null
          created_at?: string | null
          date_logged?: string | null
          estrogen_score?: number | null
          id?: string
          patient_id?: string
          progesterone_score?: number | null
          raw_answers?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "symptom_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      toxicity_payments: {
        Row: {
          amount_paid: number | null
          created_at: string
          customer_email: string
          customer_name: string | null
          id: string
          kit_status: string
          patient_id: string | null
          payment_status: string
          results_ready_at: string | null
          sample_received_at: string | null
          shipped_at: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          customer_email: string
          customer_name?: string | null
          id?: string
          kit_status?: string
          patient_id?: string | null
          payment_status?: string
          results_ready_at?: string | null
          sample_received_at?: string | null
          shipped_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          customer_email?: string
          customer_name?: string | null
          id?: string
          kit_status?: string
          patient_id?: string | null
          payment_status?: string
          results_ready_at?: string | null
          sample_received_at?: string | null
          shipped_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "toxicity_payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_plans: {
        Row: {
          created_at: string
          goals: Json
          id: string
          interventions: Json
          last_reviewed_at: string | null
          patient_id: string
          progress_notes: Json
          provider_id: string
          review_frequency: string | null
          service_line: string
          start_date: string
          status: string
          target_end_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          goals?: Json
          id?: string
          interventions?: Json
          last_reviewed_at?: string | null
          patient_id: string
          progress_notes?: Json
          provider_id: string
          review_frequency?: string | null
          service_line?: string
          start_date?: string
          status?: string
          target_end_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          goals?: Json
          id?: string
          interventions?: Json
          last_reviewed_at?: string | null
          patient_id?: string
          progress_notes?: Json
          provider_id?: string
          review_frequency?: string | null
          service_line?: string
          start_date?: string
          status?: string
          target_end_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_room_utilization: {
        Row: {
          active_blackouts: number | null
          allowed_service_lines: string[] | null
          appointments_this_week: number | null
          appointments_today: number | null
          id: string | null
          is_active: boolean | null
          is_flex: boolean | null
          name: string | null
          type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      advance_journey: {
        Args: { p_note?: string; p_patient: string; p_stage: string }
        Returns: undefined
      }
      auth_owns_patient: { Args: { _patient_id: string }; Returns: boolean }
      bootstrap_vault_create_cron_secret: {
        Args: { _value: string }
        Returns: string
      }
      bootstrap_vault_update_cron_secret: {
        Args: { _value: string }
        Returns: undefined
      }
      cds_assessment_readable: {
        Args: { _assessment_id: string; _user_id: string }
        Returns: boolean
      }
      check_booking_limits: {
        Args: {
          _duration_minutes: number
          _exclude_appointment_id?: string
          _scheduled_at: string
          _service_line: string
        }
        Returns: boolean
      }
      dispense_from_lot: {
        Args: {
          p_appointment_id?: string
          p_lot_id: string
          p_notes?: string
          p_patient_id?: string
          p_protocol_execution_id?: string
          p_quantity: number
          p_reason?: string
          p_transaction_type: string
        }
        Returns: string
      }
      expire_inventory_lots: { Args: never; Returns: number }
      expire_onboarding_credits: { Args: never; Returns: number }
      find_available_room: {
        Args: {
          _duration_minutes: number
          _exclude_appointment_id?: string
          _service_line: string
          _start_at: string
        }
        Returns: string
      }
      get_active_lot_for_sku: { Args: { p_sku_id: string }; Returns: string }
      get_all_providers: {
        Args: never
        Returns: {
          email: string
          full_name: string
          id: string
          role: string
        }[]
      }
      get_inventory_status: { Args: { p_sku_id: string }; Returns: Json }
      get_iv_booking_by_stripe_session: {
        Args: { _session_id: string }
        Returns: {
          amount_paid: number
          appointment_id: string
          customer_email: string
          customer_name: string
          id: string
          payment_status: string
          therapy_id: string
          therapy_name: string
        }[]
      }
      get_patient_by_intake_token: {
        Args: { _token: string }
        Returns: {
          email: string
          full_name: string
          id: string
          phone: string
          primary_program: string
          service_interests: Json
        }[]
      }
      get_patient_signup_prefill: {
        Args: { p_email: string }
        Returns: {
          full_name: string
          phone: string
        }[]
      }
      get_providers_directory: {
        Args: never
        Returns: {
          color: string
          display_name: string
          email: string
          user_id: string
        }[]
      }
      get_redeemable_credit: {
        Args: { p_patient: string }
        Returns: {
          applied_amount_cents: number | null
          cap_mode: string
          created_at: string
          credit_amount_cents: number
          expires_at: string
          id: string
          issued_at: string
          onboarding_charge_ref: string
          patient_user_id: string
          redeemed_against_ref: string | null
          redeemed_at: string | null
          status: string
          stripe_coupon_id: string | null
          stripe_customer_id: string | null
          updated_at: string
          window_days: number
        }
        SetofOptions: {
          from: "*"
          to: "onboarding_credits"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_business_admin_role: { Args: { _user_id: string }; Returns: boolean }
      has_clinical_staff_access: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_clinic_staff: { Args: { _user_id: string }; Returns: boolean }
      is_prescriber: { Args: { _user_id: string }; Returns: boolean }
      link_patient_account: {
        Args: { p_email: string; p_full_name?: string; p_phone?: string }
        Returns: {
          linked: boolean
          patient_id: string
          phone: string
          primary_program: string
        }[]
      }
      provider_can_access_appointment: {
        Args: { _appointment_provider_id: string; _scheduled_at: string }
        Returns: boolean
      }
      provider_has_active_schedule_on_day: {
        Args: { _scheduled_at: string }
        Returns: boolean
      }
      redeem_onboarding_credit: {
        Args: {
          p_against_ref?: string
          p_applied_cents: number
          p_coupon_id: string
          p_credit_id: string
        }
        Returns: {
          applied_amount_cents: number | null
          cap_mode: string
          created_at: string
          credit_amount_cents: number
          expires_at: string
          id: string
          issued_at: string
          onboarding_charge_ref: string
          patient_user_id: string
          redeemed_against_ref: string | null
          redeemed_at: string | null
          status: string
          stripe_coupon_id: string | null
          stripe_customer_id: string | null
          updated_at: string
          window_days: number
        }
        SetofOptions: {
          from: "*"
          to: "onboarding_credits"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      sign_clinical_protocol_version: {
        Args: { version_id: string }
        Returns: {
          authored_by: string | null
          body_markdown: string
          body_structured: Json
          created_at: string
          id: string
          notes_for_reviewer: Json
          protocol_id: string
          retired_at: string | null
          signature_hash: string | null
          signed_at: string | null
          signed_by: string | null
          status: string
          updated_at: string
          version_number: number
        }
        SetofOptions: {
          from: "*"
          to: "clinical_protocol_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      sync_my_consult_payment_status: { Args: never; Returns: Json }
      validate_consult_checkout_token: {
        Args: { p_token: string }
        Returns: {
          email: string
          full_name: string
          session_id: string
          visit_reasons: string[]
        }[]
      }
      void_credit_redemption: {
        Args: { p_credit_id: string }
        Returns: {
          applied_amount_cents: number | null
          cap_mode: string
          created_at: string
          credit_amount_cents: number
          expires_at: string
          id: string
          issued_at: string
          onboarding_charge_ref: string
          patient_user_id: string
          redeemed_against_ref: string | null
          redeemed_at: string | null
          status: string
          stripe_coupon_id: string | null
          stripe_customer_id: string | null
          updated_at: string
          window_days: number
        }
        SetofOptions: {
          from: "*"
          to: "onboarding_credits"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user" | "business_admin" | "provider"
      callback_window: "morning" | "afternoon" | "evening" | "no_preference"
      eligibility_review_status:
        | "pending"
        | "contacted"
        | "scheduled"
        | "declined"
        | "referred_out"
      gfe_clearance_source: "qualiphy" | "in_clinic"
      gfe_clearance_status:
        | "pending"
        | "approved"
        | "rejected"
        | "deferred"
        | "missed"
        | "na"
        | "cancelled"
      gfe_service_category:
        | "general"
        | "iv_therapy"
        | "hormone"
        | "weight_loss"
        | "peptide"
      order_status:
        | "pending_review"
        | "authorized"
        | "sent_to_pharmacy"
        | "completed"
      submission_status: "new" | "contacted" | "scheduled" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "user", "business_admin", "provider"],
      callback_window: ["morning", "afternoon", "evening", "no_preference"],
      eligibility_review_status: [
        "pending",
        "contacted",
        "scheduled",
        "declined",
        "referred_out",
      ],
      gfe_clearance_source: ["qualiphy", "in_clinic"],
      gfe_clearance_status: [
        "pending",
        "approved",
        "rejected",
        "deferred",
        "missed",
        "na",
        "cancelled",
      ],
      gfe_service_category: [
        "general",
        "iv_therapy",
        "hormone",
        "weight_loss",
        "peptide",
      ],
      order_status: [
        "pending_review",
        "authorized",
        "sent_to_pharmacy",
        "completed",
      ],
      submission_status: ["new", "contacted", "scheduled", "completed"],
    },
  },
} as const
A new version of Supabase CLI is available: v2.108.0 (currently installed v2.104.0)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
