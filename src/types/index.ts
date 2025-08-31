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
          status: 'todo' | 'in_progress' | 'done';
          priority: number;
          order_index: number;
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
          status?: 'todo' | 'in_progress' | 'done';
          priority?: number;
          order_index?: number;
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
          status?: 'todo' | 'in_progress' | 'done';
          priority?: number;
          order_index?: number;
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
};
export type Prompt = Database['public']['Tables']['prompts']['Row'];
export type KnowledgeItem = Database['public']['Tables']['knowledge_items']['Row'];

// Add Product type (will be available after migration)
export interface Product {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export type PromptStatus = 'todo' | 'in_progress' | 'done';
export type EpicColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink';