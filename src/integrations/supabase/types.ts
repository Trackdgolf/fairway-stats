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
      hole_stats: {
        Row: {
          approach_club: string | null
          created_at: string | null
          fir: boolean | null
          fir_direction: string | null
          gir: boolean | null
          gir_direction: string | null
          hole_number: number
          id: string
          par: number | null
          penalties: number | null
          putts: number | null
          round_id: string
          score: number | null
          scramble: string | null
          scramble_club: string | null
          scramble_shot_type: string | null
          tee_club: string | null
          yardage: number | null
        }
        Insert: {
          approach_club?: string | null
          created_at?: string | null
          fir?: boolean | null
          fir_direction?: string | null
          gir?: boolean | null
          gir_direction?: string | null
          hole_number: number
          id?: string
          par?: number | null
          penalties?: number | null
          putts?: number | null
          round_id: string
          score?: number | null
          scramble?: string | null
          scramble_club?: string | null
          scramble_shot_type?: string | null
          tee_club?: string | null
          yardage?: number | null
        }
        Update: {
          approach_club?: string | null
          created_at?: string | null
          fir?: boolean | null
          fir_direction?: string | null
          gir?: boolean | null
          gir_direction?: string | null
          hole_number?: number
          id?: string
          par?: number | null
          penalties?: number | null
          putts?: number | null
          round_id?: string
          score?: number | null
          scramble?: string | null
          scramble_club?: string | null
          scramble_shot_type?: string | null
          tee_club?: string | null
          yardage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hole_stats_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      in_progress_rounds: {
        Row: {
          course_data: Json
          created_at: string
          current_hole_index: number
          hole_stats: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course_data: Json
          created_at?: string
          current_hole_index?: number
          hole_stats: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course_data?: Json
          created_at?: string
          current_hole_index?: number
          hole_stats?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      influencers: {
        Row: {
          code: string
          commission_annual_cpa: number
          commission_monthly_cpa: number
          commission_type: string
          commission_value: number
          created_at: string
          handle: string
          id: string
          is_active: boolean
        }
        Insert: {
          code: string
          commission_annual_cpa?: number
          commission_monthly_cpa?: number
          commission_type?: string
          commission_value?: number
          created_at?: string
          handle: string
          id?: string
          is_active?: boolean
        }
        Update: {
          code?: string
          commission_annual_cpa?: number
          commission_monthly_cpa?: number
          commission_type?: string
          commission_value?: number
          created_at?: string
          handle?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      marketing_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          opted_in_at: string
          source: string
          unsubscribed_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          opted_in_at?: string
          source?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          opted_in_at?: string
          source?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          has_seen_welcome: boolean | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          has_seen_welcome?: boolean | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          has_seen_welcome?: boolean | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          claimed_at: string
          code: string
          converted_at: string | null
          converted_entitlement_id: string | null
          converted_period: string | null
          converted_product_id: string | null
          created_at: string
          id: string
          influencer_id: string
          latest_rc_event_at: string | null
          payable_amount: number | null
          status: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          code: string
          converted_at?: string | null
          converted_entitlement_id?: string | null
          converted_period?: string | null
          converted_product_id?: string | null
          created_at?: string
          id?: string
          influencer_id: string
          latest_rc_event_at?: string | null
          payable_amount?: number | null
          status?: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          code?: string
          converted_at?: string | null
          converted_entitlement_id?: string | null
          converted_period?: string | null
          converted_product_id?: string | null
          created_at?: string
          id?: string
          influencer_id?: string
          latest_rc_event_at?: string | null
          payable_amount?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencer_referral_stats"
            referencedColumns: ["influencer_id"]
          },
          {
            foreignKeyName: "referrals_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      rounds: {
        Row: {
          country: string | null
          course_id: string | null
          course_name: string
          created_at: string | null
          id: string
          played_at: string | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          country?: string | null
          course_id?: string | null
          course_name: string
          created_at?: string | null
          id?: string
          played_at?: string | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          country?: string | null
          course_id?: string | null
          course_name?: string
          created_at?: string | null
          id?: string
          played_at?: string | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string | null
          revenuecat_customer_id: string | null
          revenuecat_product_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string | null
          revenuecat_customer_id?: string | null
          revenuecat_product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string | null
          revenuecat_customer_id?: string | null
          revenuecat_product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          my_bag: Json | null
          stat_preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          my_bag?: Json | null
          stat_preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          my_bag?: Json | null
          stat_preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      influencer_referral_stats: {
        Row: {
          code: string | null
          commission_annual_cpa: number | null
          commission_monthly_cpa: number | null
          handle: string | null
          influencer_id: string | null
          is_active: boolean | null
          last_claimed_at: string | null
          total_claimed: number | null
          total_converted: number | null
          total_converted_annual: number | null
          total_converted_monthly: number | null
          total_paid: number | null
          total_payable_amount: number | null
        }
        Relationships: []
      }
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
