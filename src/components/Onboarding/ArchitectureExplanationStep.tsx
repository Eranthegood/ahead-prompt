import React, { useState } from 'react';
import { Package, Layers, ChevronRight, ChevronDown } from 'lucide-react';

interface ArchitectureExplanationStepProps {
  productName: string;
}

export const ArchitectureExplanationStep: React.FC<ArchitectureExplanationStepProps> = ({
  productName
}) => {
  const [expandedProduct, setExpandedProduct] = useState(true);

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-full bg-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-foreground font-medium">Organisation simple et efficace</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <strong>Products</strong> : Vos projets (Apps, Sites web, etc.)</li>
              <li>• <strong>Epics</strong> : Les grandes fonctionnalités du projet</li>
              <li>• <strong>Prompts</strong> : Vos tâches spécifiques (vous allez en créer un !)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 space-y-2">
        {/* Product Level - Interactive */}
        <div 
          className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setExpandedProduct(!expandedProduct)}
        >
          {expandedProduct ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <Package className="h-4 w-4 text-primary" />
          <span className="font-medium flex-1">{productName}</span>
          <span className="text-xs text-muted-foreground">Product</span>
        </div>

        {/* Epic Levels - Only show when expanded */}
        {expandedProduct && (
          <>
            <div className="flex items-center gap-3 p-3 pl-8 rounded hover:bg-accent/50 cursor-pointer transition-colors">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Layers className="h-4 w-4 text-emerald-500" />
              <span className="font-medium flex-1">Authentification</span>
              <span className="text-xs text-muted-foreground">Epic</span>
            </div>

            <div className="flex items-center gap-3 p-3 pl-8 rounded hover:bg-accent/50 cursor-pointer transition-colors">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Layers className="h-4 w-4 text-violet-500" />
              <span className="font-medium flex-1">Interface utilisateur</span>
              <span className="text-xs text-muted-foreground">Epic</span>
            </div>

            <div className="flex items-center gap-3 p-3 pl-8 rounded hover:bg-accent/50 cursor-pointer transition-colors">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Layers className="h-4 w-4 text-amber-500" />
              <span className="font-medium flex-1">API Backend</span>
              <span className="text-xs text-muted-foreground">Epic</span>
            </div>

            <div className="flex items-center gap-3 p-3 pl-8 rounded hover:bg-accent/50 cursor-pointer transition-colors">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Layers className="h-4 w-4 text-blue-500" />
              <span className="font-medium flex-1">Déploiement</span>
              <span className="text-xs text-muted-foreground">Epic</span>
            </div>
          </>
        )}
      </div>

    </div>
  );
};