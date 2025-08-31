import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PromptTransformService } from '@/services/promptTransformService';
import { Prompt, PromptStatus } from '@/types';
import { 
  Copy, 
  Edit3, 
  Check, 
  X, 
  ArrowRight, 
  ArrowLeft,
  Trash2,
  Circle,
  Sparkles
} from 'lucide-react';

interface PromptCardProps {
  prompt: Prompt;
  onStatusChange: (promptId: string, status: PromptStatus) => void;
  onUpdate: () => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ 
  prompt, 
  onStatusChange, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(prompt.title);
  const [description, setDescription] = useState(prompt.description || '');
  const { toast } = useToast();

  const saveChanges = async () => {
    try {
      const { error } = await supabase
        .from('prompts')
        .update({
          title: title.trim() || 'Untitled Prompt',
          description: description.trim() || null,
        })
        .eq('id', prompt.id);

      if (error) throw error;

      setIsEditing(false);
      onUpdate();
      
      toast({
        title: 'Prompt updated',
        description: 'Your changes have been saved!'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating prompt',
        description: error?.message
      });
    }
  };

  const cancelEdit = () => {
    setTitle(prompt.title);
    setDescription(prompt.description || '');
    setIsEditing(false);
  };

  const deletePrompt = async () => {
    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', prompt.id);

      if (error) throw error;

      onUpdate();
      
      toast({
        title: 'Prompt deleted',
        description: 'Prompt has been removed from your board'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting prompt',
        description: error?.message
      });
    }
  };

  const copyForLovable = () => {
    const promptText = `${prompt.title}${prompt.description ? '\n\n' + prompt.description : ''}`;
    navigator.clipboard.writeText(promptText);
    
    toast({
      title: 'Copied to clipboard!',
      description: 'Paste this into Lovable chat to start building'
    });
  };

  const copyGeneratedPrompt = async () => {
    try {
      const rawText = `${prompt.title}${prompt.description ? '\n\n' + prompt.description : ''}`;
      
      toast({
        title: 'Generating prompt...',
        description: 'Please wait while we generate your prompt'
      });

      const response = await PromptTransformService.transformPrompt(rawText);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.transformedPrompt) {
        await navigator.clipboard.writeText(response.transformedPrompt);
        
        toast({
          title: 'Generated prompt copied!',
          description: 'AI-generated prompt is ready to paste into Lovable'
        });
      } else {
        throw new Error('No generated prompt received');
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: 'Error generating prompt',
        description: 'Copying original content instead',
        variant: 'destructive'
      });
      
      // Fallback to original copy
      copyForLovable();
    }
  };

  const movePrompt = (direction: 'next' | 'prev') => {
    const statusOrder: PromptStatus[] = ['todo', 'in_progress', 'done'];
    const currentIndex = statusOrder.indexOf(prompt.status);
    
    let newIndex: number;
    if (direction === 'next') {
      newIndex = Math.min(currentIndex + 1, statusOrder.length - 1);
    } else {
      newIndex = Math.max(currentIndex - 1, 0);
    }
    
    if (newIndex !== currentIndex) {
      onStatusChange(prompt.id, statusOrder[newIndex]);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'text-destructive';
    if (priority === 3) return 'text-status-progress';
    return 'text-muted-foreground';
  };

  return (
    <Card className="bg-card border-border hover:shadow-md transition-shadow group">
      <CardHeader className="pb-3">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Prompt title..."
              className="font-semibold"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveChanges}>
                <Check className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={cancelEdit}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-sm line-clamp-2 flex-1">
              {prompt.title}
            </h4>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-6 w-6 p-0 text-muted-foreground"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {isEditing ? (
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description (optional)..."
            rows={3}
            className="resize-none"
          />
        ) : (
          prompt.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {prompt.description}
            </p>
          )
        )}

        {/* Priority and Epic indicators */}
        <div className="flex items-center gap-2 text-xs">
          <Circle className={`w-2 h-2 ${getPriorityColor(prompt.priority)}`} fill="currentColor" />
          <span className="text-muted-foreground">P{prompt.priority}</span>
          {prompt.epic_id && (
            <>
              <span className="text-muted-foreground">•</span>
              <Badge variant="secondary" className="text-xs">
                Epic
              </Badge>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {prompt.status !== 'todo' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => movePrompt('prev')}
                className="h-6 px-2 text-muted-foreground"
              >
                <ArrowLeft className="w-3 h-3" />
              </Button>
            )}
            {prompt.status !== 'done' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => movePrompt('next')}
                className="h-6 px-2 text-muted-foreground"
              >
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={copyForLovable}
              className="h-6 px-2 text-primary hover:text-primary-glow"
              title="Copy original content"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyGeneratedPrompt}
              className="h-6 px-2 text-primary hover:text-primary-glow"
              title="Copy generated prompt"
            >
              <Sparkles className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={deletePrompt}
              className="h-6 px-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};