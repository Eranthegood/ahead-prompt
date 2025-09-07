import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hash, Package, Calendar, MoreHorizontal, Edit, Copy, Trash2, Minus, Sparkles, Flame, Check, ExternalLink, Clock, Zap, GitMerge } from 'lucide-react';
import { format } from 'date-fns';
import { PromptContextMenu } from '@/components/PromptContextMenu';
import { TruncatedTitle } from '@/components/ui/truncated-title';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { AIAgentManager } from '@/services/aiAgentManager';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useCursorIntegration } from '@/hooks/useCursorIntegration';
import { useCursorAgentPolling } from '@/hooks/useCursorAgentPolling';
import { useAgentStatusStream } from '@/hooks/useAgentStatusStream';
import { CursorConfigDialog } from '@/components/CursorConfigDialog';
import { CursorWorkflowProgress } from '@/components/CursorWorkflowProgress';
import { CursorAgentModal } from '@/components/CursorAgentModal';
import { AgentWorkingIndicator } from '@/components/ui/loading-pulse';
import { Prompt, PromptStatus, PRIORITY_LABELS, PRIORITY_OPTIONS, Product, Epic } from '@/types';
import { isPromptUsable } from '@/lib/utils';
import { getStatusDisplayInfo } from '@/types/cursor';

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

