import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Zap, MoreHorizontal, Target, CheckCircle2 } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
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
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(2);  // Default to "Normale"
  const [status, setStatus] = useState<PromptStatus>(preferences.lastPromptStatus as PromptStatus);
  const [selectedEpic, setSelectedEpic] = useState<string>('none');
  const [isLoading, setIsLoading] = useState(false);

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
      // Reset form but use user preferences for status/priority
      setTitle('');
      setDescription('');
      setPriority(getPriorityNumber(preferences.lastPromptPriority));
      setStatus(preferences.lastPromptStatus as PromptStatus);
      setSelectedEpic('none');

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

    // Priority shortcuts (1-4)
    if (e.key >= '1' && e.key <= '4') {
      e.preventDefault();
      const priorityNumber = parseInt(e.key);
      setPriority(priorityNumber);
      return;
    }

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
      // Save user preferences for next time
      savePromptSettings(status, getPriorityString(priority));

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
        className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-border/50"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Création rapide de prompt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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

          {/* 📝 Description - Optional */}
          <div>
            <Textarea
              placeholder="Description (optionnel)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border-border/50 bg-muted/30 resize-none"
              maxLength={500}
            />
          </div>

          {/* ⚡ Quick selectors */}
          <div className="flex items-center gap-3 pt-2">
            {/* Status selector */}
            <Select value={status} onValueChange={(value: PromptStatus) => setStatus(value)}>
              <SelectTrigger className="w-32 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => {
                  const IconComponent = s.icon;
                  return (
                    <SelectItem key={s.value} value={s.value} className="text-sm">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        {s.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Priority selector */}
            <Select value={priority.toString()} onValueChange={(value) => setPriority(parseInt(value))}>
              <SelectTrigger className="w-32 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p.value} value={p.value.toString()} className="text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${p.color}`} />
                      <span>{p.label}</span>
                      <span className="text-xs text-muted-foreground">({p.shortcut})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Epic selector */}
            {filteredEpics.length > 0 && (
              <Select value={selectedEpic} onValueChange={setSelectedEpic}>
                <SelectTrigger ref={epicSelectRef} className="flex-1 h-9 text-sm">
                  <SelectValue placeholder="Epic..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-sm">
                    <span className="text-muted-foreground">Aucun epic</span>
                  </SelectItem>
                  {filteredEpics.map((epic) => (
                    <SelectItem key={epic.id} value={epic.id} className="text-sm">
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
            )}

            {/* More options button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoreOptions}
              className="h-9 px-2 text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* 🚀 Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="text-xs text-muted-foreground">
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Enter</kbd> pour créer
              <span className="mx-2">•</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">1-4</kbd> priorité
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};