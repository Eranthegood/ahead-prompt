import React, { useState, useEffect, useMemo } from 'react';
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
import { Hash, Package, Plus, FileText, CheckCircle, Eye, EyeOff, ChevronDown, ChevronRight, Palette, Edit, Edit3, Trash2, Trophy, BookOpen, User, Settings, Keyboard, LogOut, Home, GitBranch, Github, TrendingUp, BarChart3, Sparkles, Zap, Library, X, StickyNote } from 'lucide-react';
import { ProductIcon } from '@/components/ui/product-icon';
import { Workspace, Product } from '@/types';


import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { CompactGamificationDisplay } from './gamification/CompactGamificationDisplay';
import { UserAccountSection } from './UserAccountSection';

import { OnboardingChecklist } from './OnboardingChecklist';
import { MinimalKnowledgeBase } from './MinimalKnowledgeBase';
import { PromptLibrary } from './PromptLibrary';
import { KnowledgeAccessGuard } from './KnowledgeAccessGuard';
import { NotesDialog } from './NotesDialog';
import { useWorkspacePremiumAccess } from '@/hooks/useWorkspacePremiumAccess';

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
  const location = useLocation();
  const { user } = useAuth();
  const { products, createProduct, updateProduct, deleteProduct, reorderProducts, refetch } = useProducts(workspace.id);
  const { epics, createEpic, updateEpic, deleteEpic } = useEpics(workspace.id);
  const promptsContext = usePromptsContext();
  const { prompts = [] } = promptsContext || {};
  const { achievements, stats, isGamificationEnabled } = useGamification();
  const { hasPremiumAccess } = useWorkspacePremiumAccess();
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
  
  // Epic creation during product creation
  const [pendingEpics, setPendingEpics] = useState<Array<{
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
  }>>([]);
  const [isAddingEpic, setIsAddingEpic] = useState(false);
  const [epicFormData, setEpicFormData] = useState({
    name: '',
    description: '',
    color: '#8B5CF6',
    icon: 'Hash',
  });
  
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

  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

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
        // Create pending epics for the new product
        for (const pendingEpic of pendingEpics) {
          await createEpic({
            name: pendingEpic.name,
            description: pendingEpic.description,
            color: pendingEpic.color,
            product_id: newProduct.id,
          });
        }

        onProductSelect(newProduct.id);
        setIsCreateProductOpen(false);
        setNewProductData({ name: '', description: '', color: '#3B82F6' });
        setPendingEpics([]);
        setIsAddingEpic(false);
        setEpicFormData({ name: '', description: '', color: '#8B5CF6', icon: 'Hash' });
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

  const handleDeleteEpic = async (epicId: string) => {
    if (confirm('Are you sure you want to delete this epic? This action is irreversible.')) {
      await deleteEpic(epicId);
      // If the deleted epic was selected, reset epic selection
      if (selectedEpicId === epicId) {
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
    // Use event system to open the new Knowledge Box modal
    const event = new CustomEvent('open-knowledge-dialog', { 
      detail: { productId: product?.id } 
    });
    window.dispatchEvent(event);
  };

  // Add event listeners for onboarding checklist actions
  useEffect(() => {
    const handleOpenKnowledgeDialog = () => {
      console.log('Opening knowledge dialog from onboarding');
      // Use event system to open the new Knowledge Box modal
      const event = new CustomEvent('open-knowledge-dialog');
      window.dispatchEvent(event);
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

  // Listen for product creation events (e.g., from onboarding) to refresh the list
  useEffect(() => {
    const handleProductCreated = (e: CustomEvent) => {
      refetch?.();
      if ((e as any)?.detail?.productId) {
        onProductSelect((e as any).detail.productId);
      }
    };
    window.addEventListener('product-created', handleProductCreated as EventListener);
    return () => window.removeEventListener('product-created', handleProductCreated as EventListener);
  }, [refetch, onProductSelect]);

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
        
        <SidebarContent 
          className={`${isCollapsed ? 'px-2 py-3 sm:py-4' : 'p-4 sm:p-5'} flex flex-col min-h-full`}
          style={{ backgroundColor: '#222326' }}
        >
          {/* Logo and Brand */}
          {!isCollapsed ? (
            <div className="mb-6 pb-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  className="justify-start p-0 h-auto hover:bg-transparent"
                  onClick={() => navigate('/')}
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground tracking-tight">
                      <span>Ahead</span>
                    </h2>
                  </div>
                </Button>
                <SidebarTrigger className="h-7 w-7 shrink-0 hover:bg-accent/50" />
              </div>
            </div>
          ) : (
            <div className="mb-6 flex flex-col items-center gap-3 pb-4 border-b border-border/50">
              <SidebarTrigger className="h-7 w-7 hover:bg-accent/50" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-8 h-8 p-0 hover:bg-accent/50"
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
          <div className="mb-6">
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={onQuickAdd}
                    className="w-full aspect-square bg-primary hover:bg-primary/90 text-primary-foreground p-0 shadow-sm"
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
              <div>
                <Button 
                  onClick={() => {
                    console.log('Add Prompt clicked');
                    setOpenMobile?.(false);
                    onQuickAdd();
                  }}
                  className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium h-10 shadow-sm"
                  size="sm"
                  aria-label="Add Prompt"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Prompt
                </Button>
                <p className="text-xs text-muted-foreground mt-2 px-1">
                  Tip: Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted/70 text-muted-foreground rounded border border-border/40">Q</kbd> for task or <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted/70 text-muted-foreground rounded border border-border/40">T</kbd> for bugs
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-6 space-y-2">
            {/* Section Label */}
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">Navigation</h3>
            )}
            
            {/* Prompt Library */}
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full aspect-square p-0 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
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
                className="w-full justify-between text-left font-medium text-sm py-2.5 h-auto hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md"
                onClick={() => setIsPromptLibraryOpen(true)}
              >
                <div className="flex items-center">
                  <Library className="mr-3 h-4 w-4 text-foreground/70" />
                  <span className="text-foreground">Prompt Library</span>
                </div>
                <kbd className="px-2 py-1 text-xs bg-muted/70 text-muted-foreground rounded border border-border/40">L</kbd>
              </Button>
            )}

            {/* Knowledge Box */}
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full aspect-square p-0 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    onClick={() => handleOpenKnowledge()}
                    aria-label="Knowledge Box"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Knowledge Box</p>
                  <p className="text-xs text-muted-foreground">Press K to open</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button 
                variant="ghost" 
                className="w-full justify-between text-left font-medium text-sm py-2.5 h-auto hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md"
                onClick={() => handleOpenKnowledge()}
              >
                <div className="flex items-center">
                  <BookOpen className="mr-3 h-4 w-4 text-foreground/70" />
                  <span className="text-foreground">Knowledge Box</span>
                </div>
                <kbd className="px-2 py-1 text-xs bg-muted/70 text-muted-foreground rounded border border-border/40">K</kbd>
              </Button>
            )}

            {/* Notes */}
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full aspect-square p-0 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    onClick={() => setIsNotesOpen(true)}
                    aria-label="Notes"
                  >
                    <StickyNote className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Notes</p>
                  <p className="text-xs text-muted-foreground">Press N to open</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button 
                variant="ghost" 
                className="w-full justify-between text-left font-medium text-sm py-2.5 h-auto hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md"
                onClick={() => setIsNotesOpen(true)}
              >
                <div className="flex items-center">
                  <StickyNote className="mr-3 h-4 w-4 text-foreground/70" />
                  <span className="text-foreground">Notes</span>
                </div>
                <kbd className="px-2 py-1 text-xs bg-muted/70 text-muted-foreground rounded border border-border/40">N</kbd>
              </Button>
            )}

            {/* All Prompts */}
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full aspect-square p-0 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
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
                           className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs rounded-full flex items-center justify-center bg-primary/80 text-primary-foreground border border-primary/20"
                         >
                           {activePromptsCount > 99 ? '99+' : activePromptsCount}
                         </Badge>
                       )}
                     </div>
                   </Button>
                 </TooltipTrigger>
                 <TooltipContent side="right">
                   <p>All Prompts</p>
                   <p className="text-xs text-muted-foreground">{activePromptsCount} active prompts</p>
                 </TooltipContent>
               </Tooltip>
             ) : (
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-left font-medium text-sm py-2.5 h-auto hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md"
                  onClick={() => {
                    navigate('/build');
                    onProductSelect('all');
                    onEpicSelect(undefined);
                  }}
                  aria-label={`All Prompts (${activePromptsCount})`}
                >
                 <div className="flex items-center">
                   <FileText className="mr-3 h-4 w-4 text-foreground/70" />
                   <span className="text-foreground">All Prompts</span>
                 </div>
               </Button>
             )}
          </div>

          {/* Products with Epic Hierarchy */}
          <SidebarGroup className="mt-4 flex-1">
            {!isCollapsed && (
              <div className="mb-4 pb-2 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Products</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 hover:bg-accent/50 border border-transparent hover:border-border -mr-1 -ml-5"
                          onClick={() => setIsCreateProductOpen(true)}
                          aria-label="Create Product"
                        >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create Product</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                                <ProductIcon className="h-4 w-4 text-muted-foreground" />
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
                            
                            // If not on /build route, redirect to build with selected product
                            if (location.pathname !== '/build') {
                              navigate(`/build?product=${product.id}`);
                            } else {
                              // On /build route, use the existing selection behavior
                              onProductSelect(product.id);
                              onEpicSelect(undefined);
                            }
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
                          onDeleteEpic={handleDeleteEpic}
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
      {isCreateProductOpen && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div 
            className="border border-border rounded-lg w-full max-w-4xl mx-auto shadow-lg max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: '#16161c' }}
          >
            {/* Header with breadcrumb */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2 text-sm">
                <ProductIcon className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Workspace</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">New Product</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsCreateProductOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Main content */}
            <div className="p-6 space-y-6">
              {/* Product name input */}
              <input 
                type="text" 
                placeholder="Product name"
                value={newProductData.name}
                onChange={(e) => setNewProductData(prev => ({ ...prev, name: e.target.value }))}
                className="text-2xl font-medium bg-transparent border-none outline-none text-foreground placeholder-muted-foreground w-full"
                autoFocus
              />
              
              {/* Description input */}
              <div className="space-y-2">
                <textarea 
                  placeholder="Write a description or project brief to feed the knowledge of the project"
                  value={newProductData.description}
                  onChange={(e) => setNewProductData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-transparent border border-border rounded-md p-3 text-foreground placeholder-muted-foreground resize-none focus:border-transparent"
                  rows={3}
                />
              </div>
              
              {/* Knowledge URL input */}
              <div className="space-y-2">
                <input 
                  type="url" 
                  placeholder="Knowledge URL (optional)"
                  className="w-full bg-transparent border border-border rounded-md p-3 text-foreground placeholder-muted-foreground focus:border-transparent"
                />
              </div>
              
              {/* Color selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Color</label>
                <div className="flex items-center gap-3">
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

              {/* Initial Epics Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Initial Epics</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingEpic(true)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Epic
                  </Button>
                </div>

                {/* Pending Epics List */}
                {pendingEpics.length > 0 && (
                  <div className="space-y-2">
                    {pendingEpics.map((epic) => (
                      <div key={epic.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: epic.color }}
                          />
                          <div>
                            <div className="text-sm font-medium text-foreground">{epic.name}</div>
                            {epic.description && (
                              <div className="text-xs text-muted-foreground">{epic.description}</div>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPendingEpics(prev => prev.filter(e => e.id !== epic.id))}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Epic Creation Form */}
                {isAddingEpic && (
                  <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/10">
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Epic name"
                        value={epicFormData.name}
                        onChange={(e) => setEpicFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-transparent border border-border rounded-md p-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary"
                        autoFocus
                      />
                      <textarea
                        placeholder="Add a description..."
                        value={epicFormData.description}
                        onChange={(e) => setEpicFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-transparent border border-border rounded-md p-2 text-sm text-foreground placeholder-muted-foreground resize-none focus:border-primary"
                        rows={2}
                      />
                      
                      {/* Epic Color Selection */}
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
                            onClick={() => setEpicFormData(prev => ({ ...prev, color: color.value }))}
                            className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                              epicFormData.color === color.value 
                                ? 'border-primary scale-110' 
                                : 'border-muted-foreground/20'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsAddingEpic(false);
                          setEpicFormData({ name: '', description: '', color: '#8B5CF6', icon: 'Hash' });
                        }}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (epicFormData.name.trim()) {
                            const newEpic = {
                              id: Date.now().toString(),
                              name: epicFormData.name.trim(),
                              description: epicFormData.description.trim(),
                              color: epicFormData.color,
                              icon: epicFormData.icon,
                            };
                            setPendingEpics(prev => [...prev, newEpic]);
                            setEpicFormData({ name: '', description: '', color: '#8B5CF6', icon: 'Hash' });
                            setIsAddingEpic(false);
                          }
                        }}
                        disabled={!epicFormData.name.trim()}
                        className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Add Epic
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-end p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateProductOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleCreateProduct}
                  disabled={!newProductData.name.trim() || isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create product'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <ProductIcon className="w-5 h-5" />
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


      {/* Prompt Library */}
      <PromptLibrary
        open={isPromptLibraryOpen}
        onOpenChange={setIsPromptLibraryOpen}
      />

      {/* Notes Dialog */}
      <NotesDialog
        open={isNotesOpen}
        onOpenChange={setIsNotesOpen}
        selectedProductId={selectedProductId}
        selectedEpicId={selectedEpicId}
      />
    </TooltipProvider>
  );
}
