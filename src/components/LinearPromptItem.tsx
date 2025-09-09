import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, ExternalLink, Flame, Minus, Clock, MoreHorizontal } from 'lucide-react';
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
  isHovered,
  onHover
}: LinearPromptItemProps) {
  const [justCopied, setJustCopied] = useState(false);
  
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
      className={`group flex items-center py-2 px-3 -mx-3 rounded-md transition-all duration-150 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
        isHovered ? 'bg-gray-50 dark:bg-gray-800/50' : ''
      } ${!isUsable ? 'opacity-60' : ''}`}
      onMouseEnter={() => onHover?.(prompt.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onPromptClick(prompt)}
    >
      {/* Priority indicator - 32px column */}
      <div className="flex items-center justify-center w-8 h-8 flex-shrink-0 mr-3">
        <div className={`p-1.5 rounded-full ${priorityDisplay.bg} transition-colors`}>
          <PriorityIcon className={`h-3 w-3 ${priorityDisplay.color}`} />
        </div>
      </div>

      {/* Actions - show on hover, positioned left of title */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 mr-3">
        {/* Copy Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          disabled={!isUsable}
          className="h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
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
            className="h-7 w-7 p-0 text-purple-500 hover:text-purple-600 hover:bg-gray-200 dark:hover:bg-gray-700"
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
            // This could open a context menu or additional actions
          }}
          className="h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="More actions"
        >
          <MoreHorizontal className="h-3.5 w-3.5 text-gray-500" />
        </Button>
      </div>

      {/* Status - positioned left of title */}
      <div className="w-20 flex-shrink-0 mr-4 flex items-center">
        {['sent_to_cursor', 'cursor_working', 'sending_to_cursor'].includes(prompt.status) && (
          <AgentWorkingIndicator size="sm" className="mr-2" />
        )}
        <div className={`text-xs font-medium ${getStatusColor()}`}>
          {getStatusLabel()}
        </div>
      </div>

      {/* Title - flexible column */}
      <div className="flex-1 min-w-0 mr-4">
        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-1">
          {prompt.title}
        </div>
        {prompt.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
            {prompt.description}
          </div>
        )}
      </div>

      {/* Epic/Product context - 120px column */}
      <div className="w-30 flex-shrink-0 mr-4 hidden sm:block">
        {prompt.epic && (
          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
            {prompt.epic.name}
          </div>
        )}
        {prompt.product && (
          <div className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1">
            {prompt.product.name}
          </div>
        )}
      </div>

    </div>
  );
}
