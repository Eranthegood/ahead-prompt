import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Github, Settings, GitBranch, ExternalLink, ArrowLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function GitCursorSettings() {
  const navigate = useNavigate();
  const { products, refetch: refetchProducts } = useProducts();
  const { epics, refetch: refetchEpics } = useEpics();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpdateProduct = async (productId: string, updates: any) => {
    setLoading(productId);
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;
      
      await refetchProducts();
      toast.success('Configuration du produit mise à jour');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(null);
    }
  };

  const handleUpdateEpic = async (epicId: string, updates: any) => {
    setLoading(epicId);
    try {
      const { error } = await supabase
        .from('epics')
        .update(updates)
        .eq('id', epicId);

      if (error) throw error;
      
      await refetchEpics();
      toast.success('Configuration de l\'epic mise à jour');
    } catch (error) {
      console.error('Error updating epic:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(null);
    }
  };

  const getProductEpics = (productId: string) => {
    return epics?.filter(epic => epic.product_id === productId) || [];
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/')}
          className="p-0 h-auto hover:bg-transparent"
        >
          Accueil
        </Button>
        <ChevronRight className="h-4 w-4" />
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/integrations')}
          className="p-0 h-auto hover:bg-transparent"
        >
          Intégrations
        </Button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Configuration Repository</span>
      </nav>

      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/integrations')}
        className="mb-4 -ml-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux intégrations
      </Button>

      <div className="flex items-center gap-3">
        <Github className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Configuration Git & Cursor</h1>
          <p className="text-muted-foreground">
            Configurez vos repositories GitHub et branches pour l'intégration Cursor
          </p>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="epics">Epics</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration des Produits
              </CardTitle>
              <CardDescription>
                Configurez le repository GitHub et la branche par défaut pour chaque produit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {products?.map((product) => (
                <div key={product.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {product.name}
                        {product.cursor_enabled && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Github className="h-3 w-3" />
                            Configuré
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`repo-${product.id}`}>URL du Repository GitHub</Label>
                      <Input
                        id={`repo-${product.id}`}
                        placeholder="https://github.com/user/repo"
                        defaultValue={product.github_repo_url || ''}
                        onBlur={(e) => {
                          if (e.target.value !== product.github_repo_url) {
                            handleUpdateProduct(product.id, { 
                              github_repo_url: e.target.value || null 
                            });
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`branch-${product.id}`}>Branche par défaut</Label>
                      <Input
                        id={`branch-${product.id}`}
                        placeholder="main"
                        defaultValue={product.default_branch || 'main'}
                        onBlur={(e) => {
                          if (e.target.value !== product.default_branch) {
                            handleUpdateProduct(product.id, { 
                              default_branch: e.target.value || 'main' 
                            });
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Activer l'intégration Cursor</Label>
                      <p className="text-xs text-muted-foreground">
                        Permet d'envoyer les prompts de ce produit vers Cursor
                      </p>
                    </div>
                    <Switch
                      checked={product.cursor_enabled || false}
                      onCheckedChange={(checked) => {
                        handleUpdateProduct(product.id, { cursor_enabled: checked });
                      }}
                      disabled={loading === product.id}
                    />
                  </div>

                  {product.github_repo_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => window.open(product.github_repo_url!, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Voir le repo
                    </Button>
                  )}
                </div>
              ))}

              {!products?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun produit trouvé. Créez d'abord un produit pour le configurer.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="epics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Configuration des Epics
              </CardTitle>
              <CardDescription>
                Configurez les branches Git spécifiques pour chaque epic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {products?.map((product) => {
                const productEpics = getProductEpics(product.id);
                if (!productEpics.length) return null;

                return (
                  <div key={product.id} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      {product.cursor_enabled ? (
                        <Badge variant="secondary">Configuré</Badge>
                      ) : (
                        <Badge variant="outline">Non configuré</Badge>
                      )}
                    </div>

                    <div className="pl-4 space-y-3">
                      {productEpics.map((epic) => (
                        <div key={epic.id} className="p-3 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{epic.name}</h4>
                            {epic.git_branch_name && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <GitBranch className="h-3 w-3" />
                                {epic.git_branch_name}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`epic-branch-${epic.id}`}>Nom de la branche</Label>
                              <Input
                                id={`epic-branch-${epic.id}`}
                                placeholder="feature/epic-name"
                                defaultValue={epic.git_branch_name || ''}
                                onBlur={(e) => {
                                  if (e.target.value !== epic.git_branch_name) {
                                    handleUpdateEpic(epic.id, { 
                                      git_branch_name: e.target.value || null 
                                    });
                                  }
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`epic-base-${epic.id}`}>Branche de base (optionnel)</Label>
                              <Input
                                id={`epic-base-${epic.id}`}
                                placeholder="Utilise la branche par défaut du produit"
                                defaultValue={epic.base_branch_override || ''}
                                onBlur={(e) => {
                                  if (e.target.value !== epic.base_branch_override) {
                                    handleUpdateEpic(epic.id, { 
                                      base_branch_override: e.target.value || null 
                                    });
                                  }
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label>Créer automatiquement une Pull Request</Label>
                              <p className="text-xs text-muted-foreground">
                                Cursor créera une PR après avoir terminé le travail
                              </p>
                            </div>
                            <Switch
                              checked={epic.auto_create_pr !== false}
                              onCheckedChange={(checked) => {
                                handleUpdateEpic(epic.id, { auto_create_pr: checked });
                              }}
                              disabled={loading === epic.id}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />
                  </div>
                );
              })}

              {!epics?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun epic trouvé. Créez d'abord des epics pour les configurer.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}