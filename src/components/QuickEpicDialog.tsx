import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, MoreHorizontal, Palette } from 'lucide-react';
import type { Workspace, Product } from '@/types';

interface CreateEpicData {
  name: string;
  description?: string;
  color?: string;
  product_id?: string;
}

interface QuickEpicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (epicData: CreateEpicData) => Promise<any>;
  onOpenExtended?: (epicData: CreateEpicData) => void;
  workspace: Workspace;
  products?: Product[];
  selectedProductId?: string;
}

const EPIC_COLORS = [
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#3B82F6', label: 'Bleu' },
  { value: '#10B981', label: 'Vert' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Rouge' },
  { value: '#EC4899', label: 'Rose' },
];

export const QuickEpicDialog: React.FC<QuickEpicDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onOpenExtended,
  workspace,
  products = [],
  selectedProductId,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<string>('#8B5CF6');
  const [selectedProduct, setSelectedProduct] = useState<string>('none');
  const [isLoading, setIsLoading] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // 🎯 Auto-focus and reset on open
  useEffect(() => {
    if (isOpen) {
      // Reset form
      setName('');
      setDescription('');
      setColor('#8B5CF6');
      setSelectedProduct(selectedProductId || 'none');

      // Focus with delay to avoid rendering issues
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, selectedProductId]);

  // ⌨️ Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && name.trim()) {
      // Enter = save, Ctrl+Enter = force save
      if (e.ctrlKey || e.metaKey || !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
    }
  };

  // 💾 Save epic
  const handleSave = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const epicData: CreateEpicData = {
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        product_id: selectedProduct === 'none' ? undefined : selectedProduct,
      };

      await onSave(epicData);
      onClose();
    } catch (error) {
      console.error('Error saving epic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 Transition to extended editor
  const handleMoreOptions = () => {
    const epicData: CreateEpicData = {
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      product_id: selectedProduct === 'none' ? undefined : selectedProduct,
    };

    onOpenExtended?.(epicData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-border/50"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Création rapide d'épic
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 🎯 Name - Large input */}
          <div>
            <Input
              ref={nameInputRef}
              placeholder="Nom de l'épic..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg font-medium h-12 border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground"
              maxLength={100}
            />
          </div>

          {/* 📝 Description - Optional */}
          <div>
            <Textarea
              placeholder="Description (optionnel)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border-border/50 bg-muted/30 resize-none"
              maxLength={500}
            />
          </div>

          {/* ⚡ Quick selectors */}
          <div className="flex items-center gap-3 pt-2">
            {/* Product selector */}
            {products.length > 0 && (
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="flex-1 h-9 text-sm">
                  <SelectValue placeholder="Produit..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-sm">
                    <span className="text-muted-foreground">Aucun produit</span>
                  </SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: product.color }}
                        />
                        {product.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Color selector */}
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger className="w-32 h-9 text-sm">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span>Couleur</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {EPIC_COLORS.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: c.value }}
                      />
                      {c.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* More options button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoreOptions}
              className="h-9 px-2 text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* 🚀 Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="text-xs text-muted-foreground">
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Enter</kbd> pour créer
              <span className="mx-2">•</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Esc</kbd> pour annuler
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!name.trim() || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    Création...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    Créer
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};