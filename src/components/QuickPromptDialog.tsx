import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, MoreHorizontal, Target, CheckCircle2, Sparkles, Copy, Clock } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { PromptTransformService, type PromptHistory } from '@/services/promptTransformService';
import { PromptHistoryPanel } from '@/components/PromptHistoryPanel';
import { useToast } from '@/components/ui/use-toast';
import type { Workspace, PromptStatus, Epic } from '@/types';

interface CreatePromptData {
  title: string;
  description?: string;
  status?: PromptStatus;
  priority?: number;
  epic_id?: string;
  product_id?: string;
}

interface QuickPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promptData: CreatePromptData) => Promise<any>;
  onOpenExtended?: (promptData: CreatePromptData) => void;
  workspace: Workspace;
  epics?: Epic[];
  selectedProductId?: string;
}

const priorities = [
  { value: 1, label: 'Faible', color: 'bg-gray-500', shortcut: '1' },
  { value: 2, label: 'Normale', color: 'bg-yellow-500', shortcut: '2' },
  { value: 3, label: 'Élevée', color: 'bg-orange-500', shortcut: '3' },
  { value: 4, label: 'Urgente', color: 'bg-red-500', shortcut: '4' },
];

const statuses: { value: PromptStatus; label: string; icon: any }[] = [
  { value: 'todo', label: 'À faire', icon: Target },
  { value: 'in_progress', label: 'En cours', icon: Zap },
  { value: 'done', label: 'Terminé', icon: CheckCircle2 },
];

