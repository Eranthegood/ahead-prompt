import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Copy, Check, ExternalLink, Flame, Minus, Clock, MoreHorizontal, ChevronDown } from 'lucide-react';
import { AgentWorkingIndicator } from '@/components/ui/loading-pulse';
import { Prompt, PromptStatus, Product, Epic } from '@/types';
import { isPromptUsable } from '@/lib/utils';
import { getStatusDisplayInfo } from '@/types/cursor';
import { useAgentStatusStream } from '@/hooks/useAgentStatusStream';

interface LinearPromptItemProps {
  prompt: Prompt & {
    product?: Product;
    epic?: Epic;
  };
  onPromptClick: (prompt: Prompt) => void;
  onCopyGenerated: (prompt: Prompt) => void;
  onShowCursorDialog: () => void;
  onPriorityChange?: (prompt: Prompt, newPriority: number) => void;
  onStatusChange?: (prompt: Prompt, newStatus: PromptStatus) => void;
  onMoreActions?: (prompt: Prompt) => void;
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
  onShowCursorDialog,
  onPriorityChange,
  onStatusChange,
  onMoreActions,
  isHovered,
  onHover
}: LinearPromptItemProps) {
  const [justCopied, setJustCopied] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
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

  // Get priority display
  const getPriorityDisplay = () => {
    if (priority === 1) {
      return { icon: Flame, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950' };
    }
    if (priority === 2) {
      return { icon: Minus, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' };
    }
    return { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900' };
  };

  const priorityDisplay = getPriorityDisplay();
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
    <div 
      className={`group flex items-center h-12 py-1 px-3 -mx-3 rounded-md transition-all duration-150 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
        isHovered ? 'bg-gray-50 dark:bg-gray-800/50' : ''
      } ${!isUsable ? 'opacity-60' : ''} ${
        isSliding ? 'animate-slide-out-right' : ''
      } ${isCompleting && !isSliding ? 'animate-fade-out' : ''}`}
      onMouseEnter={() => onHover?.(prompt.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onPromptClick(prompt)}
    >
      {/* Priority indicator - Fixed 32px column */}
      <div className="flex items-center justify-center w-8 h-8 flex-shrink-0 mr-3">
        <div 
          className={`flex items-center justify-center w-6 h-6 rounded-full ${priorityDisplay.bg} transition-all cursor-pointer hover:scale-110 hover:shadow-sm`}
          onClick={(e) => {
            e.stopPropagation();
            if (onPriorityChange) {
              // Cycle through priorities: 1 (High) -> 2 (Normal) -> 3 (Low) -> 1
              const currentPriority = prompt.priority || 3;
              const nextPriority = currentPriority === 3 ? 1 : currentPriority + 1;
              onPriorityChange(prompt, nextPriority);
            }
          }}
        >
          <PriorityIcon className={`h-3 w-3 ${priorityDisplay.color}`} />
        </div>
      </div>

      {/* Actions - Fixed width, show on hover */}
      <div className="flex items-center gap-1 w-24 opacity-0 group-hover:opacity-100 transition-opacity duration-150 mr-3">
        {/* Copy Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          disabled={!isUsable}
          className="h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
          aria-label="Copy prompt"
        >
          {justCopied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-gray-500" />
          )}
        </Button>
        
        {/* Cursor Button */}
        {prompt.product?.github_repo_url && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (!isUsable) return;
              onShowCursorDialog();
            }}
            disabled={!isUsable}
            className="h-7 w-7 p-0 text-purple-500 hover:text-purple-600 hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
            aria-label="Send to Cursor"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* More actions */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (onMoreActions) {
              onMoreActions(prompt);
            }
          }}
          className="h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
          aria-label="More actions"
        >
          <MoreHorizontal className="h-3.5 w-3.5 text-gray-500" />
        </Button>
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
                <div className={`${getStatusColor()} line-clamp-1`}>
                  {getStatusLabel()}
                </div>
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
                className={`${prompt.status === 'todo' ? 'bg-gray-100 dark:bg-gray-700' : ''} text-xs hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                To do
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (prompt.status !== 'in_progress') {
                    handleStatusChange('in_progress');
                  }
                }}
                className={`${prompt.status === 'in_progress' ? 'bg-gray-100 dark:bg-gray-700' : ''} text-xs hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                In progress
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (prompt.status !== 'done') {
                    handleStatusChange('done');
                  }
                }}
                className={`${prompt.status === 'done' ? 'bg-gray-100 dark:bg-gray-700' : ''} text-xs hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                Done
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Title - Flexible column with consistent height */}
      <div className="flex-1 min-w-0 mr-4 py-1">
        <div 
          className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-1 h-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
  );
}
