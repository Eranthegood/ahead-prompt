import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFavoriteLinks, FavoriteLink } from '@/hooks/useFavoriteLinks';
import { useToast } from '@/hooks/use-toast';
import { ExternalLink, Edit2, Trash2, Plus, Save, X } from 'lucide-react';

export function FavoriteLinksSection() {
  const { links, loading, createLink, updateLink, deleteLink } = useFavoriteLinks();
  const { toast } = useToast();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
  });

  const resetForm = () => {
    setFormData({ title: '', url: '', description: '' });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.url.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre et l'URL sont requis",
        variant: "destructive",
      });
      return;
    }

    const result = await createLink(formData);
    if (result) {
      resetForm();
    }
  };

  const handleEdit = (link: FavoriteLink) => {
    setEditingId(link.id);
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || '',
    });
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.title.trim() || !formData.url.trim()) return;

    const result = await updateLink(editingId, formData);
    if (result) {
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) {
      await deleteLink(id);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {isCreating ? 'Nouveau lien favori' : 'Ajouter un lien favori'}
          </CardTitle>
          <CardDescription>
            Enregistrez vos liens et ressources importantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCreating ? (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nom du lien"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/100 caractères
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://exemple.com"
                />
                {formData.url && !isValidUrl(formData.url) && (
                  <p className="text-xs text-destructive">URL invalide</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du lien (optionnel)"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/200 caractères
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleCreate}
                  disabled={!formData.title.trim() || !formData.url.trim() || !isValidUrl(formData.url)}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Créer
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un lien
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Links List */}
      <Card>
        <CardHeader>
          <CardTitle>Mes liens favoris ({links.length})</CardTitle>
          <CardDescription>
            Tous vos liens enregistrés.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement...</div>
          ) : links.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun lien favori enregistré
            </div>
          ) : (
            <div className="space-y-4">
              {links.map((link) => (
                <div key={link.id} className="border rounded-lg p-4">
                  {editingId === link.id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label>Titre</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          maxLength={100}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label>URL</Label>
                        <Input
                          type="url"
                          value={formData.url}
                          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={2}
                          maxLength={200}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={handleUpdate}
                          disabled={!formData.title.trim() || !formData.url.trim() || !isValidUrl(formData.url)}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Sauvegarder
                        </Button>
                        <Button size="sm" variant="outline" onClick={resetForm}>
                          <X className="mr-2 h-4 w-4" />
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{link.title}</h3>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(link.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {link.url}
                        </p>
                        {link.description && (
                          <p className="text-sm text-muted-foreground">
                            {link.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Ajouté le {new Date(link.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      
                      <div className="flex gap-1 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(link)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(link.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}