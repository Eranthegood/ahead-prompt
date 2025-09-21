import React, { useState } from 'react';
import { Package, Layers, ChevronRight, ChevronDown, ShoppingCart, Smartphone, Code, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ArchitectureExplanationStepProps {
  productName: string;
}

interface Epic {
  name: string;
  icon: any;
  color: string;
}

interface ExampleProduct {
  id: string;
  name: string;
  icon: any;
  color: string;
  epics: Epic[];
  isUserProduct?: boolean;
}

export const ArchitectureExplanationStep: React.FC<ArchitectureExplanationStepProps> = ({
  productName
}) => {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set(['user-product']));

  const exampleProducts: ExampleProduct[] = [
    {
      id: 'user-product',
      name: productName,
      icon: Package,
      color: 'text-primary',
      isUserProduct: true,
      epics: [
        { name: 'Authentification', icon: Layers, color: 'text-emerald-500' },
        { name: 'Interface utilisateur', icon: Layers, color: 'text-violet-500' },
        { name: 'API Backend', icon: Layers, color: 'text-amber-500' }
      ]
    },
    {
      id: 'ecommerce-app',
      name: 'E-commerce Mobile',
      icon: ShoppingCart,
      color: 'text-emerald-500',
      epics: [
        { name: 'Catalogue produits', icon: Layers, color: 'text-blue-500' },
        { name: 'Panier & Checkout', icon: Layers, color: 'text-red-500' },
        { name: 'Paiements Stripe', icon: Layers, color: 'text-violet-500' }
      ]
    },
    {
      id: 'design-system',
      name: 'Design System',
      icon: Palette,
      color: 'text-pink-500',
      epics: [
        { name: 'Composants UI', icon: Layers, color: 'text-blue-500' },
        { name: 'Tokens de design', icon: Layers, color: 'text-green-500' },
        { name: 'Documentation', icon: Layers, color: 'text-orange-500' }
      ]
    },
    {
      id: 'saas-platform',
      name: 'SaaS Analytics',
      icon: Code,
      color: 'text-blue-500',
      epics: [
        { name: 'Dashboard temps réel', icon: Layers, color: 'text-cyan-500' },
        { name: 'Système de billing', icon: Layers, color: 'text-green-500' },
        { name: 'API Analytics', icon: Layers, color: 'text-purple-500' }
      ]
    }
  ];

  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-muted-foreground">
          Explorez l'organisation hiérarchique de vos projets
        </p>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 space-y-2 max-h-80 overflow-y-auto">
        {exampleProducts.map((product) => {
          const isExpanded = expandedProducts.has(product.id);
          const ProductIcon = product.icon;
          
          return (
            <div key={product.id}>
              {/* Product Level - Interactive */}
              <div 
                className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => toggleProduct(product.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
                )}
                <ProductIcon className={`h-4 w-4 ${product.color}`} />
                <span className="font-medium flex-1">{product.name}</span>
                <div className="flex items-center gap-2">
                  {product.isUserProduct && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      Votre produit
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">Product</span>
                </div>
              </div>

              {/* Epic Levels - Only show when expanded */}
              {isExpanded && (
                <div className="space-y-1">
                  {product.epics.map((epic, index) => {
                    const EpicIcon = epic.icon;
                    return (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-3 pl-8 rounded hover:bg-accent/50 cursor-pointer transition-colors"
                      >
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <EpicIcon className={`h-4 w-4 ${epic.color}`} />
                        <span className="font-medium flex-1">{epic.name}</span>
                        <span className="text-xs text-muted-foreground">Epic</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

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

      <div className="text-center text-sm text-muted-foreground">
        <strong>Étape suivante : Créer votre premier prompt dans {productName}</strong>
      </div>
    </div>
  );
};