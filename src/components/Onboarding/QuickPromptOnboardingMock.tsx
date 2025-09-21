import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame, Minus, Clock, Zap, Type, FileText, Save } from 'lucide-react';

// Interactive QuickPrompt dialog mock for onboarding
export default function QuickPromptOnboardingMock() {
  const [isOpen, setIsOpen] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(2);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const interactiveSteps = [
    {
      id: 'title',
      title: '⚡ Lightning Title',
      content: 'Type your prompt idea instantly. Keep it short and actionable!',
      style: { top: '-80px', left: '50px' },
      arrowClass: 'bottom-[-4px] left-6'
    },
    {
      id: 'description',
      title: '📝 Rich Description',
      content: 'Add context, requirements, or details. This helps AI understand your needs perfectly.',
      style: { top: '-80px', left: '50px' },
      arrowClass: 'bottom-[-4px] left-6'
    },
    {
      id: 'priority',
      title: '🔥 Set Priority',
      content: 'High priority = urgent tasks that appear first. Perfect for blocking issues!',
      style: { top: '-80px', right: '50px' },
      arrowClass: 'bottom-[-4px] right-6'
    },
    {
      id: 'save',
      title: '💾 Save & Go',
      content: 'One click saves your idea and you\'re ready for the next one. Zero friction workflow!',
      style: { bottom: '-80px', right: '100px' },
      arrowClass: 'top-[-4px] right-6'
    }
  ];

  const showTooltip = (stepId: string) => {
    setActiveTooltip(stepId);
    setTimeout(() => setActiveTooltip(null), 4000);
  };

  const priorityOptions = [
    { value: 1, label: 'High', icon: Flame, color: 'text-red-500', bgColor: 'bg-red-500/10 border-red-500/20' },
    { value: 2, label: 'Normal', icon: Minus, color: 'text-muted-foreground', bgColor: 'bg-muted border-muted-foreground/20' },
    { value: 3, label: 'Low', icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted border-muted-foreground/20' }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Mock Quick Prompt Dialog */}
        <div className="relative">
          <div className="rounded-lg border-2 border-primary/20 bg-background p-6 shadow-lg max-w-md mx-auto">
            <div className="space-y-4">
              {/* Dialog Header */}
              <div className="flex items-center gap-2 pb-2 border-b">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Quick Prompt Creation</h3>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="e.g., Add user authentication to landing page"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Description Textarea */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optional)</label>
                <Textarea
                  placeholder="Add context, requirements, or specific details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[80px] resize-none"
                />
              </div>

              {/* Priority Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <div className="flex gap-2">
                  {priorityOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Button
                        key={option.value}
                        variant="outline"
                        size="sm"
                        onClick={() => setPriority(option.value)}
                        className={`flex items-center gap-1 ${
                          priority === option.value ? option.bgColor : 'bg-background'
                        }`}
                      >
                        <Icon className={`h-3 w-3 ${option.color}`} />
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="bg-primary">
                  <Save className="h-3 w-3 mr-1" />
                  Save Prompt
                </Button>
              </div>
            </div>
          </div>

          {/* Interactive tooltip overlays */}
          {interactiveSteps.map((step) => (
            <div
              key={step.id}
              className={`absolute transition-all duration-300 ${
                activeTooltip === step.id
                  ? 'opacity-100 scale-100 z-20 animate-scale-in' 
                  : 'opacity-0 scale-95 pointer-events-none'
              }`}
              style={step.style}
            >
              <div className="bg-primary text-primary-foreground p-3 rounded-lg shadow-xl max-w-64 text-xs border border-primary/20">
                <div className="font-semibold mb-1">{step.title}</div>
                <div className="leading-relaxed">{step.content}</div>
                
                {/* Arrow pointer */}
                <div className={`absolute w-2 h-2 bg-primary rotate-45 ${step.arrowClass}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Interactive feature buttons */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('title')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'title' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <Type className="h-3 w-3 text-primary" />
            <span>Title Field</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('description')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'description' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <FileText className="h-3 w-3 text-primary" />
            <span>Description</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('priority')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'priority' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <Flame className="h-3 w-3 text-primary" />
            <span>Priority System</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => showTooltip('save')}
            className={`flex items-center gap-2 p-2 h-auto justify-start hover:bg-muted transition-all ${
              activeTooltip === 'save' ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
            }`}
          >
            <Save className="h-3 w-3 text-primary" />
            <span>Save & Go</span>
          </Button>
        </div>

        {/* Success message */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-3 rounded-lg border border-blue-500/20">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
            ⚡ 2-Second Capture
          </p>
          <p className="text-xs text-muted-foreground">
            While Claude or Cursor works, your brain races ahead. Capture those ideas instantly before they vanish!
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}