// Enhanced status display for Cursor workflow
const getCursorStatusDisplay = (status: PromptStatus, cursorAgentStatus?: string) => {
  // If we have a Cursor agent status, show that instead
  if (cursorAgentStatus && ['sent_to_cursor', 'cursor_working', 'pr_created', 'pr_review', 'pr_ready', 'error'].includes(status)) {
    return getStatusDisplayInfo(cursorAgentStatus as any);
  }
  
  // Otherwise use internal status
  return getStatusDisplayInfo(status);
};

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
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();
  const { workspace } = useWorkspace();
  const isMobile = useIsMobile();
  const { sendToCursor, isLoading: cursorLoading, cancelAgent, mergePullRequest, updateAgentStatus } = useCursorIntegration();
  
  // Real-time agent polling for active Cursor agents
  const isAgentActive = ['sent_to_cursor', 'cursor_working', 'sending_to_cursor'].includes(prompt.status);
  const { isPolling, lastPolled } = useCursorAgentPolling({
    agentId: prompt.cursor_agent_id,
    enabled: isAgentActive,
    interval: 15000, // Poll every 15 seconds for active agents
    onStatusUpdate: (agent) => {
      console.log('Agent status update:', agent);
      if (agent?.id) updateAgentStatus(agent.id);
    }
  });

  // Live status stream from Agent Status Service keyed by Cursor agent id
  const { latest: liveStatus } = useAgentStatusStream(prompt.cursor_agent_id || undefined);
  
  const priority = prompt.priority || 3;
  const statusDisplay = getCursorStatusDisplay(
    prompt.status,
    (liveStatus?.status?.toLowerCase?.() as any) || (prompt.cursor_agent_status || undefined)
  );
  
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

  const handleStatusChange = (newStatus: PromptStatus) => {
    const isCursorFlow = ['sending_to_cursor','sent_to_cursor','cursor_working','pr_created','pr_review','pr_ready','pr_merged','error'].includes(prompt.status);
    if (isCursorFlow) return; // Don't cycle manual status while Cursor workflow is active

    if (newStatus === 'done') {
      playSlideSound();
      setIsSliding(true);
      setTimeout(() => {
        onStatusChange(prompt, newStatus);
      }, 300);
    } else {
      onStatusChange(prompt, newStatus);
    }
  };

  const handleCopy = () => {
    if (!isUsable) return;
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1200);
    onCopyGenerated(prompt);
  };

  const handleOptimizePrompt = async () => {
    if (!workspace || !prompt.description?.trim()) {
      toast({
        title: 'Impossible d\'optimiser',
        description: 'Le prompt doit avoir du contenu pour être optimisé',
        variant: 'destructive'
      });
      return;
    }

    setIsOptimizing(true);
    try {
      await AIAgentManager.executePromptOptimization(prompt.id, workspace.id);
      toast({
        title: 'Prompt optimisé',
        description: 'Votre prompt a été amélioré par l\'IA',
      });
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
      toast({
        title: 'Erreur d\'optimisation',
        description: 'Impossible d\'optimiser le prompt pour le moment',
        variant: 'destructive'
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  // Get priority display
  const getPriorityDisplay = () => {
    if (priority === 1) {
      return { icon: Flame, color: 'text-destructive', bgColor: 'bg-destructive/10' };
    }
    if (priority === 2) {
      return { icon: Minus, color: 'text-orange-500', bgColor: 'bg-orange-500/10' };
    }
    return { icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted/50' };
  };

  const priorityDisplay = getPriorityDisplay();
  const PriorityIcon = priorityDisplay.icon;

  // Enhanced event prevention for mobile touch events
  const preventEventBubbling = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Use nativeEvent for stopImmediatePropagation
    e.nativeEvent.stopImmediatePropagation();
  };

  return (
    <>
      <PromptContextMenu
        prompt={prompt}
        onEdit={() => onEdit(prompt)}
        onUpdate={() => {}}
      >
        <Card 
          className={`group hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${
            priority === 1 ? 'border-l-destructive' : 
            priority === 2 ? 'border-l-orange-500' : 
            'border-l-muted'
          } ${
            isHovered ? 'ring-2 ring-primary/30 shadow-lg' : ''
          } ${!isUsable ? 'opacity-60' : ''} ${isSliding ? 'animate-slide-out-right' : ''}`}
          onMouseEnter={() => onHover?.(prompt.id)}
          onMouseLeave={() => onHover?.(null)}
        >
          <CardContent className="p-3 sm:p-4">
            {/* Main Click Area */}
            <div 
              className="space-y-3"
              onClick={() => onPromptClick(prompt)}
            >
              {/* Header Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <TruncatedTitle 
                    title={prompt.title}
                    maxLength={45}
                    className="font-medium text-foreground text-sm leading-tight"
                    showCopyButton={false}
                    variant="inline"
                  />
                </div>
                
                {/* Priority & Status Indicators */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Priority Dropdown */}
                  <Select
                    value={priority.toString()}
                    onValueChange={(value: string) => {
                      onPriorityChange(prompt, parseInt(value));
                    }}
                  >
                    <SelectTrigger 
                      className="w-auto h-6 border-none bg-transparent p-0 hover:bg-accent/30 transition-colors [&>svg]:hidden"
                      onClick={preventEventBubbling}
                      onTouchStart={isMobile ? preventEventBubbling : undefined}
                      onTouchEnd={isMobile ? preventEventBubbling : undefined}
                    >
                      <SelectValue asChild>
                        <div className={`flex items-center justify-center h-6 w-6 rounded-full ${priorityDisplay.bgColor} cursor-pointer hover:scale-105 transition-all duration-200`}>
                          <PriorityIcon className={`h-3 w-3 ${priorityDisplay.color}`} />
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-popover/95 backdrop-blur-sm border-border/40">
                      {PRIORITY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value.toString()} className="text-sm">
                          <div className="flex items-center gap-2">
                            {option.value === 1 && <Flame className="h-3 w-3 text-destructive" />}
                            {option.value === 2 && <Minus className="h-3 w-3 text-orange-500" />}
                            {option.value === 3 && <Clock className="h-3 w-3 text-muted-foreground" />}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Working Indicator */}
                  {['sent_to_cursor', 'cursor_working', 'sending_to_cursor'].includes(prompt.status) && (
                    <AgentWorkingIndicator size="sm" />
                  )}
                  
                  {/* Status Dropdown */}
                  {['sending_to_cursor','sent_to_cursor','cursor_working','pr_created','pr_review','pr_ready','pr_merged','error'].includes(prompt.status) ? (
                    <Badge 
                      variant={
                        prompt.status === 'done' ? 'success' : 
                        prompt.status === 'in_progress' ? 'secondary' : 'outline'
                      }
                      className="text-xs px-2 py-1"
                    >
                      {`${statusDisplay.label}${liveStatus?.progress != null ? ` • ${liveStatus.progress}%` : ''}`}
                    </Badge>
                  ) : (
                    <Select
                      value={prompt.status}
                      onValueChange={(value: PromptStatus) => {
                        handleStatusChange(value);
                      }}
                    >
                      <SelectTrigger 
                        className="w-auto h-6 text-xs border-none bg-transparent p-0 hover:bg-accent/30 transition-colors [&>svg]:hidden"
                        onClick={preventEventBubbling}
                        onTouchStart={isMobile ? preventEventBubbling : undefined}
                        onTouchEnd={isMobile ? preventEventBubbling : undefined}
                      >
                        <SelectValue asChild>
                          <Badge 
                            variant={
                              prompt.status === 'done' ? 'success' : 
                              prompt.status === 'in_progress' ? 'secondary' : 'outline'
                            }
                            className="text-xs px-2 py-1 cursor-pointer hover:bg-opacity-80 transition-all duration-200"
                          >
                            {prompt.status === 'in_progress' ? 'In Progress' : 
                             prompt.status === 'done' ? 'Done' : 'Todo'}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-popover/95 backdrop-blur-sm border-border/40">
                        <SelectItem value="todo" className="text-sm">Todo</SelectItem>
                        <SelectItem value="in_progress" className="text-sm">In Progress</SelectItem>
                        <SelectItem value="done" className="text-sm">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              
              {/* Content Preview */}
              {prompt.description ? (
                <div 
                  className="text-sm text-muted-foreground leading-relaxed overflow-hidden"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    maxHeight: '2.5rem'
                  }}
                  dangerouslySetInnerHTML={{ __html: prompt.description }}
                />
              ) : (
                <div className="text-sm text-muted-foreground italic opacity-60">
                  No description
                </div>
              )}
              
              {/* Context Tags - Mobile Optimized */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {(prompt.product || prompt.epic) ? (
                    <div className="flex items-center gap-2">
                      {prompt.product && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          {prompt.product.name}
                        </Badge>
                      )}
                      {prompt.epic && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          #{prompt.epic.name}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      {format(new Date(prompt.created_at), 'MMM d')}
                    </span>
                  )}
                </div>
                
                {/* Quick Actions */}
                <div className="flex items-center gap-1">
                  {/* Quick Copy */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy();
                    }}
                    disabled={!isUsable}
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Copy prompt"
                  >
                    {justCopied ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  
                   {/* Send to Cursor */}
                  {prompt.product?.github_repo_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUsable) return;
                        setShowCursorDialog(true);
                      }}
                      disabled={!isUsable}
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-purple-600 hover:text-purple-700"
                      aria-label="Send to Cursor"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  
                  {/* Merge PR - Only shown for prompts with completed PRs */}
                  {prompt.github_pr_url && prompt.status === 'pr_ready' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await mergePullRequest(prompt.github_pr_url!);
                          toast({
                            title: 'PR Merged',
                            description: 'Pull request has been merged successfully'
                          });
                        } catch (error) {
                          toast({
                            title: 'Merge Failed',
                            description: 'Failed to merge the pull request',
                            variant: 'destructive'
                          });
                        }
                      }}
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:text-green-700"
                      aria-label="Merge PR"
                    >
                      <GitMerge className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  
                  {/* More Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
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
                        e.stopPropagation();
                        handleOptimizePrompt();
                      }} className="flex items-center gap-2" disabled={isOptimizing || !prompt.description?.trim()}>
                        <Zap className="h-4 w-4" />
                        {isOptimizing ? 'Optimisation...' : 'Optimiser avec IA'}
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
            </div>

            {/* Cursor Workflow Progress - Always visible when active */}
            <CursorWorkflowProgress
              status={prompt.status}
              cursorAgentId={prompt.cursor_agent_id}
              cursorAgentStatus={prompt.cursor_agent_status}
              githubPrUrl={prompt.github_pr_url}
              githubPrNumber={prompt.github_pr_number}
              cursorBranchName={prompt.cursor_branch_name}
              error={prompt.status === 'error' ? (prompt.cursor_logs as any)?.error || 'Unknown error' : undefined}
              onViewAgent={() => setShowAgentModal(true)}
              onViewPR={() => prompt.github_pr_url && window.open(prompt.github_pr_url, '_blank')}
              onMergePR={() => {
                toast({
                  title: 'Merge PR',
                  description: 'PR merge functionality coming soon!',
                });
              }}
              onCancel={() => cancelAgent(prompt.cursor_agent_id!)}
            />
          </CardContent>
        </Card>
      </PromptContextMenu>
      
      {/* Cursor Config Dialog */}
      <CursorConfigDialog
        isOpen={showCursorDialog}
        onClose={() => setShowCursorDialog(false)}
        prompt={prompt}
        onPromptUpdate={(promptId, updates) => {
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
