import React from 'react';
import { Package, Layers, MessageSquare, ChevronRight } from 'lucide-react';

interface ArchitectureExplanationStepProps {
  productName: string;
}

export const ArchitectureExplanationStep: React.FC<ArchitectureExplanationStepProps> = ({
  productName
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-muted-foreground">
          Voici comment s'organisent vos projets dans Ahead.love
        </p>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        {/* Product Level - Level 0 */}
        <div className="flex items-center gap-3 p-2 rounded hover:bg-accent/50">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Package className="h-4 w-4 text-primary" />
          <span className="font-medium">{productName}</span>
          <span className="text-xs text-muted-foreground ml-auto">Product</span>
        </div>

        {/* Epic Level - Level 1 (indented) */}
        <div className="flex items-center gap-3 p-2 pl-8 rounded hover:bg-accent/50">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Layers className="h-4 w-4 text-blue-500" />
          <span className="font-medium">Authentification</span>
          <span className="text-xs text-muted-foreground ml-auto">Epic</span>
        </div>

        {/* Prompt Level - Level 2 (more indented) */}
        <div className="flex items-center gap-3 p-2 pl-12 rounded hover:bg-accent/50">
          <MessageSquare className="h-4 w-4 text-green-500" />
          <span>Créer le formulaire de login</span>
          <span className="text-xs text-muted-foreground ml-auto">Prompt</span>
        </div>
        
        {/* Another Prompt at same level */}
        <div className="flex items-center gap-3 p-2 pl-12 rounded hover:bg-accent/50">
          <MessageSquare className="h-4 w-4 text-green-500" />
          <span>Ajouter la validation des champs</span>
          <span className="text-xs text-muted-foreground ml-auto">Prompt</span>
        </div>

        {/* Another Epic */}
        <div className="flex items-center gap-3 p-2 pl-8 rounded hover:bg-accent/50">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Layers className="h-4 w-4 text-purple-500" />
          <span className="font-medium">Dashboard</span>
          <span className="text-xs text-muted-foreground ml-auto">Epic</span>
        </div>

        <div className="flex items-center gap-3 p-2 pl-12 rounded hover:bg-accent/50">
          <MessageSquare className="h-4 w-4 text-green-500" />
          <span>Créer les graphiques de stats</span>
          <span className="text-xs text-muted-foreground ml-auto">Prompt</span>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Cette organisation vous permet de retrouver facilement tous vos prompts<br/>
        <strong>Créons maintenant votre premier prompt !</strong>
      </div>
    </div>
  );
};