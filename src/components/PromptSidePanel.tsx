import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Copy, Edit, Target, Zap, CheckCircle2, Calendar, User, Folder } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useToast } from '@/components/ui/use-toast';
import type { Prompt } from '@/types';

interface PromptWithExtras extends Prompt {
  epic?: { id: string; name: string; color: string };
  product?: { id: string; name: string };
}

interface PromptSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: PromptWithExtras | null;
  onEdit?: (prompt: PromptWithExtras) => void;
}

const statusConfig = {
  todo: { 
    label: 'À faire', 
    icon: Target, 
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
  },
  in_progress: { 
    label: 'En cours', 
    icon: Zap, 
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
  },
  done: { 
    label: 'Terminé', 
    icon: CheckCircle2, 
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
  },
};

const priorityConfig = {
  1: { label: 'Faible', color: 'bg-gray-500' },
  2: { label: 'Normale', color: 'bg-yellow-500' },
  3: { label: 'Élevée', color: 'bg-orange-500' },
  4: { label: 'Urgente', color: 'bg-red-500' },
};

export const PromptSidePanel: React.FC<PromptSidePanelProps> = ({
  isOpen,
  onClose,
  prompt,
  onEdit,
}) => {
  const { toast } = useToast();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié !",
        description: "Le contenu a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le contenu",
        variant: "destructive",
      });
    }
  };

  if (!prompt) return null;

  const statusInfo = statusConfig[prompt.status];
  const priorityInfo = priorityConfig[prompt.priority as keyof typeof priorityConfig];
  const StatusIcon = statusInfo.icon;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[500px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left flex items-start gap-3">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground mb-2 leading-tight">
                {prompt.title}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={statusInfo.className}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${priorityInfo.color}`} />
                  {priorityInfo.label}
                </Badge>
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Actions */}
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(prompt)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(prompt.title)}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copier titre
            </Button>
            {prompt.description && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(prompt.description || '')}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copier description
              </Button>
            )}
          </div>

          <Separator />

          {/* Description */}
          {prompt.description && (
            <Card className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Description
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted/30 p-3 rounded-md border">
                  {prompt.description}
                </pre>
              </div>
            </Card>
          )}

          {/* Assignment */}
          {(prompt.epic || prompt.product) && (
            <Card className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Assignation
              </h3>
              <div className="space-y-2">
                {prompt.epic && (
                  <div className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: prompt.epic.color }}
                    />
                    <span className="font-medium">Epic:</span>
                    <span>{prompt.epic.name}</span>
                  </div>
                )}
                {prompt.product && (
                  <div className="flex items-center gap-2 text-sm">
                    <Folder className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">Produit:</span>
                    <span>{prompt.product.name}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Metadata */}
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Informations
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créé le:</span>
                <span>{format(new Date(prompt.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modifié le:</span>
                <span>{format(new Date(prompt.updated_at), 'dd MMM yyyy à HH:mm', { locale: fr })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-xs">{prompt.id}</span>
              </div>
            </div>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};