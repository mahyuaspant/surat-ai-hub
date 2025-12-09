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
      digital_signatures: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          letter_id: string
          signature_hash: string
          signature_image_url: string
          signed_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          letter_id: string
          signature_hash: string
          signature_image_url: string
          signed_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          letter_id?: string
          signature_hash?: string
          signature_image_url?: string
          signed_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_signatures_letter_id_fkey"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "outgoing_letters"
            referencedColumns: ["id"]
          },
        ]
      }
      dispositions: {
        Row: {
          created_at: string | null
          deadline: string | null
          from_user_id: string
          id: string
          instructions: string
          letter_id: string
          response: string | null
          status: string | null
          to_user_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deadline?: string | null
          from_user_id: string
          id?: string
          instructions: string
          letter_id: string
          response?: string | null
          status?: string | null
          to_user_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deadline?: string | null
          from_user_id?: string
          id?: string
          instructions?: string
          letter_id?: string
          response?: string | null
          status?: string | null
          to_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispositions_letter_id_fkey"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "incoming_letters"
            referencedColumns: ["id"]
          },
        ]
      }
      incoming_letters: {
        Row: {
          ai_summary: string | null
          content: string | null
          created_at: string | null
          file_url: string | null
          id: string
          institution_id: string
          sender_email: string
          sender_name: string
          sender_phone: string | null
          status: Database["public"]["Enums"]["letter_status"] | null
          subject: string
          ticket_number: string
          updated_at: string | null
        }
        Insert: {
          ai_summary?: string | null
          content?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          institution_id: string
          sender_email: string
          sender_name: string
          sender_phone?: string | null
          status?: Database["public"]["Enums"]["letter_status"] | null
          subject: string
          ticket_number: string
          updated_at?: string | null
        }
        Update: {
          ai_summary?: string | null
          content?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          institution_id?: string
          sender_email?: string
          sender_name?: string
          sender_phone?: string | null
          status?: Database["public"]["Enums"]["letter_status"] | null
          subject?: string
          ticket_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incoming_letters_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      letter_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          institution_id: string
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          institution_id: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          institution_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "letter_templates_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      letter_verifications: {
        Row: {
          id: string
          ip_address: string | null
          is_valid: boolean | null
          letter_id: string
          verification_hash: string
          verified_at: string | null
        }
        Insert: {
          id?: string
          ip_address?: string | null
          is_valid?: boolean | null
          letter_id: string
          verification_hash: string
          verified_at?: string | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          is_valid?: boolean | null
          letter_id?: string
          verification_hash?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "letter_verifications_letter_id_fkey"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "outgoing_letters"
            referencedColumns: ["id"]
          },
        ]
      }
      letterhead_settings: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string
          custom_header: string | null
          id: string
          institution_id: string
          institution_name: string
          logo_url: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string
          custom_header?: string | null
          id?: string
          institution_id: string
          institution_name: string
          logo_url?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string
          custom_header?: string | null
          id?: string
          institution_id?: string
          institution_name?: string
          logo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "letterhead_settings_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: true
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      outgoing_letters: {
        Row: {
          approved_by: string | null
          content: string
          created_at: string | null
          created_by: string | null
          document_hash: string | null
          file_url: string | null
          final_pdf_url: string | null
          id: string
          institution_id: string
          is_signed: boolean | null
          letter_number: string
          qr_code_url: string | null
          recipient: string
          status: Database["public"]["Enums"]["letter_status"] | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          document_hash?: string | null
          file_url?: string | null
          final_pdf_url?: string | null
          id?: string
          institution_id: string
          is_signed?: boolean | null
          letter_number: string
          qr_code_url?: string | null
          recipient: string
          status?: Database["public"]["Enums"]["letter_status"] | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          document_hash?: string | null
          file_url?: string | null
          final_pdf_url?: string | null
          id?: string
          institution_id?: string
          is_signed?: boolean | null
          letter_number?: string
          qr_code_url?: string | null
          recipient?: string
          status?: Database["public"]["Enums"]["letter_status"] | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outgoing_letters_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          institution_id: string | null
          phone: string | null
          position: string | null
          signature_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          institution_id?: string | null
          phone?: string | null
          position?: string | null
          signature_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          institution_id?: string | null
          phone?: string | null
          position?: string | null
          signature_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          institution_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          institution_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          institution_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_institution: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "superadmin" | "admin_instansi" | "user_instansi" | "visitor"
      letter_status:
        | "received"
        | "review"
        | "disposition"
        | "in_progress"
        | "completed"
        | "archived"
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
      app_role: ["superadmin", "admin_instansi", "user_instansi", "visitor"],
      letter_status: [
        "received",
        "review",
        "disposition",
        "in_progress",
        "completed",
        "archived",
      ],
    },
  },
} as const
