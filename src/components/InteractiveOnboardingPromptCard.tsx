import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check } from 'lucide-react';
import { PromptContextMenu } from '@/components/PromptContextMenu';
import { TruncatedTitle } from '@/components/ui/truncated-title';
import { useToast } from '@/hooks/use-toast';
import { StatusIcon } from '@/components/ui/status-icon';
import { PromptStatus, PRIORITY_LABELS, PRIORITY_OPTIONS } from '@/types';
import { cn, getPriorityDisplay } from '@/lib/utils';

interface InteractiveOnboardingPromptCardProps {
  className?: string;
}

export function InteractiveOnboardingPromptCard({ className }: InteractiveOnboardingPromptCardProps) {
  const [status, setStatus] = useState<PromptStatus>('todo');
  const [priority, setPriority] = useState<number>(2); // 2 = Normal
  const [justCopied, setJustCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const { toast } = useToast();

  const demoPrompt = {
    id: 'demo-1',
    title: 'Add user authentication with JWT tokens',
    description: 'Implement secure login/logout system with JWT token management',
    status: status,
    priority: priority,
    product: { name: 'Demo Product' },
    epic: { name: 'Authentication Epic' }
  };

  const handleCopy = () => {
    // Copy to clipboard
    navigator.clipboard.writeText("Add user authentication with JWT tokens - Implement secure login/logout system with JWT token management");
    
    // Visual feedback
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1200);
    
    // Auto-progress to in_progress
    if (status === 'todo') {
      setStatus('in_progress');
      toast({
        title: "Prompt copied!",
        description: "Status automatically updated to In Progress",
      });
    } else {
      toast({
        title: "Prompt copied to clipboard!",
      });
    }
  };

  const handleStatusChange = (newStatus: PromptStatus) => {
    setStatus(newStatus);
    toast({
      title: `Status updated to ${newStatus === 'todo' ? 'To Do' : newStatus === 'in_progress' ? 'In Progress' : 'Done'}`,
    });
  };

  const handlePriorityChange = (value: string) => {
    const newPriority = parseInt(value);
    setPriority(newPriority);
    toast({
      title: `Priority changed to ${newPriority === 1 ? 'High' : newPriority === 2 ? 'Normal' : 'Low'}`,
    });
  };

  const priorityDisplay = getPriorityDisplay(priority);
  const PriorityIcon = priorityDisplay.icon;

  // Prevent bubbling from controls inside the card
  const stopEventPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <PromptContextMenu
      prompt={demoPrompt as any}
      onEdit={() => {}}
      onUpdate={() => {}}
    >
      <Card 
        className={`group hover:shadow-md transition-all duration-200 cursor-pointer ${
          isHovered ? 'ring-2 ring-primary/30 shadow-lg' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-2.5 sm:p-3">
          {/* Ultra Minimalist Layout */}
          <div className="space-y-1.5" onClick={() => {}}>
            {/* Single Row Layout */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Priority selector */}
                <Select 
                  value={priority.toString()} 
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger 
                    className={cn(
                      "h-7 gap-1.5 px-2 flex-shrink-0 w-auto border-0 bg-transparent hover:bg-muted/50",
                      priorityDisplay.color
                    )}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <PriorityIcon className="h-3.5 w-3.5" />
                    <span className="text-xs">{PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS] || 'Low'}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map(option => {
                      const optionDisplay = getPriorityDisplay(option.value);
                      const OptionIcon = optionDisplay.icon;
                      return (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          <div className="flex items-center gap-2">
                            <OptionIcon className={cn("h-4 w-4", optionDisplay.color)} />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* Compact Title */}
                <TruncatedTitle 
                  title={demoPrompt.title}
                  maxLength={window.innerWidth >= 768 ? 60 : 35}
                  className="font-medium text-foreground text-base"
                  showCopyButton={false}
                  variant="inline"
                />
                
                {/* Context Badges - Inline */}
                <Badge variant="outline" className="text-xs px-1 py-0 font-normal opacity-60">
                  Demo Product
                </Badge>
                <Badge variant="outline" className="text-xs px-1 py-0 font-normal opacity-60">
                  Authentication Epic
                </Badge>
              </div>
              
              {/* Right Side Actions */}
              <div className="flex items-center gap-2.5">
                {/* Copy Button - Always Visible */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  className="h-7 w-7 p-0 hover:bg-accent/50"
                >
                  {justCopied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                
                {/* Status Badge */}
                <Select value={status} onValueChange={(value: PromptStatus) => handleStatusChange(value)}>
                  <SelectTrigger 
                    className="w-auto h-5 text-xs border-none bg-transparent p-0 hover:bg-accent/30 [&>svg]:hidden"
                    onPointerDown={stopEventPropagation}
                    onClick={stopEventPropagation}
                  >
                    <SelectValue asChild>
                      <div className="cursor-pointer">
                        <StatusIcon status={status} size="sm" />
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo" className="flex items-center gap-2">
                      <StatusIcon status="todo" size="sm" />
                      Todo
                    </SelectItem>
                    <SelectItem value="in_progress" className="flex items-center gap-2">
                      <StatusIcon status="in_progress" size="sm" />
                      In Progress
                    </SelectItem>
                    <SelectItem value="done" className="flex items-center gap-2">
                      <StatusIcon status="done" size="sm" />
                      Done
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PromptContextMenu>
  );
}