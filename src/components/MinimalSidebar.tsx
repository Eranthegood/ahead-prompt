import React, { useState, useEffect } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableProductItem } from '@/components/DraggableProductItem';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { usePromptsContext } from '@/context/PromptsContext';
import { useGamification } from '@/hooks/useGamification';
import { Hash, Package, Plus, FileText, CheckCircle, Eye, EyeOff, ChevronDown, ChevronRight, Palette, Edit, Edit3, Trash2, Trophy, BookOpen, User, Settings, Keyboard, LogOut, Home, GitBranch, Github, TrendingUp, BarChart3, Sparkles, Zap, Library } from 'lucide-react';
import { Workspace, Product } from '@/types';


import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { CompactGamificationDisplay } from './gamification/CompactGamificationDisplay';
import { UserAccountSection } from './UserAccountSection';

import { OnboardingChecklist } from './OnboardingChecklist';
import { MinimalKnowledgeBase } from './MinimalKnowledgeBase';
import { PromptLibrary } from './PromptLibrary';

interface MinimalSidebarProps {
  workspace: Workspace;
  selectedProductId?: string;
  selectedEpicId?: string;
  onProductSelect: (productId: string) => void;
  onEpicSelect: (epicId: string | undefined) => void;
  showCompletedItems: boolean;
  onToggleCompletedItems: (show: boolean) => void;
  onQuickAdd: () => void;
  searchQuery: string;
}

const PRODUCT_COLORS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Red' },
  { value: '#6B7280', label: 'Gray' },
];

