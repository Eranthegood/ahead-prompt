import { supabase } from "@/integrations/supabase/client";
import type { AIAgent, AgentActivity, AgentRule, AgentType, AgentMetrics } from "@/types/ai-agents";
import type { Json } from "@/integrations/supabase/types";

export class AIAgentManager {
  // Agent Management
  static async getAgents(workspaceId: string): Promise<AIAgent[]> {
    const { data, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(agent => ({
      ...agent,
      agent_type: agent.agent_type as AgentType,
      config: agent.config as Record<string, any>
    }));
  }

  static async createAgent(agentData: Omit<AIAgent, 'id' | 'created_at' | 'updated_at'>): Promise<AIAgent> {
    const { data, error } = await supabase
      .from('ai_agents')
      .insert({
        ...agentData,
        config: agentData.config as Json
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      agent_type: data.agent_type as AgentType,
      config: data.config as Record<string, any>
    };
  }

  static async updateAgent(agentId: string, updates: Partial<AIAgent>): Promise<AIAgent> {
    const updateData = {
      ...updates,
      config: updates.config ? updates.config as Json : undefined
    };
    
    const { data, error } = await supabase
      .from('ai_agents')
      .update(updateData)
      .eq('id', agentId)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      agent_type: data.agent_type as AgentType,
      config: data.config as Record<string, any>
    };
  }

  static async deleteAgent(agentId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_agents')
      .delete()
      .eq('id', agentId);

    if (error) throw error;
  }

  static async toggleAgent(agentId: string, isActive: boolean): Promise<AIAgent> {
    return this.updateAgent(agentId, { is_active: isActive });
  }

  // Activity Logging
  static async logActivity(activity: Omit<AgentActivity, 'id' | 'created_at'>): Promise<AgentActivity> {
    const { data, error } = await supabase
      .from('agent_activities')
      .insert({
        ...activity,
        metadata: activity.metadata as Json
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      metadata: data.metadata as Record<string, any>
    };
  }

  static async getAgentActivities(agentId: string, limit = 50): Promise<AgentActivity[]> {
    const { data, error } = await supabase
      .from('agent_activities')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(activity => ({
      ...activity,
      metadata: activity.metadata as Record<string, any>
    }));
  }

  // Rules Management
  static async createRule(rule: Omit<AgentRule, 'id' | 'created_at' | 'updated_at'>): Promise<AgentRule> {
    const { data, error } = await supabase
      .from('agent_rules')
      .insert({
        ...rule,
        conditions: rule.conditions as Json,
        actions: rule.actions as Json
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      conditions: data.conditions as Record<string, any>,
      actions: data.actions as Record<string, any>
    };
  }

  static async getAgentRules(agentId: string): Promise<AgentRule[]> {
    const { data, error } = await supabase
      .from('agent_rules')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;
    return (data || []).map(rule => ({
      ...rule,
      conditions: rule.conditions as Record<string, any>,
      actions: rule.actions as Record<string, any>
    }));
  }

  // Metrics and Analytics
  static async getAgentMetrics(agentId: string): Promise<AgentMetrics> {
    const [activities, recentActivities] = await Promise.all([
      this.getAgentActivities(agentId, 1000),
      this.getAgentActivities(agentId, 10)
    ]);

    const totalActivities = activities.length;
    const successfulActivities = activities.filter(a => a.success).length;
    const successRate = totalActivities > 0 ? (successfulActivities / totalActivities) * 100 : 0;
    
    const processingTimes = activities
      .filter(a => a.processing_time_ms)
      .map(a => a.processing_time_ms!);
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
      : 0;

    return {
      agent_id: agentId,
      total_activities: totalActivities,
      success_rate: Math.round(successRate * 100) / 100,
      avg_processing_time: Math.round(avgProcessingTime),
      recent_activities: recentActivities
    };
  }

  // Execution Methods
  static async executePromptOptimization(promptId: string, workspaceId: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Call the prompt optimization edge function
      const { data, error } = await supabase.functions.invoke('optimize-prompt', {
        body: { promptId, workspaceId }
      });

      if (error) throw error;

      // Log successful activity
      await this.logActivity({
        agent_id: data.agentId,
        workspace_id: workspaceId,
        activity_type: 'prompt_optimization',
        entity_type: 'prompt',
        entity_id: promptId,
        action_taken: 'optimized_prompt',
        metadata: { improvements: data.improvements },
        success: true,
        processing_time_ms: Date.now() - startTime
      });
    } catch (error) {
      console.error('Prompt optimization failed:', error);
      
      // Try to find existing agent for error logging, or skip logging if no agent found
      try {
        const { data: existingAgent } = await supabase
          .from('ai_agents')
          .select('id')
          .eq('workspace_id', workspaceId)
          .eq('agent_type', 'prompt_optimizer')
          .eq('is_active', true)
          .single();

        if (existingAgent) {
          await this.logActivity({
            agent_id: existingAgent.id,
            workspace_id: workspaceId,
            activity_type: 'prompt_optimization',
            entity_type: 'prompt',
            entity_id: promptId,
            action_taken: 'optimize_prompt_failed',
            metadata: {},
            success: false,
            error_message: error instanceof Error ? error.message : 'Unknown error',
            processing_time_ms: Date.now() - startTime
          });
        }
      } catch (logError) {
        console.error('Failed to log error activity:', logError);
      }
      
      throw error;
    }
  }

  // Knowledge Curator Agent
  static async executeKnowledgeAnalysis(knowledgeItemId: string, workspaceId: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-curator', {
        body: { 
          workspaceId, 
          knowledgeItemId, 
          action: 'analyze_knowledge' 
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Knowledge analysis failed:', error);
      throw error;
    }
  }

  static async findKnowledgeDuplicates(workspaceId: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-curator', {
        body: { 
          workspaceId, 
          action: 'find_duplicates' 
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Duplicate detection failed:', error);
      throw error;
    }
  }

  static async suggestKnowledgeCategories(workspaceId: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-curator', {
        body: { 
          workspaceId, 
          action: 'suggest_categories' 
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Category suggestion failed:', error);
      throw error;
    }
  }

  // Task Automation Methods
  static async executeTaskAutomation(workspaceId: string, entityId?: string, entityType?: string): Promise<any> {
    try {
      // Only call if we have valid entity parameters
      if (!entityId || !entityType) {
        console.log('Skipping task automation - missing entityId or entityType');
        return { success: true, message: 'Skipped - missing entity parameters' };
      }

      const { data, error } = await supabase.functions.invoke('workflow-automation', {
        body: {
          workspaceId,
          action: 'task_automation',
          entityId,
          entityType
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Task automation failed:', error);
      throw error;
    }
  }

  // Workspace-level automation methods
  static async executeWorkspaceAutomation(workspaceId: string, action: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('workflow-automation', {
        body: { 
          workspaceId, 
          action 
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Workspace automation failed:', error);
      throw error;
    }
  }

  // Workflow Automation Agent
  static async executeWorkflowAutomation(entityId: string, entityType: string, workspaceId: string, action: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('workflow-automation', {
        body: { 
          workspaceId, 
          entityId,
          entityType,
          action 
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Workflow automation failed:', error);
      throw error;
    }
  }

  static async autoStatusUpdate(entityId: string, entityType: string, workspaceId: string): Promise<void> {
    return this.executeWorkflowAutomation(entityId, entityType, workspaceId, 'auto_status_update');
  }

  static async adjustPriorities(workspaceId: string): Promise<void> {
    return this.executeWorkspaceAutomation(workspaceId, 'priority_adjustment');
  }

  static async organizeEpics(workspaceId: string): Promise<void> {
    return this.executeWorkspaceAutomation(workspaceId, 'epic_organization');
  }

  static async analyzePromptPatterns(workspaceId: string): Promise<void> {
    return this.executeWorkspaceAutomation(workspaceId, 'analyze_prompt_patterns');
  }
}