import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  ExternalLink,
  Package,
  Calendar,
  Hash 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Product } from "@/types";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface ProductItemProps {
  product: Product;
  epicCount?: number;
  promptCount?: number;
  onClick?: () => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onDuplicate?: (product: Product) => void;
}

export function ProductItem({
  product,
  epicCount = 0,
  promptCount = 0,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
}: ProductItemProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(product);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(product.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate?.(product);
  };

  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/product/${product.id}`;
    await navigator.clipboard.writeText(url);
  };

  return (
    <Card 
      className="group hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in" 
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          {/* Main Content */}
          <div className="flex items-start gap-3 flex-1">
            {/* Product Color Indicator */}
            <div 
              className="w-3 h-3 rounded-full mt-1 flex-shrink-0" 
              style={{ backgroundColor: product.color || '#3B82F6' }}
            />
            
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-foreground truncate">
                  {product.name}
                </h3>
              </div>
              
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {product.description}
                </p>
              )}
              
              {/* Metadata Row */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Created {format(new Date(product.created_at), 'MMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  <span>{epicCount} epics</span>
                </div>
                
                {promptCount > 0 && (
                  <Badge variant="secondary" className="text-xs h-5">
                    {promptCount} prompts
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              asChild
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <Link to={`/product/${product.id}`}>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={copyLink}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}