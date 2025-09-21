import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { copyText } from '@/lib/clipboard';
import { 
  Search, 
  Plus,
  ExternalLink,
  Hash,
  FolderOpen,
  BookOpen,
  Lightbulb,
  Copy,
  Eye,
  Clock,
  Star,
  Settings,
  Keyboard,
  Package
} from 'lucide-react';
import { usePromptsContext } from '@/context/PromptsContext';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useEnhancedSearch } from '@/hooks/useEnhancedSearch';
import { useRecentItems } from '@/hooks/useRecentItems';
import { formatShortcut } from '@/utils/keyboardUtils';
import { Prompt, Epic, Product, KnowledgeItem } from '@/types';
import type { PromptLibraryItem } from '@/types/prompt-library';
import { useToast } from '@/hooks/use-toast';
import { PromptDetailDialog } from '@/components/PromptDetailDialog';
import { Badge } from '@/components/ui/badge';

interface EnhancedCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (path: string) => void;
  injectedQuery?: string;
  onSetSearchQuery?: (query: string) => void;
}

export function EnhancedCommandPalette({ 
  open, 
  onOpenChange, 
  onNavigate, 
  injectedQuery = '', 
  onSetSearchQuery 
}: EnhancedCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const promptsCtx = usePromptsContext();
  const createPrompt = promptsCtx?.createPrompt;
  const canCreatePrompt = !!createPrompt;
  const { workspace } = useWorkspace();
  const { products } = useProducts(workspace?.id || '');
  const { epics } = useEpics(workspace?.id || '');
  const { toast } = useToast();
  const { recentItems, addRecentItem } = useRecentItems();
  
  // Enhanced search with client-side fuzzy search + server-side advanced search
  const { searchResults, isSearching, hasSearched, isEmpty } = useEnhancedSearch(query, {
    debounceMs: 200,
    maxResults: 8,
    enableFuzzySearch: true
  });

  // Sync injected query from external sources
  useEffect(() => {
    if (injectedQuery && injectedQuery !== query) {
      setQuery(injectedQuery);
      if (onSetSearchQuery) {
        onSetSearchQuery('');
      }
    }
  }, [injectedQuery, query, onSetSearchQuery]);

  const handleCreatePrompt = () => {
    // Déclencher l'ouverture du QuickPromptDialog
    window.dispatchEvent(new CustomEvent('open-quick-prompt'));
    onOpenChange(false);
  };

  const handleSelect = useCallback((item: any, type: string, action?: string) => {
    // Add to recent items for navigation actions
    if (action !== 'copy' && type !== 'action') {
      addRecentItem({
        id: item.id,
        title: item.title || item.name,
        type: type as any,
        metadata: type === 'prompt' ? {
          body: item.description,
          priority: item.priority?.toString(),
          status: item.status
        } : undefined
      });
    }

    // Handle different actions
    switch (action) {
      case 'copy':
        if (type === 'prompt') {
          copyPromptForLovable(item);
        } else if (type === 'knowledge') {
          copyKnowledgeForLovable(item);
        } else if (type === 'promptLibrary') {
          copyPromptLibraryForLovable(item);
        }
        break;
      case 'view':
        setSelectedPrompt(item);
        onOpenChange(false);
        break;
      default:
        // Navigation action
        if (type === 'action') {
          // Handle quick actions
          switch (item.id) {
            case 'settings':
              // Open settings modal instead of navigating
              // This should be handled by the parent component
              break;
            case 'prompt-library':
              // Déclencher l'ouverture de la Prompt Library
              window.dispatchEvent(new CustomEvent('open-prompt-library'));
              break;
            case 'shortcuts':
              onNavigate?.('/keyboard-shortcuts');
              break;
          }
        } else {
          onNavigate?.(item.path || `/build?${type}=${item.id}`);
        }
        onOpenChange(false);
    }
  }, [addRecentItem, onNavigate, onOpenChange]);

  const copyPromptForLovable = async (prompt: Prompt) => {
    const content = `Title: ${prompt.title}\n\nDescription: ${prompt.description || ''}\n\nPriority: ${prompt.priority}\nStatus: ${prompt.status}`;
    const ok = await copyText(content);
    if (ok) {
      toast({
        title: "Copié dans le presse-papiers",
        description: "Le prompt a été copié pour utilisation dans Lovable."
      });
    } else {
      toast({
        title: "Erreur de copie",
        description: "Impossible de copier le prompt.",
        variant: "destructive"
      });
    }
  };

  const copyKnowledgeForLovable = async (item: KnowledgeItem) => {
    const content = `Knowledge: ${item.title}\n\n${item.content}${item.tags && item.tags.length > 0 ? `\n\nTags: ${item.tags.join(', ')}` : ''}`;
    const ok = await copyText(content);
    if (ok) {
      toast({
        title: "Copié dans le presse-papiers", 
        description: "L'élément de connaissance a été copié."
      });
    } else {
      toast({
        title: "Erreur de copie",
        description: "Impossible de copier l'élément.",
        variant: "destructive"
      });
    }
  };

  const copyPromptLibraryForLovable = async (item: PromptLibraryItem) => {
    const content = `Template: ${item.title}\n\n${item.body}${item.tags && item.tags.length > 0 ? `\n\nTags: ${item.tags.join(', ')}` : ''}${item.category ? `\nCategory: ${item.category}` : ''}`;
    const ok = await copyText(content);
    if (ok) {
      toast({
        title: "Copié dans le presse-papiers", 
        description: "Le template a été copié."
      });
    } else {
      toast({
        title: "Erreur de copie",
        description: "Impossible de copier le template.",
        variant: "destructive"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !query.trim() && isEmpty) {
      e.preventDefault();
      handleCreatePrompt();
    }
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <CommandInput 
          placeholder="Rechercher des prompts, épics, produits..." 
          value={query}
          onValueChange={setQuery}
          onKeyDown={handleKeyDown}
        />
        <CommandList>
          <CommandEmpty>
            {isSearching ? (
              <div className="flex items-center gap-2 text-muted-foreground py-6">
                <Search className="h-4 w-4 animate-spin" />
                Recherche en cours...
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-muted-foreground mb-2">
                  {hasSearched ? "Aucun résultat trouvé" : "Commencez à taper pour rechercher"}
                </div>
                {query.trim() && (
                  <div className="text-sm text-muted-foreground">
                    Appuyez sur <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Entrée</kbd> pour créer "{query.slice(0, 30)}{query.length > 30 ? '...' : ''}"
                  </div>
                )}
              </div>
            )}
          </CommandEmpty>

          {/* Recent Items - Show when no search query */}
          {!query.trim() && recentItems.length > 0 && (
            <CommandGroup heading="Récemment consultés">
              {recentItems.slice(0, 5).map((item) => (
                <CommandItem
                  key={`recent-${item.id}-${item.type}`}
                  onSelect={() => handleSelect(item, item.type)}
                >
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.title}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                      {item.metadata?.body && (
                        <span className="truncate">
                          {item.metadata.body.slice(0, 40)}...
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Quick Actions */}
          <CommandGroup heading="Actions rapides">
            <CommandItem onSelect={handleCreatePrompt}>
              <Plus className="mr-2 h-4 w-4" />
              Créer un nouveau prompt
              <div className="ml-auto text-xs text-muted-foreground">
                {formatShortcut('n')}
              </div>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect({ id: 'prompt-library', title: 'Bibliothèque de prompts', path: '/prompt-library' }, 'action')}>
              <BookOpen className="mr-2 h-4 w-4" />
              Bibliothèque de prompts
              <div className="ml-auto text-xs text-muted-foreground">
                {formatShortcut('l')}
              </div>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect({ id: 'settings', title: 'Paramètres', path: '/settings' }, 'action')}>
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </CommandItem>
            <CommandItem onSelect={() => handleSelect({ id: 'shortcuts', title: 'Raccourcis clavier', path: '/keyboard-shortcuts' }, 'action')}>
              <Keyboard className="mr-2 h-4 w-4" />
              Raccourcis clavier
              <div className="ml-auto text-xs text-muted-foreground">
                {formatShortcut('?')}
              </div>
            </CommandItem>
          </CommandGroup>

          {/* External Resources */}
          <CommandGroup heading="Ressources externes">
            <CommandItem onSelect={() => window.open('https://lovable.dev', '_blank')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Ouvrir Lovable
            </CommandItem>
          </CommandGroup>

          {/* Search Results */}
          {searchResults.prompts.filter(p => ['todo', 'in_progress'].includes(p.status)).length > 0 && (
            <CommandGroup heading="Prompts actifs">
              {searchResults.prompts.filter(p => ['todo', 'in_progress'].includes(p.status)).map((prompt) => (
                <CommandItem
                  key={prompt.id}
                  onSelect={() => handleSelect(prompt, 'prompt', 'view')}
                  className="group"
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{prompt.title}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {prompt.priority === 1 ? 'High' : prompt.priority === 2 ? 'Medium' : 'Low'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {prompt.status}
                      </Badge>
                      {prompt.description && (
                        <span className="truncate">
                          {prompt.description.slice(0, 40)}...
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(prompt, 'prompt', 'copy');
                      }}
                      className="p-1 hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copier pour Lovable"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchResults.prompts.filter(p => p.status === 'done').length > 0 && (
            <CommandGroup heading="Prompts terminés">
              {searchResults.prompts.filter(p => p.status === 'done').map((prompt) => (
                <CommandItem
                  key={prompt.id}
                  onSelect={() => handleSelect(prompt, 'prompt', 'view')}
                  className="group"
                >
                  <Lightbulb className="mr-2 h-4 w-4 opacity-60" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate opacity-80">{prompt.title}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        terminé
                      </Badge>
                      {prompt.description && (
                        <span className="truncate">
                          {prompt.description.slice(0, 40)}...
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(prompt, 'prompt', 'copy');
                      }}
                      className="p-1 hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copier pour Lovable"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchResults.products.length > 0 && (
            <CommandGroup heading="Produits">
              {searchResults.products.map((product) => (
                <CommandItem
                  key={product.id}
                  onSelect={() => handleSelect(product, 'product')}
                >
                  <Package className="mr-2 h-4 w-4" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {product.description.slice(0, 60)}...
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchResults.epics.length > 0 && (
            <CommandGroup heading="Épics">
              {searchResults.epics.map((epic) => (
                <CommandItem
                  key={epic.id}
                  onSelect={() => handleSelect(epic, 'epic')}
                >
                  <Hash className="mr-2 h-4 w-4" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{epic.name}</div>
                    {epic.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {epic.description.slice(0, 60)}...
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchResults.knowledge.length > 0 && (
            <CommandGroup heading="Base de connaissances">
              {searchResults.knowledge.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item, 'knowledge', 'copy')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.title}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {item.tags && item.tags.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {item.tags[0]}
                        </Badge>
                      )}
                      <span className="truncate">
                        {item.content.slice(0, 40)}...
                      </span>
                    </div>
                  </div>
                  <Copy className="ml-2 h-3 w-3 opacity-50" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchResults.promptLibrary.length > 0 && (
            <CommandGroup heading="Templates de prompts">
              {searchResults.promptLibrary.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item, 'promptLibrary', 'copy')}
                  className="group"
                >
                  <Star className="mr-2 h-4 w-4" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.title}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                      {item.ai_model && (
                        <Badge variant="outline" className="text-xs">
                          {item.ai_model}
                        </Badge>
                      )}
                      <span className="truncate">
                        {item.body.slice(0, 40)}...
                      </span>
                    </div>
                  </div>
                  <Copy className="ml-2 h-3 w-3 opacity-50" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>

      {/* Prompt Detail Dialog */}
      {selectedPrompt && (
        <PromptDetailDialog
          prompt={selectedPrompt}
          products={products}
          epics={epics}
          open={!!selectedPrompt}
          onOpenChange={(open) => !open && setSelectedPrompt(null)}
        />
      )}
    </>
  );
}