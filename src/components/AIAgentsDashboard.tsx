import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Bot, 
  Activity, 
  Settings, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  XCircle
} from "lucide-react";
import { useAIAgents, useAgentMetrics } from "@/hooks/useAIAgents";
import { AgentConfigDialog } from "./AgentConfigDialog";
import { AgentMetricsCard } from "./AgentMetricsCard";

interface AIAgentsDashboardProps {
  workspaceId: string;
}

const AGENT_TYPES = [
  {
    type: 'prompt_optimizer' as const,
    name: 'Optimiseur de Prompts',
    description: 'Améliore automatiquement la qualité de vos prompts avec des suggestions intelligentes',
    icon: TrendingUp,
    color: 'blue'
  },
  {
    type: 'workflow_automation' as const,
    name: 'Automatisation Workflow',
    description: 'Gère automatiquement le statut et la progression de vos tâches',
    icon: Activity,
    color: 'green'
  },
  {
    type: 'knowledge_curator' as const,
    name: 'Curateur de Connaissances',
    description: 'Organise et enrichit votre base de connaissances automatiquement',
    icon: Bot,
    color: 'purple'
  },
  {
    type: 'code_review' as const,
    name: 'Revue de Code',
    description: 'Analyse et suggère des améliorations pour votre code généré',
    icon: CheckCircle,
    color: 'orange'
  },
  {
    type: 'analytics' as const,
    name: 'Analytics',
    description: 'Suit et analyse vos métriques de productivité',
    icon: Clock,
    color: 'indigo'
  }
];

export function AIAgentsDashboard({ workspaceId }: AIAgentsDashboardProps) {
  const { agents, isLoading, toggleAgent, deleteAgent } = useAIAgents(workspaceId);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const activeAgents = agents.filter(agent => agent.is_active);
  const totalAgents = agents.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground">
            Gérez vos agents IA pour automatiser votre workflow de développement
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Créer un Agent
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents Actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeAgents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents Inactifs</CardTitle>
            <XCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{totalAgents - activeAgents.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map((agent) => {
          const agentTypeInfo = AGENT_TYPES.find(t => t.type === agent.agent_type);
          const Icon = agentTypeInfo?.icon || Bot;
          
          return (
            <Card key={agent.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-${agentTypeInfo?.color || 'gray'}-100`}>
                      <Icon className={`h-5 w-5 text-${agentTypeInfo?.color || 'gray'}-600`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <CardDescription>{agent.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={agent.is_active}
                      onCheckedChange={(checked) => toggleAgent({ agentId: agent.id, isActive: checked })}
                    />
                    <Badge variant={agent.is_active ? "default" : "secondary"}>
                      {agent.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <AgentMetricsCard agentId={agent.id} />
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Créé le {new Date(agent.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedAgent(agent.id)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Config
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {agents.length === 0 && (
        <Card className="p-12 text-center">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun agent configuré</h3>
          <p className="text-muted-foreground mb-4">
            Créez votre premier agent IA pour commencer à automatiser votre workflow
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer votre premier Agent
          </Button>
        </Card>
      )}

      {/* Create Agent Dialog */}
      <AgentConfigDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        workspaceId={workspaceId}
        agentTypes={AGENT_TYPES}
      />
    </div>
  );
}