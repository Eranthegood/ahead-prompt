import React from 'react';
import { motion } from 'framer-motion';
import { Epic, Product } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  FileText, 
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Package
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface EpicGridCardProps {
  epic: Epic;
  promptCount: number;
  product?: Product;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export function EpicGridCard({
  epic,
  promptCount,
  product,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
}: EpicGridCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on dropdown menu
    if ((e.target as Element).closest('[role="button"]')) {
      return;
    }
    onClick?.();
  };

  const epicColor = product?.color || '#6B7280';

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
                style={{ backgroundColor: epicColor }}
              >
                <Zap className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {epic.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Epic
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
                    Edit Epic
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
                    Delete Epic
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {epic.description && (
            <p className="text-xs text-muted-foreground mb-4 line-clamp-3">
              {epic.description}
            </p>
          )}
          
          {/* Product Association */}
          {product && (
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-4 h-4 rounded flex items-center justify-center"
                style={{ backgroundColor: product.color }}
              >
                <Package className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {product.name}
              </span>
            </div>
          )}
          
          {/* Statistics */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>{promptCount} prompts</span>
            </div>
            
            {/* Status or Priority could go here */}
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}