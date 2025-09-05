import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Hash, Package, Calendar, MoreHorizontal, Edit, Copy, Trash2, ArrowRight, Sparkles, Flame, Check, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { PromptContextMenu } from '@/components/PromptContextMenu';
import { TruncatedTitle } from '@/components/ui/truncated-title';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useCursorIntegration } from '@/hooks/useCursorIntegration';
import { useCursorAgentPolling } from '@/hooks/useCursorAgentPolling';
import { CursorConfigDialog } from '@/components/CursorConfigDialog';
import { CursorWorkflowProgress } from '@/components/CursorWorkflowProgress';
import { CursorAgentModal } from '@/components/CursorAgentModal';
import { AgentWorkingIndicator } from '@/components/ui/loading-pulse';
import { Prompt, PromptStatus, PRIORITY_LABELS, PRIORITY_OPTIONS, Product, Epic } from '@/types';
import { isPromptUsable } from '@/lib/utils';

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
  const [justCopied, setJustCopied] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [showCursorDialog, setShowCursorDialog] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const { toast } = useToast();
  const { sendToCursor, isLoading: cursorLoading, cancelAgent, mergePullRequest, updateAgentStatus } = useCursorIntegration();
  
  // Real-time agent polling for active Cursor agents
  const isAgentActive = ['sent_to_cursor', 'cursor_working'].includes(prompt.status);
  const { isPolling } = useCursorAgentPolling({
    agentId: prompt.cursor_agent_id,
    enabled: isAgentActive,
    interval: 15000, // Poll every 15 seconds for active agents
    onStatusUpdate: (agent) => {
      console.log('Agent status update:', agent);
      // The webhook will handle database updates, this is just for logging
    }
  });
  const priority = prompt.priority || 3;
  
  const playSlideSound = () => {
    try {
      // Create synthetic swoosh sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure swoosh sound: frequency sweep from 800Hz to 200Hz
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
      
      // Configure volume envelope: fade out over 200ms
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      
      // Play sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Silently fail if Web Audio API is not supported
    }
  };
  const priorityOption = PRIORITY_OPTIONS.find(p => p.value === priority);
  const isUsable = isPromptUsable(prompt);

  return (
    <>
      <PromptContextMenu
        prompt={prompt}
        onEdit={() => onEdit(prompt)}
        onUpdate={() => {}}
      >
        <Card 
          className={`hover:shadow-sm transition-all cursor-pointer ${
            isHovered ? 'ring-2 ring-primary/50 shadow-lg' : ''
          } ${!isUsable ? 'opacity-60' : ''} ${isSliding ? 'animate-slide-out-right' : ''}`}
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
                  
                  {/* Priority Badge and Status Indicators */}
                  <div className="flex items-center gap-2 flex-wrap">
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
                    
                    {/* Cursor Agent Working Indicator */}
                    {prompt.status === 'cursor_working' && (
                      <AgentWorkingIndicator size="sm" className="ml-1" />
                    )}
                    
                    {/* Sending to Cursor Indicator */}
                    {cursorLoading && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-xs text-blue-600 dark:text-blue-400">Sending...</span>
                      </div>
                    )}
                    
                    {prompt.product && (
                      <Badge variant="outline" className="text-xs">
                        {prompt.product.name}
                      </Badge>
                    )}
                    {prompt.epic && (
                      <Badge variant="outline" className="text-xs">
                        {prompt.epic.name}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {prompt.description ? (
                  <div 
                    className="text-sm text-muted-foreground mb-3 overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      maxHeight: '2.5rem'
                    }}
                    dangerouslySetInnerHTML={{ __html: prompt.description }}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground mb-3 italic opacity-60">
                    Aucun contexte
                  </div>
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

                {/* Cursor Workflow Progress */}
                <CursorWorkflowProgress
                  status={prompt.status}
                  cursorAgentId={prompt.cursor_agent_id}
                  githubPrUrl={prompt.github_pr_url}
                  githubPrNumber={prompt.github_pr_number}
                  cursorBranchName={prompt.cursor_branch_name}
                  onViewAgent={() => setShowAgentModal(true)}
                  onViewPR={() => prompt.github_pr_url && window.open(prompt.github_pr_url, '_blank')}
                  onMergePR={() => {
                    // TODO: Implement merge PR functionality
                    toast({
                      title: 'Merge PR',
                      description: 'PR merge functionality coming soon!',
                    });
                  }}
                  onCancel={() => cancelAgent(prompt.cursor_agent_id!)}
                />
              </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {/* Send to Cursor Button - Show if product has GitHub repo */}
                    {prompt.product?.github_repo_url && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isUsable) return;
                                setShowCursorDialog(true);
                              }}
                              disabled={!isUsable}
                              className={`h-8 w-8 p-0 transition-opacity ${
                                !isUsable 
                                  ? 'opacity-30 cursor-not-allowed' 
                                  : 'opacity-60 hover:opacity-100 text-purple-600 hover:text-purple-700'
                              }`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {!isUsable ? 'Description trop courte pour être exploitable' : 'Send to Cursor'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* Quick Copy Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isUsable) return;
                              setJustCopied(true);
                              setTimeout(() => setJustCopied(false), 1200);
                              onCopyGenerated(prompt);
                            }}
                            disabled={!isUsable}
                            className={`h-8 w-8 p-0 transition-opacity ${
                              !isUsable 
                                ? 'opacity-30 cursor-not-allowed' 
                                : 'opacity-60 hover:opacity-100'
                            }`}
                          >
                            {justCopied ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        {!isUsable && (
                          <TooltipContent>
                            Description trop courte pour être exploitable
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                    
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
                        
                        if (nextStatus === 'done') {
                          playSlideSound();
                          setIsSliding(true);
                          setTimeout(() => {
                            onStatusChange(prompt, nextStatus);
                          }, 300);
                        } else {
                          onStatusChange(prompt, nextStatus);
                        }
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
                                  const status = option.value as PromptStatus;
                                  
                                  if (status === 'done') {
                                    playSlideSound();
                                    setIsSliding(true);
                                    setTimeout(() => {
                                      onStatusChange(prompt, status);
                                    }, 300);
                                  } else {
                                    onStatusChange(prompt, status);
                                  }
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
                            e.stopPropagation();
                            setShowCursorDialog(true);
                          }}
                          disabled={!prompt.description && !prompt.generated_prompt}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Send to Cursor
                        </DropdownMenuItem>
                        
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
      
      {/* Cursor Config Dialog */}
      <CursorConfigDialog
        isOpen={showCursorDialog}
        onClose={() => setShowCursorDialog(false)}
        prompt={prompt}
        onPromptUpdate={(promptId, updates) => {
          // Update the prompt status when sent to Cursor
          onStatusChange({ ...prompt, ...updates } as Prompt, updates.status as PromptStatus);
        }}
      />
      
      {/* Cursor Agent Modal */}
      <CursorAgentModal
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
        agentId={prompt.cursor_agent_id || ''}
        agentStatus={prompt.cursor_agent_status}
        branchName={prompt.cursor_branch_name}
        logs={prompt.cursor_logs || {}}
        onCancel={() => cancelAgent(prompt.cursor_agent_id!)}
        onRefresh={() => {
          if (prompt.cursor_agent_id) {
            updateAgentStatus(prompt.cursor_agent_id);
          }
        }}
      />
    </>
  );
}