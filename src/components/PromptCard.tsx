import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Hash, Package, Calendar, MoreHorizontal, Edit, Copy, Trash2, ArrowRight, Sparkles, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { PromptContextMenu } from '@/components/PromptContextMenu';
import { TruncatedTitle } from '@/components/ui/truncated-title';
import { Prompt, PromptStatus, PRIORITY_LABELS, PRIORITY_OPTIONS, Product, Epic } from '@/types';

interface PromptCardProps {
  prompt: Prompt & {
    product?: Product;
    epic?: Epic;
  };
  onPromptClick: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onStatusChange: (prompt: Prompt, status: PromptStatus) => void;
  onPriorityChange: (prompt: Prompt, priority: number) => void;
  onDuplicate: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onCopy: (prompt: Prompt) => void;
  onCopyGenerated: (prompt: Prompt) => void;
  isHovered?: boolean;
  onHover?: (promptId: string | null) => void;
}

const statusOptions = [
  { value: 'todo', label: 'Todo', variant: 'outline' as const },
  { value: 'in_progress', label: 'In Progress', variant: 'secondary' as const },
  { value: 'done', label: 'Done', variant: 'success' as const }
];

export function PromptCard({
  prompt,
  onPromptClick,
  onEdit,
  onStatusChange,
  onPriorityChange, 
  onDuplicate,
  onDelete,
  onCopy,
  onCopyGenerated,
  isHovered,
  onHover
}: PromptCardProps) {
  const priority = prompt.priority || 3;
  const priorityOption = PRIORITY_OPTIONS.find(p => p.value === priority);

  return (
    <PromptContextMenu
      prompt={prompt}
      onEdit={() => onEdit(prompt)}
      onUpdate={() => {}}
    >
      <Card 
        className={`hover:shadow-sm transition-all cursor-pointer ${
          isHovered ? 'ring-2 ring-primary/50 shadow-lg' : ''
        }`}
        onMouseEnter={() => onHover?.(prompt.id)}
        onMouseLeave={() => onHover?.(null)}
      >
        <CardContent className="p-4">
          <div 
            className="flex items-start justify-between"
            onClick={() => onPromptClick(prompt)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <TruncatedTitle 
                  title={prompt.title}
                  maxLength={60}
                  className="font-medium text-foreground group"
                  showCopyButton={false}
                  variant="inline"
                />
                
                {/* Priority Badge */}
                {priority === 1 && (
                  <Badge variant="destructive" className="text-xs flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    {PRIORITY_LABELS[priority]}
                  </Badge>
                )}
                {priority === 2 && (
                  <Badge variant="secondary" className="text-xs">
                    {PRIORITY_LABELS[priority]}
                  </Badge>
                )}
                {priority === 3 && (
                  <Badge variant="outline" className="text-xs opacity-60">
                    {PRIORITY_LABELS[priority]}
                  </Badge>
                )}
              </div>
              
              {prompt.description && (
                <div 
                  className="text-sm text-muted-foreground mb-3 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: prompt.description }}
                />
              )}
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {prompt.product && (
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    <span>{prompt.product.name}</span>
                  </div>
                )}
                
                {prompt.epic && (
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    <span>{prompt.epic.name}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(prompt.created_at), 'MMM d')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {/* Quick Copy Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyGenerated(prompt);
                }}
                className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity"
                title="Copy auto-generated prompt"
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              {/* Status Badge - Click to cycle through statuses */}
              <Badge 
                variant={
                  prompt.status === 'done' ? 'success' : 
                  prompt.status === 'in_progress' ? 'secondary' : 'outline'
                }
                className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = statusOptions.findIndex(s => s.value === prompt.status);
                  const nextIndex = (currentIndex + 1) % statusOptions.length;
                  const nextStatus = statusOptions[nextIndex].value as PromptStatus;
                  onStatusChange(prompt, nextStatus);
                }}
              >
                {prompt.status === 'in_progress' ? 'In Progress' : 
                 prompt.status === 'done' ? 'Done' : 'Todo'}
              </Badge>
              
              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault();
                    onEdit(prompt);
                  }} className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit prompt
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => onCopy(prompt)} className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy content
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onCopyGenerated(prompt);
                  }} className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Copy generated prompt
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault();
                    onDuplicate(prompt);
                  }} className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Change status
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48">
                      {statusOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={(e) => {
                            e.preventDefault();
                            onStatusChange(prompt, option.value as PromptStatus);
                          }}
                          disabled={option.value === prompt.status}
                          className="flex items-center justify-between"
                        >
                          <span>{option.label}</span>
                          <Badge variant={option.variant} className="text-xs">
                            {option.value === prompt.status ? 'Current' : ''}
                          </Badge>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center gap-2">
                      <Flame className="h-4 w-4" />
                      Change priority
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48">
                      {PRIORITY_OPTIONS.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={(e) => {
                            e.preventDefault();
                            onPriorityChange(prompt, option.value);
                          }}
                          disabled={option.value === priority}
                          className="flex items-center justify-between"
                        >
                          <span>{option.label}</span>
                          <Badge variant={option.variant} className="text-xs">
                            {option.value === priority ? 'Current' : ''}
                          </Badge>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(prompt);
                    }}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete prompt
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </PromptContextMenu>
  );
}