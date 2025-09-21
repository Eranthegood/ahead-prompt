import React, { useState, useRef, useEffect } from 'react';
import { Flag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Workspace, Epic, Product, PromptPriority } from '@/types';

interface CreatePromptData {
  title: string;
  description?: string;
  product_id?: string;
  epic_id?: string;
  priority?: PromptPriority;
}

interface LinearPromptCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promptData: CreatePromptData) => Promise<any>;
  workspace: Workspace;
  epics?: Epic[];
  products?: Product[];
  selectedProductId?: string;
  selectedEpicId?: string;
  onCreateProduct?: () => void;
  onCreateEpic?: () => void;
  onProductsRefetch?: () => void;
}

export const LinearPromptCard: React.FC<LinearPromptCardProps> = ({
  isOpen,
  onClose,
  onSave,
  workspace,
  epics = [],
  products = [],
  selectedProductId,
  selectedEpicId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PromptPriority>(2);
  const [productId, setProductId] = useState(selectedProductId || 'none');
  const [epicId, setEpicId] = useState(selectedEpicId || 'none');
  
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus on title input when opening
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isOpen]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority(2);
      setProductId(selectedProductId || 'none');
      setEpicId(selectedEpicId || 'none');
    }
  }, [isOpen, selectedProductId, selectedEpicId]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        product_id: productId === 'none' ? undefined : productId,
        epic_id: epicId === 'none' ? undefined : epicId,
        priority,
      });
      onClose();
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="linear-prompt-creator fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl mx-4">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">New Prompt</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Title Input */}
          <Input
            ref={titleInputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Prompt title..."
            className="text-base font-medium"
          />

          {/* Description Textarea */}
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="min-h-[80px] resize-none"
            rows={3}
          />

          {/* Priority Selector */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const priorities: PromptPriority[] = [1, 2, 3];
                const currentIndex = priorities.indexOf(priority);
                const nextIndex = (currentIndex + 1) % priorities.length;
                setPriority(priorities[nextIndex]);
              }}
              className="h-8 px-3 text-xs"
            >
              <Flag className={`h-3 w-3 mr-1 ${
                priority === 1 ? 'text-red-500' : 
                priority === 3 ? 'text-gray-400' : ''
              }`} />
              {priority === 1 ? 'High' : priority === 3 ? 'Low' : 'Normal'}
            </Button>
          </div>

          {/* Product Selector */}
          {products.length > 0 && (
            <div>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a product (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No product</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Epic Selector */}
          {productId && epics.length > 0 && (
            <div>
              <Select value={epicId} onValueChange={setEpicId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an epic (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No epic</SelectItem>
                  {epics
                    .filter(epic => epic.product_id === productId)
                    .map((epic) => (
                      <SelectItem key={epic.id} value={epic.id}>
                        {epic.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              className="text-sm"
            >
              Add Prompt
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};