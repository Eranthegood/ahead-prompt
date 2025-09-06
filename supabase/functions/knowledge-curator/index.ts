import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface KnowledgeAnalysis {
  category?: string;
  quality_score: number;
  tags?: string[];
  suggestions: string[];
  duplicates?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workspaceId, knowledgeItemId, action } = await req.json();

    console.log('Knowledge Curator action:', { workspaceId, knowledgeItemId, action });

    // Find or create the knowledge curator agent
    let { data: agent, error: agentError } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('agent_type', 'knowledge_curator')
      .eq('is_active', true)
      .single();

    if (agentError && agentError.code === 'PGRST116') {
      const { data: newAgent, error: createError } = await supabase
        .from('ai_agents')
        .insert({
          workspace_id: workspaceId,
          agent_type: 'knowledge_curator',
          name: 'Knowledge Curator',
          description: 'Automatically organizes and improves knowledge base quality',
          config: {
            auto_categorize: true,
            duplicate_detection: true,
            quality_scoring: true
          },
          is_active: true
        })
        .select()
        .single();

      if (createError) throw new Error('Failed to create knowledge curator agent');
      agent = newAgent;
    } else if (agentError) {
      throw new Error('Failed to fetch knowledge curator agent');
    }

    const startTime = Date.now();

    switch (action) {
      case 'analyze_knowledge':
        return await analyzeKnowledge(workspaceId, knowledgeItemId, agent.id, startTime);
      case 'find_duplicates':
        return await findDuplicates(workspaceId, agent.id, startTime);
      case 'suggest_categories':
        return await suggestCategories(workspaceId, agent.id, startTime);
      default:
        throw new Error('Unknown action');
    }

  } catch (error) {
    console.error('Error in knowledge-curator function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeKnowledge(workspaceId: string, knowledgeItemId: string, agentId: string, startTime: number) {
  try {
    // Get the knowledge item
    const { data: knowledgeItem, error } = await supabase
      .from('knowledge_items')
      .select('*')
      .eq('id', knowledgeItemId)
      .single();

    if (error) throw new Error('Knowledge item not found');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Analyze with AI
    const systemPrompt = `You are a knowledge curator AI. Analyze the following knowledge item and provide:
1. Appropriate category suggestion
2. Quality score (1-10)
3. Relevant tags
4. Improvement suggestions

Knowledge Item:
Title: ${knowledgeItem.title}
Content: ${knowledgeItem.content}
Current Category: ${knowledgeItem.category || 'None'}

Respond with JSON:
{
  "category": "suggested_category",
  "quality_score": 8.5,
  "tags": ["tag1", "tag2"],
  "suggestions": ["improvement 1", "improvement 2"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.3,
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze knowledge with AI');
    }

    const aiResponse = await response.json();
    const analysis: KnowledgeAnalysis = JSON.parse(aiResponse.choices[0].message.content);

    // Update the knowledge item with analysis
    const updates: any = {};
    if (analysis.category && analysis.category !== knowledgeItem.category) {
      updates.category = analysis.category;
    }
    if (analysis.tags) {
      updates.tags = analysis.tags;
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('knowledge_items')
        .update(updates)
        .eq('id', knowledgeItemId);
    }

    // Log activity
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'knowledge_analysis',
      entity_type: 'knowledge_item',
      entity_id: knowledgeItemId,
      action_taken: 'analyzed_and_improved',
      metadata: { analysis, updates_applied: updates },
      success: true,
      processing_time_ms: Date.now() - startTime
    });

    return new Response(JSON.stringify({
      success: true,
      analysis,
      updates_applied: updates
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'knowledge_analysis',
      entity_type: 'knowledge_item', 
      entity_id: knowledgeItemId,
      action_taken: 'analysis_failed',
      metadata: {},
      success: false,
      error_message: error.message,
      processing_time_ms: Date.now() - startTime
    });
    throw error;
  }
}

async function findDuplicates(workspaceId: string, agentId: string, startTime: number) {
  try {
    // Get all knowledge items for the workspace
    const { data: knowledgeItems, error } = await supabase
      .from('knowledge_items')
      .select('id, title, content')
      .eq('workspace_id', workspaceId);

    if (error) throw error;

    const duplicates = [];

    // Simple duplicate detection based on title similarity and content overlap
    for (let i = 0; i < knowledgeItems.length; i++) {
      for (let j = i + 1; j < knowledgeItems.length; j++) {
        const item1 = knowledgeItems[i];
        const item2 = knowledgeItems[j];

        // Check title similarity
        const titleSimilarity = calculateSimilarity(item1.title.toLowerCase(), item2.title.toLowerCase());
        
        // Check content similarity  
        const contentSimilarity = calculateSimilarity(
          item1.content.toLowerCase().substring(0, 200),
          item2.content.toLowerCase().substring(0, 200)
        );

        if (titleSimilarity > 0.7 || contentSimilarity > 0.8) {
          duplicates.push({
            item1: { id: item1.id, title: item1.title },
            item2: { id: item2.id, title: item2.title },
            similarity_score: Math.max(titleSimilarity, contentSimilarity)
          });
        }
      }
    }

    // Log activity
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'duplicate_detection',
      entity_type: 'knowledge_items',
      action_taken: 'found_duplicates',
      metadata: { duplicates_found: duplicates.length, duplicates },
      success: true,
      processing_time_ms: Date.now() - startTime
    });

    return new Response(JSON.stringify({
      success: true,
      duplicates
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'duplicate_detection',
      action_taken: 'detection_failed',
      metadata: {},
      success: false,
      error_message: error.message,
      processing_time_ms: Date.now() - startTime
    });
    throw error;
  }
}

async function suggestCategories(workspaceId: string, agentId: string, startTime: number) {
  try {
    // Get knowledge items without categories
    const { data: uncategorized, error } = await supabase
      .from('knowledge_items')
      .select('id, title, content')
      .eq('workspace_id', workspaceId)
      .is('category', null);

    if (error) throw error;

    const suggestions = [];

    for (const item of uncategorized.slice(0, 5)) { // Limit to 5 items per run
      if (!openaiApiKey) continue;

      const systemPrompt = `Suggest an appropriate category for this knowledge item. Choose from: documentation, api, design-system, resources, templates, snippets, guides, or suggest a new category.

Title: ${item.title}
Content: ${item.content.substring(0, 300)}

Respond with just the category name.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }],
          temperature: 0.1,
          max_tokens: 50
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();
        const suggestedCategory = aiResponse.choices[0].message.content.trim();
        
        suggestions.push({
          item_id: item.id,
          suggested_category: suggestedCategory,
          title: item.title
        });
      }
    }

    // Log activity
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'category_suggestion',
      entity_type: 'knowledge_items',
      action_taken: 'suggested_categories',
      metadata: { suggestions_count: suggestions.length, suggestions },
      success: true,
      processing_time_ms: Date.now() - startTime
    });

    return new Response(JSON.stringify({
      success: true,
      suggestions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    await supabase.from('agent_activities').insert({
      agent_id: agentId,
      workspace_id: workspaceId,
      activity_type: 'category_suggestion',
      action_taken: 'suggestion_failed',
      metadata: {},
      success: false,
      error_message: error.message,
      processing_time_ms: Date.now() - startTime
    });
    throw error;
  }
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}