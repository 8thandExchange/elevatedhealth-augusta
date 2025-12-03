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
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
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
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
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
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
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
      lab_results: {
        Row: {
          collection_date: string
          correlation_alert: string | null
          cortisol_morning: number | null
          created_at: string
          created_by: string | null
          estradiol_e2: number | null
          id: string
          notes: string | null
          patient_id: string
          progesterone_pg: number | null
          testosterone_t: number | null
        }
        Insert: {
          collection_date: string
          correlation_alert?: string | null
          cortisol_morning?: number | null
          created_at?: string
          created_by?: string | null
          estradiol_e2?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          progesterone_pg?: number | null
          testosterone_t?: number | null
        }
        Update: {
          collection_date?: string
          correlation_alert?: string | null
          cortisol_morning?: number | null
          created_at?: string
          created_by?: string | null
          estradiol_e2?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          progesterone_pg?: number | null
          testosterone_t?: number | null
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
      orders: {
        Row: {
          created_at: string | null
          id: string
          patient_id: string
          protocol_snapshot: Json | null
          status: Database["public"]["Enums"]["order_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          patient_id: string
          protocol_snapshot?: Json | null
          status?: Database["public"]["Enums"]["order_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          patient_id?: string
          protocol_snapshot?: Json | null
          status?: Database["public"]["Enums"]["order_status"] | null
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
        ]
      }
      patients: {
        Row: {
          allergies: string | null
          avatar_url: string | null
          city: string | null
          created_at: string | null
          current_protocol: string | null
          dob: string | null
          email: string | null
          full_name: string
          gender: string | null
          id: string
          intake_completed: boolean | null
          invited_at: string | null
          invited_by: string | null
          lab_path: string | null
          medical_history: Json | null
          onboarding_status: string | null
          phone: string | null
          risk_status: string | null
          safety_flags: Json | null
          state: string | null
          street_address: string | null
          treatment_request: string | null
          updated_at: string | null
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          allergies?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          current_protocol?: string | null
          dob?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          intake_completed?: boolean | null
          invited_at?: string | null
          invited_by?: string | null
          lab_path?: string | null
          medical_history?: Json | null
          onboarding_status?: string | null
          phone?: string | null
          risk_status?: string | null
          safety_flags?: Json | null
          state?: string | null
          street_address?: string | null
          treatment_request?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          allergies?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          current_protocol?: string | null
          dob?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          intake_completed?: boolean | null
          invited_at?: string | null
          invited_by?: string | null
          lab_path?: string | null
          medical_history?: Json | null
          onboarding_status?: string | null
          phone?: string | null
          risk_status?: string | null
          safety_flags?: Json | null
          state?: string | null
          street_address?: string | null
          treatment_request?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
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
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
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
      app_role: ["admin", "staff", "user"],
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
