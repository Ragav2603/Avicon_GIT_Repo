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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      adoption_audits: {
        Row: {
          airline_id: string
          audit_date: string | null
          consultant_id: string
          created_at: string
          id: string
          overall_score: number | null
        }
        Insert: {
          airline_id: string
          audit_date?: string | null
          consultant_id: string
          created_at?: string
          id?: string
          overall_score?: number | null
        }
        Update: {
          airline_id?: string
          audit_date?: string | null
          consultant_id?: string
          created_at?: string
          id?: string
          overall_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "adoption_audits_airline_id_fkey"
            columns: ["airline_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adoption_audits_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      approved_domains: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          domain: string
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      audit_items: {
        Row: {
          audit_id: string
          calculated_score: number | null
          id: string
          recommendation: string | null
          sentiment_score: number | null
          tool_name: string
          utilization_metric: number | null
        }
        Insert: {
          audit_id: string
          calculated_score?: number | null
          id?: string
          recommendation?: string | null
          sentiment_score?: number | null
          tool_name: string
          utilization_metric?: number | null
        }
        Update: {
          audit_id?: string
          calculated_score?: number | null
          id?: string
          recommendation?: string | null
          sentiment_score?: number | null
          tool_name?: string
          utilization_metric?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_items_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "adoption_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      consulting_requests: {
        Row: {
          created_at: string
          id: string
          message: string
          problem_area: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          problem_area: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          problem_area?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      invite_code_uses: {
        Row: {
          id: string
          invite_code_id: string
          used_at: string
          user_id: string
        }
        Insert: {
          id?: string
          invite_code_id: string
          used_at?: string
          user_id: string
        }
        Update: {
          id?: string
          invite_code_id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_code_uses_invite_code_id_fkey"
            columns: ["invite_code_id"]
            isOneToOne: false
            referencedRelation: "invite_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string | null
          id: string
          role: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          id: string
          role?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          endpoint: string
          id: string
          request_count: number | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          endpoint: string
          id?: string
          request_count?: number | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          endpoint?: string
          id?: string
          request_count?: number | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      rfp_requirements: {
        Row: {
          id: string
          is_mandatory: boolean | null
          requirement_text: string
          rfp_id: string
          weight: number | null
        }
        Insert: {
          id?: string
          is_mandatory?: boolean | null
          requirement_text: string
          rfp_id: string
          weight?: number | null
        }
        Update: {
          id?: string
          is_mandatory?: boolean | null
          requirement_text?: string
          rfp_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rfp_requirements_rfp_id_fkey"
            columns: ["rfp_id"]
            isOneToOne: false
            referencedRelation: "rfps"
            referencedColumns: ["id"]
          },
        ]
      }
      rfps: {
        Row: {
          airline_id: string
          budget_max: number | null
          created_at: string
          deadline: string | null
          description: string | null
          evaluation_criteria: string | null
          id: string
          project_context: string | null
          status: string | null
          submission_guidelines: string | null
          timelines: string | null
          title: string
        }
        Insert: {
          airline_id: string
          budget_max?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          evaluation_criteria?: string | null
          id?: string
          project_context?: string | null
          status?: string | null
          submission_guidelines?: string | null
          timelines?: string | null
          title: string
        }
        Update: {
          airline_id?: string
          budget_max?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          evaluation_criteria?: string | null
          id?: string
          project_context?: string | null
          status?: string | null
          submission_guidelines?: string | null
          timelines?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfps_airline_id_fkey"
            columns: ["airline_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          ai_score: number | null
          ai_verification_notes: Json | null
          airline_response: string | null
          attachment_url: string | null
          created_at: string
          file_paths: string[] | null
          id: string
          pitch_text: string | null
          response_status: string | null
          rfp_id: string
          vendor_id: string
        }
        Insert: {
          ai_score?: number | null
          ai_verification_notes?: Json | null
          airline_response?: string | null
          attachment_url?: string | null
          created_at?: string
          file_paths?: string[] | null
          id?: string
          pitch_text?: string | null
          response_status?: string | null
          rfp_id: string
          vendor_id: string
        }
        Update: {
          ai_score?: number | null
          ai_verification_notes?: Json | null
          airline_response?: string | null
          attachment_url?: string | null
          created_at?: string
          file_paths?: string[] | null
          id?: string
          pitch_text?: string | null
          response_status?: string | null
          rfp_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_rfp_id_fkey"
            columns: ["rfp_id"]
            isOneToOne: false
            referencedRelation: "rfps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      vendor_profiles: {
        Row: {
          description: string | null
          id: string
          profile_id: string
          verified_status: boolean | null
          website_url: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          profile_id: string
          verified_status?: boolean | null
          website_url?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          profile_id?: string
          verified_status?: boolean | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "airline" | "vendor" | "consultant"
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
      app_role: ["airline", "vendor", "consultant"],
    },
  },
} as const
