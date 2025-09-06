export type AgentType = 'prompt_optimizer' | 'workflow_automation' | 'knowledge_curator' | 'code_review' | 'analytics';

export interface AIAgent {
  id: string;
  workspace_id: string;
  agent_type: AgentType;
  name: string;
  description?: string;
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentActivity {
  id: string;
  agent_id: string;
  workspace_id: string;
  activity_type: string;
  entity_type?: string;
  entity_id?: string;
  action_taken: string;
  metadata: Record<string, any>;
  success: boolean;
  error_message?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface AgentRule {
  id: string;
  agent_id: string;
  workspace_id: string;
  rule_type: string;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentMetrics {
  agent_id: string;
  total_activities: number;
  success_rate: number;
  avg_processing_time: number;
  recent_activities: AgentActivity[];
}