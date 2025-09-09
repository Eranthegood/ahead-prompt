import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Expand, X, ChevronRight, Package, Palette, BookOpen } from 'lucide-react';
import { ProductIcon } from '@/components/ui/product-icon';
import { useToast } from '@/hooks/use-toast';
import type { Workspace, Product } from '@/types';
import type { CreateProductData } from '@/hooks/useProducts';

const PRODUCT_COLORS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Red' },
  { value: '#6B7280', label: 'Gray' },
];

interface ModernProductCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: CreateProductData) => Promise<Product | null>;
  workspace: Workspace;
  editingProduct?: Product | null;
  onCreateKnowledge?: (product: Product) => void;
}

export const ModernProductCreator: React.FC<ModernProductCreatorProps> = ({
  isOpen,
  onClose,
  onSave,
  workspace,
  editingProduct,
  onCreateKnowledge,
}) => {
  const { toast } = useToast();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [inventoryCount, setInventoryCount] = useState<number | ''>('');
  const [color, setColor] = useState('#3B82F6');
  const [createKnowledge, setCreateKnowledge] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when opening or editing
  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setName(editingProduct.name);
        setDescription(editingProduct.description || '');
        setPrice(editingProduct.price || '');
        setInventoryCount(editingProduct.inventory_count || '');
        setColor(editingProduct.color);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingProduct]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setInventoryCount('');
    setColor('#3B82F6');
    setCreateKnowledge(false);
    setIsExpanded(false);
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast({
        title: "Product name required",
        description: "Please enter a product name.",
        variant: "destructive",
      });
      return false;
    }

    if (name.trim().length > 50) {
      toast({
        title: "Product name too long",
        description: "Product name must not exceed 50 characters.",
        variant: "destructive",
      });
      return false;
    }

    if (description.length > 250) {
      toast({
        title: "Description too long",
        description: "Product description must not exceed 250 characters.",
        variant: "destructive",
      });
      return false;
    }

    if (price !== '' && (isNaN(Number(price)) || Number(price) < 0)) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price (numbers only).",
        variant: "destructive",
      });
      return false;
    }

    if (inventoryCount !== '' && (!Number.isInteger(Number(inventoryCount)) || Number(inventoryCount) < 0)) {
      toast({
        title: "Invalid inventory count",
        description: "Please enter a valid inventory count (whole numbers only).",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const productData: CreateProductData = {
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        price: price !== '' ? Number(price) : undefined,
        inventory_count: inventoryCount !== '' ? Number(inventoryCount) : undefined,
      };

      const result = await onSave(productData);

      if (result) {
        toast({
          title: editingProduct ? "Product updated" : "Product created",
          description: editingProduct 
            ? "Changes have been saved successfully"
            : `"${name}" has been created successfully`,
        });

        // Handle knowledge creation for new products
        if (!editingProduct && createKnowledge && onCreateKnowledge) {
          onCreateKnowledge(result);
        } else {
          onClose();
        }
        
        resetForm();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error saving product",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isExpanded, handleSave, onClose]);

  if (!isOpen) return null;

  const remainingNameChars = 50 - name.length;
  const remainingDescChars = 250 - description.length;

  return (
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
            <span className="text-foreground">
              {editingProduct ? 'Edit Product' : 'New Product'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              <Expand className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 space-y-6">
          {/* Title input */}
          <div>
            <input 
              type="text" 
              placeholder="Product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl font-medium bg-transparent border-none outline-none text-foreground placeholder-muted-foreground w-full"
              autoFocus
              maxLength={50}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {remainingNameChars} characters remaining
            </div>
          </div>
          
          {/* Expanded details */}
          {isExpanded && (
            <div className="space-y-6 border-t border-border pt-6">
              {/* Description */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe this product..."
                  className="w-full min-h-[100px] p-3 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  maxLength={250}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {remainingDescChars} characters remaining
                </div>
              </div>

              {/* Price and Inventory Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full p-3 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Inventory Count
                  </label>
                  <input
                    type="number"
                    value={inventoryCount}
                    onChange={(e) => setInventoryCount(e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="1"
                    className="w-full p-3 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="text-sm text-muted-foreground mb-3 block">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  {PRODUCT_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      type="button"
                      onClick={() => setColor(colorOption.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color === colorOption.value 
                          ? 'border-primary scale-110' 
                          : 'border-muted hover:scale-105'
                      }`}
                      style={{ backgroundColor: colorOption.value }}
                      title={colorOption.label}
                    />
                  ))}
                  <div className="flex items-center gap-2 ml-2">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Knowledge creation option - only show when creating new product */}
          {!editingProduct && onCreateKnowledge && (
            <div className="flex items-center space-x-2 py-2 border-t border-border pt-4">
              <Switch
                id="create-knowledge"
                checked={createKnowledge}
                onCheckedChange={setCreateKnowledge}
              />
              <label htmlFor="create-knowledge" className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4" />
                Add initial knowledge after creating product
              </label>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <Button 
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground"
          >
            {isExpanded ? 'Collapse' : 'Expand'} details
          </Button>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleSave}
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting 
                ? (editingProduct ? 'Updating...' : 'Creating...')
                : (editingProduct 
                  ? 'Update Product' 
                  : createKnowledge ? 'Create & Add Knowledge' : 'Create Product'
                )
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};