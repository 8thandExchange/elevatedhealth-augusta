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
    PostgrestVersion: "13.0.5"
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
          acknowledgment_text: string
          acknowledgment_type: string
          acknowledged_at: string
          acknowledged_ip: string
          acknowledged_user_agent: string
          created_at: string
          id: string
          parent_consent_record_id: string
          patient_id: string
          substance_added: string | null
        }
        Insert: {
          acknowledgment_text: string
          acknowledgment_type: string
          acknowledged_at?: string
          acknowledged_ip: string
          acknowledged_user_agent: string
          created_at?: string
          id?: string
          parent_consent_record_id: string
          patient_id: string
          substance_added?: string | null
        }
        Update: {
          acknowledgment_text?: string
          acknowledgment_type?: string
          acknowledged_at?: string
          acknowledged_ip?: string
          acknowledged_user_agent?: string
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
          consent_type: string
          created_at: string
          effective_from: string
          effective_to: string | null
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
          consent_type: string
          created_at?: string
          effective_from: string
          effective_to?: string | null
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
          consent_type?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
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
          created_at: string | null
          description: string | null
          detailed_description: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          stripe_price_id: string | null
        }
        Insert: {
          benefits?: string[] | null
          best_for?: string[] | null
          created_at?: string | null
          description?: string | null
          detailed_description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number
          stripe_price_id?: string | null
        }
        Update: {
          benefits?: string[] | null
          best_for?: string[] | null
          created_at?: string | null
          description?: string | null
          detailed_description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
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
      iv_therapies: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          feelings: string[] | null
          icon_name: string | null
          id: string
          ingredients: string[] | null
          is_active: boolean | null
          name: string
          price: number
          sort_order: number | null
          stripe_price_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          feelings?: string[] | null
          icon_name?: string | null
          id?: string
          ingredients?: string[] | null
          is_active?: boolean | null
          name: string
          price: number
          sort_order?: number | null
          stripe_price_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          feelings?: string[] | null
          icon_name?: string | null
          id?: string
          ingredients?: string[] | null
          is_active?: boolean | null
          name?: string
          price?: number
          sort_order?: number | null
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      lab_panels: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          member_price_cents: number
          name: string
          non_member_price_cents: number
          sex_specific: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          member_price_cents: number
          name: string
          non_member_price_cents: number
          sex_specific?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          member_price_cents?: number
          name?: string
          non_member_price_cents?: number
          sex_specific?: string | null
          slug?: string
          updated_at?: string
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
          category: string | null
          code: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          member_price_cents: number
          name: string
          non_member_price_cents: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          member_price_cents: number
          name: string
          non_member_price_cents: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          member_price_cents?: number
          name?: string
          non_member_price_cents?: number
          updated_at?: string
        }
        Relationships: []
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
          display_order: number
          id: string
          panel_id: string
          test_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          panel_id: string
          test_id: string
        }
        Update: {
          created_at?: string
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
      bootstrap_vault_create_cron_secret: {
        Args: { _value: string }
        Returns: string
      }
      bootstrap_vault_update_cron_secret: {
        Args: { _value: string }
        Returns: undefined
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
      get_providers_directory: {
        Args: never
        Returns: {
          color: string
          display_name: string
          email: string
          user_id: string
        }[]
      }
      has_business_admin_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
