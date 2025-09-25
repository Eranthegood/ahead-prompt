import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workspaceId, action, entityId, entityType } = await req.json();

    console.log('Workflow Automation action:', { workspaceId, action, entityId, entityType });

    // Find or create the workflow automation agent
    let { data: agent, error: agentError } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('agent_type', 'workflow_automation')
      .eq('is_active', true)
      .single();

    if (agentError && agentError.code === 'PGRST116') {
      const { data: newAgent, error: createError } = await supabase
        .from('ai_agents')
        .insert({
          workspace_id: workspaceId,
          agent_type: 'workflow_automation',
          name: 'Workflow Automation',
          description: 'Automatically manages workflow states and organization',
          config: {
            auto_status_updates: true,
            priority_adjustments: true,
            epic_organization: true,
            notification_triggers: true
          },
          is_active: true
        })
        .select()
        .single();

      if (createError) throw new Error('Failed to create workflow automation agent');
      agent = newAgent;
    } else if (agentError) {
      throw new Error('Failed to fetch workflow automation agent');
    }

    const startTime = Date.now();

    switch (action) {
      case 'auto_status_update':
        return await autoStatusUpdate(workspaceId, entityId, entityType, agent.id, startTime);
      case 'task_automation':
        return await automateTaskTransitions(workspaceId, entityId, entityType, agent.id, startTime);
      case 'priority_adjustment':
        return await priorityAdjustment(workspaceId, agent.id, startTime);
      case 'epic_organization':
        return await epicOrganization(workspaceId, agent.id, startTime);
      case 'analyze_prompt_patterns':
        return await analyzePromptPatterns(workspaceId, agent.id, startTime);
      default:
        throw new Error('Unknown action');
    }

  } catch (error) {
    console.error('Error in workflow-automation function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function autoStatusUpdate(workspaceId: string, entityId: string, entityType: string, agentId: string, startTime: number) {
  try {
    let updatedEntities = [];

    if (entityType === 'prompt') {
      // Check if prompt has been copied (indicating it's being used)
      const { data: prompt, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', entityId)
        .single();

      if (error) throw error;

      // Rule: If prompt was just copied, move to "in_progress" - DISABLED
      // if (prompt.status === 'todo') {
      //   await supabase
      //     .from('prompts')
      //     .update({ 
      //       status: 'in_progress',
      //       updated_at: new Date().toISOString()
      //     })
      //     .eq('id', entityId);

      //   updatedEntities.push({
      //     id: entityId,
      //     type: 'prompt',
      //     old_status: 'todo',
      //     new_status: 'in_progress',
      //     reason: 'Auto-updated on copy action'
      //   });
      // }
    } else if (entityType === 'epic') {
      // Auto-update epic status based on prompt completion rates
      const { data: epic, error } = await supabase
        .from('epics')
        .select('*')
        .eq('id', entityId)
        .single();

      if (error) throw error;

      // Get prompts in this epic
      const { data: prompts, error: promptsError } = await supabase
        .from('prompts')
        .select('status')
        .eq('epic_id', entityId);

      if (promptsError) throw promptsError;

      if (prompts.length > 0) {
        const completedPrompts = prompts.filter(p => p.status === 'done').length;
        const completionRate = completedPrompts / prompts.length;

        let newStatus = epic.status;
        
        if (completionRate === 1 && epic.status !== 'done') {
          newStatus = 'done';
        } else if (completionRate > 0.5 && epic.status === 'todo') {
          newStatus = 'in_progress';
        } else if (completionRate > 0 && epic.status === 'todo') {
          newStatus = 'in_progress';
        }

        if (newStatus !== epic.status) {
          await supabase
            .from('epics')
            .update({ 
              status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', entityId);

          updatedEntities.push({
            id: entityId,
            type: 'epic',
            old_status: epic.status,
            new_status: newStatus,
            reason: `Auto-updated based on ${Math.round(completionRate * 100)}% completion rate`
          });
        }
      }
    }

    // Log activity
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'status_automation',
      entity_type: entityType,
      entity_id: entityId,
      action_taken: 'auto_status_update',
      metadata: { updates: updatedEntities },
      success: true,
      processing_time_ms: Date.now() - startTime
    });

    return new Response(JSON.stringify({
      success: true,
      updates: updatedEntities
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'status_automation',
      entity_type: entityType,
      entity_id: entityId,
      action_taken: 'status_update_failed',
      metadata: {},
      success: false,
      error_message: error.message,
      processing_time_ms: Date.now() - startTime
    });
    throw error;
  }
}

// Task automation for MVP - handles automatic transitions
async function automateTaskTransitions(workspaceId: string, entityId: string, entityType: string, agentId: string, startTime: number) {
  try {
    if (entityType === 'prompt' && entityId) {
      // Get the specific prompt
      const { data: prompt, error: promptError } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', entityId)
        .single();

      if (promptError || !prompt) {
        console.error('Error fetching prompt:', promptError);
        throw new Error('Prompt not found');
      }

      const updates: any = {};
      let statusChanged = false;
      let reason = '';

      // Rule 1: "To Do" → "In Progress" when Cursor agent starts - DISABLED
      // if (prompt.status === 'todo' && prompt.cursor_agent_id && 
      //     (prompt.cursor_agent_status === 'RUNNING' || prompt.cursor_agent_status === 'CREATING')) {
      //   updates.status = 'in_progress';
      //   statusChanged = true;
      //   reason = 'Cursor agent started working on task';
      // }

      // Rule 2: "In Progress" → "Done" when PR is merged
      if ((prompt.status === 'in_progress' || prompt.status === 'pr_created') && 
          prompt.github_pr_url && prompt.github_pr_status === 'merged') {
        updates.status = 'done';
        statusChanged = true;
        reason = 'Pull request merged successfully';
      }

      // Rule 3: Handle Cursor completion
      if (prompt.status === 'cursor_working' && prompt.cursor_agent_status === 'COMPLETED') {
        if (prompt.github_pr_url) {
          updates.status = 'pr_created';
          reason = 'Cursor completed - PR created';
        } else {
          updates.status = 'done';
          reason = 'Cursor completed - Task finished';
        }
        statusChanged = true;
      }

      // Rule 4: Handle failures - reset to todo
      if ((prompt.status === 'cursor_working' || prompt.status === 'sending_to_cursor') && 
          (prompt.cursor_agent_status === 'FAILED' || prompt.cursor_agent_status === 'CANCELLED')) {
        updates.status = 'todo';
        statusChanged = true;
        reason = `Cursor ${prompt.cursor_agent_status.toLowerCase()} - Reset to todo`;
      }

      if (statusChanged) {
        // Add automation metadata
        updates.workflow_metadata = {
          ...prompt.workflow_metadata,
          automated_at: new Date().toISOString(),
          automation_reason: reason,
          previous_status: prompt.status
        };

        // Update the prompt
        const { error: updateError } = await supabase
          .from('prompts')
          .update(updates)
          .eq('id', entityId);

        if (updateError) {
          console.error('Error updating prompt status:', updateError);
          throw new Error('Failed to update prompt');
        }

        // Log success activity
        await supabase.from('agent_activities').insert({
          agent_id: agentId,
          workspace_id: workspaceId,
          activity_type: 'task_automation',
          entity_type: 'prompt',
          entity_id: entityId,
          action_taken: `status_transition_${prompt.status}_to_${updates.status}`,
          metadata: {
            previous_status: prompt.status,
            new_status: updates.status,
            reason: reason,
            cursor_agent_id: prompt.cursor_agent_id,
            pr_url: prompt.github_pr_url
          },
          success: true,
          processing_time_ms: Date.now() - startTime
        });

        console.log(`Task automation: ${prompt.title} (${entityId}) - ${prompt.status} → ${updates.status}: ${reason}`);
        
        return new Response(JSON.stringify({
          success: true,
          action: 'status_updated',
          previous_status: prompt.status,
          new_status: updates.status,
          reason: reason
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Log no automation needed
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'task_automation',
      entity_type: entityType || 'prompt',
      entity_id: entityId,
      action_taken: 'no_automation_needed',
      metadata: { checked_at: new Date().toISOString() },
      success: true,
      processing_time_ms: Date.now() - startTime
    });

    return new Response(JSON.stringify({ success: true, action: 'no_automation_needed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Task automation failed:', error);
    
    // Log failed activity
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'task_automation',
      entity_type: entityType || 'prompt',
      entity_id: entityId || null,
      action_taken: 'task_automation_failed',
      metadata: {},
      success: false,
      error_message: error.message,
      processing_time_ms: Date.now() - startTime
    });

    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function priorityAdjustment(workspaceId: string, agentId: string, startTime: number) {
  try {
    // Get prompts created in the last 24 hours to analyze patterns
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentPrompts, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('created_at', oneDayAgo)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const adjustments = [];

    // Rule 1: Increase priority for prompts with urgent keywords
    const urgentKeywords = ['urgent', 'critical', 'asap', 'important', 'priority', 'fix', 'bug', 'error', 'broken'];
    
    for (const prompt of recentPrompts) {
      const hasUrgentKeywords = urgentKeywords.some(keyword => 
        prompt.title.toLowerCase().includes(keyword) || 
        prompt.description?.toLowerCase().includes(keyword)
      );

      if (hasUrgentKeywords && prompt.priority < 3) {
        await supabase
          .from('prompts')
          .update({ 
            priority: Math.min(3, prompt.priority + 1),
            updated_at: new Date().toISOString()
          })
          .eq('id', prompt.id);

        adjustments.push({
          prompt_id: prompt.id,
          old_priority: prompt.priority,
          new_priority: Math.min(3, prompt.priority + 1),
          reason: 'Contains urgent keywords'
        });
      }
    }

    // Rule 2: Boost priority for frequently accessed prompts
    const { data: frequentPrompts, error: freqError } = await supabase
      .from('prompts')
      .select('id, priority, title')
      .eq('workspace_id', workspaceId)
      .eq('status', 'in_progress')
      .gte('updated_at', oneDayAgo);

    if (!freqError && frequentPrompts) {
      for (const prompt of frequentPrompts.slice(0, 3)) { // Top 3 active prompts
        if (prompt.priority < 2) {
          await supabase
            .from('prompts')
            .update({ 
              priority: 2,
              updated_at: new Date().toISOString()
            })
            .eq('id', prompt.id);

          adjustments.push({
            prompt_id: prompt.id,
            old_priority: prompt.priority,
            new_priority: 2,
            reason: 'Frequently accessed prompt'
          });
        }
      }
    }

    // Log activity
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'priority_automation',
      action_taken: 'adjusted_priorities',
      metadata: { adjustments_made: adjustments.length, adjustments },
      success: true,
      processing_time_ms: Date.now() - startTime
    });

    return new Response(JSON.stringify({
      success: true,
      adjustments
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'priority_automation',
      action_taken: 'priority_adjustment_failed',
      metadata: {},
      success: false,
      error_message: error.message,
      processing_time_ms: Date.now() - startTime
    });
    throw error;
  }
}

async function epicOrganization(workspaceId: string, agentId: string, startTime: number) {
  try {
    // Get prompts without epics
    const { data: orphanPrompts, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .is('epic_id', null);

    if (error) throw error;

    // Get existing epics for pattern matching
    const { data: epics, error: epicsError } = await supabase
      .from('epics')
      .select('*')
      .eq('workspace_id', workspaceId);

    if (epicsError) throw epicsError;

    const suggestions = [];

    // Group orphan prompts by similarity to existing epics
    for (const prompt of orphanPrompts) {
      let bestMatch = null;
      let bestScore = 0;

      for (const epic of epics) {
        const score = calculateTextSimilarity(
          prompt.title + ' ' + (prompt.description || ''),
          epic.title + ' ' + (epic.description || '')
        );

        if (score > bestScore && score > 0.3) {
          bestMatch = epic;
          bestScore = score;
        }
      }

      if (bestMatch) {
        suggestions.push({
          prompt_id: prompt.id,
          prompt_title: prompt.title,
          suggested_epic_id: bestMatch.id,
          suggested_epic_title: bestMatch.title,
          similarity_score: bestScore,
          reason: 'Content similarity detected'
        });
      }
    }

    // Auto-assign high confidence matches (score > 0.7)
    const autoAssigned = [];
    for (const suggestion of suggestions) {
      if (suggestion.similarity_score > 0.7) {
        await supabase
          .from('prompts')
          .update({ 
            epic_id: suggestion.suggested_epic_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', suggestion.prompt_id);

        autoAssigned.push(suggestion);
      }
    }

    // Log activity
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'epic_organization',
      action_taken: 'organized_prompts',
      metadata: { 
        suggestions_made: suggestions.length, 
        auto_assigned: autoAssigned.length,
        suggestions: suggestions.filter(s => s.similarity_score <= 0.7),
        auto_assignments: autoAssigned
      },
      success: true,
      processing_time_ms: Date.now() - startTime
    });

    return new Response(JSON.stringify({
      success: true,
      suggestions: suggestions.filter(s => s.similarity_score <= 0.7),
      auto_assigned: autoAssigned
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'epic_organization',
      action_taken: 'organization_failed',
      metadata: {},
      success: false,
      error_message: error.message,
      processing_time_ms: Date.now() - startTime
    });
    throw error;
  }
}

async function analyzePromptPatterns(workspaceId: string, agentId: string, startTime: number) {
  try {
    // Get recent prompt activity
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: prompts, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('updated_at', sevenDaysAgo);

    if (error) throw error;

    // Analyze patterns
    const patterns = {
      most_active_times: analyzeMostActiveTimes(prompts),
      common_keywords: analyzeCommonKeywords(prompts),
      status_transitions: analyzeStatusTransitions(prompts),
      productivity_metrics: calculateProductivityMetrics(prompts)
    };

    // Log activity
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'pattern_analysis',
      action_taken: 'analyzed_patterns',
      metadata: { patterns, analyzed_prompts: prompts.length },
      success: true,
      processing_time_ms: Date.now() - startTime
    });

    return new Response(JSON.stringify({
      success: true,
      patterns
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'pattern_analysis',
      action_taken: 'analysis_failed',
      metadata: {},
      success: false,
      error_message: error.message,
      processing_time_ms: Date.now() - startTime
    });
    throw error;
  }
}

function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  
  return union.length > 0 ? intersection.length / union.length : 0;
}

function analyzeMostActiveTimes(prompts: any[]): string[] {
  const hourCounts = new Array(24).fill(0);
  
  prompts.forEach(prompt => {
    const hour = new Date(prompt.created_at).getHours();
    hourCounts[hour]++;
  });
  
  const maxCount = Math.max(...hourCounts);
  return hourCounts
    .map((count, hour) => ({ hour, count }))
    .filter(item => item.count === maxCount)
    .map(item => `${item.hour}:00`);
}

function analyzeCommonKeywords(prompts: any[]): string[] {
  const wordCounts: { [key: string]: number } = {};
  
  prompts.forEach(prompt => {
    const words = (prompt.title + ' ' + (prompt.description || ''))
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
  });
  
  return Object.entries(wordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

function analyzeStatusTransitions(prompts: any[]): any {
  const transitions = {
    todo_to_progress: 0,
    progress_to_done: 0,
    avg_completion_time: 0
  };
  
  const completedPrompts = prompts.filter(p => p.status === 'done');
  
  if (completedPrompts.length > 0) {
    const totalTime = completedPrompts.reduce((sum, prompt) => {
      const created = new Date(prompt.created_at).getTime();
      const updated = new Date(prompt.updated_at).getTime();
      return sum + (updated - created);
    }, 0);
    
    transitions.avg_completion_time = Math.round(totalTime / completedPrompts.length / (1000 * 60 * 60)); // hours
  }
  
  return transitions;
}

function calculateProductivityMetrics(prompts: any[]): any {
  const total = prompts.length;
  const completed = prompts.filter(p => p.status === 'done').length;
  const inProgress = prompts.filter(p => p.status === 'in_progress').length;
  
  return {
    completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    active_prompts: inProgress,
    total_prompts: total,
    productivity_score: total > 0 ? Math.round(((completed * 2 + inProgress) / (total * 2)) * 100) : 0
  };
}