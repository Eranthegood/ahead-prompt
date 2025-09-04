import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, Search } from 'lucide-react';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useProducts } from '@/hooks/useProducts';
import { useWorkspace } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RepositoryConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export const RepositoryConnectionDialog = ({ isOpen, onClose, productId, productName }: RepositoryConnectionDialogProps) => {
  const { integrations } = useIntegrations();
  const { workspace } = useWorkspace();
  const { refetch } = useProducts(workspace?.id);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [customRepo, setCustomRepo] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [isLoading, setIsLoading] = useState(false);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const githubIntegration = integrations.find(i => i.id === 'github');

  // Filter repositories based on search term
  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && githubIntegration?.metadata?.repositories) {
      setRepositories(githubIntegration.metadata.repositories);
    }
  }, [isOpen, githubIntegration]);

  const handleConnect = async () => {
    const repoUrl = selectedRepo || customRepo;
    if (!repoUrl.trim()) {
      toast.error('Veuillez sélectionner ou saisir une URL de repository');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          github_repo_url: repoUrl,
          default_branch: defaultBranch,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      await refetch();
      toast.success(`Repository connecté au produit ${productName}`);
      onClose();
    } catch (error) {
      console.error('Error connecting repository:', error);
      toast.error('Erreur lors de la connexion du repository');
    } finally {
      setIsLoading(false);
    }
  };

  const validateGitHubUrl = (url: string) => {
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
    return githubRegex.test(url);
  };

  const isValidCustomRepo = customRepo ? validateGitHubUrl(customRepo) : true;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connecter un repository à {productName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {repositories.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Sélectionner un repository existant ({filteredRepositories.length} sur {repositories.length})
              </Label>
              
              {repositories.length > 10 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un repository..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un repository..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredRepositories.map((repo: any) => (
                    <SelectItem key={repo.full_name} value={repo.html_url}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{repo.name}</span>
                        {repo.private && (
                          <Badge variant="secondary" className="text-xs">Privé</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                  {filteredRepositories.length === 0 && searchTerm && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Aucun repository trouvé pour "{searchTerm}"
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-sm font-medium">Ou saisir une URL de repository</Label>
            <Input
              placeholder="https://github.com/username/repository"
              value={customRepo}
              onChange={(e) => setCustomRepo(e.target.value)}
              className={!isValidCustomRepo ? 'border-red-500' : ''}
            />
            {!isValidCustomRepo && (
              <p className="text-sm text-red-500">
                Veuillez saisir une URL GitHub valide
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Branche par défaut</Label>
            <Input
              placeholder="main"
              value={defaultBranch}
              onChange={(e) => setDefaultBranch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button 
              onClick={handleConnect}
              disabled={isLoading || (!selectedRepo && !customRepo) || !isValidCustomRepo}
              className="flex-1"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Connecter le repository
            </Button>
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          </div>

          {(selectedRepo || customRepo) && isValidCustomRepo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="w-4 h-4" />
              <span>Repository: {selectedRepo || customRepo}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};