import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useAppStore } from '@/store/AppStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Workspace, Prompt, Epic, KnowledgeItem, Product } from '@/types';
import { copyText } from '@/lib/clipboard';
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
import { usePromptsContext } from '@/context/PromptsContext';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { searchPrompts, SearchablePrompt } from '@/lib/searchUtils';
import { PromptDetailDialog } from '@/components/PromptDetailDialog';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
  onNavigate?: (tab: string) => void;
  injectedQuery?: string; // optional external query (e.g., from header search)
  onSetSearchQuery?: (query: string) => void; // update header/list search
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  open, 
  onOpenChange, 
  workspace,
  onNavigate, 
  injectedQuery,
  onSetSearchQuery
}) => {
  const [query, setQuery] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [completedPrompts, setCompletedPrompts] = useState<Prompt[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const { toast } = useToast();
  const { openDialog } = useAppStore();

  // Local, fuzzy prompt search aligned with list view
  const promptsContext = usePromptsContext();
  const contextPrompts = promptsContext?.prompts || [];
  const { products: allProducts } = useProducts(workspace.id);
  const { epics: allEpics } = useEpics(workspace.id);

  const clientPromptResults = useMemo(() => {
    if (!query.trim()) return [] as { prompt: SearchablePrompt; score: number }[];
    const searchable: SearchablePrompt[] = contextPrompts.map((p) => ({
      ...p,
      product: allProducts.find((prod) => prod.id === p.product_id),
      epic: allEpics.find((e) => e.id === p.epic_id),
    }));
    return searchPrompts(searchable, query, { minScore: 0.05, maxResults: 10 });
  }, [contextPrompts, allProducts, allEpics, query]);

  const activeClientPrompts = useMemo(() => clientPromptResults.map(r => r.prompt).filter(p => p.status !== 'done'), [clientPromptResults]);
  const completedClientPrompts = useMemo(() => clientPromptResults.map(r => r.prompt).filter(p => p.status === 'done'), [clientPromptResults]);

  // Sync external injected query from header search
  useEffect(() => {
    if (typeof injectedQuery === 'string') {
      setQuery(injectedQuery);
    }
  }, [injectedQuery]);

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
      if (promptsContext?.createPrompt) {
        await promptsContext.createPrompt({
          title: query.trim(),
          status: 'todo',
          priority: 2,
        });
      }
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

  const copyPromptForLovable = async (prompt: Prompt) => {
    const promptText = `${prompt.title}${prompt.description ? '\n\n' + prompt.description : ''}`;
    const ok = await copyText(promptText);
    
    if (ok) {
      toast({
        title: 'Copied to clipboard',
        description: 'Paste this prompt into Lovable chat!'
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Copy failed',
        description: 'Failed to copy prompt to clipboard'
      });
    }
    
    onOpenChange(false);
  };

  const copyKnowledgeForLovable = async (item: KnowledgeItem) => {
    const knowledgeText = `Knowledge Context: ${item.title}\n\n${item.content}`;
    const ok = await copyText(knowledgeText);
    
    if (ok) {
      toast({
        title: 'Knowledge copied',
        description: 'Use this as context in your Lovable prompts!'
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Copy failed',
        description: 'Failed to copy knowledge to clipboard'
      });
    }
    
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
            <CommandItem onSelect={() => {
              openDialog('quickPrompt');
              onOpenChange(false);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Create new prompt
            </CommandItem>
            <CommandItem onSelect={() => {
              console.log('CommandPalette: Opening settings modal');
              // Settings modal should be opened by parent component
              onOpenChange(false);
            }}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
            <CommandItem onSelect={() => {
              console.log('CommandPalette: Navigating to profile');
              onNavigate('/profile');
              onOpenChange(false);
            }}>
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
        {activeClientPrompts.length > 0 && (
          <CommandGroup heading="Active Prompts">
            {activeClientPrompts.map((prompt) => (
              <CommandItem 
                key={prompt.id}
                onSelect={() => {
                  setSelectedPrompt(prompt);
                  setDetailDialogOpen(true);
                  onOpenChange(false);
                }}
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
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Open</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Completed Prompts */}
        {completedClientPrompts.length > 0 && (
          <CommandGroup heading="Completed Prompts">
            {completedClientPrompts.map((prompt) => (
              <CommandItem 
                key={prompt.id}
                onSelect={() => {
                  setSelectedPrompt(prompt);
                  setDetailDialogOpen(true);
                  onOpenChange(false);
                }}
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
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Open</span>
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
      
      {/* Detail Dialog */}
      <PromptDetailDialog
        prompt={selectedPrompt}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        products={allProducts}
        epics={allEpics}
      />
    </CommandDialog>
  );
};