import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Package, Layers, MessageSquare } from 'lucide-react';

interface ArchitectureExplanationStepProps {
  productName: string;
}

export const ArchitectureExplanationStep: React.FC<ArchitectureExplanationStepProps> = ({
  productName
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Comprendre l'architecture Ahead.love
        </h3>
        <p className="text-sm text-muted-foreground">
          Voici comment organiser vos idées dans une hiérarchie claire et productive
        </p>
      </div>

      <div className="space-y-4">
        {/* Product Level */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Product: {productName}</h4>
                <p className="text-sm text-muted-foreground">
                  Votre projet global - l'application que vous développez
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Epic Level */}
        <Card className="border-secondary/20 bg-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Layers className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Epic: Authentification</h4>
                <p className="text-sm text-muted-foreground">
                  Grandes fonctionnalités - regroupent les tâches similaires
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Prompt Level */}
        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <MessageSquare className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Prompt: Créer le formulaire de login</h4>
                <p className="text-sm text-muted-foreground">
                  Tâches spécifiques - vos demandes concrètes à l'IA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-foreground font-medium">Pourquoi cette hiérarchie ?</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <strong>Organisation</strong> : Retrouvez facilement vos prompts</li>
              <li>• <strong>Focus</strong> : Travaillez sur une fonctionnalité à la fois</li>
              <li>• <strong>Productivité</strong> : Pendant que l'IA génère, préparez la suite</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Maintenant, créons votre premier prompt pour <strong>{productName}</strong>
        </p>
      </div>
    </div>
  );
};