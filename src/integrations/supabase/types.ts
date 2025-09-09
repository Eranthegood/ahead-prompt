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
      agent_activities: {
        Row: {
          action_taken: string
          activity_type: string
          agent_id: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          processing_time_ms: number | null
          success: boolean
          workspace_id: string
        }
        Insert: {
          action_taken: string
          activity_type: string
          agent_id: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          success?: boolean
          workspace_id: string
        }
        Update: {
          action_taken?: string
          activity_type?: string
          agent_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          success?: boolean
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_activities_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_rules: {
        Row: {
          actions: Json
          agent_id: string
          conditions: Json
          created_at: string
          id: string
          is_active: boolean
          priority: number
          rule_type: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          actions?: Json
          agent_id: string
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: number
          rule_type: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          actions?: Json
          agent_id?: string
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: number
          rule_type?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_rules_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          agent_type: string
          config: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          agent_type: string
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          agent_type?: string
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
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
      cursor_audit_logs: {
        Row: {
          action: string
          created_at: string
          error_details: string | null
          id: string
          metadata: Json | null
          prompt_id: string
          status: string
          success: boolean
          timestamp: string
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          error_details?: string | null
          id?: string
          metadata?: Json | null
          prompt_id: string
          status: string
          success?: boolean
          timestamp?: string
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          error_details?: string | null
          id?: string
          metadata?: Json | null
          prompt_id?: string
          status?: string
          success?: boolean
          timestamp?: string
          updated_at?: string
        }
        Relationships: []
      }
      cursor_tracking_events: {
        Row: {
          created_at: string
          data: Json
          duration_ms: number | null
          event_type: string
          id: string
          performance_metrics: Json | null
          prompt_id: string
          timestamp: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          duration_ms?: number | null
          event_type: string
          id?: string
          performance_metrics?: Json | null
          prompt_id: string
          timestamp?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          duration_ms?: number | null
          event_type?: string
          id?: string
          performance_metrics?: Json | null
          prompt_id?: string
          timestamp?: string
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
      figma_design_elements: {
        Row: {
          created_at: string
          description: string | null
          element_type: string
          figma_url: string | null
          id: string
          name: string
          node_id: string
          project_id: string
          specs: Json | null
          thumbnail_url: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          element_type: string
          figma_url?: string | null
          id?: string
          name: string
          node_id: string
          project_id: string
          specs?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          element_type?: string
          figma_url?: string | null
          id?: string
          name?: string
          node_id?: string
          project_id?: string
          specs?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "figma_design_elements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "figma_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      figma_projects: {
        Row: {
          created_at: string
          figma_file_key: string
          figma_file_name: string
          id: string
          last_synced_at: string | null
          team_id: string | null
          team_name: string | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          figma_file_key: string
          figma_file_name: string
          id?: string
          last_synced_at?: string | null
          team_id?: string | null
          team_name?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          figma_file_key?: string
          figma_file_name?: string
          id?: string
          last_synced_at?: string | null
          team_id?: string | null
          team_name?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
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
      pricing_feedback: {
        Row: {
          created_at: string
          email: string | null
          feedback_type: string
          id: string
          ip_address: unknown | null
          price_point: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          feedback_type?: string
          id?: string
          ip_address?: unknown | null
          price_point: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          feedback_type?: string
          id?: string
          ip_address?: unknown | null
          price_point?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
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
      prompt_library: {
        Row: {
          ai_model: string
          body: string
          category: string | null
          created_at: string
          id: string
          is_favorite: boolean
          tags: string[] | null
          title: string
          updated_at: string
          usage_count: number
          user_id: string
          workspace_id: string
        }
        Insert: {
          ai_model?: string
          body: string
          category?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean
          tags?: string[] | null
          title: string
          updated_at?: string
          usage_count?: number
          user_id: string
          workspace_id: string
        }
        Update: {
          ai_model?: string
          body?: string
          category?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_library_workspace_id_fkey"
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
          cursor_agent_id: string | null
          cursor_agent_status: string | null
          cursor_branch_name: string | null
          cursor_logs: Json | null
          description: string | null
          epic_id: string | null
          generated_at: string | null
          generated_prompt: string | null
          github_pr_number: number | null
          github_pr_status: string | null
          github_pr_url: string | null
          id: string
          is_debug_session: boolean | null
          order_index: number
          original_description: string | null
          priority: number | null
          product_id: string | null
          status: string
          title: string
          updated_at: string
          workflow_metadata: Json | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          cursor_agent_id?: string | null
          cursor_agent_status?: string | null
          cursor_branch_name?: string | null
          cursor_logs?: Json | null
          description?: string | null
          epic_id?: string | null
          generated_at?: string | null
          generated_prompt?: string | null
          github_pr_number?: number | null
          github_pr_status?: string | null
          github_pr_url?: string | null
          id?: string
          is_debug_session?: boolean | null
          order_index?: number
          original_description?: string | null
          priority?: number | null
          product_id?: string | null
          status?: string
          title: string
          updated_at?: string
          workflow_metadata?: Json | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          cursor_agent_id?: string | null
          cursor_agent_status?: string | null
          cursor_branch_name?: string | null
          cursor_logs?: Json | null
          description?: string | null
          epic_id?: string | null
          generated_at?: string | null
          generated_prompt?: string | null
          github_pr_number?: number | null
          github_pr_status?: string | null
          github_pr_url?: string | null
          id?: string
          is_debug_session?: boolean | null
          order_index?: number
          original_description?: string | null
          priority?: number | null
          product_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          workflow_metadata?: Json | null
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
      seo_articles: {
        Row: {
          content: string | null
          created_at: string
          external_id: string
          id: string
          keywords: string[] | null
          meta_description: string | null
          metadata: Json | null
          published_at: string | null
          seo_score: number | null
          source: string
          status: string
          title: string
          updated_at: string
          url: string | null
          webhook_received_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          external_id: string
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          metadata?: Json | null
          published_at?: string | null
          seo_score?: number | null
          source?: string
          status?: string
          title: string
          updated_at?: string
          url?: string | null
          webhook_received_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          external_id?: string
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          metadata?: Json | null
          published_at?: string | null
          seo_score?: number | null
          source?: string
          status?: string
          title?: string
          updated_at?: string
          url?: string | null
          webhook_received_at?: string
        }
        Relationships: []
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
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          payload: Json | null
          processed_count: number | null
          source: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          processed_count?: number | null
          source: string
          status: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          processed_count?: number | null
          source?: string
          status?: string
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
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
      enhancer_type: ["system", "user"],
    },
  },
} as const
