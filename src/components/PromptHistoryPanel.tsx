import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Trash2, Clock } from 'lucide-react';
import { PromptHistory, PromptTransformService } from '@/services/promptTransformService';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PromptHistoryPanelProps {
  history: PromptHistory[];
  onHistoryUpdate: () => void;
  onCopyPrompt: (prompt: string) => void;
}

export const PromptHistoryPanel: React.FC<PromptHistoryPanelProps> = ({
  history,
  onHistoryUpdate,
  onCopyPrompt
}) => {
  const { toast } = useToast();

  const handleCopy = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      onCopyPrompt(prompt);
      toast({
        title: "Copié !",
        description: "Le prompt a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le prompt",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: string) => {
    PromptTransformService.removeFromHistory(id);
    onHistoryUpdate();
    toast({
      title: "Supprimé",
      description: "L'élément a été supprimé de l'historique",
    });
  };

  const handleClearAll = () => {
    PromptTransformService.clearHistory();
    onHistoryUpdate();
    toast({
      title: "Historique effacé",
      description: "Tous les éléments ont été supprimés",
    });
  };

  if (history.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-2">Aucun historique</p>
        <p className="text-sm text-muted-foreground">
          Vos transformations de prompts apparaîtront ici
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm text-muted-foreground">
          Historique ({history.length}/10)
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Tout effacer
        </Button>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="border border-border rounded-lg p-3 bg-card hover:bg-accent/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-muted-foreground truncate flex-1 mr-2">
                  {item.rawIdea}
                </p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(item.timestamp, { 
                    addSuffix: true, 
                    locale: fr 
                  })}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(item.transformedPrompt)}
                  className="flex-1 h-8 text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copier
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  className="h-8 px-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};