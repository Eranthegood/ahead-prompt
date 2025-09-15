import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Copy, Check, ExternalLink, Flame, Minus, Clock, ChevronDown, Merge, Edit, Trash2, Copy as CopyIcon, Code, Settings } from 'lucide-react';
import { StatusIcon } from '@/components/ui/status-icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { AgentWorkingIndicator } from '@/components/ui/loading-pulse';
import { Prompt, PromptStatus, Product, Epic } from '@/types';
import { cn, isPromptUsable, getPriorityDisplay } from '@/lib/utils';
import { getStatusDisplayInfo } from '@/types/cursor';
import { useAgentStatusStream } from '@/hooks/useAgentStatusStream';
import { useIntegrations } from '@/hooks/useIntegrations';

interface LinearPromptItemProps {
  prompt: Prompt & {
    product?: Product;
    epic?: Epic;
  };
  onPromptClick: (prompt: Prompt) => void;
  onCopyGenerated: (prompt: Prompt) => void;
  onShowCursorDrawer: () => void;
  onShowClaudeDrawer?: () => void;
  onPriorityChange?: (prompt: Prompt, newPriority: number) => void;
  onStatusChange?: (prompt: Prompt, newStatus: PromptStatus) => void;
  onDuplicate?: (prompt: Prompt) => void;
  onDelete?: (prompt: Prompt) => void;
  onEdit?: (prompt: Prompt) => void;
  isHovered?: boolean;
  onHover?: (promptId: string | null) => void;
}

// Enhanced status display for Cursor workflow
const getCursorStatusDisplay = (status: PromptStatus, cursorAgentStatus?: string) => {
  // If we have a Cursor agent status, show that instead
  if (cursorAgentStatus && ['sent_to_cursor', 'cursor_working', 'pr_created', 'pr_review', 'pr_ready', 'error'].includes(status)) {
    return getStatusDisplayInfo(cursorAgentStatus as any);
  }
  
  // Otherwise use internal status
  return getStatusDisplayInfo(status);
};

