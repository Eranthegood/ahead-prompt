import React from 'react';
import { motion } from 'framer-motion';
import { Product, Epic } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Zap, 
  FileText, 
  MoreHorizontal,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ProductGridCardProps {
  product: Product;
  epicCount: number;
  promptCount: number;
  epics: Epic[];
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export function ProductGridCard({
  product,
  epicCount,
  promptCount,
  epics,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
}: ProductGridCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on dropdown menu
    if ((e.target as Element).closest('[role="button"]')) {
      return;
    }
    onClick?.();
  };

  return (
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
      >
      <Card 
        className={cn(
          "group cursor-pointer transition-all duration-200",
          "hover:shadow-lg hover:shadow-primary/10",
          "border-l-4 border-l-transparent hover:border-l-primary"
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: product.color }}
              >
                <Package className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Product
                </p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Product
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                {(onEdit || onDuplicate) && onDelete && <DropdownMenuSeparator />}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Product
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {product.description && (
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
              {product.description}
            </p>
          )}
          
          {/* Statistics */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                <span>{epicCount}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span>{promptCount}</span>
              </div>
            </div>
          </div>
          
          {/* Recent Epics Preview */}
          {epics.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">Recent Epics:</p>
              <div className="space-y-1">
                {epics.slice(0, 2).map((epic) => (
                  <div 
                    key={epic.id} 
                    className="flex items-center gap-2 p-1.5 rounded bg-muted/30 text-xs"
                  >
                    <Zap className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate flex-1">{epic.name}</span>
                  </div>
                ))}
                {epics.length > 2 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{epics.length - 2} more epics
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}