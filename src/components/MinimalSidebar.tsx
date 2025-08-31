import React, { useState } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { usePrompts } from '@/hooks/usePrompts';
import { Hash, Package, Plus, FileText, CheckCircle, Eye, EyeOff, ChevronDown, ChevronRight, Palette, Edit, Trash2 } from 'lucide-react';
import { Workspace } from '@/types';

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
  const { products, createProduct, deleteProduct } = useProducts(workspace.id);
  const { epics, createEpic } = useEpics(workspace.id);
  const { prompts } = usePrompts(workspace.id);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [isCreateEpicOpen, setIsCreateEpicOpen] = useState(false);
  const [selectedProductForEpic, setSelectedProductForEpic] = useState<string>('');
  const [newProductData, setNewProductData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
  });
  const [newEpicData, setNewEpicData] = useState({
    name: '',
    description: '',
    color: '#8B5CF6',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingEpic, setIsCreatingEpic] = useState(false);

  // Filter function to match search and exclude completed
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

  // Get active prompts count for "All Prompts"
  const allActivePromptsCount = getActivePrompts('all').length;

  // Organization with epic hierarchy and filtered counts
  const productsWithData = products.map(product => {
    const productEpics = getFilteredEpics(product.id);
    const directPrompts = getActivePrompts(product.id).filter(p => !p.epic_id);
    
    const epicsWithCounts = productEpics.map(epic => ({
      ...epic,
      promptCount: getActivePrompts(product.id, epic.id).length
    }));

    const totalActivePrompts = getActivePrompts(product.id).length;
    
    return {
      ...product,
      epics: epicsWithCounts,
      directPrompts,
      promptCount: totalActivePrompts
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
        setNewEpicData({ name: '', description: '', color: '#8B5CF6' });
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

  return (
    <>
      <Sidebar className="w-64 border-r border-border">
        <SidebarContent className="p-4">
          {/* Workspace Name */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">{workspace.name}</h2>
            <SidebarTrigger />
          </div>

          {/* Add Prompt Action */}
          <div className="mb-6">
            <Button 
              onClick={onQuickAdd}
              className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Prompt
            </Button>
            <p className="text-xs text-muted-foreground mt-2 px-1">
              Tip: Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">Q</kbd> to create quickly
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-6 space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-left font-normal"
              onClick={() => {
                onProductSelect('all');
                onEpicSelect(undefined); // Clear epic selection
              }}
            >
              <FileText className="mr-3 h-4 w-4" />
              All Prompts
              <Badge variant="secondary" className="ml-auto">
                {allActivePromptsCount}
              </Badge>
            </Button>
          </div>

          {/* Products with Epic Hierarchy */}
          <SidebarGroup>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Products</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setIsCreateProductOpen(true)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <SidebarGroupContent>
              <div className="space-y-1">
                {productsWithData.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">No products yet</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setIsCreateProductOpen(true)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Product
                    </Button>
                  </div>
                ) : (
                  productsWithData.map((product) => (
                    <Collapsible 
                      key={product.id}
                      open={expandedProducts.has(product.id)}
                      onOpenChange={() => toggleProductExpanded(product.id)}
                    >
                      <div className="space-y-1">
                        {/* Product Header */}
                        <div className="flex items-center">
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 mr-1"
                            >
                              <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${
                                expandedProducts.has(product.id) ? 'rotate-90' : ''
                              }`} />
                            </Button>
                          </CollapsibleTrigger>
                          
                          <ContextMenu>
                            <ContextMenuTrigger asChild>
                              <SidebarMenuButton 
                                className="flex-1 justify-between"
                                onClick={() => {
                                  onProductSelect(product.id);
                                  onEpicSelect(undefined); // Clear epic selection when product is selected
                                }}
                                isActive={selectedProductId === product.id && !selectedEpicId}
                              >
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: product.color || '#6B7280' }}
                                  />
                                  <Package className="h-3 w-3" />
                                  <span className="truncate text-sm">{product.name}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {product.promptCount}
                                </Badge>
                              </SidebarMenuButton>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-48 bg-popover border border-border shadow-lg z-50">
                              <ContextMenuItem 
                                onClick={() => {
                                  setSelectedProductForEpic(product.id);
                                  setIsCreateEpicOpen(true);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Hash className="h-4 w-4" />
                                Create Epic
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                              <ContextMenuItem 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="flex items-center gap-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Product
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        </div>

                        {/* Epic List */}
                        <CollapsibleContent className="ml-4">
                          <div className="space-y-1">
                            {product.epics.length > 0 && (
                              <>
                                {product.epics.map((epic) => (
                                  <SidebarMenuButton
                                    key={epic.id}
                                    className="w-full justify-between text-xs"
                                    onClick={() => {
                                      onProductSelect(product.id);
                                      onEpicSelect(epic.id);
                                    }}
                                    isActive={selectedEpicId === epic.id}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-1.5 h-1.5 rounded-full" 
                                        style={{ backgroundColor: epic.color || '#8B5CF6' }}
                                      />
                                      <Hash className="h-3 w-3" />
                                      <span className="truncate">{epic.name}</span>
                                    </div>
                                    {epic.promptCount > 0 && (
                                      <Badge variant="outline" className="text-xs h-4">
                                        {epic.promptCount}
                                      </Badge>
                                    )}
                                  </SidebarMenuButton>
                                ))}
                              </>
                            )}
                            
                            {/* Show "No epics" when expanded but empty */}
                            {expandedProducts.has(product.id) && product.epics.length === 0 && (
                              <div className="py-2 px-2">
                                <p className="text-xs text-muted-foreground mb-2">No epics yet</p>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="w-full text-xs h-7"
                                  onClick={() => {
                                    setSelectedProductForEpic(product.id);
                                    setIsCreateEpicOpen(true);
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Create Epic
                                </Button>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Completed Prompts */}
          {showCompletedItems && (
            <SidebarGroup className="mt-6">
              <div className="mb-3 flex items-center justify-between cursor-pointer" onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}>
                <h3 className="text-sm font-medium text-muted-foreground">Completed ({completedPrompts.length})</h3>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCompletedExpanded ? 'rotate-180' : ''}`} />
              </div>
              
              {isCompletedExpanded && (
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {completedPrompts.length === 0 ? (
                      <div className="py-2 px-3 text-center">
                        <p className="text-xs text-muted-foreground">No completed prompts</p>
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
                              View all {completedPrompts.length} prompts
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
                Show completed items
                <Badge variant="secondary" className="ml-auto">
                  {completedPrompts.length}
                </Badge>
              </Button>
            </div>
          )}

          {/* Remove Recent Epics since they're now integrated above */}
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
              <Label>Color</Label>
              <div className="flex items-center gap-2 mt-2">
                {PRODUCT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNewProductData(prev => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newProductData.color === color.value 
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
                    value={newProductData.color}
                    onChange={(e) => setNewProductData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
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
                    onClick={() => setNewEpicData(prev => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newEpicData.color === color.value 
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
                    value={newEpicData.color}
                    onChange={(e) => setNewEpicData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateEpicOpen(false);
                    setNewEpicData({ name: '', description: '', color: '#8B5CF6' });
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
    </>
  );
}
