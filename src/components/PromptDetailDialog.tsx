import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { usePrompts } from '@/hooks/usePrompts';
import { Prompt, Product, Epic, PRIORITY_OPTIONS } from '@/types';
import { Copy, FileText, Sparkles, RotateCcw } from 'lucide-react';
import { PromptTransformService } from '@/services/promptTransformService';
import { copyText } from '@/lib/clipboard';
import { ProviderSelector } from '@/components/ProviderSelector';

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
  const [regenerating, setRegenerating] = useState(false);
  const [providerConfig, setProviderConfig] = useState({ provider: 'openai' as 'openai' | 'claude', model: 'gpt-5-2025-08-07' });

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

  const handleCopyGeneratedPrompt = async () => {
    if (prompt?.generated_prompt) {
      try {
        const ok = await copyText(prompt.generated_prompt);
        if (!ok) throw new Error('Clipboard copy failed');
        
        toast({
          title: 'Copied!',
          description: 'Generated prompt copied to clipboard'
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to copy to clipboard',
          variant: 'destructive'
        });
      }
    }
  };

  const handleRegeneratePrompt = async () => {
    if (!prompt || !description.trim()) return;
    
    setRegenerating(true);
    try {
      const response = await PromptTransformService.transformPrompt(
        description.trim(),
        undefined,
        providerConfig.provider,
        providerConfig.model
      );
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.transformedPrompt) {
        // Update the prompt with the new generated content
        await updatePrompt(prompt.id, {
          generated_prompt: response.transformedPrompt
        });

        toast({
          title: 'Regenerated!',
          description: `New AI-enhanced prompt generated with ${providerConfig.provider.toUpperCase()}`
        });
      } else {
        throw new Error('No generated prompt received');
      }
    } catch (error) {
      console.error('Error regenerating prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to regenerate prompt. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setRegenerating(false);
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
        className="max-w-5xl max-h-[85vh] flex flex-col" 
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Idea</DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* Main Content Panel */}
          <div className="flex flex-col space-y-6 overflow-y-auto pr-3 min-h-0">
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

          {/* Generated Prompt Side Panel */}
          <div className="hidden lg:flex flex-col border-l border-border pl-6">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-medium">Generated Prompt</Label>
                </div>
                <div className="flex items-center gap-2">
                  {prompt?.generated_prompt && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyGeneratedPrompt}
                      className="h-8 px-3"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRegeneratePrompt}
                    disabled={regenerating || !description.trim()}
                    className="h-8 px-3"
                  >
                    <RotateCcw className={`h-3 w-3 mr-1 ${regenerating ? 'animate-spin' : ''}`} />
                    {regenerating ? 'Regenerating...' : 'Regenerate'}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">AI Provider</Label>
                <ProviderSelector
                  value={providerConfig}
                  onChange={setProviderConfig}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {prompt?.generated_prompt ? (
                <div className="bg-muted/30 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono">
                  {prompt.generated_prompt}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mb-3 opacity-50" />
                  <p className="text-sm">No generated prompt yet</p>
                  <p className="text-xs opacity-75 mt-1">
                    The AI-enhanced version will appear here once generated
                  </p>
                </div>
              )}
            </div>
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