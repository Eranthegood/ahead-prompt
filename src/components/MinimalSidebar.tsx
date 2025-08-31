import React, { useState } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { usePrompts } from '@/hooks/usePrompts';
import { Hash, Package, Plus, FileText, CheckCircle, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Workspace } from '@/types';

interface MinimalSidebarProps {
  workspace: Workspace;
  selectedProductId?: string;
  onProductSelect: (productId: string) => void;
  showCompletedItems: boolean;
  onToggleCompletedItems: (show: boolean) => void;
  onQuickAdd: () => void;
  searchQuery: string;
}

export function MinimalSidebar({ workspace, selectedProductId, onProductSelect, showCompletedItems, onToggleCompletedItems, onQuickAdd, searchQuery }: MinimalSidebarProps) {
  const { products } = useProducts(workspace.id);
  const { epics } = useEpics(workspace.id);
  const { prompts } = usePrompts(workspace.id);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);

  // Filter function to match search and exclude completed
  const getActivePrompts = (productFilter?: string) => {
    return prompts.filter(prompt => {
      const matchesSearch = !searchQuery || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProduct = !productFilter || productFilter === 'all' || 
        prompt.product_id === productFilter;

      const isActive = prompt.status !== 'done';

      return matchesSearch && matchesProduct && isActive;
    });
  };

  // Get active prompts count for "All Prompts"
  const allActivePromptsCount = getActivePrompts('all').length;

  // Simple organization with filtered counts
  const productsWithCounts = products.map(product => {
    const activePromptsCount = getActivePrompts(product.id).length;
    
    return {
      ...product,
      promptCount: activePromptsCount
    };
  });

  // Get completed prompts with search filter
  const completedPrompts = prompts
    .filter(p => {
      const matchesSearch = !searchQuery || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return p.status === 'done' && matchesSearch;
    })
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return (
    <Sidebar className="w-64 border-r border-border">
      <SidebarContent className="p-4">
        {/* Workspace Name */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-foreground">{workspace.name}</h2>
        </div>

        {/* Add Prompt Action */}
        <div className="mb-6">
          <Button 
            onClick={onQuickAdd}
            className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un prompt
          </Button>
          <p className="text-xs text-muted-foreground mt-2 px-1">
            Astuce : Appuyez sur <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">Q</kbd> pour créer rapidement
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left font-normal"
            onClick={() => onProductSelect('all')}
          >
            <FileText className="mr-3 h-4 w-4" />
            All Prompts
            <Badge variant="secondary" className="ml-auto">
              {allActivePromptsCount}
            </Badge>
          </Button>
        </div>

        {/* Products */}
        <SidebarGroup>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Products</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {productsWithCounts.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">No products yet</p>
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Product
                  </Button>
                </div>
              ) : (
                productsWithCounts.map((product) => (
                  <SidebarMenuItem key={product.id}>
                    <SidebarMenuButton 
                      className="w-full justify-between"
                      onClick={() => onProductSelect(product.id)}
                      isActive={selectedProductId === product.id}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: product.color || '#6B7280' }}
                        />
                        <Package className="h-4 w-4" />
                        <span className="truncate">{product.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {product.promptCount}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Completed Prompts */}
        {showCompletedItems && (
          <SidebarGroup className="mt-6">
            <div className="mb-3 flex items-center justify-between cursor-pointer" onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}>
              <h3 className="text-sm font-medium text-muted-foreground">Achevé ({completedPrompts.length})</h3>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCompletedExpanded ? 'rotate-180' : ''}`} />
            </div>
            
            {isCompletedExpanded && (
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {completedPrompts.length === 0 ? (
                    <div className="py-2 px-3 text-center">
                      <p className="text-xs text-muted-foreground">Aucun prompt terminé</p>
                    </div>
                  ) : (
                    <>
                      {completedPrompts.slice(0, 3).map((prompt) => (
                        <SidebarMenuItem key={prompt.id}>
                          <SidebarMenuButton className="w-full justify-start text-xs">
                            <div className="flex items-center gap-2 w-full">
                              <CheckCircle className="h-3 w-3 text-success" />
                              <span className="truncate flex-1">{prompt.title}</span>
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                      {completedPrompts.length > 3 && (
                        <SidebarMenuItem>
                          <SidebarMenuButton 
                            className="w-full justify-center text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => onProductSelect('completed')}
                          >
                            Voir tous les {completedPrompts.length} prompts
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        )}

        {/* Toggle for completed items when hidden */}
        {!showCompletedItems && (
          <div className="mt-6">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-left font-normal text-sm"
              onClick={() => onToggleCompletedItems(true)}
            >
              <Eye className="mr-3 h-4 w-4" />
              Afficher les éléments achevés
              <Badge variant="secondary" className="ml-auto">
                {completedPrompts.length}
              </Badge>
            </Button>
          </div>
        )}

        {/* Recent Epics */}
        {epics.length > 0 && (
          <SidebarGroup className="mt-6">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Epics</h3>
            </div>
            
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {epics.slice(0, 5).map((epic) => (
                  <SidebarMenuItem key={epic.id}>
                    <SidebarMenuButton className="w-full justify-start">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: epic.color || '#8B5CF6' }}
                        />
                        <Hash className="h-3 w-3" />
                        <span className="truncate text-sm">{epic.name}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}