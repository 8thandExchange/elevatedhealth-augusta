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
          created_at: string | null
          current_protocol: string | null
          dob: string | null
          full_name: string
          id: string
          safety_flags: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_protocol?: string | null
          dob?: string | null
          full_name: string
          id?: string
          safety_flags?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_protocol?: string | null
          dob?: string | null
          full_name?: string
          id?: string
          safety_flags?: Json | null
          updated_at?: string | null
          user_id?: string | null
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
