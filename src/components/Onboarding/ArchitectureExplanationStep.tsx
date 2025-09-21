import React from 'react';
import { ChevronRight, Package, Layers, MessageSquare } from 'lucide-react';

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
          Voici comment s'organise votre workspace
        </p>
      </div>

      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-primary" />
          <div>
            <div className="font-medium">{productName}</div>
            <div className="text-sm text-muted-foreground">Product</div>
          </div>
        </div>
        
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-blue-500" />
          <div>
            <div className="font-medium">Authentification</div>
            <div className="text-sm text-muted-foreground">Epic</div>
          </div>
        </div>
        
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-green-500" />
          <div>
            <div className="font-medium">Créer le login</div>
            <div className="text-sm text-muted-foreground">Prompt</div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Créons maintenant votre premier prompt !
        </p>
      </div>
    </div>
  );
};