export function MinimalSidebar({ workspace, selectedProductId, selectedEpicId, onProductSelect, onEpicSelect, showCompletedItems, onToggleCompletedItems, onQuickAdd, searchQuery }: MinimalSidebarProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, createProduct, updateProduct, deleteProduct, reorderProducts } = useProducts(workspace.id);
  const { epics, createEpic, updateEpic } = useEpics(workspace.id);
  const promptsContext = usePromptsContext();
  const { prompts = [] } = promptsContext || {};
  const { achievements, stats, isGamificationEnabled } = useGamification();
  const { state, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [isCreateEpicOpen, setIsCreateEpicOpen] = useState(false);
  const [selectedProductForEpic, setSelectedProductForEpic] = useState<string>('');
  const [showGamification, setShowGamification] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });
  const [newEpicData, setNewEpicData] = useState({
    name: '',
    description: '',
    color: '#8B5CF6',
    icon: 'Hash',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingEpic, setIsCreatingEpic] = useState(false);
  
  // Edit states
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isEditEpicOpen, setIsEditEpicOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingEpic, setEditingEpic] = useState<any>(null);
  const [editProductData, setEditProductData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });
  const [editEpicData, setEditEpicData] = useState({
    name: '',
    description: '',
    color: '#8B5CF6'
  });

  // Knowledge Modal states
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [selectedKnowledgeProduct, setSelectedKnowledgeProduct] = useState<Product | undefined>();
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);

  // Filter function to get prompts that match current view filters (only active prompts)
  const getVisiblePrompts = (productFilter?: string, epicFilter?: string) => {
    return prompts.filter(prompt => {
      const matchesSearch = !searchQuery || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProduct = !productFilter || productFilter === 'all' || 
        prompt.product_id === productFilter;

      const matchesEpic = !epicFilter || prompt.epic_id === epicFilter;

      // Only show To do and In progress prompts in counts
      const isActive = prompt.status === 'todo' || prompt.status === 'in_progress';

      return matchesSearch && matchesProduct && matchesEpic && isActive;
    });
  };

  // Keep the original function for backward compatibility where needed
  const getActivePrompts = (productFilter?: string, epicFilter?: string) => {
    return prompts.filter(prompt => {
      const matchesSearch = !searchQuery || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProduct = !productFilter || productFilter === 'all' || 
        prompt.product_id === productFilter;

      const matchesEpic = !epicFilter || prompt.epic_id === epicFilter;

      const isActive = prompt.status !== 'done';

      return matchesSearch && matchesProduct && matchesEpic && isActive;
    });
  };

  // Filter epics by search
  const getFilteredEpics = (productId?: string) => {
    return epics.filter(epic => {
      const matchesProduct = !productId || epic.product_id === productId;
      const matchesSearch = !searchQuery || 
        epic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        epic.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesProduct && matchesSearch;
    });
  };

  // Get active prompts count for "All Prompts" - shows To do and In progress prompts
  const activePromptsCount = prompts.filter(p => p.status === 'todo' || p.status === 'in_progress').length;

  // Organization with epic hierarchy and filtered counts
  const productsWithData = products.map(product => {
    const productEpics = getFilteredEpics(product.id);
    const directPrompts = getVisiblePrompts(product.id).filter(p => !p.epic_id);
    
    const epicsWithCounts = productEpics.map(epic => ({
      ...epic,
      promptCount: getVisiblePrompts(product.id, epic.id).length
    }));

    const totalVisiblePrompts = getVisiblePrompts(product.id).length;
    
    return {
      ...product,
      epics: epicsWithCounts,
      directPrompts,
      promptCount: totalVisiblePrompts
    };
  });

  const toggleProductExpanded = (productId: string) => {
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

  // Get completed prompts with search filter
  const completedPrompts = prompts
    .filter(p => {
      const matchesSearch = !searchQuery || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return p.status === 'done' && matchesSearch;
    })
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const handleCreateProduct = async () => {
    if (!newProductData.name.trim()) return;

    setIsCreating(true);
    try {
      const newProduct = await createProduct({
        name: newProductData.name.trim(),
        description: newProductData.description.trim() || undefined,
        color: newProductData.color,
      });

      if (newProduct) {
        onProductSelect(newProduct.id);
        setIsCreateProductOpen(false);
        setNewProductData({ name: '', description: '', color: '#3B82F6' });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateEpic = async () => {
    if (!newEpicData.name.trim() || !selectedProductForEpic) return;

    setIsCreatingEpic(true);
    try {
      const newEpic = await createEpic({
        name: newEpicData.name.trim(),
        description: newEpicData.description.trim() || undefined,
        color: newEpicData.color,
        product_id: selectedProductForEpic,
      });

      if (newEpic) {
        setIsCreateEpicOpen(false);
        setNewEpicData({ name: '', description: '', color: '#8B5CF6', icon: 'Hash' });
        setSelectedProductForEpic('');
        // Expand the product to show the new epic
        setExpandedProducts(prev => new Set(prev).add(selectedProductForEpic));
      }
    } finally {
      setIsCreatingEpic(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product? This action is irreversible.')) {
      await deleteProduct(productId);
      // If the deleted product was selected, reset selection
      if (selectedProductId === productId) {
        onProductSelect('all');
        onEpicSelect(undefined);
      }
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setEditProductData({
      name: product.name,
      description: product.description || '',
      color: product.color || '#3B82F6',
    });
    setIsEditProductOpen(true);
  };

  const handleEditEpic = (epic: any) => {
    setEditingEpic(epic);
    setEditEpicData({
      name: epic.name,
      description: epic.description || '',
      color: epic.color || '#8B5CF6'
    });
    setIsEditEpicOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !editProductData.name.trim()) return;

    setIsCreating(true);
    try {
      await updateProduct(editingProduct.id, {
        name: editProductData.name.trim(),
        description: editProductData.description.trim() || undefined,
        color: editProductData.color,
      });

      setIsEditProductOpen(false);
      setEditProductData({ name: '', description: '', color: '#3B82F6' });
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateEpic = async () => {
    if (!editingEpic || !editEpicData.name.trim()) return;

    setIsCreating(true);
    try {
      await updateEpic(editingEpic.id, {
        name: editEpicData.name.trim(),
        description: editEpicData.description.trim() || undefined,
        color: editEpicData.color
      });

      setIsEditEpicOpen(false);
      setEditEpicData({ name: '', description: '', color: '#8B5CF6' });
      setEditingEpic(null);
    } catch (error) {
      console.error('Error updating epic:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Knowledge Modal handlers
  const handleOpenKnowledge = (product?: Product) => {
    setSelectedKnowledgeProduct(product);
    setIsKnowledgeModalOpen(true);
  };

  const handleCloseKnowledge = () => {
    setIsKnowledgeModalOpen(false);
    setSelectedKnowledgeProduct(undefined);
  };

  // Add event listeners for onboarding checklist actions
  useEffect(() => {
    const handleOpenKnowledgeDialog = () => {
      console.log('Opening knowledge dialog from onboarding');
      setIsKnowledgeModalOpen(true);
    };

    const handleOpenProductDialog = () => {
      console.log('Opening product dialog from onboarding');
      setIsCreateProductOpen(true);
    };

    const handleOpenEpicDialog = () => {
      console.log('Opening epic dialog from onboarding');
      // If we have products, set the first one as selected for epic creation
      if (products && products.length > 0) {
        setSelectedProductForEpic(products[0].id);
      }
      setIsCreateEpicOpen(true);
    };

    const handleOpenQuickPrompt = () => {
      console.log('Opening quick prompt from onboarding');
      onQuickAdd();
    };

    // Add event listeners
    window.addEventListener('open-knowledge-dialog', handleOpenKnowledgeDialog);
    window.addEventListener('open-product-dialog', handleOpenProductDialog);
    window.addEventListener('open-epic-dialog', handleOpenEpicDialog);
    window.addEventListener('open-quick-prompt', handleOpenQuickPrompt);

    // Cleanup
    return () => {
      window.removeEventListener('open-knowledge-dialog', handleOpenKnowledgeDialog);
      window.removeEventListener('open-product-dialog', handleOpenProductDialog);
      window.removeEventListener('open-epic-dialog', handleOpenEpicDialog);
      window.removeEventListener('open-quick-prompt', handleOpenQuickPrompt);
    };
  }, [products, onQuickAdd]);

  // Handle drag end for product reordering
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = productsWithData.findIndex(product => product.id === active.id);
      const newIndex = productsWithData.findIndex(product => product.id === over.id);
      
      const reorderedProducts = arrayMove(productsWithData, oldIndex, newIndex);
      reorderProducts(reorderedProducts);
    }
  };

  return (
    <TooltipProvider>
      <Sidebar className="border-r shrink-0" collapsible="icon">
        
        <SidebarContent className={`${isCollapsed ? 'px-2 py-3 sm:py-4' : 'p-3 sm:p-4'} flex flex-col min-h-full`}>
          {/* Logo and Brand */}
          {!isCollapsed ? (
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  className="justify-start p-0 h-auto hover:bg-transparent"
                  onClick={() => navigate('/')}
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-medium text-foreground truncate">
                      <span>Ahead</span>
                    </h2>
                  </div>
                </Button>
                <SidebarTrigger className="h-7 w-7 shrink-0" />
              </div>
            </div>
          ) : (
            <div className="mb-4 sm:mb-6 flex flex-col items-center gap-2">
              <SidebarTrigger className="h-7 w-7" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => navigate('/')}
                    aria-label="Home"
                  >
                    <Zap className="w-4 h-4 text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Ahead - Go Home</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}


          {/* Add Prompt Action */}
          <div className="mb-4 sm:mb-6">
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={onQuickAdd}
                    className="w-full aspect-square bg-primary hover:bg-primary/90 text-primary-foreground p-0"
                    size="sm"
                    aria-label="Add Prompt"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Add Prompt</p>
                  <p className="text-xs text-muted-foreground">Press Q for task or T for bugs</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <>
                <Button 
                  onClick={() => {
                    console.log('Add Prompt clicked');
                    setOpenMobile?.(false);
                    onQuickAdd();
                  }}
                  className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base"
                  size="sm"
                  aria-label="Add Prompt"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Prompt
                </Button>
                <p className="text-xs text-muted-foreground mt-2 px-1 hidden sm:block">
                  Tip: Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">Q</kbd> for task or <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">T</kbd> for bugs
                </p>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-3 sm:mb-4 space-y-1 sm:space-y-2">
            {/* Prompt Library */}
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full aspect-square p-0 hover:bg-accent/50"
                    onClick={() => setIsPromptLibraryOpen(true)}
                    aria-label="Prompt Library"
                  >
                    <Library className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Prompt Library</p>
                  <p className="text-xs text-muted-foreground">Press L to open</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left font-normal text-sm sm:text-base py-2 hover:bg-accent/50"
                onClick={() => setIsPromptLibraryOpen(true)}
              >
                <Library className="mr-2 sm:mr-3 h-4 w-4" />
                Prompt Library
                <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded border">L</kbd>
              </Button>
            )}

            {/* All Prompts */}
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full aspect-square p-0"
                    onClick={() => {
                      navigate('/');
                      onProductSelect('all');
                      onEpicSelect(undefined);
                    }}
                    aria-label={`All Prompts (${activePromptsCount})`}
                  >
                    <div className="relative">
                      <FileText className="h-4 w-4" />
                      {activePromptsCount > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs rounded-full flex items-center justify-center"
                        >
                          {activePromptsCount > 99 ? '99+' : activePromptsCount}
                        </Badge>
                      )}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>All Prompts</p>
                  <p className="text-xs text-muted-foreground">{activePromptsCount} active prompts (To do + In progress)</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left font-normal text-sm sm:text-base py-2"
                onClick={() => {
                  navigate('/build');
                  onProductSelect('all');
                  onEpicSelect(undefined);
                }}
                aria-label={`All Prompts (${activePromptsCount})`}
              >
                <FileText className="mr-2 sm:mr-3 h-4 w-4" />
                All Prompts
                <Badge variant="secondary" className="ml-auto text-xs">
                  {activePromptsCount}</Badge>
              </Button>
            )}
          </div>

          {/* Products with Epic Hierarchy */}
          <SidebarGroup className="mt-2">
            {!isCollapsed && (
              <div className="mb-2 sm:mb-3 flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Products</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                      onClick={() => setIsCreateProductOpen(true)}
                      aria-label="Create Product"
                    >
                      <Plus className="h-2 w-2 sm:h-3 sm:w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create Product</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
            
            <SidebarGroupContent>
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={productsWithData.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1">
                    {productsWithData.length === 0 ? (
                      <div className={`${isCollapsed ? 'py-2' : 'py-3 sm:py-4'} text-center`}>
                        {isCollapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="aspect-square p-0"
                                onClick={() => setIsCreateProductOpen(true)}
                                aria-label="No products - Click to add"
                              >
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>No products yet</p>
                              <p className="text-xs text-muted-foreground">Click to add product</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2">No products yet</p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setIsCreateProductOpen(true)}
                              className="text-xs sm:text-sm py-1 px-2 sm:px-3"
                            >
                              <Plus className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                              Add Product
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2 px-1 hidden sm:block">
                              Tip: Create a product to organize your workflow
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      productsWithData.map((product) => (
                        <DraggableProductItem
                          key={product.id}
                          product={product}
                          isCollapsed={isCollapsed}
                          isExpanded={expandedProducts.has(product.id) || product.epics.length === 0}
                          isSelected={selectedProductId === product.id}
                          selectedEpicId={selectedEpicId}
                          totalEpicCount={epics.length}
                          onToggleExpanded={() => toggleProductExpanded(product.id)}
                          onProductSelect={() => {
                            console.log('Product clicked:', product.name, product.id);
                            setOpenMobile?.(false);
                            onProductSelect(product.id);
                            onEpicSelect(undefined);
                          }}
                          onEpicSelect={(epicId) => {
                            console.log('Epic clicked:', epicId);
                            setOpenMobile?.(false);
                            onEpicSelect(epicId);
                          }}
                          onDeleteProduct={() => handleDeleteProduct(product.id)}
                          onOpenKnowledge={() => handleOpenKnowledge(product)}
                          onCreateEpic={() => {
                            setSelectedProductForEpic(product.id);
                            setIsCreateEpicOpen(true);
                          }}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Onboarding Checklist - Only show for unauthenticated users */}
          {!isCollapsed && !user && (
            <SidebarGroup className="mt-4">
              <SidebarGroupContent>
                <OnboardingChecklist workspace={workspace} />
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Compact Gamification Display - Fixed at bottom */}
          {!isCollapsed && stats && (
            <SidebarGroup className="mt-6">
              <SidebarGroupContent>
                <CompactGamificationDisplay stats={stats} achievements={achievements} />
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* User Account Section */}
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <UserAccountSection />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Create Product Dialog */}
      <Dialog open={isCreateProductOpen} onOpenChange={setIsCreateProductOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              New Product
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="product-name">Product name</Label>
              <Input
                id="product-name"
                value={newProductData.name}
                onChange={(e) => setNewProductData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Mobile App, Website..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="product-description">Description (optional)</Label>
              <Textarea
                id="product-description"
                value={newProductData.description}
                onChange={(e) => setNewProductData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Briefly describe this product..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Icon & Color</Label>
              
              {/* Icon Selector */}

              {/* Color Selector */}
              <div>
                <Label className="text-sm text-muted-foreground">Choose a color</Label>
                <div className="flex items-center gap-3 mt-2">
                  {/* Preset Colors */}
                  <div className="flex items-center gap-2">
                    {PRODUCT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewProductData(prev => ({ ...prev, color: color.value }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                          newProductData.color === color.value 
                            ? 'border-primary scale-110 shadow-md' 
                            : 'border-muted-foreground/20'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                  
                  {/* Custom Color Picker */}
                  <div className="flex items-center gap-2 pl-3 border-l border-border">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <label className="cursor-pointer">
                      <input
                        type="color"
                        value={newProductData.color}
                        onChange={(e) => setNewProductData(prev => ({ ...prev, color: e.target.value }))}
                        className="sr-only"
                      />
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-muted-foreground/20 hover:scale-110 transition-all cursor-pointer"
                        style={{ backgroundColor: newProductData.color }}
                        title="Custom color"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateProductOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProduct}
                  disabled={!newProductData.name.trim() || isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Epic Dialog */}
      <Dialog open={isCreateEpicOpen} onOpenChange={setIsCreateEpicOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              New Epic
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="epic-name">Epic name</Label>
              <Input
                id="epic-name"
                value={newEpicData.name}
                onChange={(e) => setNewEpicData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Authentication, Dashboard..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="epic-description">Description (optional)</Label>
              <Textarea
                id="epic-description"
                value={newEpicData.description}
                onChange={(e) => setNewEpicData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Briefly describe this epic..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Icon & Color</Label>
              
              {/* Icon Selector */}
              <div className="mt-2 mb-4">
                <Label className="text-sm text-muted-foreground">Choose an icon</Label>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {[
                    { icon: Hash, name: 'Hash' },
                    { icon: Package, name: 'Package' },
                    { icon: FileText, name: 'Document' },
                    { icon: Plus, name: 'Plus' },
                    { icon: Settings, name: 'Settings' },
                    { icon: User, name: 'User' },
                    { icon: Trophy, name: 'Trophy' },
                    { icon: BookOpen, name: 'Book' },
                    { icon: Sparkles, name: 'Sparkles' },
                    { icon: TrendingUp, name: 'Trending' },
                    { icon: BarChart3, name: 'Chart' },
                    { icon: Github, name: 'Github' }
                  ].map(({ icon: IconComponent, name }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setNewEpicData(prev => ({ ...prev, icon: name }))}
                      className={`p-2 rounded-lg border transition-all hover:scale-105 ${
                        newEpicData.icon === name 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                      title={name}
                    >
                      <IconComponent className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <Label className="text-sm text-muted-foreground">Choose a color</Label>
                <div className="flex items-center gap-3 mt-2">
                  {/* Preset Colors */}
                  <div className="flex items-center gap-2">
                    {[
                      { value: '#8B5CF6', label: 'Purple' },
                      { value: '#10B981', label: 'Green' },
                      { value: '#3B82F6', label: 'Blue' },
                      { value: '#F59E0B', label: 'Orange' },
                      { value: '#EF4444', label: 'Red' },
                      { value: '#6B7280', label: 'Gray' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewEpicData(prev => ({ ...prev, color: color.value }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                          newEpicData.color === color.value 
                            ? 'border-primary scale-110 shadow-md' 
                            : 'border-muted-foreground/20'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                  
                  {/* Custom Color Picker */}
                  <div className="flex items-center gap-2 pl-3 border-l border-border">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <label className="cursor-pointer">
                      <input
                        type="color"
                        value={newEpicData.color}
                        onChange={(e) => setNewEpicData(prev => ({ ...prev, color: e.target.value }))}
                        className="sr-only"
                      />
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-muted-foreground/20 hover:scale-110 transition-all cursor-pointer"
                        style={{ backgroundColor: newEpicData.color }}
                        title="Custom color"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateEpicOpen(false);
                    setNewEpicData({ name: '', description: '', color: '#8B5CF6', icon: 'Hash' });
                    setSelectedProductForEpic('');
                  }}
                  disabled={isCreatingEpic}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEpic}
                  disabled={!newEpicData.name.trim() || isCreatingEpic}
                >
                  {isCreatingEpic ? 'Creating...' : 'Create'}
                </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Edit Product
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-product-name">Product name</Label>
              <Input
                id="edit-product-name"
                value={editProductData.name}
                onChange={(e) => setEditProductData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Mobile App, Website..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-product-description">Description (optional)</Label>
              <Textarea
                id="edit-product-description"
                value={editProductData.description}
                onChange={(e) => setEditProductData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Briefly describe this product..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Icon & Color</Label>
              

              {/* Color Selector */}
              <div>
                <Label className="text-sm text-muted-foreground">Choose a color</Label>
                <div className="flex items-center gap-3 mt-2">
                  {/* Preset Colors */}
                  <div className="flex items-center gap-2">
                    {PRODUCT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setEditProductData(prev => ({ ...prev, color: color.value }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                          editProductData.color === color.value 
                            ? 'border-primary scale-110 shadow-md' 
                            : 'border-muted-foreground/20'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                  
                  {/* Custom Color Picker */}
                  <div className="flex items-center gap-2 pl-3 border-l border-border">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <label className="cursor-pointer">
                      <input
                        type="color"
                        value={editProductData.color}
                        onChange={(e) => setEditProductData(prev => ({ ...prev, color: e.target.value }))}
                        className="sr-only"
                      />
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-muted-foreground/20 hover:scale-110 transition-all cursor-pointer"
                        style={{ backgroundColor: editProductData.color }}
                        title="Custom color"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditProductOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateProduct}
                disabled={!editProductData.name.trim() || isCreating}
              >
                {isCreating ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Epic Dialog */}
      <Dialog open={isEditEpicOpen} onOpenChange={setIsEditEpicOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Edit Epic
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-epic-name">Epic name</Label>
              <Input
                id="edit-epic-name"
                value={editEpicData.name}
                onChange={(e) => setEditEpicData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Authentication, Dashboard..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-epic-description">Description (optional)</Label>
              <Textarea
                id="edit-epic-description"
                value={editEpicData.description}
                onChange={(e) => setEditEpicData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Briefly describe this epic..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex items-center gap-2 mt-2">
                {[
                  { value: '#8B5CF6', label: 'Purple' },
                  { value: '#10B981', label: 'Green' },
                  { value: '#3B82F6', label: 'Blue' },
                  { value: '#F59E0B', label: 'Orange' },
                  { value: '#EF4444', label: 'Red' },
                  { value: '#6B7280', label: 'Gray' },
                ].map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setEditEpicData(prev => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      editEpicData.color === color.value 
                        ? 'border-primary scale-110' 
                        : 'border-muted hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
                <div className="flex items-center gap-2 ml-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="color"
                    value={editEpicData.color}
                    onChange={(e) => setEditEpicData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditEpicOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateEpic}
                disabled={!editEpicData.name.trim() || isCreating}
              >
                {isCreating ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Knowledge Manager - Minimalist */}
      <Dialog open={isKnowledgeModalOpen} onOpenChange={setIsKnowledgeModalOpen}>
        <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">
              {selectedKnowledgeProduct?.name ?? 'Knowledge'}
            </DialogTitle>
          </DialogHeader>
          <MinimalKnowledgeBase workspace={workspace} product={selectedKnowledgeProduct} />
        </DialogContent>
      </Dialog>

      {/* Prompt Library */}
      <PromptLibrary
        open={isPromptLibraryOpen}
        onOpenChange={setIsPromptLibraryOpen}
      />
    </TooltipProvider>
  );
}
