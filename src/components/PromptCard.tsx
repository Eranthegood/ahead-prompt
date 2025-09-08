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
// import { useIsMobile } from '@/hooks/use-mobile';
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
        description: 'Votre prompt a été amélioré par l\'IA avec un titre plus descriptif',
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

  // Prevent bubbling from controls inside the card (keeps card onClick from firing)
  const stopEventPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
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
          <CardContent className="p-2 sm:p-3">
            {/* Minimalist Layout */}
            <div className="space-y-2" onClick={() => onPromptClick(prompt)}>
              {/* Compact Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Priority Indicator */}
                  <Select
                    value={priority.toString()}
                    onValueChange={(value: string) => onPriorityChange(prompt, parseInt(value))}
                  >
                    <SelectTrigger 
                      className="w-auto h-5 border-none bg-transparent p-0 hover:bg-accent/30 transition-colors [&>svg]:hidden"
                      onPointerDown={stopEventPropagation}
                      onClick={stopEventPropagation}
                    >
                      <SelectValue asChild>
                        <div className={`flex items-center justify-center h-5 w-5 rounded-full ${priorityDisplay.bgColor}`}>
                          <PriorityIcon className={`h-2.5 w-2.5 ${priorityDisplay.color}`} />
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value.toString()}>
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

                  {/* Enhanced Title with responsive length */}
                  <TruncatedTitle 
                    title={prompt.title}
                    maxLength={window.innerWidth >= 768 ? 80 : 45}
                    className="font-medium text-foreground text-sm"
                    showCopyButton={false}
                    variant="inline"
                  />
                </div>
                
                {/* Status Badge */}
                {['sending_to_cursor','sent_to_cursor','cursor_working','pr_created','pr_review','pr_ready','pr_merged','error'].includes(prompt.status) ? (
                  <Badge variant={prompt.status === 'done' ? 'success' : prompt.status === 'in_progress' ? 'secondary' : 'outline'} className="text-xs px-2 py-0.5">
                    {`${statusDisplay.label}${liveStatus?.progress != null ? ` ${liveStatus.progress}%` : ''}`}
                  </Badge>
                ) : (
                  <Select value={prompt.status} onValueChange={(value: PromptStatus) => handleStatusChange(value)}>
                    <SelectTrigger 
                      className="w-auto h-6 text-xs border-none bg-transparent p-0 hover:bg-accent/30 [&>svg]:hidden"
                      onPointerDown={stopEventPropagation}
                      onClick={stopEventPropagation}
                    >
                      <SelectValue asChild>
                        <Badge 
                          variant={prompt.status === 'done' ? 'success' : prompt.status === 'in_progress' ? 'secondary' : 'outline'}
                          className="text-xs px-2 py-0.5 cursor-pointer"
                        >
                          {prompt.status === 'in_progress' ? 'In Progress' : prompt.status === 'done' ? 'Done' : 'Todo'}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Todo</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Description Preview - Show on medium screens and up */}
              {prompt.description && (
                <div className="hidden md:block">
                  <div 
                    className="text-sm text-muted-foreground leading-relaxed pl-7"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      maxHeight: '2.4rem'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: prompt.description.length > 120 
                        ? `${prompt.description.substring(0, 120)}...` 
                        : prompt.description 
                    }}
                  />
                </div>
              )}
              
              {/* Context Row */}
              <div className="flex items-center justify-between">
                {/* Product/Epic Tags */}
                <div className="flex items-center gap-1.5">
                  {prompt.product && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 font-normal">
                      <Package className="h-2.5 w-2.5 mr-1" />
                      {prompt.product.name}
                    </Badge>
                  )}
                  {prompt.epic && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 font-normal">
                      <Hash className="h-2.5 w-2.5 mr-1" />
                      {prompt.epic.name}
                    </Badge>
                  )}
                  {/* Show creation date if no product/epic context */}
                  {!prompt.product && !prompt.epic && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(prompt.created_at), 'MMM d')}
                    </span>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {['sent_to_cursor', 'cursor_working', 'sending_to_cursor'].includes(prompt.status) && (
                    <AgentWorkingIndicator size="sm" />
                  )}
                  
                  {/* Copy Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy();
                    }}
                    disabled={!isUsable}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {justCopied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  
                  {/* Cursor Button */}
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
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-purple-600"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Cursor Workflow Progress - Compact when active */}
            {['sending_to_cursor','sent_to_cursor','cursor_working','pr_created','pr_review','pr_ready','pr_merged','error'].includes(prompt.status) && (
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
            )}
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
