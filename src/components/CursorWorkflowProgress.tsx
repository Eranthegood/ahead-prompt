import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  GitBranch, 
  GitPullRequest, 
  CheckCircle, 
  Circle, 
  Clock, 
  ExternalLink, 
  Eye,
  GitMerge,
  X
} from 'lucide-react';
import type { PromptStatus } from '@/types';

interface CursorWorkflowProgressProps {
  status: PromptStatus;
  cursorAgentId?: string;
  githubPrUrl?: string;
  githubPrNumber?: number;
  cursorBranchName?: string;
  onViewAgent?: () => void;
  onViewPR?: () => void;
  onMergePR?: () => void;
  onCancel?: () => void;
}

const WORKFLOW_STEPS = [
  { key: 'todo', label: 'Todo', icon: Circle },
  { key: 'sent_to_cursor', label: 'Sent', icon: GitBranch },
  { key: 'cursor_working', label: 'Coding', icon: Clock },
  { key: 'pr_created', label: 'PR', icon: GitPullRequest },
  { key: 'pr_ready', label: 'Ready', icon: Eye },
  { key: 'pr_merged', label: 'Merged', icon: GitMerge },
  { key: 'done', label: 'Done', icon: CheckCircle },
];

export function CursorWorkflowProgress({
  status,
  cursorAgentId,
  githubPrUrl,
  githubPrNumber,
  cursorBranchName,
  onViewAgent,
  onViewPR,
  onMergePR,
  onCancel
}: CursorWorkflowProgressProps) {
  const getProgress = () => {
    const stepIndex = WORKFLOW_STEPS.findIndex(step => step.key === status);
    return stepIndex >= 0 ? ((stepIndex + 1) / WORKFLOW_STEPS.length) * 100 : 0;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'sent_to_cursor':
      case 'cursor_working':
        return 'bg-blue-500';
      case 'pr_created':
      case 'pr_review':
        return 'bg-orange-500';
      case 'pr_ready':
        return 'bg-green-500';
      case 'pr_merged':
      case 'done':
        return 'bg-emerald-500';
      default:
        return 'bg-muted-foreground';
    }
  };

  const isWorkflowActive = ['sent_to_cursor', 'cursor_working', 'pr_created', 'pr_review', 'pr_ready', 'pr_merged'].includes(status);

  if (!isWorkflowActive) {
    return null;
  }

  return (
    <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Cursor Workflow</span>
          <Badge variant="outline" className={`text-xs ${getStatusColor()} text-white border-0`}>
            {WORKFLOW_STEPS.find(step => step.key === status)?.label || status}
          </Badge>
        </div>
        <Progress value={getProgress()} className="h-1" />
      </div>

      {/* Workflow steps */}
      <div className="flex items-center justify-between">
        {WORKFLOW_STEPS.slice(1, -1).map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = WORKFLOW_STEPS.findIndex(s => s.key === status) > index;
          const isCurrent = step.key === status;
          
          return (
            <div key={step.key} className="flex flex-col items-center space-y-1">
              <div className={`
                p-1.5 rounded-full border-2 transition-colors
                ${isCompleted || isCurrent 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : 'border-muted-foreground/30 bg-background text-muted-foreground'
                }
                ${isCurrent ? 'animate-pulse' : ''}
              `}>
                <StepIcon className="w-3 h-3" />
              </div>
              <span className={`text-xs ${isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {cursorAgentId && (status === 'sent_to_cursor' || status === 'cursor_working') && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onViewAgent}
              className="h-7 text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              View Agent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="h-7 text-xs text-destructive hover:text-destructive"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
          </>
        )}

        {githubPrUrl && ['pr_created', 'pr_review', 'pr_ready'].includes(status) && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onViewPR}
              className="h-7 text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View PR
            </Button>
            {status === 'pr_ready' && (
              <Button
                variant="default"
                size="sm"
                onClick={onMergePR}
                className="h-7 text-xs"
              >
                <GitMerge className="w-3 h-3 mr-1" />
                Merge
              </Button>
            )}
          </>
        )}
      </div>

      {/* Additional info */}
      {(cursorBranchName || githubPrNumber) && (
        <div className="text-xs text-muted-foreground space-y-1">
          {cursorBranchName && (
            <div className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              <span>{cursorBranchName}</span>
            </div>
          )}
          {githubPrNumber && (
            <div className="flex items-center gap-1">
              <GitPullRequest className="w-3 h-3" />
              <span>PR #{githubPrNumber}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}