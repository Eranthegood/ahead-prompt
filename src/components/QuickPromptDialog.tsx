import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Zap, MoreHorizontal, Target, CheckCircle2 } from 'lucide-react';
import type { Workspace, PromptStatus } from '@/types';

interface Epic {
  id: string;
  name: string;
  color: string;
}

interface CreatePromptData {
  title: string;
  description?: string;
  status?: PromptStatus;
  priority?: number;
  epic_id?: string;
}

interface QuickPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promptData: CreatePromptData) => Promise<any>;
  onOpenExtended?: (promptData: CreatePromptData) => void;
  workspace: Workspace;
  epics?: Epic[];
}

const priorities = [
  { value: 1, label: 'P1', color: 'bg-red-500' },
  { value: 2, label: 'P2', color: 'bg-orange-500' },
  { value: 3, label: 'P3', color: 'bg-yellow-500' },
  { value: 4, label: 'P4', color: 'bg-green-500' },
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
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(3);
  const [status, setStatus] = useState<PromptStatus>('todo');
  const [selectedEpic, setSelectedEpic] = useState<string>('none');
  const [isLoading, setIsLoading] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // 🎯 Auto-focus and reset on open
  useEffect(() => {
    if (isOpen) {
      // Reset form
      setTitle('');
      setDescription('');
      setPriority(3);
      setStatus('todo');
      setSelectedEpic('none');

      // Focus with delay to avoid rendering issues
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // ⌨️ Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && title.trim()) {
      // Enter = save, Ctrl+Enter = force save
      if (e.ctrlKey || e.metaKey || !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
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
              <SelectTrigger className="w-20 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p.value} value={p.value.toString()} className="text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${p.color}`} />
                      {p.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Epic selector */}
            {epics.length > 0 && (
              <Select value={selectedEpic} onValueChange={setSelectedEpic}>
                <SelectTrigger className="flex-1 h-9 text-sm">
                  <SelectValue placeholder="Epic..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-sm">
                    <span className="text-muted-foreground">Aucun epic</span>
                  </SelectItem>
                  {epics.map((epic) => (
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
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Esc</kbd> pour annuler
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