import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, GitBranch } from 'lucide-react';
import { useEpics } from '@/hooks/useEpics';
import { useWorkspace } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BranchMappingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  epicId: string;
  epicName: string;
  productId: string;
  repositoryUrl?: string;
}

export const BranchMappingDialog = ({ isOpen, onClose, epicId, epicName, productId, repositoryUrl }: BranchMappingDialogProps) => {
  const { workspace } = useWorkspace();
  const { refetch } = useEpics(workspace?.id);
  const [branchName, setBranchName] = useState('');
  const [baseBranch, setBaseBranch] = useState('main');
  const [autoCreatePr, setAutoCreatePr] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && repositoryUrl) {
      // For now, we'll use common branch names
      // In a real implementation, you would fetch branches from GitHub API
      setAvailableBranches(['main', 'master', 'develop', 'staging']);
      
      // Generate suggested branch name from epic name
      const suggestedBranch = epicName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      setBranchName(suggestedBranch);
    }
  }, [isOpen, repositoryUrl, epicName]);

  const handleMapBranch = async () => {
    if (!branchName.trim()) {
      toast.error('Veuillez saisir un nom de branche');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('epics')
        .update({
          git_branch_name: branchName,
          base_branch_override: baseBranch !== 'main' ? baseBranch : null,
          auto_create_pr: autoCreatePr,
          updated_at: new Date().toISOString()
        })
        .eq('id', epicId);

      if (error) throw error;

      await refetch();
      toast.success(`Branche "${branchName}" mappée à l'epic ${epicName}`);
      onClose();
    } catch (error) {
      console.error('Error mapping branch:', error);
      toast.error('Erreur lors du mapping de la branche');
    } finally {
      setIsLoading(false);
    }
  };

  const validateBranchName = (name: string) => {
    // Git branch name validation
    const validBranchRegex = /^[a-zA-Z0-9][a-zA-Z0-9._\-]*[a-zA-Z0-9]$/;
    return validBranchRegex.test(name) && !name.includes('..');
  };

  const isValidBranchName = branchName ? validateBranchName(branchName) : true;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Mapper une branche à {epicName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Nom de la branche</Label>
            <Input
              placeholder="feature/my-epic-branch"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className={!isValidBranchName ? 'border-red-500' : ''}
            />
            {!isValidBranchName && (
              <p className="text-sm text-red-500">
                Nom de branche invalide (utilisez lettres, chiffres, tirets et points)
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Cette branche sera créée automatiquement si elle n'existe pas
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Branche de base</Label>
            <Select value={baseBranch} onValueChange={setBaseBranch}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableBranches.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto-pr"
                checked={autoCreatePr}
                onChange={(e) => setAutoCreatePr(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="auto-pr" className="text-sm font-medium cursor-pointer">
                Créer automatiquement une Pull Request
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Lorsque le travail sur cette epic est terminé, une PR sera automatiquement créée
            </p>
          </div>

          {repositoryUrl && (
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="text-sm font-medium mb-1">Configuration</div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Repository: {repositoryUrl}</div>
                <div>Branche: {branchName || '(non définie)'}</div>
                <div>Base: {baseBranch}</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <Button 
              onClick={handleMapBranch}
              disabled={isLoading || !branchName || !isValidBranchName}
              className="flex-1"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Mapper la branche
            </Button>
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};