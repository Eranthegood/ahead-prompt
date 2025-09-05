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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      binary_tasks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_completed: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_activity: {
        Row: {
          activity_date: string
          ai_generations: number
          created_at: string
          epics_completed: number
          epics_created: number
          id: string
          prompts_completed: number
          prompts_created: number
          updated_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          activity_date?: string
          ai_generations?: number
          created_at?: string
          epics_completed?: number
          epics_created?: number
          id?: string
          prompts_completed?: number
          prompts_created?: number
          updated_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          activity_date?: string
          ai_generations?: number
          created_at?: string
          epics_completed?: number
          epics_created?: number
          id?: string
          prompts_completed?: number
          prompts_created?: number
          updated_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      epics: {
        Row: {
          auto_create_pr: boolean | null
          base_branch_override: string | null
          color: string | null
          created_at: string
          description: string | null
          git_branch_name: string | null
          id: string
          name: string
          product_id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          auto_create_pr?: boolean | null
          base_branch_override?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          git_branch_name?: string | null
          id?: string
          name: string
          product_id: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          auto_create_pr?: boolean | null
          base_branch_override?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          git_branch_name?: string | null
          id?: string
          name?: string
          product_id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "epics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epics_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          user_id?: string | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          created_at: string
          id: string
          integration_type: string
          is_configured: boolean
          is_enabled: boolean
          last_test_result: string | null
          last_test_time: string | null
          metadata: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          integration_type: string
          is_configured?: boolean
          is_enabled?: boolean
          last_test_result?: string | null
          last_test_time?: string | null
          metadata?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          integration_type?: string
          is_configured?: boolean
          is_enabled?: boolean
          last_test_result?: string | null
          last_test_time?: string | null
          metadata?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      knowledge_items: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          product_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          product_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          product_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      kv_store_bd163058: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      mixpanel_excluded_users: {
        Row: {
          created_at: string
          excluded_by: string
          id: string
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          excluded_by: string
          id?: string
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          excluded_by?: string
          id?: string
          reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mixpanel_exclusion_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          mixpanel_response: string | null
          performed_by: string
          success: boolean | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          mixpanel_response?: string | null
          performed_by: string
          success?: boolean | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          mixpanel_response?: string | null
          performed_by?: string
          success?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          color: string | null
          created_at: string
          cursor_enabled: boolean | null
          default_branch: string | null
          description: string | null
          github_repo_url: string | null
          id: string
          name: string
          order_index: number | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          cursor_enabled?: boolean | null
          default_branch?: string | null
          description?: string | null
          github_repo_url?: string | null
          id?: string
          name: string
          order_index?: number | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          cursor_enabled?: boolean | null
          default_branch?: string | null
          description?: string | null
          github_repo_url?: string | null
          id?: string
          name?: string
          order_index?: number | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          provider: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          provider?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          provider?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prompt_enhancer_versions: {
        Row: {
          commit_message: string | null
          created_at: string
          created_by: string | null
          enhancer_id: string
          id: string
          prompt_template: string
          system_message: string
          version_number: number
        }
        Insert: {
          commit_message?: string | null
          created_at?: string
          created_by?: string | null
          enhancer_id: string
          id?: string
          prompt_template: string
          system_message: string
          version_number: number
        }
        Update: {
          commit_message?: string | null
          created_at?: string
          created_by?: string | null
          enhancer_id?: string
          id?: string
          prompt_template?: string
          system_message?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_enhancer_versions_enhancer_id_fkey"
            columns: ["enhancer_id"]
            isOneToOne: false
            referencedRelation: "prompt_enhancers"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_enhancers: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          prompt_template: string
          system_message: string
          type: Database["public"]["Enums"]["enhancer_type"]
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          prompt_template: string
          system_message: string
          type?: Database["public"]["Enums"]["enhancer_type"]
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          prompt_template?: string
          system_message?: string
          type?: Database["public"]["Enums"]["enhancer_type"]
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_enhancers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_test_runs: {
        Row: {
          created_at: string
          enhancer_version_id: string
          error_message: string | null
          execution_time: number | null
          id: string
          max_tokens: number | null
          model_used: string
          status: string
          temperature: number | null
          test_input: string
          test_output: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          enhancer_version_id: string
          error_message?: string | null
          execution_time?: number | null
          id?: string
          max_tokens?: number | null
          model_used?: string
          status?: string
          temperature?: number | null
          test_input: string
          test_output?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          enhancer_version_id?: string
          error_message?: string | null
          execution_time?: number | null
          id?: string
          max_tokens?: number | null
          model_used?: string
          status?: string
          temperature?: number | null
          test_input?: string
          test_output?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_test_runs_enhancer_version_id_fkey"
            columns: ["enhancer_version_id"]
            isOneToOne: false
            referencedRelation: "prompt_enhancer_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_test_runs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          created_at: string
          description: string | null
          epic_id: string | null
          generated_at: string | null
          generated_prompt: string | null
          id: string
          is_debug_session: boolean | null
          order_index: number
          priority: number | null
          product_id: string | null
          status: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          epic_id?: string | null
          generated_at?: string | null
          generated_prompt?: string | null
          id?: string
          is_debug_session?: boolean | null
          order_index?: number
          priority?: number | null
          product_id?: string | null
          status?: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          epic_id?: string | null
          generated_at?: string | null
          generated_prompt?: string | null
          id?: string
          is_debug_session?: boolean | null
          order_index?: number
          priority?: number | null
          product_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          best_streak: number
          created_at: string
          current_level: number
          current_streak: number
          id: string
          last_activity_date: string | null
          total_ai_generations: number
          total_epics_completed: number
          total_epics_created: number
          total_prompts_completed: number
          total_prompts_created: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          total_ai_generations?: number
          total_epics_completed?: number
          total_epics_created?: number
          total_prompts_completed?: number
          total_prompts_created?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak?: number
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          total_ai_generations?: number
          total_epics_completed?: number
          total_epics_created?: number
          total_prompts_completed?: number
          total_prompts_created?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_level: {
        Args: { xp: number }
        Returns: number
      }
      ensure_user_stats: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      enhancer_type: "system" | "user"
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
      enhancer_type: ["system", "user"],
    },
  },
} as const
