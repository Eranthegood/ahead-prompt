import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Calendar,
  Hash,
  Package,
  Zap
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Epic, Product } from "@/types";
import { format } from "date-fns";

interface EpicItemProps {
  epic: Epic;
  product?: Product;
  promptCount?: number;
  onClick?: () => void;
  onEdit?: (epic: Epic) => void;
  onDelete?: (epicId: string) => void;
  onDuplicate?: (epic: Epic) => void;
}

export function EpicItem({
  epic,
  product,
  promptCount = 0,
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
}: EpicItemProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(epic);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(epic.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate?.(epic);
  };

  const copyEpicInfo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Epic: ${epic.name}\n${epic.description || ''}`;
    await navigator.clipboard.writeText(text);
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
            {/* Epic Color Indicator */}
            <div 
              className="w-3 h-3 rounded-full mt-1 flex-shrink-0" 
              style={{ backgroundColor: epic.color || '#8B5CF6' }}
            />
            
            {/* Epic Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-foreground truncate">
                  {epic.name}
                </h3>
              </div>
              
              {/* Product Badge */}
              {product && (
                <div className="flex items-center gap-1 mb-2">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">
                    <div 
                      className="w-2 h-2 rounded-full mr-1" 
                      style={{ backgroundColor: product.color }}
                    />
                    {product.name}
                  </Badge>
                </div>
              )}
              
              {epic.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {epic.description}
                </p>
              )}
              
              {/* Metadata Row */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Created {format(new Date(epic.created_at), 'MMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  <span>{promptCount} prompts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  Edit Epic
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={copyEpicInfo}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Info
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