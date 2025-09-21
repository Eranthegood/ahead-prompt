import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { FolderPlus, Loader2, CheckCircle } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useToast } from '@/hooks/use-toast';

interface ProductCreationOnboardingStepProps {
  onProductCreated: (productId: string, productName: string) => void;
}

const productColors = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#06B6D4', // cyan
];

export function ProductCreationOnboardingStep({ onProductCreated }: ProductCreationOnboardingStepProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(productColors[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { createProduct } = useProducts(workspace?.id);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !workspace || isCreating) return;

    setIsCreating(true);
    try {
      const product = await createProduct({
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
      });

      if (product) {
        setIsCreated(true);
        toast({
          title: "Produit créé !",
          description: `"${product.name}" est prêt pour vos prompts`,
        });
        onProductCreated(product.id, product.name);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le produit",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isCreated) {
    return (
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Parfait !</h3>
          <p className="text-muted-foreground">
            Votre produit <strong>"{name}"</strong> est créé et prêt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FolderPlus className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Créons votre premier produit</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Les produits vous aident à organiser vos projets. Pensez "App Mobile", "Site Web", "API Backend"...
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Nom du produit *</Label>
              <Input
                id="product-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Mon App Mobile"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Description (optionnel)</Label>
              <Textarea
                id="product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brève description de votre projet..."
                rows={2}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex gap-2">
                {productColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? 'border-primary scale-110'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={!name.trim() || isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Créer le produit
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="bg-accent/20 p-3 rounded-lg">
        <p className="text-sm">
          💡 <strong>Astuce:</strong> Vous pourrez créer plusieurs produits après l'onboarding !
        </p>
      </div>
    </div>
  );
}