export const QuickPromptDialog: React.FC<QuickPromptDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onOpenExtended,
  workspace,
  epics = [],
  selectedProductId,
}) => {
  const { preferences, savePromptSettings } = useUserPreferences();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Simplified - use default values
  const priority = 2; // Default to "Normale" 
  const status: PromptStatus = 'todo'; // Default to "À faire"
  const [selectedEpic, setSelectedEpic] = useState<string>('none');
  const [isLoading, setIsLoading] = useState(false);
  
  // AI Transform states
  const [rawIdea, setRawIdea] = useState('');
  const [transformedPrompt, setTransformedPrompt] = useState('');
  const [isTransforming, setIsTransforming] = useState(false);
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([]);
  const [activeTab, setActiveTab] = useState('create');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const epicSelectRef = useRef<HTMLButtonElement>(null);

  // Convert number priority to string for preferences
  const getPriorityString = (num: number) => {
    const priorityMap = { 1: 'low', 2: 'medium', 3: 'high', 4: 'urgent' };
    return priorityMap[num as keyof typeof priorityMap] || 'medium';
  };

  // Convert string priority to number
  const getPriorityNumber = (str: string) => {
    const priorityMap = { 'low': 1, 'medium': 2, 'high': 3, 'urgent': 4 };
    return priorityMap[str as keyof typeof priorityMap] || 2;
  };

  // Filter epics by selected product
  const filteredEpics = selectedProductId 
    ? epics.filter(epic => epic.product_id === selectedProductId)
    : epics;

  // 🎯 Auto-focus and reset on open
  useEffect(() => {
    if (isOpen) {
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedEpic('none');
      
      // Reset AI states
      setRawIdea('');
      setTransformedPrompt('');
      setActiveTab('create');
      
      // Load prompt history
      loadPromptHistory();

      // Smart focus: epic selector if product selected and epics available, otherwise title
      setTimeout(() => {
        if (selectedProductId && filteredEpics.length > 0) {
          epicSelectRef.current?.click();
        } else {
          titleInputRef.current?.focus();
        }
      }, 100);
    }
  }, [isOpen, preferences, selectedProductId, filteredEpics.length]);

  // Load prompt history
  const loadPromptHistory = () => {
    setPromptHistory(PromptTransformService.getHistory());
  };

  // AI Transform function
  const handleTransformIdea = async () => {
    if (!rawIdea.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une idée à transformer",
        variant: "destructive",
      });
      return;
    }

    setIsTransforming(true);
    try {
      const result = await PromptTransformService.transformPrompt(rawIdea);
      
      if (result.error) {
        toast({
          title: "Erreur de transformation",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      setTransformedPrompt(result.transformedPrompt);
      loadPromptHistory(); // Refresh history
      
      toast({
        title: "Prompt généré !",
        description: "Votre idée a été transformée en prompt structuré",
      });
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de transformer l'idée",
        variant: "destructive",
      });
    } finally {
      setIsTransforming(false);
    }
  };

  // Copy prompt function
  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
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

  // Use generated prompt as title/description
  const handleUseGeneratedPrompt = () => {
    if (!transformedPrompt) return;
    
    // Extract title from markdown (first # line)
    const lines = transformedPrompt.split('\n');
    const titleLine = lines.find(line => line.startsWith('# '));
    const title = titleLine ? titleLine.replace('# ', '').trim() : 'Nouveau prompt';
    
    // Use the rest as description
    const description = transformedPrompt;
    
    setTitle(title);
    setDescription(description);
    setActiveTab('create');
    
    toast({
      title: "Prompt appliqué",
      description: "Le prompt généré a été utilisé comme titre et description",
    });
  };

  // Generate description from title using AI
  const handleGenerateFromTitle = async () => {
    if (!title.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord entrer un titre",
        variant: "destructive",
      });
      return;
    }
    
    setIsTransforming(true);
    try {
      const result = await PromptTransformService.transformPrompt(title);
      
      if (result.error) {
        toast({
          title: "Erreur de génération",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      setDescription(result.transformedPrompt);
      setShowSuggestions(true);
      
      toast({
        title: "Description générée !",
        description: "Une description a été générée automatiquement",
      });
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer la description",
        variant: "destructive",
      });
    } finally {
      setIsTransforming(false);
    }
  };

  // ⌨️ Enhanced keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      // Allow Ctrl+Enter to save from input fields
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && title.trim()) {
        e.preventDefault();
        handleSave();
      }
      return;
    }

    // No priority shortcuts needed in simplified interface

    // Other shortcuts
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && title.trim()) {
      e.preventDefault();
      handleSave();
    }
  };

  // 💾 Save prompt
  const handleSave = async () => {
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const promptData: CreatePromptData = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        epic_id: selectedEpic === 'none' ? undefined : selectedEpic,
        product_id: selectedEpic === 'none' && selectedProductId ? selectedProductId : undefined,
      };

      await onSave(promptData);
      onClose();
    } catch (error) {
      console.error('Error saving prompt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 Transition to extended editor
  const handleMoreOptions = () => {
    const promptData: CreatePromptData = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      epic_id: selectedEpic === 'none' ? undefined : selectedEpic,
      product_id: selectedEpic === 'none' && selectedProductId ? selectedProductId : undefined,
    };

    onOpenExtended?.(promptData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[700px] bg-card/95 backdrop-blur-sm border-border/50"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Création rapide de prompt
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create" className="text-sm">
              <Zap className="w-4 h-4 mr-2" />
              Créer
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Générer IA
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm">
              <Clock className="w-4 h-4 mr-2" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
            {/* 🎯 Title - Large input */}
            <div>
              <Input
                ref={titleInputRef}
                placeholder="Titre du prompt..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium h-12 border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground"
                maxLength={100}
              />
            </div>

            {/* 📝 Description - Optional with AI generation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Description (optionnel)
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateFromTitle}
                  disabled={!title.trim() || isTransforming}
                  className="h-6 px-2 text-xs"
                >
                  {isTransforming ? (
                    <>
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      Générer avec IA
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                placeholder="Description (optionnel) ou utilisez l'IA pour générer..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="border-border/50 bg-muted/30 resize-none"
                maxLength={500}
              />
            </div>

            {/* 🎯 Epic/Product assignment */}
            {filteredEpics.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Assigner à un epic
                </label>
                <Select value={selectedEpic} onValueChange={setSelectedEpic}>
                  <SelectTrigger ref={epicSelectRef} className="h-10">
                    <SelectValue placeholder="Sélectionner un epic..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    <SelectItem value="none">
                      <span className="text-muted-foreground">Aucun epic</span>
                    </SelectItem>
                    {filteredEpics.map((epic) => (
                      <SelectItem key={epic.id} value={epic.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: epic.color }}
                          />
                          {epic.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            {/* Raw idea input */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Décrivez votre idée brute
              </label>
              <Textarea
                placeholder="Ex: Je veux créer une app de gestion de tâches avec des collaborateurs, notifications en temps réel et tableaux de bord personnalisables..."
                value={rawIdea}
                onChange={(e) => setRawIdea(e.target.value)}
                rows={4}
                className="border-border/50 bg-muted/30 resize-none"
                maxLength={1000}
              />
            </div>

            {/* Transform button */}
            <div className="flex gap-2">
              <Button
                onClick={handleTransformIdea}
                disabled={!rawIdea.trim() || isTransforming}
                className="bg-primary hover:bg-primary/90"
              >
                {isTransforming ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                    Génération...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Générer avec IA
                  </div>
                )}
              </Button>
            </div>

            {/* Generated prompt preview */}
            {transformedPrompt && (
              <Card className="p-4 bg-accent/20 border-accent/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-accent-foreground">
                    Prompt généré
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyPrompt(transformedPrompt)}
                      className="h-8 text-xs"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUseGeneratedPrompt}
                      className="h-8 text-xs"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Utiliser
                    </Button>
                  </div>
                </div>
                <div className="bg-background/50 rounded-md p-3 max-h-[200px] overflow-y-auto">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                    {transformedPrompt}
                  </pre>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <PromptHistoryPanel
              history={promptHistory}
              onHistoryUpdate={loadPromptHistory}
              onCopyPrompt={handleCopyPrompt}
            />
          </TabsContent>
        </Tabs>

        {/* 🚀 Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Enter</kbd> pour créer
            <span className="mx-2">•</span>
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Esc</kbd> annuler
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            {activeTab === 'create' && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!title.trim() || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    Création...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    Créer
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};