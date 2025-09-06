import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAIAgents } from "@/hooks/useAIAgents";
import type { AgentType } from "@/types/ai-agents";

interface AgentTypeInfo {
  type: AgentType;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface AgentConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  agentTypes: AgentTypeInfo[];
}

export function AgentConfigDialog({ 
  open, 
  onOpenChange, 
  workspaceId, 
  agentTypes 
}: AgentConfigDialogProps) {
  const [selectedType, setSelectedType] = useState<AgentType | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { createAgent, isCreating } = useAIAgents(workspaceId);

  const handleCreate = () => {
    if (!selectedType || !name) return;

    createAgent({
      agent_type: selectedType,
      name,
      description: description || undefined,
      config: {}
    });

    // Reset form
    setSelectedType(null);
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  const selectedTypeInfo = agentTypes.find(t => t.type === selectedType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un nouvel Agent IA</DialogTitle>
          <DialogDescription>
            Choisissez le type d'agent et configurez ses paramètres
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Select Agent Type */}
          {!selectedType ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Choisir le type d'agent</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentTypes.map((agentType) => {
                  const Icon = agentType.icon;
                  return (
                    <Card 
                      key={agentType.type}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => setSelectedType(agentType.type)}
                    >
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-${agentType.color}-100`}>
                            <Icon className={`h-5 w-5 text-${agentType.color}-600`} />
                          </div>
                          <CardTitle className="text-base">{agentType.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">
                          {agentType.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Step 2: Configure Agent */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Configuration de l'agent</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedType(null)}
                >
                  Changer de type
                </Button>
              </div>

              {selectedTypeInfo && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-${selectedTypeInfo.color}-100`}>
                        <selectedTypeInfo.icon className={`h-5 w-5 text-${selectedTypeInfo.color}-600`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{selectedTypeInfo.name}</CardTitle>
                        <CardDescription>{selectedTypeInfo.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="agent-name">Nom de l'agent</Label>
                  <Input
                    id="agent-name"
                    placeholder={`Ex: ${selectedTypeInfo?.name} Principal`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="agent-description">Description (optionnel)</Label>
                  <Textarea
                    id="agent-description"
                    placeholder="Décrivez le rôle spécifique de cet agent..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={!name || isCreating}
                >
                  {isCreating ? "Création..." : "Créer l'Agent"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}