export function LinearPromptItem({
  prompt,
  onPromptClick,
  onCopyGenerated,
  onShowCursorDrawer,
  onShowClaudeDrawer,
  onPriorityChange,
  onStatusChange,
  onDuplicate,
  onDelete,
  onEdit,
  isHovered,
  onHover
}: LinearPromptItemProps) {
  const [justCopied, setJustCopied] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Check integration status
  const { integrations } = useIntegrations();
  const cursorIntegration = integrations.find(int => int.id === 'cursor');
  const claudeIntegration = integrations.find(int => int.id === 'claude');
  const isCursorConfigured = cursorIntegration?.isConfigured && cursorIntegration?.isEnabled;
  const isClaudeConfigured = claudeIntegration?.isConfigured && claudeIntegration?.isEnabled;
  
  // Live status stream from Agent Status Service keyed by Cursor agent id
  const { latest: liveStatus } = useAgentStatusStream(prompt.cursor_agent_id || undefined);
  
  const priority = prompt.priority || 3;
  const statusDisplay = getCursorStatusDisplay(
    prompt.status,
    (liveStatus?.status?.toLowerCase?.() as any) || (prompt.cursor_agent_status || undefined)
  );
  const isUsable = isPromptUsable(prompt);

  const handleCopy = () => {
    if (!isUsable) return;
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1200);
    onCopyGenerated(prompt);
  };

  const handleStatusChange = (newStatus: PromptStatus) => {
    if (newStatus === 'done') {
      setIsCompleting(true);
      setIsSliding(true);
      // Start fade after slide completes
      setTimeout(() => {
        setIsSliding(false);
        // Call status change after both animations
        setTimeout(() => {
          if (onStatusChange) {
            onStatusChange(prompt, newStatus);
          }
        }, 200); // Fade duration
      }, 300); // Slide duration
    } else {
      if (onStatusChange) {
        onStatusChange(prompt, newStatus);
      }
    }
  };


  const priorityDisplay = getPriorityDisplay(prompt.priority || 3);
  const PriorityIcon = priorityDisplay.icon;

  // Get status color
  const getStatusColor = () => {
    if (prompt.status === 'done') return 'text-green-600 dark:text-green-400';
    if (prompt.status === 'in_progress') return 'text-blue-600 dark:text-blue-400';
    if (['sent_to_cursor', 'cursor_working'].includes(prompt.status)) return 'text-purple-600 dark:text-purple-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  // Get status label
  const getStatusLabel = () => {
    if (['sending_to_cursor','sent_to_cursor','cursor_working','pr_created','pr_review','pr_ready','pr_merged','error'].includes(prompt.status)) {
      return `${statusDisplay.label}${liveStatus?.progress != null ? ` • ${liveStatus.progress}%` : ''}`;
    }
    
    if (prompt.status === 'in_progress') return 'In Progress';
    if (prompt.status === 'done') return 'Done'; 
    return 'Todo';
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div 
          className={`group flex items-center h-12 py-1 px-3 -mx-3 rounded-md transition-all duration-150 cursor-pointer hover:bg-muted ${
            isHovered ? 'bg-muted' : ''
          } ${!isUsable ? 'opacity-60' : ''} ${
            isSliding ? 'animate-slide-out-right' : ''
          } ${isCompleting && !isSliding ? 'animate-fade-out' : ''} ${
            priority === 1 ? 'border-l-4 border-red-500 bg-red-50/30 dark:bg-red-950/20 hover:bg-muted' : ''
          }`}
          onMouseEnter={() => onHover?.(prompt.id)}
          onMouseLeave={() => onHover?.(null)}
          onClick={() => onPromptClick(prompt)}
        >
      {/* Priority dropdown - Fixed 32px column */}
      <div className="w-8 flex-shrink-0 mr-3 flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto p-1 justify-center hover:bg-muted"
              onClick={(e) => e.stopPropagation()}
            >
              <PriorityIcon className={`h-4 w-4 ${priorityDisplay.color}`} />
              <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                if (onPriorityChange && prompt.priority !== 1) {
                  onPriorityChange(prompt, 1);
                }
              }}
              className={`${prompt.priority === 1 ? 'bg-gray-100 dark:bg-gray-700' : ''} text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2`}
            >
              <Flame className="h-4 w-4 text-red-500" />
              High
              {prompt.priority === 1 && <Check className="h-3 w-3 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                if (onPriorityChange && prompt.priority !== 2) {
                  onPriorityChange(prompt, 2);
                }
              }}
              className={`${prompt.priority === 2 ? 'bg-gray-100 dark:bg-gray-700' : ''} text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2`}
            >
              <Minus className="h-4 w-4 text-orange-500" />
              Normal
              {prompt.priority === 2 && <Check className="h-3 w-3 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                if (onPriorityChange && prompt.priority !== 3) {
                  onPriorityChange(prompt, 3);
                }
              }}
              className={`${prompt.priority === 3 ? 'bg-gray-100 dark:bg-gray-700' : ''} text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2`}
            >
              <Clock className="h-4 w-4 text-gray-400" />
              Low
              {prompt.priority === 3 && <Check className="h-3 w-3 ml-auto" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Actions - Fixed width, show on hover */}
      <div className="flex items-center gap-1 w-20 transition-opacity duration-150 mr-3">
        {/* Copy Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          disabled={!isUsable}
          className="h-7 w-7 p-0 hover:bg-muted flex-shrink-0"
          aria-label="Copy prompt"
        >
          {justCopied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-gray-500" />
          )}
        </Button>
        
        {/* Send to Cursor Button - Only show if repository is mapped and Cursor is configured */}
        {prompt.product?.github_repo_url && isCursorConfigured && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isUsable) return;
                    onShowCursorDrawer();
                  }}
                  disabled={!isUsable}
                  className="h-7 w-7 p-0 text-purple-500 hover:text-purple-600 hover:bg-muted flex-shrink-0"
                  aria-label="Send to Cursor"
                >
                  <Merge className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send to Cursor</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Send to Claude Button - Only show if repository is mapped and Claude is configured */}
        {prompt.product?.github_repo_url && isClaudeConfigured && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isUsable) return;
                    onShowClaudeDrawer?.();
                  }}
                  disabled={!isUsable}
                  className="h-7 w-7 p-0 text-orange-500 hover:text-orange-600 hover:bg-muted flex-shrink-0"
                  aria-label="Send to Claude"
                >
                  <Code className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send to Claude</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Status - Fixed 80px column, aligned */}
      <div className="w-20 flex-shrink-0 mr-4 flex items-center justify-start">
        {/* Cursor workflow statuses are not editable */}
        {['sent_to_cursor', 'cursor_working', 'sending_to_cursor', 'pr_created', 'pr_review', 'pr_ready', 'pr_merged', 'error'].includes(prompt.status) ? (
          <div className="flex items-center px-2 py-1">
            <AgentWorkingIndicator size="sm" className="mr-1.5" />
            <div className={`text-xs font-medium ${getStatusColor()} line-clamp-1`}>
              {getStatusLabel()}
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto p-2 -mx-2 justify-start hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <StatusIcon status={prompt.status} size="sm" />
                <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (prompt.status !== 'todo') {
                    handleStatusChange('todo');
                  }
                }}
                className={`${prompt.status === 'todo' ? 'bg-gray-100 dark:bg-gray-700' : ''} text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2`}
              >
                <StatusIcon status="todo" size="sm" />
                To do
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (prompt.status !== 'in_progress') {
                    handleStatusChange('in_progress');
                  }
                }}
                className={`${prompt.status === 'in_progress' ? 'bg-gray-100 dark:bg-gray-700' : ''} text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2`}
              >
                <StatusIcon status="in_progress" size="sm" />
                In progress
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (prompt.status !== 'done') {
                    handleStatusChange('done');
                  }
                }}
                className={`${prompt.status === 'done' ? 'bg-gray-100 dark:bg-gray-700' : ''} text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2`}
              >
                <StatusIcon status="done" size="sm" />
                Done
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Title - Flexible column with consistent height */}
      <div className="flex-1 min-w-0 mr-4 py-1">
        <div 
          className="font-inter-variable font-medium text-gray-900 dark:text-gray-100 leading-tight line-clamp-1 h-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          style={{ fontSize: '13px' }}
          onClick={(e) => {
            e.stopPropagation();
            // Handle title click - could open prompt details or edit title
            onPromptClick(prompt);
          }}
        >
          {prompt.title}
        </div>
      </div>

      {/* Epic/Product context - Fixed 120px column, aligned */}
      <div className="w-30 flex-shrink-0 mr-4 hidden sm:flex flex-col justify-center py-1">
        {prompt.epic && (
          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 h-3 leading-3">
            {prompt.epic.name}
          </div>
        )}
        {prompt.product && (
          <div className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 h-3 leading-3 mt-0.5">
            {prompt.product.name}
          </div>
        )}
      </div>

      </div>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(prompt);
          }}
          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Edit className="h-4 w-4" />
          Edit prompt
        </ContextMenuItem>
        
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate?.(prompt);
          }}
          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <CopyIcon className="h-4 w-4" />
          Duplicate prompt
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(prompt);
          }}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
          Delete prompt
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
