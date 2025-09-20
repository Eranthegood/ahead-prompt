import React, { useEffect, useId } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Workspace, Product, KnowledgeItem } from '@/types';

interface KnowledgeModalProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Callback when modal closes */
  onClose: () => void;
  /** The workspace */
  workspace: Workspace;
  /** Optional product for product-specific knowledge */
  product?: Product;
  /** Knowledge item being edited */
  editingItem?: KnowledgeItem | null;
  /** Custom class name for dialog content */
  className?: string;
}

/**
 * Legacy KnowledgeModal component for backwards compatibility
 * This is a simple wrapper that maintains the old API
 */
export function KnowledgeModal({
  open,
  onOpenChange,
  onClose,
  workspace,
  product,
  editingItem,
  className
}: KnowledgeModalProps) {
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      onClose?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={cn(
          "max-w-4xl max-h-[90vh] focus:outline-none",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Edit Knowledge Item' : 'Add Knowledge Item'}
          </DialogTitle>
          <DialogDescription>
            {product 
              ? `Manage knowledge for ${product.name}` 
              : 'Manage workspace knowledge'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This modal has been simplified. Use the new Knowledge Box from the sidebar for the full experience.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}