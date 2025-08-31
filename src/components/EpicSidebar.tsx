import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  useSidebar
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { usePrompts } from '@/hooks/usePrompts';
import { useAuth } from '@/hooks/useAuth';
import { ProductContextMenu } from '@/components/ProductContextMenu';
import { EpicContextMenu } from '@/components/EpicContextMenu';
import { 
  ChevronRight, 
  ChevronDown, 
  User, 
  Package, 
  Hash, 
  FileText,
  Plus
} from 'lucide-react';
import { Workspace, Product, Epic } from '@/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EpicSidebarProps {
  workspace: Workspace;
  selectedProductId?: string;
  onProductSelect: (productId: string) => void;
}

export function EpicSidebar({ workspace, selectedProductId, onProductSelect }: EpicSidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  
  const { products, loading: productsLoading, deleteProduct } = useProducts(workspace.id);
  const { epics, loading: epicsLoading, createEpic, deleteEpic } = useEpics(workspace.id);
  const { prompts, loading: promptsLoading, createPrompt } = usePrompts(workspace.id);
  
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set());

  // Group data by hierarchy
  const productsWithData = products.map(product => {
    const productEpics = epics.filter(epic => epic.product_id === product.id);
    const directPrompts = prompts.filter(prompt => prompt.product_id === product.id && !prompt.epic_id);
    
    const epicsWithPrompts = productEpics.map(epic => {
      const epicPrompts = prompts.filter(prompt => prompt.epic_id === epic.id);
      return {
        ...epic,
        prompts: epicPrompts.slice(-3), // Last 3 prompts
        totalPrompts: epicPrompts.length
      };
    });
    
    const totalPrompts = directPrompts.length + productEpics.reduce((sum, epic) => {
      return sum + prompts.filter(prompt => prompt.epic_id === epic.id).length;
    }, 0);
    
    return {
      ...product,
      epics: epicsWithPrompts,
      directPrompts,
      totalPrompts
    };
  });

  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const toggleEpicExpansion = (epicId: string) => {
    const newExpanded = new Set(expandedEpics);
    if (newExpanded.has(epicId)) {
      newExpanded.delete(epicId);
    } else {
      newExpanded.add(epicId);
    }
    setExpandedEpics(newExpanded);
  };

  const handleNavigateToProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddEpic = (productId: string) => {
    // TODO: Open epic creation dialog with pre-selected product
    console.log('Add epic to product:', productId);
  };

  const handleEditProduct = (product: Product) => {
    // TODO: Open product edit dialog
    console.log('Edit product:', product);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This will also delete all associated epics and prompts.`)) {
      await deleteProduct(product.id);
    }
  };

  const handleAddPrompt = (epicId: string) => {
    // TODO: Open prompt creation dialog with pre-selected epic
    console.log('Add prompt to epic:', epicId);
  };

  const handleEditEpic = (epic: Epic) => {
    // TODO: Open epic edit dialog
    console.log('Edit epic:', epic);
  };

  const handleDeleteEpic = async (epic: Epic) => {
    if (window.confirm(`Are you sure you want to delete "${epic.name}"? This will also delete all associated prompts.`)) {
      await deleteEpic(epic.id);
    }
  };

  if (productsLoading || epicsLoading || promptsLoading) {
    return (
      <Sidebar className="border-r">
        <SidebarTrigger className="m-2" />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              <Skeleton className="h-4 w-32" />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  const displayName = user?.email?.split('@')[0] || 'User';

  return (
    <Sidebar className="border-r">
      <SidebarTrigger className="m-2" />
      <SidebarContent>
        {/* Workspace Header */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 px-2 py-3">
            <User className="h-4 w-4" />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-medium truncate">{displayName}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {workspace.name}
                </span>
              </div>
            )}
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Products Hierarchy */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {productsWithData.length === 0 ? (
                <div className="px-2 py-4 text-center">
                  <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No products yet</p>
                  {!collapsed && (
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => console.log('Create product')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Product
                    </Button>
                  )}
                </div>
              ) : (
                productsWithData.map((product) => (
                  <SidebarMenuItem key={product.id}>
                    <Collapsible
                      open={expandedProducts.has(product.id)}
                      onOpenChange={() => toggleProductExpansion(product.id)}
                    >
                      <ProductContextMenu
                        product={product}
                        onAddEpic={handleAddEpic}
                        onEditProduct={handleEditProduct}
                        onDeleteProduct={handleDeleteProduct}
                        onNavigateToProduct={handleNavigateToProduct}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: product.color || '#3B82F6' }}
                              />
                              {!collapsed && (
                                <>
                                  <Package className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{product.name}</span>
                                </>
                              )}
                            </div>
                            {!collapsed && (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Badge variant="secondary" className="text-xs">
                                  {product.totalPrompts}
                                </Badge>
                                {expandedProducts.has(product.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </div>
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                      </ProductContextMenu>
                      
                      {!collapsed && (
                        <CollapsibleContent className="ml-4">
                          <SidebarMenu>
                            {/* Product Epics */}
                            {product.epics.map((epic) => (
                              <SidebarMenuItem key={epic.id}>
                                <Collapsible
                                  open={expandedEpics.has(epic.id)}
                                  onOpenChange={() => toggleEpicExpansion(epic.id)}
                                >
                                  <EpicContextMenu
                                    epic={epic}
                                    onAddPrompt={handleAddPrompt}
                                    onEditEpic={handleEditEpic}
                                    onDeleteEpic={handleDeleteEpic}
                                  >
                                    <CollapsibleTrigger asChild>
                                      <SidebarMenuButton className="w-full justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div 
                                            className="w-2 h-2 rounded-full flex-shrink-0" 
                                            style={{ backgroundColor: epic.color || '#8B5CF6' }}
                                          />
                                          <Hash className="h-4 w-4 flex-shrink-0" />
                                          <span className="truncate">{epic.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <Badge variant="outline" className="text-xs">
                                            {epic.totalPrompts}
                                          </Badge>
                                          {epic.prompts.length > 0 && (
                                            expandedEpics.has(epic.id) ? (
                                              <ChevronDown className="h-4 w-4" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4" />
                                            )
                                          )}
                                        </div>
                                      </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                  </EpicContextMenu>
                                  
                                  <CollapsibleContent className="ml-4">
                                    <SidebarMenu>
                                      {epic.prompts.map((prompt) => (
                                        <SidebarMenuItem key={prompt.id}>
                                          <SidebarMenuButton className="w-full justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <FileText className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                                              <span className="truncate text-sm">{prompt.title}</span>
                                            </div>
                                            <Badge 
                                              variant={
                                                prompt.status === 'done' ? 'default' : 
                                                prompt.status === 'in_progress' ? 'secondary' : 'outline'
                                              }
                                              className="text-xs"
                                            >
                                              {prompt.status === 'in_progress' ? 'WIP' : 
                                               prompt.status === 'done' ? 'Done' : 'Todo'}
                                            </Badge>
                                          </SidebarMenuButton>
                                        </SidebarMenuItem>
                                      ))}
                                      {epic.totalPrompts > 3 && (
                                        <SidebarMenuItem>
                                          <SidebarMenuButton className="text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                              <Plus className="h-3 w-3 flex-shrink-0" />
                                              <span className="text-xs">
                                                {epic.totalPrompts - 3} more prompts
                                              </span>
                                            </div>
                                          </SidebarMenuButton>
                                        </SidebarMenuItem>
                                      )}
                                    </SidebarMenu>
                                  </CollapsibleContent>
                                </Collapsible>
                              </SidebarMenuItem>
                            ))}
                            
                            {/* Direct Prompts */}
                            {product.directPrompts.slice(-3).map((prompt) => (
                              <SidebarMenuItem key={prompt.id}>
                                <SidebarMenuButton className="w-full justify-between">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                                    <span className="truncate text-sm">{prompt.title}</span>
                                  </div>
                                  <Badge 
                                    variant={
                                      prompt.status === 'done' ? 'default' : 
                                      prompt.status === 'in_progress' ? 'secondary' : 'outline'
                                    }
                                    className="text-xs"
                                  >
                                    {prompt.status === 'in_progress' ? 'WIP' : 
                                     prompt.status === 'done' ? 'Done' : 'Todo'}
                                  </Badge>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                            
                            {product.directPrompts.length > 3 && (
                              <SidebarMenuItem>
                                <SidebarMenuButton className="text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Plus className="h-3 w-3 flex-shrink-0" />
                                    <span className="text-xs">
                                      {product.directPrompts.length - 3} more direct prompts
                                    </span>
                                  </div>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            )}
                          </SidebarMenu>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}