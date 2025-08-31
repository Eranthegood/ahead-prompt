import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/PromptCard';
import { Workspace, Prompt, PromptStatus } from '@/types';
import { Plus, MoreHorizontal } from 'lucide-react';

interface KanbanBoardProps {
  workspace: Workspace;
}

const COLUMNS: { status: PromptStatus; title: string; color: string }[] = [
  { status: 'todo', title: 'To Do', color: 'status-todo' },
  { status: 'in_progress', title: 'In Progress', color: 'status-progress' },
  { status: 'done', title: 'Done', color: 'status-done' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ workspace }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrompts();
  }, [workspace.id]);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('order_index');

      if (error) throw error;
      setPrompts((data || []) as Prompt[]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching prompts',
        description: error?.message
      });
    } finally {
      setLoading(false);
    }
  };

  const getPromptsByStatus = (status: PromptStatus) => {
    return prompts.filter(prompt => prompt.status === status);
  };

  const getStatusCount = (status: PromptStatus) => {
    return getPromptsByStatus(status).length;
  };

  const createPrompt = async (status: PromptStatus) => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .insert({
          workspace_id: workspace.id,
          title: 'New Prompt',
          status,
          order_index: getStatusCount(status),
        })
        .select()
        .single();

      if (error) throw error;

      setPrompts(prev => [...prev, data as Prompt]);
      toast({
        title: 'Prompt created',
        description: 'Start building your next feature!'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating prompt',
        description: error?.message
      });
    }
  };

  const updatePromptStatus = async (promptId: string, newStatus: PromptStatus) => {
    try {
      const { error } = await supabase
        .from('prompts')
        .update({ 
          status: newStatus,
          order_index: getStatusCount(newStatus)
        })
        .eq('id', promptId);

      if (error) throw error;

      setPrompts(prev =>
        prev.map(prompt =>
          prompt.id === promptId 
            ? { ...prompt, status: newStatus }
            : prompt
        )
      );

      toast({
        title: 'Prompt moved',
        description: `Moved to ${newStatus.replace('_', ' ')}`
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating prompt',
        description: error?.message
      });
    }
  };

  if (loading) {
    return (
      <div className="flex gap-6">
        {COLUMNS.map((column) => (
          <div key={column.status} className="flex-1">
            <Card className="h-32 animate-pulse bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Prompt Board</h2>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="w-4 h-4 mr-2" />
          Board Options
        </Button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6">
        {COLUMNS.map((column) => (
          <div key={column.status} className="flex-1 min-w-80">
            <Card className="h-full bg-card/50 border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {getStatusCount(column.status)}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => createPrompt(column.status)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {getPromptsByStatus(column.status).map((prompt) => (
                  <PromptCard 
                    key={prompt.id} 
                    prompt={prompt}
                    onStatusChange={updatePromptStatus}
                    onUpdate={fetchPrompts}
                  />
                ))}
                
                {getStatusCount(column.status) === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No prompts yet</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => createPrompt(column.status)}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add prompt
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};