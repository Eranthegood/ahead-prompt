import { useCallback, useEffect } from 'react';
import { AIAgentManager } from '@/services/aiAgentManager';
import { useAuth } from './useAuth';
import { useWorkspace } from './useWorkspace';
import { useToast } from './use-toast';

interface AutomationTrigger {
  event: string;
  entityType: string;
  entityId?: string;
  agentTypes: string[];
}

export function useAgentAutomation() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { toast } = useToast();

  // Knowledge Curator automation triggers
  const triggerKnowledgeAnalysis = useCallback(async (knowledgeItemId: string) => {
    if (!workspace?.id || !user) return;

    try {
      await AIAgentManager.executeKnowledgeAnalysis(knowledgeItemId, workspace.id);
    } catch (error) {
      console.error('Knowledge analysis automation failed:', error);
    }
  }, [workspace?.id, user]);

  // Workflow automation triggers
  const triggerWorkflowAutomation = useCallback(async (entityId: string, entityType: string, event: string) => {
    if (!workspace?.id || !user) return;

    try {
      switch (event) {
        case 'prompt_copied':
        case 'prompt_created':
        case 'prompt_updated':
          await AIAgentManager.autoStatusUpdate(entityId, 'prompt', workspace.id);
          break;
        case 'epic_updated':
          await AIAgentManager.autoStatusUpdate(entityId, 'epic', workspace.id);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Workflow automation failed:', error);
    }
  }, [workspace?.id, user]);

  // Periodic automation tasks
  const runPeriodicTasks = useCallback(async () => {
    if (!workspace?.id || !user) return;

    try {
      // Run every 30 minutes in the background
      const now = new Date();
      const isWorkingHours = now.getHours() >= 8 && now.getHours() <= 22;
      
      if (isWorkingHours) {
        // Priority adjustments
        await AIAgentManager.adjustPriorities(workspace.id);
        
        // Epic organization (less frequent)
        if (now.getMinutes() === 0) { // Only on the hour
          await AIAgentManager.organizeEpics(workspace.id);
        }

        // Knowledge duplicate detection (even less frequent)
        if (now.getHours() === 9 && now.getMinutes() === 0) { // Once per day at 9 AM
          await AIAgentManager.findKnowledgeDuplicates(workspace.id);
          await AIAgentManager.suggestKnowledgeCategories(workspace.id);
        }

        // Pattern analysis (weekly)
        if (now.getDay() === 1 && now.getHours() === 10 && now.getMinutes() === 0) { // Monday at 10 AM
          await AIAgentManager.analyzePromptPatterns(workspace.id);
        }
      }
    } catch (error) {
      console.error('Periodic automation tasks failed:', error);
    }
  }, [workspace?.id, user]);

  // Set up periodic task runner
  useEffect(() => {
    const interval = setInterval(runPeriodicTasks, 30 * 60 * 1000); // 30 minutes
    
    // Run once on mount
    setTimeout(runPeriodicTasks, 5000); // Delay 5 seconds after mount
    
    return () => clearInterval(interval);
  }, [runPeriodicTasks]);

  // Manual trigger functions for UI
  const triggerKnowledgeCuration = useCallback(async () => {
    if (!workspace?.id) return;
    
    try {
      toast({
        title: "Curation des connaissances",
        description: "Analyse en cours...",
      });

      await Promise.all([
        AIAgentManager.findKnowledgeDuplicates(workspace.id),
        AIAgentManager.suggestKnowledgeCategories(workspace.id)
      ]);

      toast({
        title: "Curation terminée",
        description: "La base de connaissances a été analysée et organisée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "La curation des connaissances a échoué",
        variant: "destructive"
      });
    }
  }, [workspace?.id, toast]);

  const triggerWorkflowOptimization = useCallback(async () => {
    if (!workspace?.id) return;
    
    try {
      toast({
        title: "Optimisation du workflow",
        description: "Analyse des patterns en cours...",
      });

      await Promise.all([
        AIAgentManager.adjustPriorities(workspace.id),
        AIAgentManager.organizeEpics(workspace.id),
        AIAgentManager.analyzePromptPatterns(workspace.id)
      ]);

      toast({
        title: "Optimisation terminée", 
        description: "Les workflows ont été analysés et optimisés",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "L'optimisation du workflow a échoué",
        variant: "destructive"
      });
    }
  }, [workspace?.id, toast]);

  return {
    triggerKnowledgeAnalysis,
    triggerWorkflowAutomation,
    triggerKnowledgeCuration,
    triggerWorkflowOptimization,
    runPeriodicTasks
  };
}