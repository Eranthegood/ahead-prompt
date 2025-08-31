import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Hash,
  ExternalLink
} from 'lucide-react';
import { Product } from '@/types';

interface ProductContextMenuProps {
  children: React.ReactNode;
  product: Product;
  onAddEpic: (productId: string) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onNavigateToProduct: (productId: string) => void;
}

export function ProductContextMenu({
  children,
  product,
  onAddEpic,
  onEditProduct,
  onDeleteProduct,
  onNavigateToProduct,
}: ProductContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem 
          onClick={() => onNavigateToProduct(product.id)}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Open Product Page
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={() => onAddEpic(product.id)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Epic
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onEditProduct(product)}
          className="flex items-center gap-2"
        >
          <Edit3 className="h-4 w-4" />
          Edit Product
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={() => onDeleteProduct(product)}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete Product
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}