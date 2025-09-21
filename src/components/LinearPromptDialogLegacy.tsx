import React, { useEffect, useMemo, useState } from 'react';
import type { Workspace, Epic, Product, PromptPriority } from '@/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreatePromptData {
  title: string;
  description?: string;
  original_description?: string;
  epic_id?: string;
  product_id?: string;
  priority?: PromptPriority;
}

interface LinearPromptDialogLegacyProps {
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

export const LinearPromptDialogLegacy: React.FC<LinearPromptDialogLegacyProps> = ({
  isOpen,
  onClose,
  onSave,
  workspace, // kept for API compatibility
  epics = [],
  products = [],
  selectedProductId,
  selectedEpicId,
  onCreateProduct,
  onCreateEpic,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [productId, setProductId] = useState<string | undefined>(selectedProductId);
  const [epicId, setEpicId] = useState<string | undefined>(selectedEpicId);
  const [priority, setPriority] = useState<PromptPriority>(2);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // reset on open
      setTitle('');
      setDescription('');
      setProductId(selectedProductId);
      setEpicId(selectedEpicId);
      setPriority(2);
      setSaving(false);
    }
  }, [isOpen, selectedProductId, selectedEpicId]);

  // Filter epics by selected product if available
  const filteredEpics = useMemo(() => {
    if (!productId) return epics;
    return epics.filter((e) => (e as any).product_id === productId);
  }, [epics, productId]);

  const handleSave = async () => {
    if (!title.trim()) return; // simple guard
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description?.trim() || undefined,
        product_id: productId,
        epic_id: epicId,
        priority,
      });
      onClose();
    } catch (e) {
      // keep dialog open on error, allow retry
      console.error('Legacy prompt save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Prompt</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt-title">Title</Label>
            <Input
              id="prompt-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Write a clear, actionable prompt title"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt-desc">Description (optional)</Label>
            <Textarea
              id="prompt-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context or steps to guide the AI"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <div className="flex items-center gap-2">
                <Select value={productId} onValueChange={(v) => { setProductId(v); setEpicId(undefined); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={(p as any).id} value={(p as any).id}>
                        {(p as any).name || (p as any).title || 'Product'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {onCreateProduct && (
                  <Button type="button" variant="secondary" onClick={onCreateProduct}>
                    New
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Epic</Label>
              <div className="flex items-center gap-2">
                <Select value={epicId} onValueChange={setEpicId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an epic" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEpics.map((e) => (
                      <SelectItem key={(e as any).id} value={(e as any).id}>
                        {(e as any).name || (e as any).title || 'Epic'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {onCreateEpic && (
                  <Button type="button" variant="secondary" onClick={onCreateEpic}>
                    New
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={String(priority)} onValueChange={(v) => setPriority(Number(v) as PromptPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">High</SelectItem>
                <SelectItem value="2">Normal</SelectItem>
                <SelectItem value="3">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
