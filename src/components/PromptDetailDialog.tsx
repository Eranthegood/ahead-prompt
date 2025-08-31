import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, Package, Hash, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Prompt, PromptStatus, Product, Epic } from '@/types';

interface PromptDetailDialogProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  products: Product[];
  epics: Epic[];
}

const statusOptions = [
  { value: 'todo', label: 'Todo', variant: 'outline' as const },
  { value: 'in_progress', label: 'In Progress', variant: 'secondary' as const },
  { value: 'done', label: 'Done', variant: 'default' as const }
];

const priorityOptions = [
  { value: 1, label: 'Critical', color: 'bg-red-500' },
  { value: 2, label: 'High', color: 'bg-orange-500' },
  { value: 3, label: 'Medium', color: 'bg-yellow-500' },
  { value: 4, label: 'Low', color: 'bg-green-500' }
];

export function PromptDetailDialog({ prompt, open, onOpenChange, onUpdate, products, epics }: PromptDetailDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<PromptStatus>('todo');
  const [priority, setPriority] = useState(3);
  const [productId, setProductId] = useState<string>('');
  const [epicId, setEpicId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Reset form when prompt changes
  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setDescription(prompt.description || '');
      setStatus(prompt.status);
      setPriority(prompt.priority);
      setProductId(prompt.product_id || '');
      setEpicId(prompt.epic_id || '');
    }
  }, [prompt]);

  const handleSave = async () => {
    if (!prompt || !title.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('prompts')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          status,
          priority,
          product_id: productId || null,
          epic_id: epicId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', prompt.id);

      if (error) throw error;

      toast({
        title: 'Prompt updated',
        description: 'Changes have been saved successfully'
      });

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to update prompt',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredEpics = epics.filter(epic => !productId || epic.product_id === productId);
  const selectedProduct = products.find(p => p.id === productId);
  const selectedEpic = epics.find(e => e.id === epicId);
  const priorityOption = priorityOptions.find(p => p.value === priority);

  if (!prompt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Prompt</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {format(new Date(prompt.created_at), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Updated {format(new Date(prompt.updated_at), 'MMM d, yyyy')}</span>
            </div>
          </div>

          <Separator />

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter prompt title..."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter prompt description..."
              rows={4}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as PromptStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Badge variant={option.variant} className="text-xs">
                          {option.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority.toString()} onValueChange={(value) => setPriority(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product and Epic */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No product</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {product.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Epic</Label>
              <Select value={epicId} onValueChange={setEpicId} disabled={!productId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select epic..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No epic</SelectItem>
                  {filteredEpics.map((epic) => (
                    <SelectItem key={epic.id} value={epic.id}>
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        {epic.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Associations */}
          {(selectedProduct || selectedEpic) && (
            <div className="space-y-2">
              <Label>Current Associations</Label>
              <div className="flex gap-2">
                {selectedProduct && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {selectedProduct.name}
                  </Badge>
                )}
                {selectedEpic && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {selectedEpic.name}
                  </Badge>
                )}
                {priorityOption && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${priorityOption.color}`} />
                    {priorityOption.label}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}