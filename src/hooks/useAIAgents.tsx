import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AIAgentManager } from "@/services/aiAgentManager";
import type { AIAgent, AgentActivity, AgentMetrics, AgentType } from "@/types/ai-agents";
import { useToast } from "@/hooks/use-toast";

export function useAIAgents(workspaceId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch agents
  const {
    data: agents = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['ai-agents', workspaceId],
    queryFn: () => AIAgentManager.getAgents(workspaceId),
    enabled: !!workspaceId
  });

  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: (agentData: { agent_type: AgentType; name: string; description?: string; config?: Record<string, any> }) =>
      AIAgentManager.createAgent({
        workspace_id: workspaceId,
        is_active: true,
        ...agentData,
        config: agentData.config || {}
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents', workspaceId] });
      toast({
        title: "Agent créé",
        description: "L'agent AI a été créé avec succès"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'agent: " + (error?.message || 'Erreur inconnue'),
        variant: "destructive"
      });
    }
  });

  // Toggle agent mutation
  const toggleAgentMutation = useMutation({
    mutationFn: ({ agentId, isActive }: { agentId: string; isActive: boolean }) =>
      AIAgentManager.toggleAgent(agentId, isActive),
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents', workspaceId] });
      toast({
        title: isActive ? "Agent activé" : "Agent désactivé",
        description: `L'agent a été ${isActive ? 'activé' : 'désactivé'} avec succès`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'agent: " + (error?.message || 'Erreur inconnue'),
        variant: "destructive"
      });
    }
  });

  // Delete agent mutation
  const deleteAgentMutation = useMutation({
    mutationFn: (agentId: string) => AIAgentManager.deleteAgent(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents', workspaceId] });
      toast({
        title: "Agent supprimé",
        description: "L'agent a été supprimé avec succès"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'agent: " + (error?.message || 'Erreur inconnue'),
        variant: "destructive"
      });
    }
  });

  return {
    agents,
    isLoading,
    error,
    createAgent: createAgentMutation.mutate,
    toggleAgent: toggleAgentMutation.mutate,
    deleteAgent: deleteAgentMutation.mutate,
    isCreating: createAgentMutation.isPending,
    isToggling: toggleAgentMutation.isPending,
    isDeleting: deleteAgentMutation.isPending
  };
}

export function useAgentMetrics(agentId?: string) {
  const {
    data: metrics,
    isLoading,
    error
  } = useQuery({
    queryKey: ['agent-metrics', agentId],
    queryFn: () => AIAgentManager.getAgentMetrics(agentId!),
    enabled: !!agentId
  });

  return { metrics, isLoading, error };
}

export function useAgentActivities(agentId?: string) {
  const {
    data: activities = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['agent-activities', agentId],
    queryFn: () => AIAgentManager.getAgentActivities(agentId!),
    enabled: !!agentId
  });

  return { activities, isLoading, error };
}