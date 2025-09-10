import React from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Badge } from '@/components/ui/badge';
import { Edit, Copy, Trash2, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePromptsContext } from '@/context/PromptsContext';
import { Prompt, PromptStatus } from '@/types';
import { copyText } from '@/lib/clipboard';

interface PromptContextMenuProps {
  prompt: Prompt;
  children: React.ReactNode;
  onEdit: () => void;
  onUpdate: () => void;
}

const statusOptions = [
  { value: 'todo', label: 'Todo', variant: 'outline' as const },
  { value: 'in_progress', label: 'In Progress', variant: 'secondary' as const },
  { value: 'done', label: 'Done', variant: 'default' as const }
];

export function PromptContextMenu({ prompt, children, onEdit, onUpdate }: PromptContextMenuProps) {
  const { toast } = useToast();
  const promptsContext = usePromptsContext();
  const { deletePrompt } = promptsContext || {};

  const handleStatusChange = async (newStatus: PromptStatus) => {
    if (newStatus === prompt.status) return;

    try {
      const { error } = await supabase
        .from('prompts')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', prompt.id);

      if (error) throw error;

      toast({
        title: 'Status updated',
        description: `Prompt moved to ${statusOptions.find(s => s.value === newStatus)?.label}`
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const handleDuplicate = async () => {
    try {
      const { error } = await supabase
        .from('prompts')
        .insert({
          workspace_id: prompt.workspace_id,
          title: `${prompt.title} (Copy)`,
          description: prompt.description,
          status: 'todo',
          priority: prompt.priority,
          product_id: prompt.product_id,
          epic_id: prompt.epic_id,
          order_index: 0
        });

      if (error) throw error;

      toast({
        title: 'Prompt duplicated',
        description: 'A copy has been created'
      });

      onUpdate();
    } catch (error) {
      console.error('Error duplicating prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate prompt',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async () => {
    if (deletePrompt) {
      // Use the optimized deletion from context (has optimistic updates)
      await deletePrompt(prompt.id);
      onUpdate(); // Still call onUpdate for any parent-specific logic
    }
  };

  const handleCopy = async () => {
    try {
      const content = `${prompt.title}\n\n${prompt.description || ''}`.trim();
      const ok = await copyText(content);
      if (!ok) throw new Error('Clipboard copy failed');
      
      // Auto-change status from todo to in_progress when copied
      if (prompt.status === 'todo') {
        await handleStatusChange('in_progress');
      }
      
      toast({
        title: 'Copied to clipboard',
        description: prompt.status === 'todo' ? 'Prompt copied and moved to In Progress' : 'Prompt content has been copied'
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onEdit} className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit prompt
        </ContextMenuItem>
        
        <ContextMenuItem onClick={handleCopy} className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          Copy content
        </ContextMenuItem>
        
        <ContextMenuItem onClick={handleDuplicate} className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          Duplicate
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Change status
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {statusOptions.map((option) => (
              <ContextMenuItem
                key={option.value}
                onClick={() => handleStatusChange(option.value as PromptStatus)}
                disabled={option.value === prompt.status}
                className="flex items-center justify-between"
              >
                <span>{option.label}</span>
                <Badge variant={option.variant} className="text-xs">
                  {option.value === prompt.status ? 'Current' : ''}
                </Badge>
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem 
          onClick={handleDelete}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete prompt
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}