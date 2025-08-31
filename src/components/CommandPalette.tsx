import React, { useState, useEffect } from 'react';
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Workspace, Prompt, Epic } from '@/types';
import { 
  Search, 
  Plus, 
  Hash, 
  Circle, 
  FileText,
  Zap,
  Copy
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  open, 
  onOpenChange, 
  workspace 
}) => {
  const [query, setQuery] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && query.length > 1) {
      searchData();
    }
  }, [query, open]);

  const searchData = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const [promptsResult, epicsResult] = await Promise.all([
        supabase
          .from('prompts')
          .select('*')
          .eq('workspace_id', workspace.id)
          .ilike('title', `%${query}%`)
          .limit(5),
        supabase
          .from('epics')
          .select('*')
          .eq('workspace_id', workspace.id)
          .ilike('name', `%${query}%`)
          .limit(3),
      ]);

      if (promptsResult.error) throw promptsResult.error;
      if (epicsResult.error) throw epicsResult.error;

      setPrompts((promptsResult.data || []) as Prompt[]);
      setEpics(epicsResult.data || []);
    } catch (error: any) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPrompt = async () => {
    if (!query.trim()) return;

    try {
      const { data, error } = await supabase
        .from('prompts')
        .insert({
          workspace_id: workspace.id,
          title: query.trim(),
          status: 'todo',
          order_index: 0,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Prompt created',
        description: `"${data.title}" is ready for development!`
      });
      
      onOpenChange(false);
      setQuery('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating prompt',
        description: error?.message
      });
    }
  };

  const copyPromptForLovable = (prompt: Prompt) => {
    const promptText = `${prompt.title}${prompt.description ? '\n\n' + prompt.description : ''}`;
    navigator.clipboard.writeText(promptText);
    
    toast({
      title: 'Copied to clipboard',
      description: 'Paste this prompt into Lovable chat!'
    });
    
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim() && prompts.length === 0) {
      e.preventDefault();
      createPrompt();
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search prompts, create new ones..."
        value={query}
        onValueChange={setQuery}
        onKeyDown={handleKeyDown}
      />
      
      <CommandList>
        <CommandEmpty>
          {query.trim() ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                No results found for "{query}"
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={createPrompt}
                className="text-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create prompt "{query}"
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Type to search or create prompts...
              </p>
            </div>
          )}
        </CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={createPrompt}>
            <Plus className="mr-2 h-4 w-4" />
            Create new prompt
          </CommandItem>
          <CommandItem onSelect={() => {/* TODO: Open knowledge base */}}>
            <FileText className="mr-2 h-4 w-4" />
            Open knowledge base
          </CommandItem>
        </CommandGroup>

        {/* Found Prompts */}
        {prompts.length > 0 && (
          <CommandGroup heading="Prompts">
            {prompts.map((prompt) => (
              <CommandItem 
                key={prompt.id}
                onSelect={() => copyPromptForLovable(prompt)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{prompt.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {prompt.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Copy className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Copy</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Found Epics */}
        {epics.length > 0 && (
          <CommandGroup heading="Epics">
            {epics.map((epic) => (
              <CommandItem key={epic.id}>
                <Circle 
                  className="mr-2 h-4 w-4" 
                  style={{ color: epic.color }}
                  fill="currentColor"
                />
                {epic.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Navigation */}
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => window.open('https://lovable.dev', '_blank')}>
            <Zap className="mr-2 h-4 w-4" />
            Open Lovable
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};