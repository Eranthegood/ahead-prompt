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
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Workspace, Prompt, Epic, KnowledgeItem, Product } from '@/types';
import { 
  Search, 
  Plus, 
  Hash, 
  Circle, 
  FileText,
  Zap,
  Copy,
  Package,
  Settings,
  User,
  ExternalLink,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
  onNavigate?: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  open, 
  onOpenChange, 
  workspace,
  onNavigate 
}) => {
  const [query, setQuery] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [completedPrompts, setCompletedPrompts] = useState<Prompt[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && query.length > 1) {
      searchData();
    } else if (open && query.length === 0) {
      // Reset all results when query is empty
      setPrompts([]);
      setCompletedPrompts([]);
      setEpics([]);
      setProducts([]);
      setKnowledgeItems([]);
    }
  }, [query, open]);

  const searchData = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const [promptsResult, completedPromptsResult, epicsResult, productsResult, knowledgeResult] = await Promise.all([
        // Active prompts (todo, in_progress)
        supabase
          .from('prompts')
          .select('*')
          .eq('workspace_id', workspace.id)
          .in('status', ['todo', 'in_progress'])
          .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
          .limit(5),
        // Completed prompts
        supabase
          .from('prompts')
          .select('*')
          .eq('workspace_id', workspace.id)
          .eq('status', 'done')
          .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
          .limit(3),
        // Epics
        supabase
          .from('epics')
          .select('*')
          .eq('workspace_id', workspace.id)
          .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
          .limit(3),
        // Products
        supabase
          .from('products')
          .select('*')
          .eq('workspace_id', workspace.id)
          .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
          .limit(3),
        // Knowledge items
        supabase
          .from('knowledge_items')
          .select('*')
          .eq('workspace_id', workspace.id)
          .or(`title.ilike.%${query}%, content.ilike.%${query}%`)
          .limit(3),
      ]);

      if (promptsResult.error) throw promptsResult.error;
      if (completedPromptsResult.error) throw completedPromptsResult.error;
      if (epicsResult.error) throw epicsResult.error;
      if (productsResult.error) throw productsResult.error;
      if (knowledgeResult.error) throw knowledgeResult.error;

      setPrompts((promptsResult.data || []) as Prompt[]);
      setCompletedPrompts((completedPromptsResult.data || []) as Prompt[]);
      setEpics(epicsResult.data || []);
      setProducts(productsResult.data || []);
      setKnowledgeItems(knowledgeResult.data || []);
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
            priority: 2, // Default to normal priority
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

  const copyKnowledgeForLovable = (item: KnowledgeItem) => {
    const knowledgeText = `Knowledge Context: ${item.title}\n\n${item.content}`;
    navigator.clipboard.writeText(knowledgeText);
    
    toast({
      title: 'Knowledge copied',
      description: 'Use this as context in your Lovable prompts!'
    });
    
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim() && prompts.length === 0 && knowledgeItems.length === 0) {
      e.preventDefault();
      createPrompt();
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="🔍 Search anything: prompts, knowledge, products, epics... or create new content"
        value={query}
        onValueChange={setQuery}
        onKeyDown={handleKeyDown}
      />
      
      <CommandList>
        <CommandEmpty>
          {query.trim() ? (
            <div className="text-center py-6">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No results found for "{query}"
              </p>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={createPrompt}
                  className="text-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create prompt "{query}"
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Try searching for prompts, knowledge, products, or epics
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-2">Universal Search</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Search across all your content or access quick actions
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Type to search prompts, knowledge, products, epics</p>
                <p>• Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to create new prompt</p>
                <p>• Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Cmd+K</kbd> to open this search</p>
              </div>
            </div>
          )}
        </CommandEmpty>

        {/* Quick Actions - Always visible when no query */}
        {!query.trim() && (
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={createPrompt}>
              <Plus className="mr-2 h-4 w-4" />
              Create new prompt
            </CommandItem>
            <CommandItem onSelect={() => onNavigate?.('knowledge')}>
              <FileText className="mr-2 h-4 w-4" />
              Open knowledge base
            </CommandItem>
            <CommandItem onSelect={() => window.open('/settings', '_self')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
            <CommandItem onSelect={() => window.open('/profile', '_self')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </CommandItem>
          </CommandGroup>
        )}

        {/* External Links - Always visible when no query */}
        {!query.trim() && (
          <CommandGroup heading="External Resources">
            <CommandItem onSelect={() => window.open('https://lovable.dev', '_blank')}>
              <Zap className="mr-2 h-4 w-4" />
              <span className="flex-1">Open Lovable</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => window.open('https://reddit.com/r/webdev', '_blank')}>
              <Globe className="mr-2 h-4 w-4" />
              <span className="flex-1">Reddit - WebDev</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => window.open('https://reddit.com/r/reactjs', '_blank')}>
              <Globe className="mr-2 h-4 w-4" />
              <span className="flex-1">Reddit - ReactJS</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </CommandItem>
          </CommandGroup>
        )}

        {/* Active Prompts */}
        {prompts.length > 0 && (
          <CommandGroup heading="Active Prompts">
            {prompts.map((prompt) => (
              <CommandItem 
                key={prompt.id}
                onSelect={() => copyPromptForLovable(prompt)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  {prompt.status === 'in_progress' ? (
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                  ) : (
                    <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">{prompt.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={prompt.status === 'in_progress' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {prompt.status.replace('_', ' ')}
                      </Badge>
                    </div>
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

        {/* Completed Prompts */}
        {completedPrompts.length > 0 && (
          <CommandGroup heading="Completed Prompts">
            {completedPrompts.map((prompt) => (
              <CommandItem 
                key={prompt.id}
                onSelect={() => copyPromptForLovable(prompt)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">{prompt.title}</p>
                    <Badge variant="success" className="text-xs">
                      Completed
                    </Badge>
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

        {/* Products */}
        {products.length > 0 && (
          <CommandGroup heading="Products">
            {products.map((product) => (
              <CommandItem 
                key={product.id}
                onSelect={() => {
                  toast({
                    title: 'Product selected',
                    description: `Navigating to ${product.name}`
                  });
                  onOpenChange(false);
                }}
              >
                <Package className="mr-2 h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium">{product.name}</p>
                  {product.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {product.description}
                    </p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Epics */}
        {epics.length > 0 && (
          <CommandGroup heading="Epics">
            {epics.map((epic) => (
              <CommandItem 
                key={epic.id}
                onSelect={() => {
                  toast({
                    title: 'Epic selected',
                    description: `Navigating to ${epic.name}`
                  });
                  onOpenChange(false);
                }}
              >
                <Circle 
                  className="mr-2 h-4 w-4" 
                  style={{ color: epic.color }}
                  fill="currentColor"
                />
                <div>
                  <p className="font-medium">{epic.name}</p>
                  {epic.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {epic.description}
                    </p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Knowledge Base */}
        {knowledgeItems.length > 0 && (
          <CommandGroup heading="Knowledge Base">
            {knowledgeItems.map((item) => (
              <CommandItem 
                key={item.id}
                onSelect={() => copyKnowledgeForLovable(item)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {item.content.substring(0, 60)}...
                    </p>
                    {item.category && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.category}
                      </Badge>
                    )}
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
      </CommandList>
    </CommandDialog>
  );
};