import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Check, ExternalLink, Flame, Minus, Clock } from 'lucide-react';
import { StatusIcon } from '@/components/ui/status-icon';
import { TruncatedTitle } from '@/components/ui/truncated-title';
import { AgentWorkingIndicator } from '@/components/ui/loading-pulse';
import { Prompt, PromptStatus, Product, Epic } from '@/types';
import { cn, isPromptUsable, getPriorityDisplay } from '@/lib/utils';
import { getStatusDisplayInfo } from '@/types/cursor';
import { useAgentStatusStream } from '@/hooks/useAgentStatusStream';

interface MinimalistPromptCardProps {
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

export function MinimalistPromptCard({
  prompt,
  onPromptClick,
  onCopyGenerated,
  onShowCursorDialog,
  isHovered,
  onHover
}: MinimalistPromptCardProps) {
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

  // Get priority display (remove local duplicate)
  const priorityDisplay = getPriorityDisplay(prompt.priority || 3);
  const PriorityIcon = priorityDisplay.icon;

  // Get status variant
  const getStatusVariant = () => {
    if (prompt.status === 'done') return 'success';
    if (prompt.status === 'in_progress') return 'secondary';
    return 'outline';
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
    <Card 
      className={`group hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${
        priority === 1 ? 'border-l-destructive' : 
        priority === 2 ? 'border-l-orange-500' : 
        'border-l-muted'
      } ${
        isHovered ? 'ring-2 ring-primary/30 shadow-lg' : ''
      } ${!isUsable ? 'opacity-60' : ''}`}
      onMouseEnter={() => onHover?.(prompt.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <CardContent className="p-3">
        <div 
          className="flex items-center justify-between gap-3"
          onClick={() => onPromptClick(prompt)}
        >
          {/* Left: Priority Icon */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted/50">
              <PriorityIcon className={`h-4 w-4 ${priorityDisplay.color}`} />
            </div>
          </div>

          {/* Center: Title */}
          <div className="flex-1 min-w-0">
            <TruncatedTitle 
              title={prompt.title}
              maxLength={40}
              className="font-medium text-foreground text-sm leading-tight"
              showCopyButton={false}
              variant="inline"
            />
          </div>

          {/* Right: Status + Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Working Indicator */}
            {['sent_to_cursor', 'cursor_working', 'sending_to_cursor'].includes(prompt.status) && (
              <AgentWorkingIndicator size="sm" />
            )}
            
            {/* Status Icon */}
            {['sending_to_cursor','sent_to_cursor','cursor_working','pr_created','pr_review','pr_ready','pr_merged','error'].includes(prompt.status) ? (
              <Badge 
                variant={getStatusVariant()}
                className="text-xs px-2 py-1"
              >
                {getStatusLabel()}
              </Badge>
            ) : (
              <StatusIcon status={prompt.status} size="sm" />
            )}

            {/* Action Buttons - Show on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Copy Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                disabled={!isUsable}
                className="h-7 w-7 p-0"
                aria-label="Copy prompt"
              >
                {justCopied ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
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
                  className="h-7 w-7 p-0 text-purple-600 hover:text-purple-700"
                  aria-label="Send to Cursor"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
