import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { 
  Hash, 
  Package, 
  Target, 
  ChevronDown, 
  ChevronRight, 
  Plus,
  Circle
} from 'lucide-react';
import type { Workspace, Product, Epic } from '@/types';

interface EpicSidebarProps {
  workspace: Workspace;
  selectedProductId?: string;
  onProductSelect?: (productId: string | 'all') => void;
}

interface ProductWithEpics extends Product {
  epics: EpicWithPromptCount[];
  epicCount: number;
  promptCount: number;
}

interface EpicWithPromptCount extends Epic {
  promptCount: number;
}

export const EpicSidebar: React.FC<EpicSidebarProps> = ({ 
  workspace, 
  selectedProductId, 
  onProductSelect 
}) => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [productsWithEpics, setProductsWithEpics] = useState<ProductWithEpics[]>([]);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  // Fetch products with their epics and prompt counts
  useEffect(() => {
    const fetchData = async () => {
      if (!workspace?.id) return;
      
      try {
        setLoading(true);

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('workspace_id', workspace.id)
          .order('created_at', { ascending: true });

        if (productsError) throw productsError;

        // Fetch epics  
        const { data: epicsData, error: epicsError } = await supabase
          .from('epics')
          .select('*')
          .eq('workspace_id', workspace.id);

        if (epicsError) throw epicsError;

        // Fetch prompt counts per epic
        const epicPromptCounts: Record<string, number> = {};
        for (const epic of epicsData || []) {
          const { count, error: countError } = await supabase
            .from('prompts')
            .select('*', { count: 'exact', head: true })
            .eq('epic_id', epic.id);
          
          if (!countError) {
            epicPromptCounts[epic.id] = count || 0;
          }
        }

        // Fetch total prompts count
        const { count: totalPromptsCount, error: promptsError } = await supabase
          .from('prompts')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id);

        if (promptsError) throw promptsError;

        // Group epics by product and calculate counts
        const productsWithEpicsData = productsData?.map(product => {
          const productEpics = epicsData?.filter(epic => epic.product_id === product.id) || [];
          const promptCount = productEpics.reduce((sum, epic) => {
            return sum + (epicPromptCounts[epic.id] || 0);
          }, 0);

          const epicsWithCounts = productEpics.map(epic => ({
            ...epic,
            promptCount: epicPromptCounts[epic.id] || 0
          }));

          return {
            ...product,
            epics: epicsWithCounts,
            epicCount: productEpics.length,
            promptCount,
          };
        }) || [];

        setProductsWithEpics(productsWithEpicsData);
        setTotalPrompts(totalPromptsCount || 0);

        // Auto-expand selected product
        if (selectedProductId && selectedProductId !== 'all') {
          setExpandedProducts(prev => new Set(prev).add(selectedProductId));
        }

      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workspace?.id, selectedProductId]);

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleProductSelect = (productId: string | 'all') => {
    onProductSelect?.(productId);
    if (productId !== 'all') {
      setExpandedProducts(prev => new Set(prev).add(productId));
    }
  };

  if (loading) {
    return (
      <Sidebar className={collapsed ? "w-14" : "w-72"}>
        <SidebarTrigger className="m-2 self-end" />
        <SidebarContent>
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className={collapsed ? "w-14" : "w-72"}>
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent className="px-2">
        {/* All Prompts Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={selectedProductId === 'all' || !selectedProductId}
                >
                  <button
                    onClick={() => handleProductSelect('all')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent"
                  >
                    <Hash className="w-4 h-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">Tous les prompts</span>
                        <Badge variant="secondary" className="text-xs">
                          {totalPrompts}
                        </Badge>
                      </>
                    )}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Products Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2">
            Produits
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {productsWithEpics.map((product) => (
                <SidebarMenuItem key={product.id}>
                  <Collapsible
                    open={expandedProducts.has(product.id)}
                    onOpenChange={() => toggleProductExpansion(product.id)}
                  >
                    {/* Product Header */}
                    <div className="flex items-center">
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start p-0 h-auto"
                        >
                          <SidebarMenuButton 
                            isActive={selectedProductId === product.id}
                            className="flex-1"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductSelect(product.id);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm"
                            >
                              {expandedProducts.has(product.id) ? (
                                <ChevronDown className="w-3 h-3 shrink-0" />
                              ) : (
                                <ChevronRight className="w-3 h-3 shrink-0" />
                              )}
                              <div 
                                className="w-2 h-2 rounded-full shrink-0" 
                                style={{ backgroundColor: product.color }}
                              />
                              {!collapsed && (
                                <>
                                  <span className="flex-1 text-left truncate">
                                    {product.name}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {product.promptCount}
                                  </Badge>
                                </>
                              )}
                            </button>
                          </SidebarMenuButton>
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    {/* Epics List */}
                    <CollapsibleContent className="ml-4">
                      {product.epics.length > 0 ? (
                        <div className="space-y-1 py-1">
                          {product.epics.map((epic) => (
                            <SidebarMenuButton key={epic.id} className="w-full">
                              <button className="w-full flex items-center gap-3 px-3 py-1.5 text-sm rounded-md hover:bg-accent/50">
                                <Target className="w-3 h-3 shrink-0 text-muted-foreground" />
                                {!collapsed && (
                                  <>
                                    <div 
                                      className="w-1.5 h-1.5 rounded-full shrink-0" 
                                      style={{ backgroundColor: epic.color }}
                                    />
                                    <span className="flex-1 text-left truncate text-muted-foreground">
                                      {epic.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {epic.promptCount}
                                    </span>
                                  </>
                                )}
                              </button>
                            </SidebarMenuButton>
                          ))}
                        </div>
                      ) : (
                        !collapsed && (
                          <div className="px-3 py-2 text-xs text-muted-foreground">
                            Aucun epic
                          </div>
                        )
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              ))}
              
              {productsWithEpics.length === 0 && !collapsed && (
                <div className="px-3 py-6 text-center text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Aucun produit</p>
                  <p className="text-xs">Créez votre premier produit</p>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-auto p-4 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Produits:</span>
                <span>{productsWithEpics.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Épics:</span>
                <span>{productsWithEpics.reduce((sum, p) => sum + p.epicCount, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Prompts:</span>
                <span>{totalPrompts}</span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};