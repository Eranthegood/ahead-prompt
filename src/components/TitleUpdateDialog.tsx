import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Wand2, Eye, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { TitleUpdateService } from '@/services/titleUpdateService';
import { useToast } from '@/hooks/use-toast';
import { Workspace } from '@/types';

interface TitleUpdateDialogProps {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

interface TitlePreview {
  id: string;
  currentTitle: string;
  newTitle: string;
  content: string;
  willUpdate: boolean;
}

export function TitleUpdateDialog({ workspace, open, onOpenChange, onComplete }: TitleUpdateDialogProps) {
  const [previews, setPreviews] = useState<TitlePreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [step, setStep] = useState<'preview' | 'updating' | 'complete'>('preview');
  const [updateResults, setUpdateResults] = useState<any>(null);
  const { toast } = useToast();

  // Load preview when dialog opens
  useEffect(() => {
    if (open && step === 'preview') {
      loadPreview();
    }
  }, [open, workspace.id]);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const result = await TitleUpdateService.previewTitleUpdates(workspace.id);
      
      if (result.success) {
        setPreviews(result.previews);
        if (result.previews.filter(p => p.willUpdate).length === 0) {
          toast({
            title: 'Aucune mise à jour nécessaire',
            description: 'Tous les titres sont déjà descriptifs'
          });
        }
      } else {
        toast({
          title: 'Erreur de prévisualisation',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la prévisualisation',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTitles = async () => {
    setUpdating(true);
    setStep('updating');
    
    try {
      const result = await TitleUpdateService.updateAllGenericTitles(workspace.id);
      setUpdateResults(result);
      
      if (result.success) {
        setStep('complete');
        toast({
          title: 'Titres mis à jour',
          description: result.message
        });
        onComplete?.();
      } else {
        toast({
          title: 'Erreur de mise à jour',
          description: result.message,
          variant: 'destructive'
        });
        setStep('preview');
      }
    } catch (error) {
      console.error('Error updating titles:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les titres',
        variant: 'destructive'
      });
      setStep('preview');
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = () => {
    setStep('preview');
    setPreviews([]);
    setUpdateResults(null);
    onOpenChange(false);
  };

  const updatablePreviews = previews.filter(p => p.willUpdate);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Améliorer les titres automatiquement
          </DialogTitle>
          <DialogDescription>
            Génère des titres descriptifs pour vos idées basés sur leur contenu
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-hidden">
          {step === 'preview' && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Analyse des titres en cours...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Prévisualisation ({updatablePreviews.length} titres à améliorer)
                      </span>
                    </div>
                    {updatablePreviews.length > 0 && (
                      <Badge variant="secondary">
                        {updatablePreviews.length} améliorations
                      </Badge>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3">
                    {updatablePreviews.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Tous les titres sont déjà descriptifs</h3>
                        <p className="text-muted-foreground">Aucune amélioration n'est nécessaire.</p>
                      </div>
                    ) : (
                      updatablePreviews.map((preview) => (
                        <Card key={preview.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Titre actuel:</span>
                                <Badge variant="outline" className="text-muted-foreground">
                                  {preview.currentTitle}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-primary" />
                                <span className="font-medium text-primary">
                                  {preview.newTitle}
                                </span>
                              </div>
                              
                              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                <strong>Contenu:</strong> {preview.content}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </>
              )}

              <Separator />

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleUpdateTitles}
                  disabled={loading || updatablePreviews.length === 0}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Améliorer {updatablePreviews.length} titres
                </Button>
              </div>
            </>
          )}

          {step === 'updating' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <h3 className="text-lg font-medium mb-2">Mise à jour en cours</h3>
              <p className="text-muted-foreground text-center">
                Génération des nouveaux titres descriptifs...
              </p>
            </div>
          )}

          {step === 'complete' && updateResults && (
            <>
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Mise à jour terminée</h3>
                <p className="text-muted-foreground text-center">
                  {updateResults.message}
                </p>
              </div>

              {updateResults.updates && updateResults.updates.length > 0 && (
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  <h4 className="font-medium text-sm">Titres mis à jour:</h4>
                  {updateResults.updates.map((update: any) => (
                    <div key={update.id} className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="flex-1 truncate">{update.newTitle}</span>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleClose}>
                  Fermer
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}