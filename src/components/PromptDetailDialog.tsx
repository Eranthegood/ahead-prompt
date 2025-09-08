import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { usePrompts } from '@/hooks/usePrompts';
import { Prompt, Product, Epic, PRIORITY_OPTIONS } from '@/types';

interface PromptDetailDialogProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  epics: Epic[];
}

export function PromptDetailDialog({
  prompt,
  open,
  onOpenChange,
  products,
  epics
}: PromptDetailDialogProps) {
  const [productId, setProductId] = useState<string>('none');
  const [epicId, setEpicId] = useState<string>('none');
  const [priority, setPriority] = useState<number>(3);
  const [description, setDescription] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();
  const { updatePrompt } = usePrompts();

  // Load prompt data when dialog opens
  useEffect(() => {
    if (prompt) {
      setProductId(prompt.product_id || 'none');
      setEpicId(prompt.epic_id || 'none');
      setPriority(prompt.priority || 3);
      setDescription(prompt.description || prompt.original_description || '');
    }
  }, [prompt]);

  const handleSave = async () => {
    if (!prompt || !description.trim()) return;
    
    setSaving(true);
    try {
      await updatePrompt(prompt.id, {
        description: description.trim(),
        product_id: productId === 'none' ? null : productId,
        epic_id: epicId === 'none' ? null : epicId,
        priority
      });

      toast({
        title: 'Saved',
        description: 'Your changes have been saved successfully'
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  // Filter epics by selected product
  const filteredEpics = epics.filter(epic => 
    productId === 'none' || !productId || epic.product_id === productId
  );

  if (!prompt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[80vh] flex flex-col" 
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Idea</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your idea..."
              className="min-h-[200px] resize-none"
            />
          </div>

          {/* Product Selection */}
          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Product</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Epic Selection */}
          <div className="space-y-2">
            <Label>Epic</Label>
            <Select value={epicId} onValueChange={setEpicId}>
              <SelectTrigger>
                <SelectValue placeholder="Select epic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Epic</SelectItem>
                {filteredEpics.map((epic) => (
                  <SelectItem key={epic.id} value={epic.id}>
                    {epic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority.toString()} onValueChange={(value) => setPriority(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !description.trim()}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}