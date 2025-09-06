import React from "react";
import { AIAgentsDashboard } from "@/components/AIAgentsDashboard";
import { useWorkspace } from "@/hooks/useWorkspace";

export default function AIAgents() {
  const { workspace } = useWorkspace();

  if (!workspace) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Aucun workspace sélectionné</h2>
        <p className="text-muted-foreground">
          Veuillez sélectionner un workspace pour gérer vos agents IA
        </p>
      </div>
    );
  }

  return <AIAgentsDashboard workspaceId={workspace.id} />;
}