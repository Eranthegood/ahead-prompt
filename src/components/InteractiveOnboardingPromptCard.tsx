import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StatusIcon } from '@/components/ui/status-icon';
import { Copy, Flame, Minus, Clock } from 'lucide-react';
import { PromptStatus, PromptPriority } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InteractiveOnboardingPromptCardProps {
  className?: string;
}

export function InteractiveOnboardingPromptCard({ className }: InteractiveOnboardingPromptCardProps) {
  const [status, setStatus] = useState<PromptStatus>('todo');
  const [priority, setPriority] = useState<PromptPriority>(2); // 2 = Normal
  const [justCopied, setJustCopied] = useState(false);

  const handleCopy = () => {
    // Copy to clipboard
    navigator.clipboard.writeText("Fix login bug on mobile devices - users can't sign in with Google");
    
    // Visual feedback
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1000);
    
    // Auto-progress to in_progress
    if (status === 'todo') {
      setStatus('in_progress');
      toast.success("Prompt copied! Status automatically updated to In Progress");
    } else {
      toast.success("Prompt copied to clipboard!");
    }
  };

  const handleStatusChange = (newStatus: PromptStatus) => {
    setStatus(newStatus);
    toast.success(`Status updated to ${newStatus === 'todo' ? 'To Do' : newStatus === 'in_progress' ? 'In Progress' : 'Done'}`);
  };

  const handlePriorityChange = (value: string) => {
    const newPriority = parseInt(value) as PromptPriority;
    setPriority(newPriority);
    toast.success(`Priority changed to ${newPriority === 1 ? 'High' : newPriority === 2 ? 'Normal' : 'Low'}`);
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 1:
        return <Flame className="w-4 h-4 text-destructive" />;
      case 3:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Minus className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'todo':
        return 'border-l-yellow-500 bg-yellow-500/5';
      case 'in_progress':
        return 'border-l-blue-500 bg-blue-500/5';
      case 'done':
        return 'border-l-green-500 bg-green-500/5';
      default:
        return 'border-l-muted';
    }
  };

  return (
    <Card className={cn(
      "relative transition-all duration-200 border-l-4 cursor-pointer hover:shadow-md",
      getStatusColor(),
      className
    )}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Priority and Title */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Select value={priority.toString()} onValueChange={handlePriorityChange}>
              <SelectTrigger className="w-auto h-auto p-1 border-none shadow-none">
                <div className="flex items-center">
                  {getPriorityIcon()}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-destructive" />
                    High
                  </div>
                </SelectItem>
                <SelectItem value="2">
                  <div className="flex items-center gap-2">
                    <Minus className="w-4 h-4 text-orange-500" />
                    Normal
                  </div>
                </SelectItem>
                <SelectItem value="3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Low
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium line-clamp-2 mb-1">
                Fix login bug on mobile devices
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Demo Product
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Authentication Epic
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className={cn(
                "h-8 w-8 p-0 transition-all duration-200",
                justCopied && "bg-green-100 dark:bg-green-900/30"
              )}
            >
              <Copy className={cn(
                "h-4 w-4 transition-colors",
                justCopied ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
              )} />
            </Button>

            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-auto h-8 px-2 gap-1">
                <StatusIcon status={status} size="sm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">
                  <div className="flex items-center gap-2">
                    <StatusIcon status="todo" size="sm" />
                    To Do
                  </div>
                </SelectItem>
                <SelectItem value="in_progress">
                  <div className="flex items-center gap-2">
                    <StatusIcon status="in_progress" size="sm" />
                    In Progress
                  </div>
                </SelectItem>
                <SelectItem value="done">
                  <div className="flex items-center gap-2">
                    <StatusIcon status="done" size="sm" />
                    Done
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
}