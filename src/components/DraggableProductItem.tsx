import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Hash, Package, ChevronRight, BookOpen, Trash2, GripVertical } from 'lucide-react';
import type { Product } from '@/types';

interface DraggableProductItemProps {
  product: Product & { 
    epics: any[]; 
    directPrompts: any[]; 
    promptCount: number; 
  };
  isCollapsed: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  selectedEpicId?: string;
  onToggleExpanded: () => void;
  onProductSelect: () => void;
  onEpicSelect: (epicId: string) => void;
  onDeleteProduct: () => void;
  onOpenKnowledge: () => void;
  onCreateEpic: () => void;
}

export function DraggableProductItem({
  product,
  isCollapsed,
  isExpanded,
  isSelected,
  selectedEpicId,
  onToggleExpanded,
  onProductSelect,
  onEpicSelect,
  onDeleteProduct,
  onOpenKnowledge,
  onCreateEpic
}: DraggableProductItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isCollapsed) {
    return (
      <div ref={setNodeRef} style={style} className={`relative ${isDragging ? 'z-50' : ''}`}>
        {/* Drag handle for collapsed view */}
        <div 
          className="absolute -left-1 top-0 h-full w-2 cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <div className="h-full w-full bg-muted-foreground/30 rounded-sm flex items-center justify-center">
            <GripVertical className="h-3 w-3" />
          </div>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full aspect-square p-0 relative ${isSelected ? 'bg-accent' : ''}`}
                  onClick={onProductSelect}
                  aria-label={`${product.name} (${product.promptCount} prompts)`}
                >
                  <div className="relative">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: product.color || '#6B7280' }}
                    />
                    {product.promptCount > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs rounded-full flex items-center justify-center"
                      >
                        {product.promptCount > 99 ? '99+' : product.promptCount}
                      </Badge>
                    )}
                  </div>
                </Button>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48">
                <ContextMenuItem 
                  onClick={onOpenKnowledge}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Manage Knowledge
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem 
                  onClick={onCreateEpic}
                  className="flex items-center gap-2"
                >
                  <Hash className="h-4 w-4" />
                  Create Epic
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem 
                  onClick={onDeleteProduct}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Product
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="max-w-xs">
              <p className="font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.promptCount} prompts</p>
              {product.epics.length > 0 && (
                <div className="mt-1">
                  <p className="text-xs text-muted-foreground">Epics:</p>
                  <ul className="text-xs">
                    {product.epics.slice(0, 3).map(epic => (
                      <li key={epic.id} className="flex items-center gap-1">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: epic.color }} 
                        />
                        {epic.name} ({epic.promptCount})
                      </li>
                    ))}
                    {product.epics.length > 3 && (
                      <li className="text-muted-foreground">+{product.epics.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Right-click for options</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className={`relative ${isDragging ? 'z-50' : ''}`}>
      {/* Drag handle for expanded view */}
      <div 
        className="absolute -left-4 top-0 h-full w-3 cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <div className="h-full w-full bg-muted-foreground/30 rounded-sm flex items-center justify-center">
          <GripVertical className="h-3 w-3" />
        </div>
      </div>
      
      <Collapsible 
        open={isExpanded}
        onOpenChange={onToggleExpanded}
      >
        <div className="space-y-1">
          <div className="flex items-center">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 mr-1"
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${product.name}`}
              >
                <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`} />
              </Button>
            </CollapsibleTrigger>
            
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <SidebarMenuButton 
                  className="flex-1 justify-between"
                  onClick={onProductSelect}
                  isActive={isSelected && !selectedEpicId}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: product.color || '#6B7280' }}
                    />
                    <span className="truncate text-sm font-medium">
                      {product.name}
                    </span>
                  </div>
                  <Badge variant="secondary" className="ml-2 text-xs flex-shrink-0">
                    {product.promptCount}
                  </Badge>
                </SidebarMenuButton>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48">
                <ContextMenuItem 
                  onClick={onOpenKnowledge}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Manage Knowledge
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem 
                  onClick={onCreateEpic}
                  className="flex items-center gap-2"
                >
                  <Hash className="h-4 w-4" />
                  Create Epic
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem 
                  onClick={onDeleteProduct}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Product
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>

          <CollapsibleContent className="pl-7 space-y-1">
            {product.epics.map((epic) => (
              <SidebarMenuButton
                key={epic.id}
                size="sm"
                className="text-xs justify-between"
                onClick={() => onEpicSelect(epic.id)}
                isActive={selectedEpicId === epic.id}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Hash className="w-2 h-2 flex-shrink-0" />
                  <div 
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: epic.color || '#8B5CF6' }}
                  />
                  <span className="truncate">
                    {epic.name}
                  </span>
                </div>
                {epic.promptCount > 0 && (
                  <Badge variant="outline" className="text-xs h-4 px-1">
                    {epic.promptCount}
                  </Badge>
                )}
              </SidebarMenuButton>
            ))}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}