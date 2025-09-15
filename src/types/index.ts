export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      epics: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      prompts: {
        Row: {
          id: string;
          workspace_id: string;
          epic_id: string | null;
          product_id: string | null;
          title: string;
          description: string | null;
          status: 'todo' | 'generating' | 'in_progress' | 'done' | 'sending_to_cursor' | 'sent_to_cursor' | 'cursor_working' | 'pr_created' | 'pr_review' | 'pr_ready' | 'pr_merged' | 'error';
          priority: number;
          order_index: number;
          generated_prompt: string | null;
          generated_at: string | null;
          is_debug_session: boolean | null;
          cursor_agent_id: string | null;
          cursor_agent_status: string | null;
          github_pr_number: number | null;
          github_pr_url: string | null;
          github_pr_status: string | null;
          cursor_branch_name: string | null;
          cursor_logs: any;
          workflow_metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          epic_id?: string | null;
          product_id?: string | null;
          title: string;
          description?: string | null;
          status?: 'todo' | 'generating' | 'in_progress' | 'done' | 'sending_to_cursor' | 'sent_to_cursor' | 'cursor_working' | 'pr_created' | 'pr_review' | 'pr_ready' | 'pr_merged' | 'error';
          priority?: number;
          order_index?: number;
          generated_prompt?: string | null;
          generated_at?: string | null;
          is_debug_session?: boolean | null;
          cursor_agent_id?: string | null;
          cursor_agent_status?: string | null;
          github_pr_number?: number | null;
          github_pr_url?: string | null;
          github_pr_status?: string | null;
          cursor_branch_name?: string | null;
          cursor_logs?: any;
          workflow_metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          epic_id?: string | null;
          product_id?: string | null;
          title?: string;
          description?: string | null;
          status?: 'todo' | 'generating' | 'in_progress' | 'done' | 'sending_to_cursor' | 'sent_to_cursor' | 'cursor_working' | 'pr_created' | 'pr_review' | 'pr_ready' | 'pr_merged' | 'error';
          priority?: number;
          order_index?: number;
          generated_prompt?: string | null;
          generated_at?: string | null;
          is_debug_session?: boolean | null;
          cursor_agent_id?: string | null;
          cursor_agent_status?: string | null;
          github_pr_number?: number | null;
          github_pr_url?: string | null;
          github_pr_status?: string | null;
          cursor_branch_name?: string | null;
          cursor_logs?: any;
          workflow_metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      knowledge_items: {
        Row: {
          id: string;
          workspace_id: string;
          product_id: string | null;
          title: string;
          content: string;
          tags: string[];
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          product_id?: string | null;
          title: string;
          content: string;
          tags?: string[];
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          product_id?: string | null;
          title?: string;
          content?: string;
          tags?: string[];
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Workspace = Database['public']['Tables']['workspaces']['Row'];
export type Epic = Database['public']['Tables']['epics']['Row'] & {
  product_id?: string; // Add product_id to Epic interface
  git_branch_name?: string | null;
  auto_create_pr?: boolean;
  base_branch_override?: string | null;
};
export type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  original_description?: string | null;
};
export type KnowledgeItem = Database['public']['Tables']['knowledge_items']['Row'];

// Add Product type (will be available after migration)
export interface Product {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  color: string;
  github_repo_url?: string | null;
  default_branch?: string;
  cursor_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export type PromptStatus = 'todo' | 'generating' | 'in_progress' | 'done' | 'sending_to_cursor' | 'sent_to_cursor' | 'cursor_working' | 'pr_created' | 'pr_review' | 'pr_ready' | 'pr_merged' | 'error';
export type EpicColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink';

// Priority levels: 1 = High, 2 = Normal, 3 = Low
export type PromptPriority = 1 | 2 | 3;

export const PRIORITY_LABELS = {
  1: "High",
  2: "Normal", 
  3: "Low"
} as const;

export const PRIORITY_OPTIONS = [
  { value: 1, label: "High", variant: "destructive" as const },
  { value: 2, label: "Normal", variant: "default" as const },
  { value: 3, label: "Low", variant: "secondary" as const }
];