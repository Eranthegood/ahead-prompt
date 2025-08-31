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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { usePrompts } from '@/hooks/usePrompts';
import { Hash, Package, Plus, FileText, Layers, Target, ChevronRight } from 'lucide-react';
import { Workspace } from '@/types';

interface MinimalSidebarProps {
  workspace: Workspace;
  selectedProductId?: string;
  onProductSelect: (productId: string) => void;
}

export function MinimalSidebar({ workspace, selectedProductId, onProductSelect }: MinimalSidebarProps) {
  const { products } = useProducts(workspace.id);
  const { epics } = useEpics(workspace.id);
  const { prompts } = usePrompts(workspace.id);
  const [activeTab, setActiveTab] = useState<'products' | 'epics'>('products');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  // Enhanced data organization
  const productsWithCounts = products.map(product => {
    const productEpics = epics.filter(epic => epic.product_id === product.id);
    const productPrompts = prompts.filter(prompt => prompt.product_id === product.id);
    
    return {
      ...product,
      epics: productEpics,
      epicCount: productEpics.length,
      promptCount: productPrompts.length
    };
  });

  const epicsWithCounts = epics.map(epic => {
    const epicPrompts = prompts.filter(prompt => prompt.epic_id === epic.id);
    const product = products.find(p => p.id === epic.product_id);
    
    return {
      ...epic,
      product,
      promptCount: epicPrompts.length
    };
  });

  const toggleProductExpansion = (productId: string) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  return (
    <Sidebar className="w-72 border-r border-border">
      <SidebarContent className="p-4">
        {/* Workspace Header */}
        <div className="mb-6 pb-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{workspace.name}</h2>
          <p className="text-sm text-muted-foreground">Workspace</p>
        </div>

        {/* Quick Overview */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left font-normal hover:bg-muted/50"
            onClick={() => onProductSelect('all')}
          >
            <FileText className="mr-3 h-4 w-4" />
            All Prompts
            <Badge variant="secondary" className="ml-auto">
              {prompts.length}
            </Badge>
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'products' | 'epics')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="epics" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Épics
            </TabsTrigger>
          </TabsList>

          {/* Products Tab Content */}
          <TabsContent value="products" className="mt-0">
            <SidebarGroup>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Logique de Produit
                </h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {productsWithCounts.length === 0 ? (
                    <div className="py-6 text-center">
                      <Package className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">No products yet</p>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Create Product
                      </Button>
                    </div>
                  ) : (
                    productsWithCounts.map((product) => (
                      <div key={product.id}>
                        <SidebarMenuItem>
                          <SidebarMenuButton 
                            className="w-full justify-between group hover:bg-muted/70 transition-colors"
                            onClick={() => onProductSelect(product.id)}
                            isActive={selectedProductId === product.id}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: product.color || '#6B7280' }}
                              />
                              <Package className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate font-medium">{product.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs px-1.5">
                                {product.promptCount}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleProductExpansion(product.id);
                                }}
                              >
                                <ChevronRight 
                                  className={`h-3 w-3 transition-transform ${
                                    expandedProduct === product.id ? 'rotate-90' : ''
                                  }`} 
                                />
                              </Button>
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        
                        {/* Expanded Epics for Product */}
                        {expandedProduct === product.id && product.epics.length > 0 && (
                          <div className="ml-6 mt-1 space-y-1 border-l border-muted pl-3">
                            {product.epics.map((epic) => (
                              <div key={epic.id} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50 transition-colors cursor-pointer">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: epic.color || '#8B5CF6' }}
                                />
                                <Hash className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground truncate">{epic.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </TabsContent>

          {/* Epics Tab Content */}
          <TabsContent value="epics" className="mt-0">
            <SidebarGroup>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Tous les Épics
                </h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {epicsWithCounts.length === 0 ? (
                    <div className="py-6 text-center">
                      <Target className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">No epics yet</p>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Create Epic
                      </Button>
                    </div>
                  ) : (
                    epicsWithCounts.map((epic) => (
                      <SidebarMenuItem key={epic.id}>
                        <SidebarMenuButton className="w-full justify-between group hover:bg-muted/70 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: epic.color || '#8B5CF6' }}
                            />
                            <Hash className="h-4 w-4 flex-shrink-0" />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm font-medium truncate">{epic.name}</span>
                              {epic.product && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {epic.product.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs px-1.5">
                            {epic.promptCount}
                          </Badge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </TabsContent>
        </Tabs>

        {/* Stats Footer */}
        <div className="mt-auto pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm font-semibold text-foreground">{products.length}</div>
              <div className="text-xs text-muted-foreground">Products</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{epics.length}</div>
              <div className="text-xs text-muted-foreground">Épics</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{prompts.length}</div>
              <div className="text-xs text-muted-foreground">Prompts</div>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}