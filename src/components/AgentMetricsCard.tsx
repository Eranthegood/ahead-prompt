import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, TrendingUp } from "lucide-react";
import { useAgentMetrics } from "@/hooks/useAIAgents";

interface AgentMetricsCardProps {
  agentId: string;
}

export function AgentMetricsCard({ agentId }: AgentMetricsCardProps) {
  const { metrics, isLoading } = useAgentMetrics(agentId);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          <Activity className="h-4 w-4 text-blue-600 mr-1" />
        </div>
        <div className="text-lg font-semibold">{metrics.total_activities}</div>
        <div className="text-xs text-muted-foreground">Activités</div>
      </div>
      
      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
        </div>
        <div className="text-lg font-semibold">{metrics.success_rate}%</div>
        <div className="text-xs text-muted-foreground">Succès</div>
      </div>
      
      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          <Clock className="h-4 w-4 text-orange-600 mr-1" />
        </div>
        <div className="text-lg font-semibold">{metrics.avg_processing_time}ms</div>
        <div className="text-xs text-muted-foreground">Temps moy.</div>
      </div>
    </div>
  );
}